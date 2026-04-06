import {
  formatKind,
  getCompactProfileTendencyLabel,
  getReadingReasonLine,
  getProfileTendency,
} from "@/lib/format";
import { getTmdbPosterProxyPath, type MetadataSpikeTitle } from "@/lib/metadata-spike";
import type { StimulusProfile, TitleKind, TitleRecord } from "@/lib/types";

export type TitlePocketEntry = {
  href: string;
  key: string;
  meta: string;
  posterSrc: string | null;
  reason: string;
  savedAt: number;
  title: string;
  toneLabel: string;
};

export type TitlePocketKind = "remembered" | "seen";

export const rememberedTitlesStorageKey = "null-noise-remembered-titles";
export const seenTitlesStorageKey = "null-noise-seen-titles";
export const hideSeenTitlesStorageKey = "null-noise-hide-seen";
export const titlePocketChangeEvent = "null-noise-title-pocket-change";
const maxStoredPocketEntries = 24;

function getKindLabel(value: MetadataSpikeTitle["mediaType"] | TitleKind): string {
  return value === "movie" ? "Film" : "Serie";
}

function clampPocketEntries(entries: TitlePocketEntry[]): TitlePocketEntry[] {
  return [...entries]
    .sort((left, right) => right.savedAt - left.savedAt)
    .slice(0, maxStoredPocketEntries);
}

function normalizeStoredEntry(value: unknown): TitlePocketEntry | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<TitlePocketEntry>;

  if (
    typeof candidate.key !== "string" ||
    typeof candidate.title !== "string" ||
    typeof candidate.href !== "string" ||
    typeof candidate.meta !== "string" ||
    typeof candidate.reason !== "string" ||
    typeof candidate.toneLabel !== "string" ||
    typeof candidate.savedAt !== "number"
  ) {
    return null;
  }

  return {
    href: candidate.href,
    key: candidate.key,
    meta: candidate.meta,
    posterSrc: typeof candidate.posterSrc === "string" ? candidate.posterSrc : null,
    reason: candidate.reason,
    savedAt: candidate.savedAt,
    title: candidate.title,
    toneLabel: candidate.toneLabel,
  };
}

export function createTitlePocketKey(input: {
  externalSource?: string | null;
  externalSourceId?: string | number | null;
  kind: MetadataSpikeTitle["mediaType"] | TitleKind;
  slug?: string | null;
}): string {
  if (
    input.externalSource &&
    (typeof input.externalSourceId === "string" || typeof input.externalSourceId === "number")
  ) {
    return `${input.externalSource}:${input.kind}:${String(input.externalSourceId)}`;
  }

  if (input.slug) {
    return `local:${input.slug}`;
  }

  return `fallback:${input.kind}:${String(input.externalSourceId ?? input.slug ?? "unknown")}`;
}

export function buildTitlePocketEntryFromMetadata(
  item: MetadataSpikeTitle,
  input: {
    href: string;
    profile?: Pick<StimulusProfile, "peakIntensity" | "stimulusDensity" | "volumeLevel">;
  },
): TitlePocketEntry {
  const profile = input.profile ?? createMetadataProfileSeed(item);
  const tendency = getProfileTendency(profile);

  return {
    href: input.href,
    key: createTitlePocketKey({
      externalSource: item.externalSource,
      externalSourceId: item.sourceId,
      kind: item.mediaType,
    }),
    meta: `${getKindLabel(item.mediaType)} · ${item.releaseYear ?? "Jahr offen"}`,
    posterSrc: getTmdbPosterProxyPath(item.posterPath),
    reason: getReadingReasonLine(profile),
    savedAt: 0,
    title: item.title,
    toneLabel: getCompactProfileTendencyLabel(tendency.tone),
  };
}

export function buildTitlePocketEntryFromTitle(
  title: TitleRecord,
  href: string,
): TitlePocketEntry {
  const tendency = getProfileTendency(title.stimulusProfile);

  return {
    href,
    key: createTitlePocketKey({
      externalSource: title.external.externalSource,
      externalSourceId: title.external.externalSourceId,
      kind: title.external.kind,
      slug: title.external.slug,
    }),
    meta: `${formatKind(title.external.kind)} · ${title.external.year ?? "Jahr offen"}`,
    posterSrc:
      title.external.externalSource === "tmdb" || title.external.externalSource === "tmdb_seed"
        ? getTmdbPosterProxyPath(title.external.posterPath ?? null)
        : null,
    reason: getReadingReasonLine(title.stimulusProfile),
    savedAt: 0,
    title: title.external.title,
    toneLabel: getCompactProfileTendencyLabel(tendency.tone),
  };
}

function createMetadataProfileSeed(item: MetadataSpikeTitle): Pick<
  StimulusProfile,
  "peakIntensity" | "stimulusDensity" | "volumeLevel"
> {
  const text = [item.title, item.originalTitle, item.synopsis, item.genres?.join(" "), item.keywords?.join(" ")]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const intense =
    /(krieg|war|action|horror|thriller|chaos|kampf|mission|verfolg|survival|katastroph|disaster|panic|terror)/.test(
      text,
    );
  const calm =
    /(romance|famil|documentary|dokument|friendship|healing|still|quiet|ruhig|stille|coming-of-age)/.test(
      text,
    );

  if (intense && !calm) {
    return { peakIntensity: 3, stimulusDensity: 3, volumeLevel: 2 };
  }

  if (calm && !intense) {
    return { peakIntensity: 1, stimulusDensity: 1, volumeLevel: 1 };
  }

  return { peakIntensity: 2, stimulusDensity: 2, volumeLevel: 2 };
}

function readPocketStore(storageKey: string): Record<string, TitlePocketEntry> {
  if (typeof window === "undefined") {
    return {};
  }

  let rawValue: string | null = null;

  try {
    rawValue = window.localStorage.getItem(storageKey);
  } catch {
    return {};
  }

  if (!rawValue) {
    return {};
  }

  try {
    const parsed = JSON.parse(rawValue) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed)
        .map(([key, value]) => [key, normalizeStoredEntry(value)] as const)
        .filter((entry): entry is [string, TitlePocketEntry] => Boolean(entry[1])),
    );
  } catch {
    return {};
  }
}

function writePocketStore(storageKey: string, store: Record<string, TitlePocketEntry>): void {
  if (typeof window === "undefined") {
    return;
  }

  const clamped = clampPocketEntries(Object.values(store));
  window.localStorage.setItem(
    storageKey,
    JSON.stringify(Object.fromEntries(clamped.map((entry) => [entry.key, entry]))),
  );
}

function getPocketStorageKey(kind: TitlePocketKind): string {
  return kind === "remembered" ? rememberedTitlesStorageKey : seenTitlesStorageKey;
}

export function listPocketEntries(kind: TitlePocketKind): TitlePocketEntry[] {
  return Object.values(
    readPocketStore(getPocketStorageKey(kind)),
  ).sort((left, right) => right.savedAt - left.savedAt);
}

export function isPocketEntryStored(kind: TitlePocketKind, key: string): boolean {
  return Boolean(readPocketStore(getPocketStorageKey(kind))[key]);
}

export function storePocketEntry(kind: TitlePocketKind, entry: TitlePocketEntry): void {
  const storageKey = getPocketStorageKey(kind);
  const store = readPocketStore(storageKey);
  store[entry.key] = {
    ...entry,
    savedAt: Date.now(),
  };
  writePocketStore(storageKey, store);
}

export function removePocketEntry(kind: TitlePocketKind, key: string): void {
  const storageKey = getPocketStorageKey(kind);
  const store = readPocketStore(storageKey);
  delete store[key];
  writePocketStore(storageKey, store);
}

export function clearPocketEntries(kind: TitlePocketKind): void {
  writePocketStore(getPocketStorageKey(kind), {});
}

export function readHideSeenTitlesPreference(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(hideSeenTitlesStorageKey) === "true";
}

export function writeHideSeenTitlesPreference(value: boolean): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(hideSeenTitlesStorageKey, value ? "true" : "false");
}

export function dispatchTitlePocketChange(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(titlePocketChangeEvent));
}
