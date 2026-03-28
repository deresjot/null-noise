import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { z } from "zod";

import { mockTitleSeeds } from "@/lib/mock-data";
import { normalizeSearchText } from "@/lib/search";
import type { MetadataSpikeTitle } from "@/lib/metadata-spike";
import type { ScaleValue, TitleSeedRecord } from "@/lib/types";

const scaleValueSchema = z.coerce.number().int().min(0).max(4);

const storedLocalTitleSeedSchema = z.object({
  external: z.object({
    slug: z.string().min(1),
    title: z.string().min(1),
    originalTitle: z.string().min(1).optional(),
    kind: z.enum(["movie", "series"]),
    year: z.number().int().nullable(),
    synopsis: z.string().nullable(),
    runtimeMinutes: z.number().int().positive().optional(),
    posterPath: z.string().nullable().optional(),
    externalSource: z.string().min(1),
    externalSourceId: z.string().min(1),
  }),
  ratingSamples: z.object({
    volumeLevel: z.array(scaleValueSchema).min(1),
    peakIntensity: z.array(scaleValueSchema).min(1),
    stimulusDensity: z.array(scaleValueSchema).min(1),
    soothingEffect: z.array(scaleValueSchema).min(1),
  }),
  notes: z.string().min(1),
  contentFlags: z.array(z.string()),
  aggregation: z.object({
    sourceType: z.enum(["editorial_seed", "provisional_seed", "community_median", "mixed"]),
    lastReviewedAt: z.string().optional(),
  }),
});

const titleImportAttemptStatusSchema = z.enum(["accepted", "rejected_rate_limited", "suspicious"]);

const storedTitleImportAttemptSchema = z.object({
  sourceKey: z.string().min(1),
  ipHash: z.string().min(1),
  status: titleImportAttemptStatusSchema,
  submittedAt: z.string().datetime(),
});

export type StoredLocalTitleSeed = TitleSeedRecord;
export type TitleImportAttemptStatus = z.infer<typeof titleImportAttemptStatusSchema>;
export type StoredTitleImportAttempt = z.infer<typeof storedTitleImportAttemptSchema>;

export const titleImportGuardConfig = {
  sourceCooldownMs: 12 * 60 * 60 * 1000,
  sourceRateLimitWindowMs: 12 * 60 * 60 * 1000,
  sourceRateLimitMaxAttempts: 3,
  globalRateLimitWindowMs: 60 * 60 * 1000,
  globalRateLimitMaxAttempts: 8,
  attemptsRetentionMs: 24 * 60 * 60 * 1000,
} as const;

const defaultLocalTitlesFilePath = path.join(
  /* turbopackIgnore: true */ process.cwd(),
  "data",
  "titles.local.json",
);
const defaultTitleImportAttemptsFilePath = path.join(
  /* turbopackIgnore: true */ process.cwd(),
  "data",
  "title-import-attempts.local.json",
);

function getLocalTitlesFilePath(): string {
  return process.env.NULL_NOISE_LOCAL_TITLES_FILE ?? defaultLocalTitlesFilePath;
}

function getTitleImportAttemptsFilePath(): string {
  return (
    process.env.NULL_NOISE_TITLE_IMPORT_ATTEMPTS_FILE ?? defaultTitleImportAttemptsFilePath
  );
}

async function ensureJsonFile(filePath: string): Promise<string> {
  await mkdir(path.dirname(filePath), { recursive: true });

  try {
    await readFile(filePath, "utf-8");
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;

    if (code !== "ENOENT") {
      throw error;
    }

    await writeFile(filePath, "[]\n", "utf-8");
  }

  return filePath;
}

function trimExpiredImportAttempts(
  attempts: StoredTitleImportAttempt[],
  now = Date.now(),
): StoredTitleImportAttempt[] {
  return attempts.filter(
    (attempt) => now - Date.parse(attempt.submittedAt) <= titleImportGuardConfig.attemptsRetentionMs,
  );
}

async function writeStoredLocalTitleSeeds(seeds: StoredLocalTitleSeed[]): Promise<void> {
  const filePath = await ensureJsonFile(getLocalTitlesFilePath());
  await writeFile(filePath, `${JSON.stringify(seeds, null, 2)}\n`, "utf-8");
}

async function writeStoredTitleImportAttempts(
  attempts: StoredTitleImportAttempt[],
): Promise<void> {
  const filePath = await ensureJsonFile(getTitleImportAttemptsFilePath());
  await writeFile(
    filePath,
    `${JSON.stringify(trimExpiredImportAttempts(attempts), null, 2)}\n`,
    "utf-8",
  );
}

function slugifyTitle(value: string): string {
  const normalized = normalizeSearchText(value)
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "titel";
}

function createUniqueSlug(title: string, year: number | null, existingSlugs: Set<string>): string {
  const baseSlug = year ? `${slugifyTitle(title)}-${year}` : slugifyTitle(title);

  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;

  while (existingSlugs.has(`${baseSlug}-${suffix}`)) {
    suffix += 1;
  }

  return `${baseSlug}-${suffix}`;
}

function getProvisionalScaleSeed(): ScaleValue[] {
  return [2];
}

export function createTitleExternalLookupKey(source: string, sourceId: string | number): string {
  return `${source}:${String(sourceId)}`;
}

export function buildImportedTitleSeedFromMetadata(
  item: MetadataSpikeTitle,
  existingSlugs: Set<string>,
): TitleSeedRecord {
  const today = new Date().toISOString().slice(0, 10);

  return {
    external: {
      slug: createUniqueSlug(item.title, item.releaseYear, existingSlugs),
      title: item.title,
      originalTitle: item.originalTitle ?? undefined,
      kind: item.mediaType,
      year: item.releaseYear,
      synopsis: item.synopsis,
      posterPath: item.posterPath,
      externalSource: item.externalSource,
      externalSourceId: String(item.sourceId),
    },
    ratingSamples: {
      volumeLevel: getProvisionalScaleSeed(),
      peakIntensity: getProvisionalScaleSeed(),
      stimulusDensity: getProvisionalScaleSeed(),
      soothingEffect: getProvisionalScaleSeed(),
    },
    notes:
      "Vorläufige Startbasis aus externen Metadaten. Reizprofil und Wirkung werden erst durch erste anonyme Einschätzungen belastbarer.",
    contentFlags: [],
    aggregation: {
      sourceType: "provisional_seed",
      lastReviewedAt: today,
    },
  };
}

export async function listStoredLocalTitleSeeds(): Promise<StoredLocalTitleSeed[]> {
  const filePath = await ensureJsonFile(getLocalTitlesFilePath());
  const contents = await readFile(filePath, "utf-8");
  const parsed = JSON.parse(contents || "[]");
  return z.array(storedLocalTitleSeedSchema).parse(parsed) as StoredLocalTitleSeed[];
}

export async function listStoredTitleImportAttempts(): Promise<StoredTitleImportAttempt[]> {
  const filePath = await ensureJsonFile(getTitleImportAttemptsFilePath());
  const contents = await readFile(filePath, "utf-8");
  const parsed = JSON.parse(contents || "[]");
  return trimExpiredImportAttempts(z.array(storedTitleImportAttemptSchema).parse(parsed));
}

export function findStoredLocalTitleSeedByExternal(
  seeds: StoredLocalTitleSeed[],
  source: string,
  sourceId: string | number,
): StoredLocalTitleSeed | undefined {
  const sourceKey = createTitleExternalLookupKey(source, sourceId);

  return seeds.find(
    (seed) =>
      createTitleExternalLookupKey(seed.external.externalSource, seed.external.externalSourceId) ===
      sourceKey,
  );
}

export async function appendStoredLocalTitleSeed(seed: TitleSeedRecord): Promise<StoredLocalTitleSeed> {
  const parsedSeed = storedLocalTitleSeedSchema.parse(seed) as StoredLocalTitleSeed;
  const seeds = await listStoredLocalTitleSeeds();
  seeds.push(parsedSeed);
  await writeStoredLocalTitleSeeds(seeds);
  return parsedSeed;
}

export async function appendStoredTitleImportAttempt(input: {
  sourceKey: string;
  ipHash: string;
  status: TitleImportAttemptStatus;
  submittedAt?: string;
}): Promise<StoredTitleImportAttempt> {
  const attempt = storedTitleImportAttemptSchema.parse({
    ...input,
    submittedAt: input.submittedAt ?? new Date().toISOString(),
  });
  const attempts = await listStoredTitleImportAttempts();
  attempts.push(attempt);
  await writeStoredTitleImportAttempts(attempts);
  return attempt;
}

export async function createOrGetStoredLocalTitleSeed(item: MetadataSpikeTitle): Promise<{
  seed: StoredLocalTitleSeed;
  created: boolean;
}> {
  const seeds = await listStoredLocalTitleSeeds();
  const existing = findStoredLocalTitleSeedByExternal(seeds, item.externalSource, item.sourceId);

  if (existing) {
    return {
      seed: existing,
      created: false,
    };
  }

  const existingSlugs = new Set([
    ...mockTitleSeeds.map((seed) => seed.external.slug),
    ...seeds.map((seed) => seed.external.slug),
  ]);
  const createdSeed = storedLocalTitleSeedSchema.parse(
    buildImportedTitleSeedFromMetadata(item, existingSlugs),
  ) as StoredLocalTitleSeed;

  seeds.push(createdSeed);
  await writeStoredLocalTitleSeeds(seeds);

  return {
    seed: createdSeed,
    created: true,
  };
}

export function evaluateTitleImportAttempt(input: {
  sourceKey: string;
  ipHash: string;
  recentAttempts: StoredTitleImportAttempt[];
  now?: number;
  hasTrustedOrigin: boolean;
}): TitleImportAttemptStatus {
  const now = input.now ?? Date.now();

  if (!input.hasTrustedOrigin) {
    return "suspicious";
  }

  const globalAttempts = input.recentAttempts.filter(
    (attempt) =>
      attempt.ipHash === input.ipHash &&
      now - Date.parse(attempt.submittedAt) <= titleImportGuardConfig.globalRateLimitWindowMs,
  );

  if (globalAttempts.length >= titleImportGuardConfig.globalRateLimitMaxAttempts) {
    return "rejected_rate_limited";
  }

  const sourceAttempts = input.recentAttempts.filter(
    (attempt) =>
      attempt.ipHash === input.ipHash &&
      attempt.sourceKey === input.sourceKey &&
      now - Date.parse(attempt.submittedAt) <= titleImportGuardConfig.sourceRateLimitWindowMs,
  );

  const recentAcceptedAttempt = sourceAttempts.find(
    (attempt) =>
      attempt.status === "accepted" &&
      now - Date.parse(attempt.submittedAt) <= titleImportGuardConfig.sourceCooldownMs,
  );

  if (recentAcceptedAttempt) {
    return "rejected_rate_limited";
  }

  if (sourceAttempts.length >= titleImportGuardConfig.sourceRateLimitMaxAttempts) {
    return "rejected_rate_limited";
  }

  return "accepted";
}
