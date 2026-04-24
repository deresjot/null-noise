export type MetadataSpikeSource = "imdb" | "tmdb";
export type MetadataSpikeMediaType = "movie" | "series";

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

export const tmdbPosterSizes = ["w185", "w342", "w500", "w780", "original"] as const;

export type TmdbPosterSize = (typeof tmdbPosterSizes)[number];

const TMDB_POSTER_BASE_URL = "https://image.tmdb.org/t/p";
const DEFAULT_TMDB_POSTER_SIZE: TmdbPosterSize = "w342";

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
