import "server-only";

import { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { createAggregatedAssessment } from "@/lib/profile";
import { readLegacyWriteStore } from "@/lib/legacy-json";
import { deriveMetadataInferenceAssessment } from "@/lib/metadata-inference";
import { mockTitleSeeds } from "@/lib/mock-data";
import { normalizeSearchText } from "@/lib/search";
import type { MetadataSpikeTitle } from "@/lib/metadata-spike";
import type {
  AggregateSourceType,
  RatingSampleSet,
  ScaleValue,
  TitleRecord,
  TitleSeedRecord,
} from "@/lib/types";

type PersistedTitleRecord = Prisma.ExternalTitleGetPayload<{
  include: {
    aggregate: true;
    contentFlags: {
      select: { flag: true };
    };
  };
}>;

type PersistedTitleSeed = Prisma.ExternalTitleGetPayload<{
  include: {
    aggregate: true;
    contentFlags: {
      select: { flag: true };
    };
    ratings: {
      orderBy: { submittedAt: "asc" };
    };
  };
}>;

type CatalogTransaction = Prisma.TransactionClient;

let bootstrapPromise: Promise<void> | null = null;
let bootstrapCompleted = false;

export class CatalogStoreUnavailableError extends Error {
  constructor(message = "Die lokale Titelbasis ist gerade nicht verfügbar.") {
    super(message);
    this.name = "CatalogStoreUnavailableError";
  }
}

function ensureDatabaseUrl(): void {
  if (!process.env.DATABASE_URL?.trim()) {
    throw new CatalogStoreUnavailableError();
  }
}

function shouldSkipLegacyImport(): boolean {
  return process.env.NULL_NOISE_SKIP_LEGACY_IMPORT === "true";
}

function toCatalogStoreUnavailableError(error: unknown): CatalogStoreUnavailableError | null {
  if (error instanceof CatalogStoreUnavailableError) {
    return error;
  }

  if (
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientRustPanicError ||
    error instanceof Prisma.PrismaClientUnknownRequestError
  ) {
    return new CatalogStoreUnavailableError();
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (["P1003", "P1008", "P1017", "P2021", "P2022"].includes(error.code)) {
      return new CatalogStoreUnavailableError();
    }
  }

  return null;
}

function parseDateOnly(value?: string): Date | null {
  if (!value) {
    return null;
  }

  return new Date(`${value}T12:00:00.000Z`);
}

function formatDateOnly(value?: Date | null): string | undefined {
  return value ? value.toISOString().slice(0, 10) : undefined;
}

function normalizeNullableText(value: string | null | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function createSeedSubmittedAt(lastReviewedAt: string | undefined, index: number): Date {
  const base = parseDateOnly(lastReviewedAt) ?? new Date("2026-03-01T12:00:00.000Z");
  return new Date(base.getTime() + index * 1000);
}

function zipRatingSamples(ratingSamples: RatingSampleSet) {
  const length = ratingSamples.volumeLevel.length;

  return Array.from({ length }, (_, index) => ({
    volumeLevel: ratingSamples.volumeLevel[index],
    peakIntensity: ratingSamples.peakIntensity[index],
    stimulusDensity: ratingSamples.stimulusDensity[index],
    soothingEffect: ratingSamples.soothingEffect[index],
  }));
}

function buildRatingSampleSet(
  ratings: Array<{
    volumeLevel: number;
    peakIntensity: number;
    stimulusDensity: number;
    soothingEffect: number;
  }>,
): RatingSampleSet {
  return {
    volumeLevel: ratings.map((rating) => rating.volumeLevel as ScaleValue),
    peakIntensity: ratings.map((rating) => rating.peakIntensity as ScaleValue),
    stimulusDensity: ratings.map((rating) => rating.stimulusDensity as ScaleValue),
    soothingEffect: ratings.map((rating) => rating.soothingEffect as ScaleValue),
  };
}

function deriveAggregateSourceType(
  baseSourceType: AggregateSourceType,
  anonymousRatingCount: number,
): AggregateSourceType {
  if (!anonymousRatingCount) {
    return baseSourceType;
  }

  if (
    baseSourceType === "editorial_seed" ||
    baseSourceType === "provisional_seed" ||
    baseSourceType === "metadata_inference"
  ) {
    return "mixed";
  }

  return baseSourceType;
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

export function buildImportedTitleSeedFromMetadata(
  item: MetadataSpikeTitle,
  existingSlugs: Set<string>,
): TitleSeedRecord {
  const today = new Date().toISOString().slice(0, 10);
  const inferredProfile = deriveMetadataInferenceAssessment(item);

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
    ratingSamples: inferredProfile.ratingSamples,
    notes: inferredProfile.notes,
    contentFlags: [],
    aggregation: {
      sourceType: "metadata_inference",
      lastReviewedAt: today,
    },
  };
}

function mapPersistedTitleToRecord(title: PersistedTitleRecord): TitleRecord {
  if (!title.aggregate) {
    throw new CatalogStoreUnavailableError();
  }

  return {
    external: {
      slug: title.slug,
      title: title.title,
      originalTitle: title.originalTitle ?? undefined,
      kind: title.kind,
      year: title.releaseYear,
      synopsis: title.synopsis,
      runtimeMinutes: title.runtimeMinutes ?? undefined,
      posterPath: title.posterPath,
      externalSource: title.externalSource,
      externalSourceId: title.externalSourceId,
    },
    stimulusProfile: {
      volumeLevel: title.aggregate.volumeLevel as ScaleValue,
      peakIntensity: title.aggregate.peakIntensity as ScaleValue,
      stimulusDensity: title.aggregate.stimulusDensity as ScaleValue,
      notes: title.profileNotes,
    },
    soothingEffect: title.aggregate.soothingEffect as ScaleValue,
    contentFlags: title.contentFlags.map((flag) => flag.flag),
    aggregation: {
      ratingCount: title.aggregate.ratingCount,
      level: title.aggregate.confidenceLevel,
      sourceType: title.aggregate.sourceType,
      lastReviewedAt: formatDateOnly(title.aggregate.lastReviewedAt) ?? undefined,
    },
  };
}

function mapPersistedTitleToSeed(title: PersistedTitleSeed): TitleSeedRecord {
  return {
    external: {
      slug: title.slug,
      title: title.title,
      originalTitle: title.originalTitle ?? undefined,
      kind: title.kind,
      year: title.releaseYear,
      synopsis: title.synopsis,
      runtimeMinutes: title.runtimeMinutes ?? undefined,
      posterPath: title.posterPath,
      externalSource: title.externalSource,
      externalSourceId: title.externalSourceId,
    },
    ratingSamples: buildRatingSampleSet(title.ratings),
    notes: title.profileNotes,
    contentFlags: title.contentFlags.map((flag) => flag.flag),
    aggregation: {
      sourceType: title.profileBaseSourceType,
      lastReviewedAt: formatDateOnly(title.profileBaseLastReviewedAt) ?? undefined,
    },
  };
}

async function recalculateAggregateForTitle(tx: CatalogTransaction, titleId: string): Promise<void> {
  const title = await tx.externalTitle.findUnique({
    where: { id: titleId },
    include: {
      ratings: {
        orderBy: { submittedAt: "asc" },
      },
    },
  });

  if (!title || !title.ratings.length) {
    throw new CatalogStoreUnavailableError();
  }

  const ratingSamples = buildRatingSampleSet(title.ratings);
  const anonymousRatings = title.ratings.filter((rating) => rating.sourceType === "anonymous");
  const latestAnonymousRating = anonymousRatings.at(-1);
  const assessment = createAggregatedAssessment({
    ratings: ratingSamples,
    notes: title.profileNotes,
    sourceType: deriveAggregateSourceType(
      title.profileBaseSourceType as AggregateSourceType,
      anonymousRatings.length,
    ),
    lastReviewedAt: formatDateOnly(latestAnonymousRating?.submittedAt ?? title.profileBaseLastReviewedAt),
  });

  await tx.stimulusAggregate.upsert({
    where: { titleId },
    update: {
      volumeLevel: assessment.stimulusProfile.volumeLevel,
      peakIntensity: assessment.stimulusProfile.peakIntensity,
      stimulusDensity: assessment.stimulusProfile.stimulusDensity,
      soothingEffect: assessment.soothingEffect,
      confidenceLevel: assessment.aggregation.level,
      ratingCount: assessment.aggregation.ratingCount,
      sourceType: assessment.aggregation.sourceType,
      lastReviewedAt: parseDateOnly(assessment.aggregation.lastReviewedAt),
    },
    create: {
      titleId,
      volumeLevel: assessment.stimulusProfile.volumeLevel,
      peakIntensity: assessment.stimulusProfile.peakIntensity,
      stimulusDensity: assessment.stimulusProfile.stimulusDensity,
      soothingEffect: assessment.soothingEffect,
      confidenceLevel: assessment.aggregation.level,
      ratingCount: assessment.aggregation.ratingCount,
      sourceType: assessment.aggregation.sourceType,
      lastReviewedAt: parseDateOnly(assessment.aggregation.lastReviewedAt),
    },
  });
}

async function upsertTitleSeed(tx: CatalogTransaction, seed: TitleSeedRecord): Promise<void> {
  const title = await tx.externalTitle.upsert({
    where: {
      externalSource_externalSourceId: {
        externalSource: seed.external.externalSource,
        externalSourceId: seed.external.externalSourceId,
      },
    },
    update: {
      slug: seed.external.slug,
      title: seed.external.title,
      originalTitle: seed.external.originalTitle ?? null,
      kind: seed.external.kind,
      releaseYear: seed.external.year,
      synopsis: normalizeNullableText(seed.external.synopsis),
      runtimeMinutes: seed.external.runtimeMinutes ?? null,
      posterPath: seed.external.posterPath ?? null,
      profileNotes: seed.notes,
      profileBaseSourceType: seed.aggregation.sourceType,
      profileBaseLastReviewedAt: parseDateOnly(seed.aggregation.lastReviewedAt),
    },
    create: {
      slug: seed.external.slug,
      title: seed.external.title,
      originalTitle: seed.external.originalTitle ?? null,
      kind: seed.external.kind,
      releaseYear: seed.external.year,
      synopsis: normalizeNullableText(seed.external.synopsis),
      runtimeMinutes: seed.external.runtimeMinutes ?? null,
      posterPath: seed.external.posterPath ?? null,
      externalSource: seed.external.externalSource,
      externalSourceId: seed.external.externalSourceId,
      profileNotes: seed.notes,
      profileBaseSourceType: seed.aggregation.sourceType,
      profileBaseLastReviewedAt: parseDateOnly(seed.aggregation.lastReviewedAt),
    },
  });

  await tx.contentFlag.deleteMany({ where: { titleId: title.id } });
  if (seed.contentFlags.length) {
    await tx.contentFlag.createMany({
      data: seed.contentFlags.map((flag) => ({
        titleId: title.id,
        flag,
      })),
    });
  }

  await tx.titleRating.deleteMany({
    where: {
      titleId: title.id,
      sourceType: "seed",
    },
  });

  if (seed.ratingSamples.volumeLevel.length) {
    await tx.titleRating.createMany({
      data: zipRatingSamples(seed.ratingSamples).map((rating, index) => ({
        titleId: title.id,
        sourceType: "seed",
        volumeLevel: rating.volumeLevel,
        peakIntensity: rating.peakIntensity,
        stimulusDensity: rating.stimulusDensity,
        soothingEffect: rating.soothingEffect,
        submittedAt: createSeedSubmittedAt(seed.aggregation.lastReviewedAt, index),
      })),
    });
  }

  await recalculateAggregateForTitle(tx, title.id);
}

async function importLegacyWriteStore(tx: CatalogTransaction): Promise<void> {
  if (shouldSkipLegacyImport()) {
    return;
  }

  const [
    importedTitleCount,
    anonymousRatingCount,
    ratingAttemptCount,
    titleImportAttemptCount,
  ] = await Promise.all([
    tx.externalTitle.count({
      where: {
        externalSource: {
          not: "tmdb_seed",
        },
      },
    }),
    tx.titleRating.count({
      where: { sourceType: "anonymous" },
    }),
    tx.ratingAttempt.count(),
    tx.titleImportAttempt.count(),
  ]);

  if (importedTitleCount || anonymousRatingCount || ratingAttemptCount || titleImportAttemptCount) {
    return;
  }

  const legacyStore = await readLegacyWriteStore();

  for (const seed of legacyStore.localTitleSeeds) {
    await upsertTitleSeed(tx, seed);
  }

  const knownTitles = await tx.externalTitle.findMany({
    select: {
      id: true,
      slug: true,
    },
  });
  const titleIdBySlug = new Map(knownTitles.map((title) => [title.slug, title.id]));
  const affectedTitleIds = new Set<string>();

  if (legacyStore.ratings.length) {
    await tx.titleRating.createMany({
      data: legacyStore.ratings
        .map((rating) => {
          const titleId = titleIdBySlug.get(rating.titleId);

          if (!titleId) {
            return null;
          }

          affectedTitleIds.add(titleId);

          return {
            titleId,
            sourceType: "anonymous" as const,
            volumeLevel: rating.volumeLevel,
            peakIntensity: rating.peakIntensity,
            stimulusDensity: rating.stimulusDensity,
            soothingEffect: rating.soothingEffect,
            submittedAt: new Date(rating.submittedAt),
          };
        })
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)),
    });
  }

  if (legacyStore.ratingAttempts.length) {
    await tx.ratingAttempt.createMany({
      data: legacyStore.ratingAttempts.map((attempt) => ({
        titleSlug: attempt.titleId,
        ipHash: attempt.ipHash,
        status: attempt.status,
        submittedAt: new Date(attempt.submittedAt),
      })),
    });
  }

  if (legacyStore.titleImportAttempts.length) {
    await tx.titleImportAttempt.createMany({
      data: legacyStore.titleImportAttempts.map((attempt) => ({
        sourceKey: attempt.sourceKey,
        ipHash: attempt.ipHash,
        status: attempt.status,
        submittedAt: new Date(attempt.submittedAt),
      })),
    });
  }

  for (const titleId of affectedTitleIds) {
    await recalculateAggregateForTitle(tx, titleId);
  }
}

export async function ensureCatalogBootstrapped(client: PrismaClient = prisma): Promise<void> {
  ensureDatabaseUrl();

  if (bootstrapCompleted) {
    return;
  }

  if (bootstrapPromise) {
    return bootstrapPromise;
  }

  bootstrapPromise = (async () => {
    try {
      await client.$transaction(async (tx) => {
        for (const seed of mockTitleSeeds) {
          await upsertTitleSeed(tx, seed);
        }

        await importLegacyWriteStore(tx);
      });
    } catch (error) {
      const mappedError = toCatalogStoreUnavailableError(error);

      if (mappedError) {
        throw mappedError;
      }

      throw error;
    }

    bootstrapCompleted = true;
  })().catch((error) => {
    bootstrapCompleted = false;
    throw error;
  }).finally(() => {
    bootstrapPromise = null;
  });

  return bootstrapPromise;
}

export async function listPersistedTitleRecords(): Promise<TitleRecord[]> {
  await ensureCatalogBootstrapped();

  const titles = await prisma.externalTitle.findMany({
    include: {
      aggregate: true,
      contentFlags: {
        select: { flag: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return titles.map(mapPersistedTitleToRecord);
}

export async function getPersistedTitleBySlug(slug: string): Promise<TitleRecord | undefined> {
  await ensureCatalogBootstrapped();

  const title = await prisma.externalTitle.findUnique({
    where: { slug },
    include: {
      aggregate: true,
      contentFlags: {
        select: { flag: true },
      },
    },
  });

  return title ? mapPersistedTitleToRecord(title) : undefined;
}

export async function listPersistedImportedTitleSeeds(): Promise<TitleSeedRecord[]> {
  await ensureCatalogBootstrapped();

  const titles = await prisma.externalTitle.findMany({
    where: {
      externalSource: {
        not: "tmdb_seed",
      },
    },
    include: {
      aggregate: true,
      contentFlags: {
        select: { flag: true },
      },
      ratings: {
        orderBy: { submittedAt: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return titles.map(mapPersistedTitleToSeed);
}

export async function getPersistedTitleSeedByExternal(
  source: string,
  sourceId: string | number,
): Promise<TitleSeedRecord | undefined> {
  await ensureCatalogBootstrapped();

  const title = await prisma.externalTitle.findUnique({
    where: {
      externalSource_externalSourceId: {
        externalSource: source,
        externalSourceId: String(sourceId),
      },
    },
    include: {
      aggregate: true,
      contentFlags: {
        select: { flag: true },
      },
      ratings: {
        orderBy: { submittedAt: "asc" },
      },
    },
  });

  return title ? mapPersistedTitleToSeed(title) : undefined;
}

export async function getPersistedLocalTitleLookupByExternalIds(
  items: Array<{ externalSource: string; sourceId: string | number }>,
): Promise<Record<string, string>> {
  await ensureCatalogBootstrapped();

  if (!items.length) {
    return {};
  }

  const titles = await prisma.externalTitle.findMany({
    where: {
      OR: items.map((item) => ({
        externalSource: item.externalSource,
        externalSourceId: String(item.sourceId),
      })),
    },
    select: {
      externalSource: true,
      externalSourceId: true,
      slug: true,
    },
  });

  return Object.fromEntries(
    titles.map((title) => [`${title.externalSource}:${title.externalSourceId}`, title.slug]),
  );
}

export async function createOrGetPersistedLocalTitleSeed(
  item: MetadataSpikeTitle,
): Promise<{ seed: TitleSeedRecord; created: boolean }> {
  await ensureCatalogBootstrapped();

  const existing = await getPersistedTitleSeedByExternal(item.externalSource, item.sourceId);

  if (existing) {
    return {
      seed: existing,
      created: false,
    };
  }

  const existingTitles = await prisma.externalTitle.findMany({
    select: { slug: true },
  });
  const existingSlugs = new Set(existingTitles.map((title) => title.slug));
  const seed = buildImportedTitleSeedFromMetadata(item, existingSlugs);

  await prisma.$transaction(async (tx) => {
    await upsertTitleSeed(tx, seed);
  });

  return {
    seed,
    created: true,
  };
}

export async function persistLocalTitleSeedRecord(seed: TitleSeedRecord): Promise<TitleSeedRecord> {
  await ensureCatalogBootstrapped();

  await prisma.$transaction(async (tx) => {
    await upsertTitleSeed(tx, seed);
  });

  return seed;
}

export async function deletePersistedLocalTitleSeedBySlug(slug: string): Promise<{
  deleted: boolean;
}> {
  await ensureCatalogBootstrapped();

  const existing = await prisma.externalTitle.findUnique({
    where: { slug },
    select: {
      id: true,
      externalSource: true,
      externalSourceId: true,
    },
  });

  if (!existing || existing.externalSource === "tmdb_seed") {
    return { deleted: false };
  }

  const sourceKey = `${existing.externalSource}:${existing.externalSourceId}`;

  await prisma.$transaction(async (tx) => {
    await tx.externalTitle.delete({
      where: { id: existing.id },
    });

    await tx.ratingAttempt.deleteMany({
      where: { titleSlug: slug },
    });

    await tx.titleImportAttempt.deleteMany({
      where: { sourceKey },
    });
  });

  return { deleted: true };
}

export async function appendPersistedAnonymousRating(input: {
  titleSlug: string;
  volumeLevel: number;
  peakIntensity: number;
  stimulusDensity: number;
  soothingEffect: number;
  submittedAt?: string;
}): Promise<void> {
  await ensureCatalogBootstrapped();

  await prisma.$transaction(async (tx) => {
    const title = await tx.externalTitle.findUnique({
      where: { slug: input.titleSlug },
      select: { id: true },
    });

    if (!title) {
      throw new CatalogStoreUnavailableError();
    }

    await tx.titleRating.create({
      data: {
        titleId: title.id,
        sourceType: "anonymous",
        volumeLevel: input.volumeLevel,
        peakIntensity: input.peakIntensity,
        stimulusDensity: input.stimulusDensity,
        soothingEffect: input.soothingEffect,
        submittedAt: input.submittedAt ? new Date(input.submittedAt) : undefined,
      },
    });

    await recalculateAggregateForTitle(tx, title.id);
  });
}

export async function listPersistedAnonymousRatings(): Promise<
  Array<{
    titleId: string;
    volumeLevel: ScaleValue;
    peakIntensity: ScaleValue;
    stimulusDensity: ScaleValue;
    soothingEffect: ScaleValue;
    submittedAt: string;
  }>
> {
  await ensureCatalogBootstrapped();

  const ratings = await prisma.titleRating.findMany({
    where: { sourceType: "anonymous" },
    include: {
      title: {
        select: { slug: true },
      },
    },
    orderBy: { submittedAt: "asc" },
  });

  return ratings.map((rating) => ({
    titleId: rating.title.slug,
    volumeLevel: rating.volumeLevel as ScaleValue,
    peakIntensity: rating.peakIntensity as ScaleValue,
    stimulusDensity: rating.stimulusDensity as ScaleValue,
    soothingEffect: rating.soothingEffect as ScaleValue,
    submittedAt: rating.submittedAt.toISOString(),
  }));
}

export async function listPersistedRatingAttempts(): Promise<
  Array<{
    titleId: string;
    ipHash: string;
    status:
      | "accepted"
      | "rejected_rate_limited"
      | "rejected_cooldown"
      | "rejected_too_fast"
      | "suspicious";
    submittedAt: string;
  }>
> {
  await ensureCatalogBootstrapped();

  const attempts = await prisma.ratingAttempt.findMany({
    orderBy: { submittedAt: "asc" },
  });

  return attempts.map((attempt) => ({
    titleId: attempt.titleSlug,
    ipHash: attempt.ipHash,
    status: attempt.status,
    submittedAt: attempt.submittedAt.toISOString(),
  }));
}

export async function appendPersistedRatingAttempt(input: {
  titleId: string;
  ipHash: string;
  status:
    | "accepted"
    | "rejected_rate_limited"
    | "rejected_cooldown"
    | "rejected_too_fast"
    | "suspicious";
  submittedAt?: string;
}): Promise<void> {
  await ensureCatalogBootstrapped();

  await prisma.ratingAttempt.create({
    data: {
      titleSlug: input.titleId,
      ipHash: input.ipHash,
      status: input.status,
      submittedAt: input.submittedAt ? new Date(input.submittedAt) : undefined,
    },
  });
}

export async function listPersistedTitleImportAttempts(): Promise<
  Array<{
    sourceKey: string;
    ipHash: string;
    status: "accepted" | "rejected_rate_limited" | "suspicious";
    submittedAt: string;
  }>
> {
  await ensureCatalogBootstrapped();

  const attempts = await prisma.titleImportAttempt.findMany({
    orderBy: { submittedAt: "asc" },
  });

  return attempts.map((attempt) => ({
    sourceKey: attempt.sourceKey,
    ipHash: attempt.ipHash,
    status: attempt.status,
    submittedAt: attempt.submittedAt.toISOString(),
  }));
}

export async function appendPersistedTitleImportAttempt(input: {
  sourceKey: string;
  ipHash: string;
  status: "accepted" | "rejected_rate_limited" | "suspicious";
  submittedAt?: string;
}): Promise<void> {
  await ensureCatalogBootstrapped();

  await prisma.titleImportAttempt.create({
    data: {
      sourceKey: input.sourceKey,
      ipHash: input.ipHash,
      status: input.status,
      submittedAt: input.submittedAt ? new Date(input.submittedAt) : undefined,
    },
  });
}

export function resetCatalogBootstrapStateForTests(): void {
  bootstrapCompleted = false;
  bootstrapPromise = null;
}
