import { readFile } from "node:fs/promises";
import path from "node:path";

import { z } from "zod";

import type { TitleSeedRecord } from "@/lib/types";

const scaleValueSchema = z.coerce.number().int().min(0).max(4);

const storedTitleRatingSchema = z.object({
  titleId: z.string().min(1),
  volumeLevel: scaleValueSchema,
  peakIntensity: scaleValueSchema,
  stimulusDensity: scaleValueSchema,
  soothingEffect: scaleValueSchema,
  submittedAt: z.string().datetime(),
});

const storedRatingAttemptSchema = z.object({
  titleId: z.string().min(1),
  ipHash: z.string().min(1),
  status: z.enum([
    "accepted",
    "rejected_rate_limited",
    "rejected_cooldown",
    "rejected_too_fast",
    "suspicious",
  ]),
  submittedAt: z.string().datetime(),
});

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
    sourceType: z.enum([
      "editorial_seed",
      "provisional_seed",
      "metadata_inference",
      "community_median",
      "mixed",
    ]),
    lastReviewedAt: z.string().optional(),
  }),
});

const storedTitleImportAttemptSchema = z.object({
  sourceKey: z.string().min(1),
  ipHash: z.string().min(1),
  status: z.enum(["accepted", "rejected_rate_limited", "suspicious"]),
  submittedAt: z.string().datetime(),
});

export type LegacyStoredTitleRating = z.infer<typeof storedTitleRatingSchema>;
export type LegacyStoredRatingAttempt = z.infer<typeof storedRatingAttemptSchema>;
export type LegacyStoredLocalTitleSeed = TitleSeedRecord;
export type LegacyStoredTitleImportAttempt = z.infer<typeof storedTitleImportAttemptSchema>;

function getLegacyFilePath(fileName: string): string {
  return path.join(/* turbopackIgnore: true */ process.cwd(), "data", fileName);
}

async function readLegacyJsonFile<T>(fileName: string, schema: z.ZodType<T>): Promise<T[]> {
  try {
    const contents = await readFile(getLegacyFilePath(fileName), "utf-8");
    const parsed = JSON.parse(contents || "[]");
    return z.array(schema).parse(parsed);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;

    if (code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

export async function readLegacyWriteStore(): Promise<{
  ratings: LegacyStoredTitleRating[];
  ratingAttempts: LegacyStoredRatingAttempt[];
  localTitleSeeds: LegacyStoredLocalTitleSeed[];
  titleImportAttempts: LegacyStoredTitleImportAttempt[];
}> {
  const [ratings, ratingAttempts, localTitleSeeds, titleImportAttempts] = await Promise.all([
    readLegacyJsonFile("ratings.local.json", storedTitleRatingSchema),
    readLegacyJsonFile("rating-attempts.local.json", storedRatingAttemptSchema),
    readLegacyJsonFile("titles.local.json", storedLocalTitleSeedSchema),
    readLegacyJsonFile("title-import-attempts.local.json", storedTitleImportAttemptSchema),
  ]);

  return {
    ratings,
    ratingAttempts,
    localTitleSeeds: localTitleSeeds as TitleSeedRecord[],
    titleImportAttempts,
  };
}
