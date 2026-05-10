import { DataExchangeClient, SendApiAssetCommand } from "@aws-sdk/client-dataexchange";
import { z } from "zod";

import { createMetadataInferencePreview } from "./metadata-inference";
import { getProfileTendency } from "./format";
import { getTextMatchScore, matchesAvoidanceFilters, normalizeSearchText } from "./search";
import type { SearchFilters } from "./types";

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
  keywords?: string[];
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

export type MetadataSpikeBrowseSectionId = "quiet" | "balanced" | "loud";

export interface MetadataSpikeBrowseSection {
  id: MetadataSpikeBrowseSectionId;
  title: string;
  description: string;
  items: MetadataSpikeTitle[];
}

export type MetadataSpikeBrowseState =
  | {
      kind: "disabled";
      source: "tmdb";
      message: string;
      items: [];
    }
  | {
      kind: "error";
      source: "tmdb";
      reason: MetadataSpikeErrorReason;
      message: string;
      items: [];
    }
  | {
      kind: "empty";
      source: "tmdb";
      message: string;
      items: [];
    }
  | {
      kind: "success";
      source: "tmdb";
      message: string;
      items: MetadataSpikeTitle[];
      sections: MetadataSpikeBrowseSection[];
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

export type MetadataWatchProviderGroupKey = "flatrate" | "free" | "rent" | "buy";

export interface MetadataWatchProvider {
  id: number;
  name: string;
  offerUrl: string | null;
  offerMode: "direct" | "listing";
  format: string | null;
  price: number | null;
}

export interface MetadataWatchProviderGroup {
  id: MetadataWatchProviderGroupKey;
  label: string;
  providers: MetadataWatchProvider[];
}

export type MetadataWatchProviderState =
  | {
      kind: "disabled";
      source: "tmdb" | "watchmode";
      region: string;
      message: string;
    }
  | {
      kind: "error";
      source: "tmdb" | "watchmode";
      region: string;
      message: string;
    }
  | {
      kind: "empty";
      source: "tmdb" | "watchmode";
      region: string;
      link: string | null;
      message: string;
    }
  | {
      kind: "success";
      source: "tmdb" | "watchmode";
      region: string;
      link: string | null;
      groups: MetadataWatchProviderGroup[];
      attribution: string;
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
  watchmodeApiKey?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  cacheMode?: RequestCache;
  revalidateSeconds?: number;
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
const WATCHMODE_BASE_URL = "https://api.watchmode.com/v1";
export const tmdbPosterSizes = ["w185", "w342", "w500", "w780", "original"] as const;

export type TmdbPosterSize = (typeof tmdbPosterSizes)[number];

const TMDB_POSTER_BASE_URL = "https://image.tmdb.org/t/p";
const DEFAULT_TMDB_POSTER_SIZE: TmdbPosterSize = "w342";
const DEFAULT_TIMEOUT_MS = 4_000;
const DEFAULT_TMDB_WATCH_REGION = "DE";
const WATCHMODE_WATCH_REVALIDATE_SECONDS = 10_800;
const TMDB_DISCOVER_REVALIDATE_SECONDS = 1_800;
const TMDB_DETAIL_REVALIDATE_SECONDS = 21_600;
const TMDB_WATCH_REVALIDATE_SECONDS = 10_800;
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
  genre_ids: z.array(z.number().int()).nullish(),
  popularity: z.number().nullish(),
});

const rawSearchResponseSchema = z.object({
  results: z.array(rawSearchItemSchema),
});

const rawDiscoverResponseSchema = z.object({
  results: z.array(rawSearchItemSchema.omit({ media_type: true })),
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
  keywords: z
    .object({
      keywords: z
        .array(
          z.object({
            name: z.string().nullish(),
          }),
        )
        .nullish(),
    })
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
  keywords: z
    .object({
      results: z
        .array(
          z.object({
            name: z.string().nullish(),
          }),
        )
        .nullish(),
    })
    .nullish(),
});

const rawWatchProviderSchema = z.object({
  provider_id: z.number().int().nonnegative(),
  provider_name: z.string().nullish(),
  display_priority: z.number().int().nullish(),
});

const rawWatchProviderRegionSchema = z.object({
  link: z.string().nullish(),
  flatrate: z.array(rawWatchProviderSchema).nullish(),
  free: z.array(rawWatchProviderSchema).nullish(),
  rent: z.array(rawWatchProviderSchema).nullish(),
  buy: z.array(rawWatchProviderSchema).nullish(),
});

const rawWatchProviderResponseSchema = z.object({
  results: z.record(z.string(), rawWatchProviderRegionSchema).default({}),
});

const rawWatchmodeSourceSchema = z.object({
  source_id: z.number().int().nonnegative(),
  name: z.string().nullish(),
  type: z.enum(["sub", "rent", "buy", "free", "tve"]).nullish(),
  region: z.string().nullish(),
  web_url: z.string().nullish(),
  format: z.string().nullish(),
  price: z.number().nullish(),
});

const rawWatchmodeSourceResponseSchema = z.array(rawWatchmodeSourceSchema);

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

const tmdbMovieGenreNames: Record<number, string> = {
  12: "Adventure",
  14: "Fantasy",
  16: "Animation",
  18: "Drama",
  27: "Horror",
  28: "Action",
  35: "Comedy",
  36: "History",
  37: "Western",
  53: "Thriller",
  80: "Crime",
  878: "Science Fiction",
  9648: "Mystery",
  99: "Documentary",
  10402: "Music",
  10749: "Romance",
  10751: "Family",
  10752: "War",
  10770: "TV Movie",
};

const tmdbSeriesGenreNames: Record<number, string> = {
  16: "Animation",
  18: "Drama",
  35: "Comedy",
  37: "Western",
  80: "Crime",
  99: "Documentary",
  9648: "Mystery",
  10751: "Family",
  10759: "Action & Adventure",
  10762: "Kids",
  10763: "News",
  10764: "Reality",
  10765: "Science Fiction & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
};

function normalizeQuery(value: string): string {
  return value.trim().replace(/\s+/g, " ").slice(0, 80);
}

function normalizeText(value: string | null | undefined): string | null {
  const normalized = value?.trim();

  return normalized ? normalized : null;
}

export function getTmdbPosterUrl(
  posterPath: string | null | undefined,
  size: TmdbPosterSize = DEFAULT_TMDB_POSTER_SIZE,
): string | null {
  const normalized = normalizeText(posterPath);

  if (!normalized) {
    return null;
  }

  const path = normalized.startsWith("/") ? normalized : `/${normalized}`;

  return `${TMDB_POSTER_BASE_URL}/${size}${path}`;
}

export function getTmdbPosterProxyPath(
  posterPath: string | null | undefined,
  size: TmdbPosterSize = DEFAULT_TMDB_POSTER_SIZE,
): string | null {
  const normalized = normalizeText(posterPath);

  if (!normalized) {
    return null;
  }

  const path = normalized.startsWith("/") ? normalized : `/${normalized}`;

  if (size === DEFAULT_TMDB_POSTER_SIZE) {
    return `/api/poster/tmdb${path}`;
  }

  return `/api/poster/tmdb/${size}${path}`;
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

function mapKeywordNames(
  keywords:
    | Array<{
        name?: string | null;
      }>
    | null
    | undefined,
): string[] | undefined {
  const names = keywords
    ?.map((keyword) => normalizeText(keyword.name))
    .filter((keyword): keyword is string => Boolean(keyword));

  if (!names?.length) {
    return undefined;
  }

  return Array.from(new Set(names));
}

function mapGenreIds(
  genreIds: number[] | null | undefined,
  mediaType: MetadataSpikeMediaType,
): string[] | undefined {
  if (!genreIds?.length) {
    return undefined;
  }

  const dictionary = mediaType === "movie" ? tmdbMovieGenreNames : tmdbSeriesGenreNames;
  const names = genreIds
    .map((genreId) => dictionary[genreId])
    .filter((genreName): genreName is string => Boolean(genreName));

  if (!names.length) {
    return undefined;
  }

  return Array.from(new Set(names));
}

function mapWatchProviders(
  providers:
    | Array<{
        provider_id: number;
        provider_name?: string | null;
        display_priority?: number | null;
      }>
    | null
    | undefined,
  offerUrl: string | null,
): MetadataWatchProvider[] {
  if (!providers?.length) {
    return [];
  }

  const deduplicatedProviders = new Map<
    number,
    { name: string; displayPriority: number; providerId: number; offerUrl: string | null }
  >();

  for (const provider of providers) {
    const name = normalizeText(provider.provider_name);

    if (!name) {
      continue;
    }

    deduplicatedProviders.set(provider.provider_id, {
      name,
      displayPriority: provider.display_priority ?? Number.MAX_SAFE_INTEGER,
      providerId: provider.provider_id,
      offerUrl,
    });
  }

  return [...deduplicatedProviders.values()]
    .sort((left, right) => {
      if (left.displayPriority !== right.displayPriority) {
        return left.displayPriority - right.displayPriority;
      }

      return left.name.localeCompare(right.name, "de");
    })
    .map((provider) => ({
      id: provider.providerId,
      name: provider.name,
      offerUrl: provider.offerUrl,
      offerMode: provider.offerUrl ? "listing" : "listing",
      format: null,
      price: null,
    }));
}

function mapWatchProviderGroups(
  regionData: z.infer<typeof rawWatchProviderRegionSchema>,
): MetadataWatchProviderGroup[] {
  const sharedOfferUrl = normalizeText(regionData.link);
  const groupDefinitions: Array<{ id: MetadataWatchProviderGroupKey; label: string }> = [
    { id: "flatrate", label: "Im Abo" },
    { id: "free", label: "Kostenlos" },
    { id: "rent", label: "Leihen" },
    { id: "buy", label: "Kaufen" },
  ];

  return groupDefinitions
    .map((group) => ({
      id: group.id,
      label: group.label,
      providers: mapWatchProviders(regionData[group.id], sharedOfferUrl),
    }))
    .filter((group) => group.providers.length > 0);
}

function toWatchmodeTitleId(
  mediaType: MetadataSpikeMediaType,
  externalId: number,
): string {
  return `${toTmdbMediaType(mediaType)}-${externalId}`;
}

function normalizeOfferUrl(value: string | null | undefined): string | null {
  const normalized = normalizeText(value);

  if (!normalized || !/^https?:\/\//i.test(normalized)) {
    return null;
  }

  return normalized;
}

function mapWatchmodeGroupId(
  sourceType: z.infer<typeof rawWatchmodeSourceSchema>["type"],
): MetadataWatchProviderGroupKey | null {
  if (sourceType === "sub") {
    return "flatrate";
  }

  if (sourceType === "free") {
    return "free";
  }

  if (sourceType === "rent") {
    return "rent";
  }

  if (sourceType === "buy") {
    return "buy";
  }

  return null;
}

function mapWatchmodeProviderGroups(
  sources: z.infer<typeof rawWatchmodeSourceResponseSchema>,
  region: string,
): MetadataWatchProviderGroup[] {
  const groupedProviders = new Map<
    MetadataWatchProviderGroupKey,
    Map<number, MetadataWatchProvider>
  >();

  for (const source of sources) {
    const groupId = mapWatchmodeGroupId(source.type);
    const name = normalizeText(source.name);
    const sourceRegion = normalizeText(source.region)?.toUpperCase();

    if (!groupId || !name || !sourceRegion || sourceRegion !== region) {
      continue;
    }

    if (!groupedProviders.has(groupId)) {
      groupedProviders.set(groupId, new Map());
    }

    const targetGroup = groupedProviders.get(groupId);

    if (!targetGroup) {
      continue;
    }

    const nextProvider: MetadataWatchProvider = {
      id: source.source_id,
      name,
      offerUrl: normalizeOfferUrl(source.web_url),
      offerMode: "direct",
      format: normalizeText(source.format),
      price: typeof source.price === "number" ? source.price : null,
    };
    const existingProvider = targetGroup.get(source.source_id);

    if (!existingProvider) {
      targetGroup.set(source.source_id, nextProvider);
      continue;
    }

    const nextHasBetterUrl = !existingProvider.offerUrl && nextProvider.offerUrl;
    const nextHasCheaperPrice =
      typeof nextProvider.price === "number" &&
      (existingProvider.price === null || nextProvider.price < existingProvider.price);
    const nextHasFormat = !existingProvider.format && nextProvider.format;

    if (nextHasBetterUrl || nextHasCheaperPrice || nextHasFormat) {
      targetGroup.set(source.source_id, {
        ...existingProvider,
        offerUrl: nextHasBetterUrl ? nextProvider.offerUrl : existingProvider.offerUrl,
        price: nextHasCheaperPrice ? nextProvider.price : existingProvider.price,
        format: nextHasFormat ? nextProvider.format : existingProvider.format,
      });
    }
  }

  const groupDefinitions: Array<{ id: MetadataWatchProviderGroupKey; label: string }> = [
    { id: "flatrate", label: "Im Abo" },
    { id: "free", label: "Kostenlos" },
    { id: "rent", label: "Leihen" },
    { id: "buy", label: "Kaufen" },
  ];

  return groupDefinitions
    .map((group) => {
      const providers = [...(groupedProviders.get(group.id)?.values() ?? [])].sort((left, right) => {
        const leftPrice = left.price ?? Number.POSITIVE_INFINITY;
        const rightPrice = right.price ?? Number.POSITIVE_INFINITY;

        if (leftPrice !== rightPrice) {
          return leftPrice - rightPrice;
        }

        return left.name.localeCompare(right.name, "de");
      });

      return {
        id: group.id,
        label: group.label,
        providers,
      };
    })
    .filter((group) => group.providers.length > 0);
}

function getTmdbAccessToken(providedToken?: string): string | null {
  const normalized = normalizeText(providedToken ?? process.env.TMDB_READ_ACCESS_TOKEN);

  return normalized ?? null;
}

function getWatchmodeApiKey(providedApiKey?: string): string | null {
  const normalized = normalizeText(providedApiKey ?? process.env.WATCHMODE_API_KEY);

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
  const genres = mapGenreIds(item.genre_ids, mediaType);

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
    ...(genres ? { genres } : {}),
  };
}

function mapRawDiscoverItems(
  payload: unknown,
  mediaType: MetadataSpikeMediaType,
): MetadataSpikeTitle[] | null {
  const parsed = rawDiscoverResponseSchema.safeParse(payload);

  if (!parsed.success) {
    return null;
  }

  return parsed.data.results
    .map((item) =>
      mapRawSearchItem({
        ...item,
        media_type: mediaType === "movie" ? "movie" : "tv",
      }),
    )
    .filter((item): item is MetadataSpikeTitle => item !== null);
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
  const keywords = mapKeywordNames(item.keywords?.keywords);

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
    ...(keywords ? { keywords } : {}),
  };
}

function mapRawSeriesDetail(item: z.infer<typeof rawSeriesDetailSchema>): MetadataSpikeTitle {
  const originalTitle = normalizeText(item.original_name);
  const genres = mapGenreNames(item.genres);
  const keywords = mapKeywordNames(item.keywords?.results);

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
    ...(keywords ? { keywords } : {}),
  };
}

function getMetadataMatchScore(item: MetadataSpikeTitle, query: string): number {
  return getTextMatchScore([item.title, item.originalTitle], [item.synopsis ?? ""], query);
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
  const normalizedOriginalTitle = normalizeSearchText(item.originalTitle ?? "");
  const normalizedQuery = normalizeSearchText(query);
  const titleDistance = getTitleDistance(item.title, query);
  const exactTitle = normalizedTitle === normalizedQuery || normalizedOriginalTitle === normalizedQuery;
  const titleStartsWithQuery =
    Boolean(normalizedQuery) &&
    [normalizedTitle, normalizedOriginalTitle]
      .filter(Boolean)
      .some(
        (titleVariant) =>
          titleVariant.startsWith(normalizedQuery) || normalizedQuery.startsWith(titleVariant),
      );
  const titleContainsQuery =
    Boolean(normalizedQuery) &&
    [normalizedTitle, normalizedOriginalTitle]
      .filter(Boolean)
      .some((titleVariant) => titleVariant.includes(normalizedQuery));
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

function hashBrowseSeed(value: string): number {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function getBrowsePages(seed: string): number[] {
  const pageRange = 10;
  const first = (hashBrowseSeed(seed) % pageRange) + 1;
  let second = (hashBrowseSeed(`${seed}:next`) % pageRange) + 1;

  if (second === first) {
    second = (second % pageRange) + 1;
  }

  return [first, second];
}

function getBrowseGenreBias(
  mediaType: MetadataSpikeMediaType,
  tone: SearchFilters["tone"],
): string | null {
  if (tone === "calm") {
    return mediaType === "movie" ? "99|16|10749|10751|18" : "99|16|35|10751|18";
  }

  if (tone === "intense") {
    return mediaType === "movie" ? "28|27|53|80|10752|878" : "80|10759|10765|10768";
  }

  return null;
}

function getBrowseSectionTone(sectionId: MetadataSpikeBrowseSectionId): SearchFilters["tone"] {
  if (sectionId === "quiet") {
    return "calm";
  }

  if (sectionId === "loud") {
    return "intense";
  }

  return "balanced";
}

function getBrowseSectionIdForItem(item: MetadataSpikeTitle): MetadataSpikeBrowseSectionId {
  const preview = createMetadataInferencePreview(item);
  const tendency = getProfileTendency(preview.stimulusProfile);

  if (tendency.tone === "ruhig") {
    return "quiet";
  }

  if (tendency.tone === "intensiv") {
    return "loud";
  }

  return "balanced";
}

function matchesBrowseFilters(item: MetadataSpikeTitle, filters: SearchFilters): boolean {
  const preview = createMetadataInferencePreview(item);
  return matchesAvoidanceFilters(preview.stimulusProfile, filters);
}

type BrowseCandidate = {
  item: MetadataSpikeTitle;
  score: number;
};

function getBrowseIntensityScore(item: MetadataSpikeTitle): number {
  const profile = createMetadataInferencePreview(item).stimulusProfile;

  return profile.peakIntensity * 0.55 + profile.stimulusDensity * 0.3 + profile.volumeLevel * 0.15;
}

function isPreferredBrowseSectionMatch(
  score: number,
  sectionId: MetadataSpikeBrowseSectionId,
): boolean {
  if (sectionId === "quiet") {
    return score <= 1.95;
  }

  if (sectionId === "loud") {
    return score >= 2.65;
  }

  return score > 1.95 && score < 2.65;
}

function isFallbackBrowseSectionMatch(
  score: number,
  sectionId: MetadataSpikeBrowseSectionId,
): boolean {
  if (sectionId === "quiet") {
    return score <= 2.3;
  }

  if (sectionId === "loud") {
    return score >= 2.2;
  }

  return score > 1.7 && score < 2.9;
}

function sortBrowseCandidates(
  items: BrowseCandidate[],
  sectionId: MetadataSpikeBrowseSectionId,
  mix: string,
): BrowseCandidate[] {
  return [...items].sort((left, right) => {
    if (left.score !== right.score) {
      if (sectionId === "quiet") {
        return left.score - right.score;
      }

      if (sectionId === "loud") {
        return right.score - left.score;
      }

      const leftDistance = Math.abs(left.score - 2.3);
      const rightDistance = Math.abs(right.score - 2.3);

      return leftDistance - rightDistance;
    }

    const leftPosterBonus = left.item.posterPath ? 1 : 0;
    const rightPosterBonus = right.item.posterPath ? 1 : 0;

    if (leftPosterBonus !== rightPosterBonus) {
      return rightPosterBonus - leftPosterBonus;
    }

    const leftHash = hashBrowseSeed(`${mix}:${sectionId}:${left.item.externalId}`);
    const rightHash = hashBrowseSeed(`${mix}:${sectionId}:${right.item.externalId}`);

    if (leftHash !== rightHash) {
      return leftHash - rightHash;
    }

    return left.item.title.localeCompare(right.item.title, "de");
  });
}

function pickDistributedBrowseItems(
  items: BrowseCandidate[],
  limit: number,
  mix: string,
): BrowseCandidate[] {
  const byMediaType: Record<MetadataSpikeMediaType, BrowseCandidate[]> = {
    movie: items.filter((item) => item.item.mediaType === "movie"),
    series: items.filter((item) => item.item.mediaType === "series"),
  };
  const preferredOrder =
    hashBrowseSeed(`${mix}:media-order`) % 2 === 0
      ? (["movie", "series"] as const)
      : (["series", "movie"] as const);
  const cursors: Record<MetadataSpikeMediaType, number> = {
    movie: 0,
    series: 0,
  };
  const selected: BrowseCandidate[] = [];
  const seen = new Set<string>();

  while (selected.length < limit) {
    let progressed = false;

    for (const mediaType of preferredOrder) {
      const candidate = byMediaType[mediaType][cursors[mediaType]];

      if (!candidate) {
        continue;
      }

      cursors[mediaType] += 1;

      if (seen.has(candidate.item.externalId)) {
        continue;
      }

      seen.add(candidate.item.externalId);
      selected.push(candidate);
      progressed = true;

      if (selected.length >= limit) {
        break;
      }
    }

    if (!progressed) {
      break;
    }
  }

  if (selected.length >= limit) {
    return selected;
  }

  for (const candidate of items) {
    if (selected.length >= limit) {
      break;
    }

    if (seen.has(candidate.item.externalId)) {
      continue;
    }

    seen.add(candidate.item.externalId);
    selected.push(candidate);
  }

  return selected;
}

function pickBrowseSectionItems(
  items: MetadataSpikeTitle[],
  sectionId: MetadataSpikeBrowseSectionId,
  mix: string,
  excludedIds: Set<string>,
  limit = 5,
): MetadataSpikeTitle[] {
  const scored = items
    .filter((item) => !excludedIds.has(item.externalId))
    .map((item) => ({
      item,
      score: getBrowseIntensityScore(item),
    }));
  const preferred = sortBrowseCandidates(
    scored.filter((candidate) => isPreferredBrowseSectionMatch(candidate.score, sectionId)),
    sectionId,
    `${mix}:${sectionId}:preferred`,
  );
  const fallback = sortBrowseCandidates(
    scored.filter((candidate) => !isPreferredBrowseSectionMatch(candidate.score, sectionId)),
    sectionId,
    `${mix}:${sectionId}:fallback`,
  ).filter((candidate) => isFallbackBrowseSectionMatch(candidate.score, sectionId));
  const selected = pickDistributedBrowseItems(
    [...preferred, ...fallback],
    limit,
    `${mix}:${sectionId}:distributed`,
  );

  return selected.map((candidate) => candidate.item);
}

function dedupeMetadataItemsByTitle(items: MetadataSpikeTitle[]): MetadataSpikeTitle[] {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = normalizeSearchText([item.title, item.mediaType, String(item.releaseYear ?? "")].join("::"));

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
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
  const cacheMode =
    dependencies.cacheMode ??
    (dependencies.revalidateSeconds ? "force-cache" : "no-store");
  const nextOptions = dependencies.revalidateSeconds
    ? { revalidate: dependencies.revalidateSeconds }
    : undefined;

  if (!accessToken) {
    throw new Error("TMDB_NOT_CONFIGURED");
  }

  return fetchImpl(`${TMDB_BASE_URL}${path}`, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: cacheMode,
    ...(nextOptions ? { next: nextOptions } : {}),
    signal: AbortSignal.timeout(timeoutMs),
  });
}

async function fetchWatchmode(
  path: string,
  dependencies: MetadataSpikeDependencies = {},
): Promise<Response> {
  const apiKey = getWatchmodeApiKey(dependencies.watchmodeApiKey);
  const fetchImpl = dependencies.fetchImpl ?? fetch;
  const timeoutMs = dependencies.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const cacheMode =
    dependencies.cacheMode ??
    (dependencies.revalidateSeconds ? "force-cache" : "no-store");
  const nextOptions = dependencies.revalidateSeconds
    ? { revalidate: dependencies.revalidateSeconds }
    : undefined;

  if (!apiKey) {
    throw new Error("WATCHMODE_NOT_CONFIGURED");
  }

  const separator = path.includes("?") ? "&" : "?";

  return fetchImpl(`${WATCHMODE_BASE_URL}${path}${separator}apiKey=${encodeURIComponent(apiKey)}`, {
    method: "GET",
    headers: {
      accept: "application/json",
    },
    cache: cacheMode,
    ...(nextOptions ? { next: nextOptions } : {}),
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
  filters?: Pick<SearchFilters, "avoidPeaks" | "avoidDensity">,
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
        "Ergänzende Titeldaten sind lokal gerade nicht verfügbar. Auf dem Server fehlt noch ein gültiger TMDb-Zugang.",
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
                "Ergänzende Titeldaten sind gerade nicht verfügbar. Der Serverzugang zu TMDb muss geprüft werden.",
              items: [] as MetadataSpikeTitle[],
            };
          }

          if (response.status === 404) {
            return {
              kind: "error" as const,
              reason: "not_found" as const,
              message:
                "Die ergänzende Titelsuche konnte gerade keine verwendbaren Daten abrufen.",
              items: [] as MetadataSpikeTitle[],
            };
          }

          return {
            kind: "error" as const,
            reason: "api_error" as const,
            message:
              "Ergänzende Titeldaten konnten gerade nicht geladen werden. Versuch es später noch einmal.",
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
              "Ergänzende Titeldaten waren gerade nicht in einer nutzbaren Form verfügbar.",
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

    const relevantPrimaryItems = primaryResult.items.filter((item) =>
      matchesAvoidanceFilters(createMetadataInferencePreview(item).stimulusProfile, {
        avoidDensity: filters?.avoidDensity ?? false,
        avoidPeaks: filters?.avoidPeaks ?? false,
      }),
    );

    if (relevantPrimaryItems.length && hasStrongMetadataMatch(relevantPrimaryItems, normalizedQuery)) {
      finalizeTmdbDiagnostics(diagnostics, "success");
      return {
        kind: "success",
        query: normalizedQuery,
        source: "tmdb",
        message:
          "Die zusätzlichen Treffer zeigen nur Titeldaten. Eine erste Einschätzung liegt dafür noch nicht vor.",
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
      ).filter((item) =>
        matchesAvoidanceFilters(createMetadataInferencePreview(item).stimulusProfile, {
          avoidDensity: filters?.avoidDensity ?? false,
          avoidPeaks: filters?.avoidPeaks ?? false,
        }),
      );

      if (relevantRetryItems.length && hasStrongMetadataMatch(relevantRetryItems, normalizedQuery)) {
        finalizeTmdbDiagnostics(diagnostics, "success");
        return {
          kind: "success",
          query: normalizedQuery,
          source: "tmdb",
          message:
            "Die zusätzlichen Treffer stammen aus einer fehlertoleranten Suche. Eine erste Einschätzung liegt dafür noch nicht vor.",
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
          "Die zusätzlichen Treffer zeigen nur Titeldaten. Eine erste Einschätzung liegt dafür noch nicht vor.",
        items: relevantPrimaryItems,
      };
    }

    finalizeTmdbDiagnostics(diagnostics, "empty");
    return {
      kind: "empty",
      query: normalizedQuery,
      source: "tmdb",
      message:
        "Zu dieser Suche wurden auch in den ergänzenden Titeldaten keine passenden Filme oder Serien gefunden.",
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
          "Ergänzende Titeldaten sind lokal gerade nicht verfügbar. Auf dem Server fehlt noch ein gültiger TMDb-Zugang.",
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
          "Ergänzende Titeldaten antworten gerade zu langsam. Versuch es später noch einmal.",
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
        "Ergänzende Titeldaten konnten gerade nicht erreicht werden. Die Suche im Katalog bleibt davon unberührt.",
      items: [],
    };
  }
}

export async function browseTmdbMetadata(
  filters: SearchFilters,
  mix: string,
  dependencies: MetadataSpikeDependencies = {},
): Promise<MetadataSpikeBrowseState> {
  const accessToken = getTmdbAccessToken(dependencies.accessToken);
  const browseLimit = filters.avoidPeaks && filters.avoidDensity ? 4 : 5;
  const sectionDefinitions: Array<{
    description: string;
    id: MetadataSpikeBrowseSectionId;
    title: string;
  }> = [
    {
      id: "quiet",
      title: "Eher ruhig",
      description: "Ruhigerer Einstieg, weniger Druck.",
    },
    {
      id: "balanced",
      title: "Eher wechselhaft",
      description: "Ruhige und dichtere Momente wechseln sich ab.",
    },
    {
      id: "loud",
      title: "Eher intensiv",
      description: "Spürbarer und dichter, aber weiterhin im selben Rahmen.",
    },
  ];

  if (!accessToken) {
    return {
      kind: "disabled",
      source: "tmdb",
      message: "Externe Titelseiten sind gerade nicht erreichbar.",
      items: [],
    };
  }

  const mediaTypes: MetadataSpikeMediaType[] =
    filters.kind === "all" ? ["movie", "series"] : [filters.kind];

  const requestConfigs = mediaTypes.flatMap((mediaType) => {
    return sectionDefinitions.flatMap((section) => {
      const resolvedTone = getBrowseSectionTone(section.id);
      const pages = getBrowsePages(
        [
          mix,
          section.id,
          resolvedTone,
          mediaType,
          filters.kind,
          String(filters.avoidPeaks),
          String(filters.avoidDensity),
        ].join(":"),
      );
      const genreBias = getBrowseGenreBias(mediaType, resolvedTone);

      return pages.map((page) => ({
        genreBias,
        mediaType,
        page,
        resolvedTone,
        sectionId: section.id,
      }));
    });
  });

  try {
    const settledResponses = await Promise.all(
      requestConfigs.map(async ({ mediaType, page, genreBias, sectionId }) => {
        const searchParams = new URLSearchParams({
          language: "de-DE",
          include_adult: "false",
          sort_by: "popularity.desc",
          page: String(page),
          "vote_count.gte": "40",
        });

        if (mediaType === "movie") {
          searchParams.set("include_video", "false");
        }

        if (genreBias) {
          searchParams.set("with_genres", genreBias);
        }

        const response = await fetchTmdb(`/discover/${toTmdbMediaType(mediaType)}?${searchParams.toString()}`, {
          ...dependencies,
          accessToken,
          revalidateSeconds: dependencies.revalidateSeconds ?? TMDB_DISCOVER_REVALIDATE_SECONDS,
        });

        return {
          mediaType,
          response,
          sectionId,
        };
      }),
    );

    const successfulPayloads: Record<MetadataSpikeBrowseSectionId, MetadataSpikeTitle[]> = {
      balanced: [],
      loud: [],
      quiet: [],
    };
    let sawInvalidPayload = false;

    for (const { mediaType, response, sectionId } of settledResponses) {
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          return {
            kind: "error",
            source: "tmdb",
            reason: "misconfigured",
            message: "Externe Titelseiten lassen sich gerade nicht belastbar laden.",
            items: [],
          };
        }

        continue;
      }

      const payload = await safeJson(response);
      const mappedItems = mapRawDiscoverItems(payload, mediaType);

      if (!mappedItems) {
        sawInvalidPayload = true;
        continue;
      }

      successfulPayloads[sectionId].push(...mappedItems);
    }

    const usedIds = new Set<string>();
    const sections = sectionDefinitions.map((section) => {
      const resolvedTone = getBrowseSectionTone(section.id);
      const sectionFilters: SearchFilters = {
        ...filters,
        tone: resolvedTone,
      };
      const basePool = dedupeMetadataItemsByTitle(dedupeMetadataItems(successfulPayloads[section.id])).filter(
        (item) => item.posterPath,
      );
      const sectionPool = basePool.filter((item) => getBrowseSectionIdForItem(item) === section.id);
      const filteredPool = sectionPool.filter((item) => matchesBrowseFilters(item, sectionFilters));
      const pool =
        (sectionFilters.avoidPeaks || sectionFilters.avoidDensity) && !filteredPool.length
          ? sectionPool
          : filteredPool;
      const items = pickBrowseSectionItems(pool, section.id, mix, usedIds, browseLimit);

      for (const item of items) {
        usedIds.add(item.externalId);
      }

      return {
        description: section.description,
        id: section.id,
        items,
        title: section.title,
      };
    });
    const visibleItems = sections.flatMap((section) => section.items);

    if (visibleItems.length) {
      return {
        kind: "success",
        source: "tmdb",
        message: "Grob nach situativer Passung aus externen Titeln gezogen.",
        items: visibleItems,
        sections,
      };
    }

    if (
      sawInvalidPayload &&
      !successfulPayloads.quiet.length &&
      !successfulPayloads.balanced.length &&
      !successfulPayloads.loud.length
    ) {
      return {
        kind: "error",
        source: "tmdb",
        reason: "invalid_response",
        message: "Externe Titelseiten waren gerade nicht in einer nutzbaren Form da.",
        items: [],
      };
    }

    return {
      kind: "empty",
      source: "tmdb",
      message: "Mit diesem Profil blieb extern gerade nichts Greifbares übrig.",
      items: [],
    };
  } catch (error) {
    if (error instanceof Error && error.message === "TMDB_NOT_CONFIGURED") {
      return {
        kind: "disabled",
        source: "tmdb",
        message: "Externe Titelseiten sind gerade nicht erreichbar.",
        items: [],
      };
    }

    if (error instanceof Error && error.name === "TimeoutError") {
      return {
        kind: "error",
        source: "tmdb",
        reason: "timeout",
        message: "Externe Titelseiten antworten gerade zu langsam.",
        items: [],
      };
    }

    return {
      kind: "error",
      source: "tmdb",
      reason: "api_error",
      message: "Externe Titelseiten konnten gerade nicht geladen werden.",
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
    const searchParams = new URLSearchParams({
      language: "de-DE",
      append_to_response: "keywords",
    });
    const endpoint = `/${toTmdbMediaType(mediaType)}/${externalId}?${searchParams.toString()}`;
    const response = await fetchTmdb(endpoint, {
      ...dependencies,
      revalidateSeconds: dependencies.revalidateSeconds ?? TMDB_DETAIL_REVALIDATE_SECONDS,
    });

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

    const item =
      mediaType === "movie"
        ? mapRawMovieDetail(parsed.data as z.infer<typeof rawMovieDetailSchema>)
        : mapRawSeriesDetail(parsed.data as z.infer<typeof rawSeriesDetailSchema>);

    return {
      kind: "success",
      source: "tmdb",
      item,
      message:
        "Basisdaten von TMDb. null-noise liest daraus vorsichtig eine situative Lesart.",
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

async function getWatchmodeWatchProviders(
  mediaType: MetadataSpikeMediaType,
  externalId: number,
  dependencies: MetadataSpikeDependencies = {},
  region = DEFAULT_TMDB_WATCH_REGION,
): Promise<MetadataWatchProviderState | null> {
  const normalizedRegion = normalizeText(region)?.toUpperCase() ?? DEFAULT_TMDB_WATCH_REGION;

  if (!getWatchmodeApiKey(dependencies.watchmodeApiKey)) {
    return null;
  }

  try {
    const titleId = toWatchmodeTitleId(mediaType, externalId);
    const response = await fetchWatchmode(`/title/${titleId}/sources/?regions=${normalizedRegion}`, {
      ...dependencies,
      revalidateSeconds: dependencies.revalidateSeconds ?? WATCHMODE_WATCH_REVALIDATE_SECONDS,
    });

    if (!response.ok) {
      return null;
    }

    const payload = await safeJson(response);
    const parsed = rawWatchmodeSourceResponseSchema.safeParse(payload);

    if (!parsed.success) {
      return null;
    }

    const groups = mapWatchmodeProviderGroups(parsed.data, normalizedRegion);

    if (!groups.length) {
      return {
        kind: "empty",
        source: "watchmode",
        region: normalizedRegion,
        link: null,
        message: `Für ${normalizedRegion} liefert Watchmode gerade keine belastbaren Direktlinks.`,
      };
    }

    return {
      kind: "success",
      source: "watchmode",
      region: normalizedRegion,
      link: null,
      groups,
      attribution: "Direktlinks, Formate und Preise von Watchmode.",
    };
  } catch {
    return null;
  }
}

export async function getTmdbWatchProviders(
  mediaType: MetadataSpikeMediaType,
  externalId: number,
  dependencies: MetadataSpikeDependencies = {},
  region = DEFAULT_TMDB_WATCH_REGION,
): Promise<MetadataWatchProviderState> {
  const normalizedRegion = normalizeText(region)?.toUpperCase() ?? DEFAULT_TMDB_WATCH_REGION;

  if (!getTmdbAccessToken(dependencies.accessToken)) {
    return {
      kind: "disabled",
      source: "tmdb",
      region: normalizedRegion,
      message:
        "Die Anbieteransicht braucht dieselbe TMDb-Verbindung wie die übrigen Basisdaten. Die ist hier gerade nicht aktiv.",
    };
  }

  try {
    const endpoint = `/${toTmdbMediaType(mediaType)}/${externalId}/watch/providers`;
    const response = await fetchTmdb(endpoint, {
      ...dependencies,
      revalidateSeconds: dependencies.revalidateSeconds ?? TMDB_WATCH_REVALIDATE_SECONDS,
    });

    if (!response.ok) {
      return {
        kind: "error",
        source: "tmdb",
        region: normalizedRegion,
        message: "Die Anbieteransicht konnte gerade nicht von TMDb geladen werden.",
      };
    }

    const payload = await safeJson(response);
    const parsed = rawWatchProviderResponseSchema.safeParse(payload);

    if (!parsed.success) {
      return {
        kind: "error",
        source: "tmdb",
        region: normalizedRegion,
        message: "TMDb hat die Anbieteransicht in einem unerwarteten Format zurückgegeben.",
      };
    }

    const regionData = parsed.data.results[normalizedRegion];
    const fallbackLink = normalizeText(regionData?.link);
    const watchmodeState = await getWatchmodeWatchProviders(
      mediaType,
      externalId,
      {
        ...dependencies,
        revalidateSeconds: dependencies.revalidateSeconds ?? WATCHMODE_WATCH_REVALIDATE_SECONDS,
      },
      normalizedRegion,
    );

    if (watchmodeState?.kind === "success") {
      return {
        ...watchmodeState,
        link: fallbackLink,
        attribution: fallbackLink
          ? "Direktlinks, Formate und Preise von Watchmode. Falls ein Weg fehlt, bleibt die gemeinsame Angebotsseite von TMDb als Fallback."
          : watchmodeState.attribution,
      };
    }

    if (!regionData) {
      return {
        kind: "empty",
        source: watchmodeState?.source ?? "tmdb",
        region: normalizedRegion,
        link: null,
        message: `Für ${normalizedRegion} liegt gerade kein Anbieterhinweis vor.`,
      };
    }

    const groups = mapWatchProviderGroups(regionData);
    const link = fallbackLink;

    if (!groups.length) {
      return {
        kind: "empty",
        source: "tmdb",
        region: normalizedRegion,
        link,
        message: `Für ${normalizedRegion} liegt gerade kein nutzbarer Anbieterhinweis vor.`,
      };
    }

    return {
      kind: "success",
      source: "tmdb",
      region: normalizedRegion,
      link,
      groups,
      attribution: "Anbieterhinweise von JustWatch via TMDb.",
    };
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      return {
        kind: "error",
        source: "tmdb",
        region: normalizedRegion,
        message: "Die Anbieteransicht hat gerade zu lange gebraucht und wurde abgebrochen.",
      };
    }

    return {
      kind: "error",
      source: "tmdb",
      region: normalizedRegion,
      message: "Die Anbieteransicht konnte serverseitig nicht geladen werden.",
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
