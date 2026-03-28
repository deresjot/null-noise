import { DataExchangeClient, SendApiAssetCommand } from "@aws-sdk/client-dataexchange";
import { z } from "zod";

import { getTextMatchScore, normalizeSearchText } from "./search";

export type MetadataSpikeSource = "imdb" | "tmdb";
export type MetadataSpikeMediaType = "movie" | "series";
export type MetadataSpikeErrorReason =
  | "invalid_query"
  | "misconfigured"
  | "timeout"
  | "api_error"
  | "invalid_response"
  | "not_found";

export interface MetadataSpikeTitle {
  externalSource: MetadataSpikeSource;
  externalId: string;
  sourceId: string | number;
  title: string;
  originalTitle?: string | null;
  mediaType: MetadataSpikeMediaType;
  releaseYear: number | null;
  synopsis: string | null;
  posterPath: string | null;
  genres?: string[];
}

export interface TmdbSearchDiagnostics {
  source: "tmdb";
  serverOnly: true;
  usedEnvToken: boolean;
  tokenPresent: boolean;
  tokenLength: number;
  authorizationScheme: "Bearer" | null;
  requestStarted: boolean;
  requestCount: number;
  attemptedQueries: string[];
  upstreamStatusCode: number | null;
  mappingSuccessful: boolean;
  mappedItemCount: number;
  usedRetry: boolean;
  finalStateKind: MetadataSpikeSearchState["kind"] | null;
  finalReason: MetadataSpikeErrorReason | null;
}

export type MetadataSpikeSearchState =
  | {
      kind: "idle";
      query: string;
      source: MetadataSpikeSource;
      message: string;
      items: [];
    }
  | {
      kind: "disabled";
      query: string;
      source: MetadataSpikeSource;
      message: string;
      items: [];
    }
  | {
      kind: "empty";
      query: string;
      source: MetadataSpikeSource;
      message: string;
      items: [];
    }
  | {
      kind: "error";
      query: string;
      source: MetadataSpikeSource;
      reason: MetadataSpikeErrorReason;
      message: string;
      items: [];
    }
  | {
      kind: "success";
      query: string;
      source: MetadataSpikeSource;
      message: string;
      items: MetadataSpikeTitle[];
    };

export type MetadataSpikeDetailState =
  | {
      kind: "disabled";
      source: MetadataSpikeSource;
      message: string;
    }
  | {
      kind: "error";
      source: MetadataSpikeSource;
      reason: MetadataSpikeErrorReason;
      message: string;
    }
  | {
      kind: "success";
      source: MetadataSpikeSource;
      item: MetadataSpikeTitle;
      message: string;
    };

type ImdbMetadataSpikeConfig = {
  apiKey?: string;
  dataSetId?: string;
  revisionId?: string;
  assetId?: string;
  region?: string;
};

type ResolvedImdbMetadataSpikeConfig = {
  apiKey: string;
  dataSetId: string;
  revisionId: string;
  assetId: string;
  region: string;
};

interface ImdbSendInput {
  query: string;
  variables?: Record<string, unknown>;
  config: ResolvedImdbMetadataSpikeConfig;
}

interface MetadataSpikeDependencies {
  accessToken?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  source?: MetadataSpikeSource;
  tmdbDiagnostics?: TmdbSearchDiagnostics;
  imdbConfig?: ImdbMetadataSpikeConfig;
  imdbSendImpl?: (input: ImdbSendInput) => Promise<unknown>;
}

type MetadataSpikeDetailParams = {
  source: MetadataSpikeSource;
  mediaType: MetadataSpikeMediaType;
  externalId: string | number;
};

type ImdbDetailMapping =
  | { kind: "success"; item: MetadataSpikeTitle }
  | { kind: "not_found" }
  | { kind: "invalid" };

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_POSTER_BASE_URL = "https://image.tmdb.org/t/p/w185";
const DEFAULT_TIMEOUT_MS = 4_000;
const IMDB_API_PATH = "/v1";

const IMDB_SEARCH_QUERY = `
  query SearchTitles($searchTerm: String!) {
    mainSearch(
      first: 8
      options: {
        searchTerm: $searchTerm
        isExactMatch: false
        type: TITLE
        includeAdult: false
      }
    ) {
      edges {
        node {
          entity {
            ... on Title {
              id
              titleText {
                text
              }
              titleType {
                text
                canHaveEpisodes
              }
              releaseDate {
                year
              }
              plots(first: 1) {
                edges {
                  node {
                    plotText {
                      plainText
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const IMDB_DETAIL_QUERY = `
  query TitleById($id: ID!) {
    title(id: $id) {
      id
      titleText {
        text
      }
      titleType {
        text
        canHaveEpisodes
      }
      releaseDate {
        year
      }
      plots(first: 1) {
        edges {
          node {
            plotText {
              plainText
            }
          }
        }
      }
    }
  }
`;

const rawSearchItemSchema = z.object({
  id: z.number().int().nonnegative(),
  media_type: z.string(),
  title: z.string().nullish(),
  original_title: z.string().nullish(),
  name: z.string().nullish(),
  original_name: z.string().nullish(),
  release_date: z.string().nullish(),
  first_air_date: z.string().nullish(),
  overview: z.string().nullish(),
  poster_path: z.string().nullish(),
  popularity: z.number().nullish(),
});

const rawSearchResponseSchema = z.object({
  results: z.array(rawSearchItemSchema),
});

const rawMovieDetailSchema = z.object({
  id: z.number().int().nonnegative(),
  title: z.string().nullish(),
  original_title: z.string().nullish(),
  release_date: z.string().nullish(),
  overview: z.string().nullish(),
  poster_path: z.string().nullish(),
  genres: z
    .array(
      z.object({
        name: z.string().nullish(),
      }),
    )
    .nullish(),
});

const rawSeriesDetailSchema = z.object({
  id: z.number().int().nonnegative(),
  name: z.string().nullish(),
  original_name: z.string().nullish(),
  first_air_date: z.string().nullish(),
  overview: z.string().nullish(),
  poster_path: z.string().nullish(),
  genres: z
    .array(
      z.object({
        name: z.string().nullish(),
      }),
    )
    .nullish(),
});

const imdbTitleSchema = z
  .object({
    id: z.string().regex(/^tt\d+$/),
    titleText: z
      .object({
        text: z.string().nullish(),
      })
      .nullish(),
    titleType: z
      .object({
        text: z.string().nullish(),
        canHaveEpisodes: z.boolean().nullish(),
      })
      .nullish(),
    releaseDate: z
      .object({
        year: z.number().int().nullish(),
      })
      .nullish(),
    plots: z
      .object({
        edges: z
          .array(
            z.object({
              node: z
                .object({
                  plotText: z
                    .object({
                      plainText: z.string().nullish(),
                    })
                    .nullish(),
                })
                .nullish(),
            }),
          )
          .nullish(),
      })
      .nullish(),
  })
  .passthrough();

function normalizeQuery(value: string): string {
  return value.trim().replace(/\s+/g, " ").slice(0, 80);
}

function normalizeText(value: string | null | undefined): string | null {
  const normalized = value?.trim();

  return normalized ? normalized : null;
}

export function getTmdbPosterUrl(posterPath: string | null | undefined): string | null {
  const normalized = normalizeText(posterPath);

  if (!normalized) {
    return null;
  }

  const path = normalized.startsWith("/") ? normalized : `/${normalized}`;

  return `${TMDB_POSTER_BASE_URL}${path}`;
}

export function getTmdbPosterProxyPath(posterPath: string | null | undefined): string | null {
  const normalized = normalizeText(posterPath);

  if (!normalized) {
    return null;
  }

  const path = normalized.startsWith("/") ? normalized : `/${normalized}`;

  return `/api/poster/tmdb${path}`;
}

function parseYear(value: string | null | undefined): number | null {
  const normalized = normalizeText(value);

  if (!normalized) {
    return null;
  }

  const match = /^\d{4}/.exec(normalized);

  return match ? Number(match[0]) : null;
}

function mapGenreNames(
  genres:
    | Array<{
        name?: string | null;
      }>
    | null
    | undefined,
): string[] | undefined {
  const names = genres
    ?.map((genre) => normalizeText(genre.name))
    .filter((genre): genre is string => Boolean(genre));

  if (!names?.length) {
    return undefined;
  }

  return Array.from(new Set(names));
}

function getTmdbAccessToken(providedToken?: string): string | null {
  const normalized = normalizeText(providedToken ?? process.env.TMDB_READ_ACCESS_TOKEN);

  return normalized ?? null;
}

export function createTmdbSearchDiagnostics(
  dependencies: MetadataSpikeDependencies = {},
): TmdbSearchDiagnostics {
  const accessToken = getTmdbAccessToken(dependencies.accessToken);

  return {
    source: "tmdb",
    serverOnly: true,
    usedEnvToken: !dependencies.accessToken && Boolean(accessToken),
    tokenPresent: Boolean(accessToken),
    tokenLength: accessToken?.length ?? 0,
    authorizationScheme: accessToken ? "Bearer" : null,
    requestStarted: false,
    requestCount: 0,
    attemptedQueries: [],
    upstreamStatusCode: null,
    mappingSuccessful: false,
    mappedItemCount: 0,
    usedRetry: false,
    finalStateKind: null,
    finalReason: null,
  };
}

function finalizeTmdbDiagnostics(
  diagnostics: TmdbSearchDiagnostics | undefined,
  kind: MetadataSpikeSearchState["kind"],
  reason: MetadataSpikeErrorReason | null = null,
) {
  if (!diagnostics) {
    return;
  }

  diagnostics.finalStateKind = kind;
  diagnostics.finalReason = reason;
}

function getImdbConfig(
  providedConfig: ImdbMetadataSpikeConfig = {},
): ResolvedImdbMetadataSpikeConfig | null {
  const apiKey = normalizeText(providedConfig.apiKey ?? process.env.IMDB_API_KEY);
  const dataSetId = normalizeText(providedConfig.dataSetId ?? process.env.IMDB_DATA_SET_ID);
  const revisionId = normalizeText(providedConfig.revisionId ?? process.env.IMDB_REVISION_ID);
  const assetId = normalizeText(providedConfig.assetId ?? process.env.IMDB_ASSET_ID);
  const region = normalizeText(providedConfig.region ?? process.env.IMDB_AWS_REGION) ?? "us-east-1";

  if (!apiKey || !dataSetId || !revisionId || !assetId) {
    return null;
  }

  return {
    apiKey,
    dataSetId,
    revisionId,
    assetId,
    region,
  };
}

export function formatMetadataSpikeSource(source: MetadataSpikeSource): string {
  return source === "imdb" ? "IMDb" : "TMDb";
}

export function getPreferredMetadataSpikeSource(
  dependencies: MetadataSpikeDependencies = {},
): MetadataSpikeSource {
  if (dependencies.source) {
    return dependencies.source;
  }

  const configuredSource = normalizeText(process.env.METADATA_SPIKE_SOURCE)?.toLowerCase();

  if (configuredSource === "imdb" || configuredSource === "tmdb") {
    return configuredSource;
  }

  if (getTmdbAccessToken(dependencies.accessToken)) {
    return "tmdb";
  }

  if (getImdbConfig(dependencies.imdbConfig)) {
    return "imdb";
  }

  return "tmdb";
}

function toTmdbMediaType(mediaType: MetadataSpikeMediaType): "movie" | "tv" {
  return mediaType === "movie" ? "movie" : "tv";
}

function createExternalId(
  source: MetadataSpikeSource,
  mediaType: MetadataSpikeMediaType,
  sourceId: string | number,
): string {
  return `${source}:${mediaType}:${sourceId}`;
}

function getImdbSynopsis(item: z.infer<typeof imdbTitleSchema>): string | null {
  const firstPlot = item.plots?.edges?.[0]?.node?.plotText?.plainText;

  return normalizeText(firstPlot);
}

function inferImdbMediaType(
  titleType: z.infer<typeof imdbTitleSchema>["titleType"],
): MetadataSpikeMediaType | null {
  const text = titleType?.text?.toLowerCase() ?? "";

  if (text.includes("episode") || text.includes("podcast") || text.includes("game")) {
    return null;
  }

  if (titleType?.canHaveEpisodes) {
    return "series";
  }

  if (text.includes("series") || text.includes("tv")) {
    return "series";
  }

  if (text.includes("movie") || text.includes("film") || text.includes("short")) {
    return "movie";
  }

  if (titleType?.canHaveEpisodes === false) {
    return "movie";
  }

  return null;
}

function mapImdbTitle(
  item: unknown,
  forcedMediaType?: MetadataSpikeMediaType,
): MetadataSpikeTitle | null {
  const parsed = imdbTitleSchema.safeParse(item);

  if (!parsed.success) {
    return null;
  }

  const mediaType = forcedMediaType ?? inferImdbMediaType(parsed.data.titleType);

  if (!mediaType) {
    return null;
  }

  return {
    externalSource: "imdb",
    externalId: createExternalId("imdb", mediaType, parsed.data.id),
    sourceId: parsed.data.id,
    title: normalizeText(parsed.data.titleText?.text) ?? "Ohne Titel",
    mediaType,
    releaseYear: parsed.data.releaseDate?.year ?? null,
    synopsis: getImdbSynopsis(parsed.data),
    posterPath: null,
  };
}

function mapRawSearchItem(item: z.infer<typeof rawSearchItemSchema>): MetadataSpikeTitle | null {
  if (item.media_type !== "movie" && item.media_type !== "tv") {
    return null;
  }

  const mediaType: MetadataSpikeMediaType = item.media_type === "movie" ? "movie" : "series";
  const title = normalizeText(item.title) ?? normalizeText(item.name) ?? "Ohne Titel";
  const originalTitle = normalizeText(
    mediaType === "movie" ? item.original_title : item.original_name,
  );
  const releaseYear =
    mediaType === "movie" ? parseYear(item.release_date) : parseYear(item.first_air_date);

  return {
    externalSource: "tmdb",
    externalId: createExternalId("tmdb", mediaType, item.id),
    sourceId: item.id,
    title,
    ...(originalTitle ? { originalTitle } : {}),
    mediaType,
    releaseYear,
    synopsis: normalizeText(item.overview),
    posterPath: normalizeText(item.poster_path),
  };
}

type RankedMetadataItem = {
  item: MetadataSpikeTitle;
  score: number;
  titleDistance: number;
  popularity: number;
  exactTitle: boolean;
};

function mapRawMovieDetail(item: z.infer<typeof rawMovieDetailSchema>): MetadataSpikeTitle {
  const originalTitle = normalizeText(item.original_title);
  const genres = mapGenreNames(item.genres);

  return {
    externalSource: "tmdb",
    externalId: createExternalId("tmdb", "movie", item.id),
    sourceId: item.id,
    title: normalizeText(item.title) ?? "Ohne Titel",
    ...(originalTitle ? { originalTitle } : {}),
    mediaType: "movie",
    releaseYear: parseYear(item.release_date),
    synopsis: normalizeText(item.overview),
    posterPath: normalizeText(item.poster_path),
    ...(genres ? { genres } : {}),
  };
}

function mapRawSeriesDetail(item: z.infer<typeof rawSeriesDetailSchema>): MetadataSpikeTitle {
  const originalTitle = normalizeText(item.original_name);
  const genres = mapGenreNames(item.genres);

  return {
    externalSource: "tmdb",
    externalId: createExternalId("tmdb", "series", item.id),
    sourceId: item.id,
    title: normalizeText(item.name) ?? "Ohne Titel",
    ...(originalTitle ? { originalTitle } : {}),
    mediaType: "series",
    releaseYear: parseYear(item.first_air_date),
    synopsis: normalizeText(item.overview),
    posterPath: normalizeText(item.poster_path),
    ...(genres ? { genres } : {}),
  };
}

function getMetadataMatchScore(item: MetadataSpikeTitle, query: string): number {
  return getTextMatchScore([item.title], [item.synopsis ?? ""], query);
}

function getEditDistance(a: string, b: string): number {
  if (a === b) {
    return 0;
  }

  if (!a.length) {
    return b.length;
  }

  if (!b.length) {
    return a.length;
  }

  const matrix = Array.from({ length: a.length + 1 }, (_, rowIndex) =>
    Array.from({ length: b.length + 1 }, (_, columnIndex) => {
      if (rowIndex === 0) {
        return columnIndex;
      }

      if (columnIndex === 0) {
        return rowIndex;
      }

      return 0;
    }),
  );

  for (let row = 1; row <= a.length; row += 1) {
    for (let column = 1; column <= b.length; column += 1) {
      const substitutionCost = a[row - 1] === b[column - 1] ? 0 : 1;

      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + substitutionCost,
      );
    }
  }

  return matrix[a.length][b.length];
}

function getTitleDistance(title: string, query: string): number {
  const normalizedTitle = normalizeSearchText(title);
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedTitle || !normalizedQuery) {
    return Number.POSITIVE_INFINITY;
  }

  return getEditDistance(normalizedTitle, normalizedQuery);
}

function getPopularityBonus(popularity: number): number {
  if (!Number.isFinite(popularity) || popularity <= 0) {
    return 0;
  }

  return Math.min(Math.round(popularity * 3), 180);
}

function getTmdbMetadataRanking(item: MetadataSpikeTitle, query: string, popularity: number): RankedMetadataItem {
  const normalizedTitle = normalizeSearchText(item.title);
  const normalizedQuery = normalizeSearchText(query);
  const titleDistance = getTitleDistance(item.title, query);
  const exactTitle = normalizedTitle === normalizedQuery;
  const titleStartsWithQuery =
    Boolean(normalizedTitle && normalizedQuery) &&
    (normalizedTitle.startsWith(normalizedQuery) || normalizedQuery.startsWith(normalizedTitle));
  const titleContainsQuery =
    Boolean(normalizedTitle && normalizedQuery) && normalizedTitle.includes(normalizedQuery);
  const prefixLengthDelta =
    titleStartsWithQuery && normalizedTitle && normalizedQuery
      ? Math.max(normalizedTitle.length - normalizedQuery.length, 0)
      : null;
  let score = getMetadataMatchScore(item, query);

  if (exactTitle) {
    score += 180;
  } else if (titleStartsWithQuery) {
    score += 140;
    score += prefixLengthDelta !== null ? Math.max(72 - prefixLengthDelta * 8, 0) : 0;
  } else if (titleContainsQuery) {
    score += 100;
  } else if (titleDistance === 1 && normalizedQuery.length >= 4) {
    score += 220;
  } else if (titleDistance === 2 && normalizedQuery.length >= 6) {
    score += 120;
  }

  score += getPopularityBonus(popularity);

  if (item.mediaType === "movie") {
    score += 8;
  }

  if (item.releaseYear) {
    score += 4;
  }

  if (item.posterPath) {
    score += 12;
  }

  if (item.synopsis) {
    score += Math.min(Math.round(item.synopsis.length / 8), 120);
  } else {
    score -= 42;
  }

  if (item.title === item.title.toLocaleLowerCase("de")) {
    score -= 150;
  }

  return {
    item,
    score,
    titleDistance,
    popularity,
    exactTitle,
  };
}

function sortMetadataByQueryRelevance(
  items: MetadataSpikeTitle[],
  query: string,
): MetadataSpikeTitle[] {
  return [...items].sort((left, right) => {
    const leftScore = getMetadataMatchScore(left, query);
    const rightScore = getMetadataMatchScore(right, query);

    if (leftScore !== rightScore) {
      return rightScore - leftScore;
    }

    return left.title.localeCompare(right.title, "de");
  });
}

function filterRelevantMetadataItems(
  items: MetadataSpikeTitle[],
  query: string,
): MetadataSpikeTitle[] {
  return sortMetadataByQueryRelevance(items, query).filter((item) => getMetadataMatchScore(item, query) > 0);
}

function dedupeMetadataItems(items: MetadataSpikeTitle[]): MetadataSpikeTitle[] {
  const seen = new Set<string>();

  return items.filter((item) => {
    if (seen.has(item.externalId)) {
      return false;
    }

    seen.add(item.externalId);
    return true;
  });
}

function rankMappedMetadataItems(
  items: MetadataSpikeTitle[],
  query: string,
): MetadataSpikeTitle[] {
  const rankedItems = items
    .map((item) => getTmdbMetadataRanking(item, query, 0))
    .filter(({ score }) => score > 0);

  return sortRankedMetadataItems(dedupeRankedMetadataItems(rankedItems)).map(({ item }) => item);
}

function hasStrongMetadataMatch(items: MetadataSpikeTitle[], query: string): boolean {
  const normalizedQuery = normalizeSearchText(query);

  return items.some((item) => {
    const normalizedTitle = normalizeSearchText(item.title);

    if (normalizedTitle === normalizedQuery) {
      return true;
    }

    return getTitleDistance(item.title, query) <= 1;
  });
}

function dedupeRankedMetadataItems(items: RankedMetadataItem[]): RankedMetadataItem[] {
  const seen = new Set<string>();

  return items.filter(({ item }) => {
    if (seen.has(item.externalId)) {
      return false;
    }

    seen.add(item.externalId);
    return true;
  });
}

function sortRankedMetadataItems(items: RankedMetadataItem[]): RankedMetadataItem[] {
  return [...items].sort((left, right) => {
    if (left.score !== right.score) {
      return right.score - left.score;
    }

    if (left.popularity !== right.popularity) {
      return right.popularity - left.popularity;
    }

    if (left.exactTitle !== right.exactTitle) {
      return Number(right.exactTitle) - Number(left.exactTitle);
    }

    if (left.titleDistance !== right.titleDistance) {
      return left.titleDistance - right.titleDistance;
    }

    if ((left.item.releaseYear ?? 0) !== (right.item.releaseYear ?? 0)) {
      return (right.item.releaseYear ?? 0) - (left.item.releaseYear ?? 0);
    }

    return left.item.title.localeCompare(right.item.title, "de");
  });
}

function buildRelaxedTmdbQueries(query: string): string[] {
  const words = normalizeQuery(query)
    .split(" ")
    .map((value) => value.trim())
    .filter(Boolean);

  if (!words.length) {
    return [];
  }

  const candidates = new Set<string>();
  const shortenedWords = words
    .map((word) => {
      if (word.length >= 6) {
        return word.slice(0, word.length - 1);
      }

      if (word.length >= 4) {
        return word.slice(0, 3);
      }

      return word;
    })
    .filter((word) => word.length >= 2);

  const prefixWords = words
    .map((word) => word.slice(0, Math.min(word.length, 3)))
    .filter((word) => word.length >= 2);

  if (shortenedWords.length) {
    candidates.add(shortenedWords.join(" "));
  }

  if (prefixWords.length) {
    candidates.add(prefixWords.join(" "));
  }

  if (words.length === 1 && words[0].length >= 4) {
    candidates.add(words[0].slice(0, 4));
  }

  if (words.length === 1 && words[0].length >= 5 && words[0].length <= 10) {
    const word = words[0];

    for (let index = 1; index < word.length - 1; index += 1) {
      candidates.add(`${word.slice(0, index)}${word[index]}${word.slice(index)}`);
    }
  }

  candidates.delete(normalizeQuery(query));

  return [...candidates];
}

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function parseJsonBody(body: unknown): unknown {
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return null;
    }
  }

  if (body instanceof Uint8Array) {
    try {
      return JSON.parse(Buffer.from(body).toString("utf8"));
    } catch {
      return null;
    }
  }

  if (body && typeof body === "object") {
    return body;
  }

  return null;
}

async function fetchTmdb(
  path: string,
  dependencies: MetadataSpikeDependencies = {},
): Promise<Response> {
  const accessToken = getTmdbAccessToken(dependencies.accessToken);
  const fetchImpl = dependencies.fetchImpl ?? fetch;
  const timeoutMs = dependencies.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  if (!accessToken) {
    throw new Error("TMDB_NOT_CONFIGURED");
  }

  return fetchImpl(`${TMDB_BASE_URL}${path}`, {
    method: "GET",
    cache: "no-store",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    signal: AbortSignal.timeout(timeoutMs),
  });
}

async function sendImdbGraphql(
  query: string,
  variables: Record<string, unknown> | undefined,
  dependencies: MetadataSpikeDependencies = {},
): Promise<unknown> {
  const config = getImdbConfig(dependencies.imdbConfig);

  if (!config) {
    throw new Error("IMDB_NOT_CONFIGURED");
  }

  if (dependencies.imdbSendImpl) {
    return dependencies.imdbSendImpl({
      query,
      variables,
      config,
    });
  }

  const client = new DataExchangeClient({
    region: config.region,
  });
  const response = await client.send(
    new SendApiAssetCommand({
      AssetId: config.assetId,
      DataSetId: config.dataSetId,
      RevisionId: config.revisionId,
      Method: "POST",
      Path: IMDB_API_PATH,
      Body: JSON.stringify({
        query,
        variables,
      }),
      RequestHeaders: {
        accept: "application/json",
        "content-type": "application/json",
        "x-api-key": config.apiKey,
      },
    }),
  );

  return parseJsonBody(response.Body);
}

export function parseSpikeQuery(query: string | string[] | undefined): string {
  if (Array.isArray(query)) {
    return normalizeQuery(query[0] ?? "");
  }

  return normalizeQuery(query ?? "");
}

export function parseSpikeDetailParams(input: {
  mediaType: string;
  externalId: string;
}): MetadataSpikeDetailParams | null {
  if (input.mediaType !== "movie" && input.mediaType !== "series") {
    return null;
  }

  if (/^\d+$/.test(input.externalId)) {
    const externalId = Number(input.externalId);

    if (!Number.isInteger(externalId) || externalId <= 0) {
      return null;
    }

    return {
      source: "tmdb",
      mediaType: input.mediaType,
      externalId,
    };
  }

  if (!/^tt\d+$/.test(input.externalId)) {
    return null;
  }

  return {
    source: "imdb",
    mediaType: input.mediaType,
    externalId: input.externalId,
  };
}

export function mapTmdbSearchPayload(payload: unknown): MetadataSpikeTitle[] | null {
  const parsed = rawSearchResponseSchema.safeParse(payload);

  if (!parsed.success) {
    return null;
  }

  return parsed.data.results
    .map((item) => mapRawSearchItem(item))
    .filter((item): item is MetadataSpikeTitle => item !== null);
}

function mapRankedTmdbSearchPayload(
  payload: unknown,
  query: string,
): MetadataSpikeTitle[] | null {
  const parsed = rawSearchResponseSchema.safeParse(payload);

  if (!parsed.success) {
    return null;
  }

  const rankedItems = parsed.data.results
    .map((rawItem) => {
      const mappedItem = mapRawSearchItem(rawItem);

      if (!mappedItem) {
        return null;
      }

      return getTmdbMetadataRanking(mappedItem, query, rawItem.popularity ?? 0);
    })
    .filter((item): item is RankedMetadataItem => item !== null)
    .filter(({ score }) => score > 0);

  return sortRankedMetadataItems(dedupeRankedMetadataItems(rankedItems)).map(({ item }) => item);
}

export function mapImdbSearchPayload(payload: unknown): MetadataSpikeTitle[] | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const data = (payload as { data?: unknown }).data;

  if (!data || typeof data !== "object") {
    return null;
  }

  const mainSearch = (data as { mainSearch?: unknown }).mainSearch;

  if (!mainSearch || typeof mainSearch !== "object") {
    return null;
  }

  const edges = (mainSearch as { edges?: unknown }).edges;

  if (!Array.isArray(edges)) {
    return null;
  }

  return edges
    .map((edge) => {
      if (!edge || typeof edge !== "object") {
        return null;
      }

      const node = (edge as { node?: unknown }).node;

      if (!node || typeof node !== "object") {
        return null;
      }

      return mapImdbTitle((node as { entity?: unknown }).entity);
    })
    .filter((item): item is MetadataSpikeTitle => item !== null);
}

function mapImdbDetailPayload(
  payload: unknown,
  mediaType: MetadataSpikeMediaType,
): ImdbDetailMapping {
  if (!payload || typeof payload !== "object") {
    return { kind: "invalid" };
  }

  const data = (payload as { data?: unknown }).data;

  if (!data || typeof data !== "object") {
    return { kind: "invalid" };
  }

  const title = (data as { title?: unknown }).title;

  if (title === null) {
    return { kind: "not_found" };
  }

  const item = mapImdbTitle(title, mediaType);

  if (!item) {
    return { kind: "invalid" };
  }

  return {
    kind: "success",
    item,
  };
}

export async function searchMetadata(
  query: string,
  dependencies: MetadataSpikeDependencies = {},
): Promise<MetadataSpikeSearchState> {
  const source = getPreferredMetadataSpikeSource(dependencies);

  return source === "imdb"
    ? searchImdbMetadata(query, dependencies)
    : searchTmdbMetadata(query, dependencies);
}

export async function searchTmdbMetadata(
  query: string,
  dependencies: MetadataSpikeDependencies = {},
): Promise<MetadataSpikeSearchState> {
  const normalizedQuery = normalizeQuery(query);
  const accessToken = getTmdbAccessToken(dependencies.accessToken);
  const diagnostics = dependencies.tmdbDiagnostics;

  if (!normalizedQuery) {
    finalizeTmdbDiagnostics(diagnostics, "idle");
    return {
      kind: "idle",
      query: "",
      source: "tmdb",
      message:
        "Dieser Pfad ist ein technischer Test für serverseitige Metadaten. Gib einen Titel ein, um den Probezugriff zu starten.",
      items: [],
    };
  }

  if (normalizedQuery.length < 2) {
    finalizeTmdbDiagnostics(diagnostics, "error", "invalid_query");
    return {
      kind: "error",
      query: normalizedQuery,
      source: "tmdb",
      reason: "invalid_query",
      message: "Bitte mindestens zwei Zeichen eingeben, damit der Testzugriff sinnvoll bleibt.",
      items: [],
    };
  }

  if (!accessToken) {
    finalizeTmdbDiagnostics(diagnostics, "disabled");
    return {
      kind: "disabled",
      query: normalizedQuery,
      source: "tmdb",
      message:
        "Ergaenzende Titeldaten sind lokal noch nicht verfuegbar. Auf dem Server fehlt noch ein gueltiger TMDb-Zugang.",
      items: [],
    };
  }

  try {
    const runTmdbSearch = async (searchQuery: string) => {
      const pagesToFetch =
        searchQuery !== normalizedQuery && searchQuery.length <= 4 ? [1, 2] : [1];
      const collectedItems: MetadataSpikeTitle[] = [];

      for (const page of pagesToFetch) {
        if (diagnostics) {
          diagnostics.requestStarted = true;
          diagnostics.requestCount += 1;
          diagnostics.attemptedQueries.push(page === 1 ? searchQuery : `${searchQuery}#${page}`);
          diagnostics.usedRetry ||= searchQuery !== normalizedQuery;
        }

        const searchParams = new URLSearchParams({
          query: searchQuery,
          language: "de-DE",
          include_adult: "false",
          page: String(page),
        });
        const response = await fetchTmdb(`/search/multi?${searchParams.toString()}`, {
          ...dependencies,
          accessToken,
        });

        if (diagnostics) {
          diagnostics.upstreamStatusCode = response.status;
        }

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            return {
              kind: "error" as const,
              reason: "misconfigured" as const,
              message:
                "Ergaenzende Titeldaten sind gerade nicht verfuegbar. Der Serverzugang zu TMDb muss geprueft werden.",
              items: [] as MetadataSpikeTitle[],
            };
          }

          if (response.status === 404) {
            return {
              kind: "error" as const,
              reason: "not_found" as const,
              message:
                "Die ergaenzende Titelsuche konnte gerade keine verwendbaren Daten abrufen.",
              items: [] as MetadataSpikeTitle[],
            };
          }

          return {
            kind: "error" as const,
            reason: "api_error" as const,
            message:
              "Ergaenzende Titeldaten konnten gerade nicht geladen werden. Bitte spaeter noch einmal versuchen.",
            items: [] as MetadataSpikeTitle[],
          };
        }

        const payload = await safeJson(response);
        const pageItems = mapRankedTmdbSearchPayload(payload, normalizedQuery);

        if (!pageItems) {
          if (diagnostics) {
            diagnostics.mappingSuccessful = false;
            diagnostics.mappedItemCount = 0;
          }

          return {
            kind: "error" as const,
            reason: "invalid_response" as const,
            message:
              "Ergaenzende Titeldaten waren gerade nicht in einer nutzbaren Form verfuegbar.",
            items: [] as MetadataSpikeTitle[],
          };
        }

        collectedItems.push(...pageItems);
      }

      const items = rankMappedMetadataItems(dedupeMetadataItems(collectedItems), normalizedQuery);

      if (diagnostics) {
        diagnostics.mappingSuccessful = true;
        diagnostics.mappedItemCount = items.length;
      }

      return {
        kind: "success" as const,
        items,
      };
    };

    const primaryResult = await runTmdbSearch(normalizedQuery);

    if (primaryResult.kind === "error") {
      finalizeTmdbDiagnostics(diagnostics, "error", primaryResult.reason);
      return {
        kind: "error",
        query: normalizedQuery,
        source: "tmdb",
        reason: primaryResult.reason,
        message: primaryResult.message,
        items: [],
      };
    }

    const relevantPrimaryItems = primaryResult.items;

    if (relevantPrimaryItems.length && hasStrongMetadataMatch(relevantPrimaryItems, normalizedQuery)) {
      finalizeTmdbDiagnostics(diagnostics, "success");
      return {
        kind: "success",
        query: normalizedQuery,
        source: "tmdb",
        message:
          "Die zusaetzlichen Treffer zeigen nur Titeldaten. Ein Reizprofil liegt dafuer noch nicht vor.",
        items: relevantPrimaryItems,
      };
    }

    for (const relaxedQuery of buildRelaxedTmdbQueries(normalizedQuery)) {
      const retryResult = await runTmdbSearch(relaxedQuery);

      if (retryResult.kind === "error") {
        finalizeTmdbDiagnostics(diagnostics, "error", retryResult.reason);
        return {
          kind: "error",
          query: normalizedQuery,
          source: "tmdb",
          reason: retryResult.reason,
          message: retryResult.message,
          items: [],
        };
      }

      const relevantRetryItems = rankMappedMetadataItems(
        dedupeMetadataItems([...relevantPrimaryItems, ...retryResult.items]),
        normalizedQuery,
      );

      if (relevantRetryItems.length && hasStrongMetadataMatch(relevantRetryItems, normalizedQuery)) {
        finalizeTmdbDiagnostics(diagnostics, "success");
        return {
          kind: "success",
          query: normalizedQuery,
          source: "tmdb",
          message:
            "Die zusaetzlichen Treffer stammen aus einer fehlertoleranten Suche. Ein Reizprofil liegt dafuer noch nicht vor.",
          items: relevantRetryItems,
        };
      }
    }

    if (relevantPrimaryItems.length) {
      finalizeTmdbDiagnostics(diagnostics, "success");
      return {
        kind: "success",
        query: normalizedQuery,
        source: "tmdb",
        message:
          "Die zusaetzlichen Treffer zeigen nur Titeldaten. Ein Reizprofil liegt dafuer noch nicht vor.",
        items: relevantPrimaryItems,
      };
    }

    finalizeTmdbDiagnostics(diagnostics, "empty");
    return {
      kind: "empty",
      query: normalizedQuery,
      source: "tmdb",
      message:
        "Zu dieser Suche wurden auch in den ergaenzenden Titeldaten keine passenden Filme oder Serien gefunden.",
      items: [],
    };
  } catch (error) {
    if (error instanceof Error && error.message === "TMDB_NOT_CONFIGURED") {
      finalizeTmdbDiagnostics(diagnostics, "disabled");
      return {
        kind: "disabled",
        query: normalizedQuery,
        source: "tmdb",
        message:
          "Ergaenzende Titeldaten sind lokal noch nicht verfuegbar. Auf dem Server fehlt noch ein gueltiger TMDb-Zugang.",
        items: [],
      };
    }

    if (error instanceof Error && error.name === "TimeoutError") {
      finalizeTmdbDiagnostics(diagnostics, "error", "timeout");
      return {
        kind: "error",
        query: normalizedQuery,
        source: "tmdb",
        reason: "timeout",
        message:
          "Ergaenzende Titeldaten antworten gerade zu langsam. Bitte spaeter noch einmal versuchen.",
        items: [],
      };
    }

    finalizeTmdbDiagnostics(diagnostics, "error", "api_error");
    return {
      kind: "error",
      query: normalizedQuery,
      source: "tmdb",
      reason: "api_error",
      message:
        "Ergaenzende Titeldaten konnten gerade nicht erreicht werden. Die Suche im Katalog bleibt davon unberuehrt.",
      items: [],
    };
  }
}

export async function searchImdbMetadata(
  query: string,
  dependencies: MetadataSpikeDependencies = {},
): Promise<MetadataSpikeSearchState> {
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery) {
    return {
      kind: "idle",
      query: "",
      source: "imdb",
      message:
        "Dieser Pfad ist ein technischer Test für serverseitige Metadaten. Gib einen Titel ein, um den offiziellen IMDb-Versuch zu starten.",
      items: [],
    };
  }

  if (normalizedQuery.length < 2) {
    return {
      kind: "error",
      query: normalizedQuery,
      source: "imdb",
      reason: "invalid_query",
      message: "Bitte mindestens zwei Zeichen eingeben, damit der Testzugriff sinnvoll bleibt.",
      items: [],
    };
  }

  if (!getImdbConfig(dependencies.imdbConfig)) {
    return {
      kind: "disabled",
      query: normalizedQuery,
      source: "imdb",
      message:
        "IMDb ist aktuell nur als spätere Option vorbereitet. Für echte Treffer brauchst du IMDB_API_KEY, IMDB_DATA_SET_ID, IMDB_REVISION_ID, IMDB_ASSET_ID und gültige AWS-Zugangsdaten.",
      items: [],
    };
  }

  try {
    const payload = await sendImdbGraphql(
      IMDB_SEARCH_QUERY,
      {
        searchTerm: normalizedQuery,
      },
      dependencies,
    );
    const items = mapImdbSearchPayload(payload);

    if (!items) {
      return {
        kind: "error",
        query: normalizedQuery,
        source: "imdb",
        reason: "invalid_response",
        message:
          "Die offizielle IMDb-Antwort konnte nicht stabil auf das interne Modell gemappt werden. Der Spike stoppt deshalb kontrolliert.",
        items: [],
      };
    }

    if (!items.length) {
      return {
        kind: "empty",
        query: normalizedQuery,
        source: "imdb",
        message:
          "Für diese Anfrage wurden in IMDb keine passenden Film- oder Serien-Metadaten gefunden. Reizprofile entstehen daraus weiterhin nicht automatisch.",
        items: [],
      };
    }

    return {
      kind: "success",
      query: normalizedQuery,
      source: "imdb",
      message:
        "Die IMDb-Treffer zeigen nur Katalog-Metadaten. Sie werden nicht mit dem Reizprofil des MVP vermischt.",
      items,
    };
  } catch (error) {
    if (error instanceof Error && error.message === "IMDB_NOT_CONFIGURED") {
      return {
        kind: "disabled",
        query: normalizedQuery,
        source: "imdb",
        message:
          "IMDb ist aktuell nur als spätere Option vorbereitet. Für echte Treffer brauchst du IMDB_API_KEY, IMDB_DATA_SET_ID, IMDB_REVISION_ID, IMDB_ASSET_ID und gültige AWS-Zugangsdaten.",
        items: [],
      };
    }

    return {
      kind: "error",
      query: normalizedQuery,
      source: "imdb",
      reason: "api_error",
      message:
        "Die offizielle IMDb-Quelle war serverseitig nicht erreichbar oder nicht autorisiert. Mock-Daten und Reizprofile bleiben davon unberührt.",
      items: [],
    };
  }
}

export async function getMetadataDetail(
  params: MetadataSpikeDetailParams,
  dependencies: MetadataSpikeDependencies = {},
): Promise<MetadataSpikeDetailState> {
  return params.source === "imdb"
    ? getImdbMetadataDetail(params.mediaType, String(params.externalId), dependencies)
    : getTmdbMetadataDetail(params.mediaType, Number(params.externalId), dependencies);
}

export async function getTmdbMetadataDetail(
  mediaType: MetadataSpikeMediaType,
  externalId: number,
  dependencies: MetadataSpikeDependencies = {},
): Promise<MetadataSpikeDetailState> {
  if (!getTmdbAccessToken(dependencies.accessToken)) {
    return {
      kind: "disabled",
      source: "tmdb",
      message:
        "Der serverseitige TMDB-Spike ist lokal noch nicht aktiviert. Lege zuerst TMDB_READ_ACCESS_TOKEN an.",
    };
  }

  try {
    const endpoint = `/${toTmdbMediaType(mediaType)}/${externalId}?language=de-DE`;
    const response = await fetchTmdb(endpoint, dependencies);

    if (response.status === 404) {
      return {
        kind: "error",
        source: "tmdb",
        reason: "not_found",
        message:
          "Der angefragte Titel wurde extern nicht gefunden. Das beeinflusst den eigentlichen null-noise-Katalog nicht.",
      };
    }

    if (!response.ok) {
      return {
        kind: "error",
        source: "tmdb",
        reason: "api_error",
        message:
          "Die externe Metadatenquelle hat den Detailrequest nicht erfolgreich beantwortet.",
      };
    }

    const payload = await safeJson(response);
    const parsed =
      mediaType === "movie"
        ? rawMovieDetailSchema.safeParse(payload)
        : rawSeriesDetailSchema.safeParse(payload);

    if (!parsed.success) {
      return {
        kind: "error",
        source: "tmdb",
        reason: "invalid_response",
        message:
          "Die externe Metadatenquelle hat ein unerwartetes Detailformat geliefert. Der Spike zeigt deshalb keinen ungeprüften Inhalt an.",
      };
    }

    return {
      kind: "success",
      source: "tmdb",
      item:
        mediaType === "movie"
          ? mapRawMovieDetail(parsed.data)
          : mapRawSeriesDetail(parsed.data),
      message:
        "Auch die Detailansicht zeigt nur externe Metadaten. Reizprofile oder Bewertungen werden daraus nicht berechnet.",
    };
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      return {
        kind: "error",
        source: "tmdb",
        reason: "timeout",
        message:
          "Die externe Metadatenquelle hat nicht rechtzeitig geantwortet. Der Detailrequest wurde kontrolliert beendet.",
      };
    }

    return {
      kind: "error",
      source: "tmdb",
      reason: "api_error",
      message: "Die Detaildaten konnten serverseitig nicht geladen werden.",
    };
  }
}

export async function getImdbMetadataDetail(
  mediaType: MetadataSpikeMediaType,
  externalId: string,
  dependencies: MetadataSpikeDependencies = {},
): Promise<MetadataSpikeDetailState> {
  if (!getImdbConfig(dependencies.imdbConfig)) {
    return {
      kind: "disabled",
      source: "imdb",
      message:
        "IMDb ist aktuell nur als spätere Option vorbereitet. Für echte Treffer brauchst du IMDB_API_KEY, IMDB_DATA_SET_ID, IMDB_REVISION_ID, IMDB_ASSET_ID und gültige AWS-Zugangsdaten.",
    };
  }

  try {
    const payload = await sendImdbGraphql(
      IMDB_DETAIL_QUERY,
      {
        id: externalId,
      },
      dependencies,
    );
    const mapped = mapImdbDetailPayload(payload, mediaType);

    if (mapped.kind === "not_found") {
      return {
        kind: "error",
        source: "imdb",
        reason: "not_found",
        message:
          "Der angefragte IMDb-Titel wurde nicht gefunden. Das beeinflusst den eigentlichen null-noise-Katalog nicht.",
      };
    }

    if (mapped.kind === "invalid") {
      return {
        kind: "error",
        source: "imdb",
        reason: "invalid_response",
        message:
          "Die IMDb-Detailantwort war unvollständig oder unerwartet. Der Spike zeigt deshalb keinen ungeprüften Inhalt an.",
      };
    }

    return {
      kind: "success",
      source: "imdb",
      item: mapped.item,
      message:
        "Auch die Detailansicht zeigt nur externe IMDb-Metadaten. Reizprofile oder Bewertungen werden daraus nicht berechnet.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "IMDB_NOT_CONFIGURED") {
      return {
        kind: "disabled",
        source: "imdb",
        message:
          "IMDb ist aktuell nur als spätere Option vorbereitet. Für echte Treffer brauchst du IMDB_API_KEY, IMDB_DATA_SET_ID, IMDB_REVISION_ID, IMDB_ASSET_ID und gültige AWS-Zugangsdaten.",
      };
    }

    return {
      kind: "error",
      source: "imdb",
      reason: "api_error",
      message:
        "Die IMDb-Detaildaten konnten serverseitig nicht geladen werden.",
    };
  }
}
