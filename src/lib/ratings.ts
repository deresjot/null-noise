import { createHash } from "node:crypto";

import { z } from "zod";

import {
  appendPersistedAnonymousRating,
  appendPersistedRatingAttempt,
  listPersistedAnonymousRatings,
  listPersistedRatingAttempts,
} from "@/lib/catalog-db";
import { createAggregatedAssessment } from "@/lib/profile";
import type {
  AggregateSourceType,
  RatingSampleSet,
  ScaleValue,
  TitleRecord,
  TitleSeedRecord,
} from "@/lib/types";

const scaleValueSchema = z.coerce.number().int().min(0).max(4);

const storedTitleRatingSchema = z.object({
  titleId: z.string().min(1),
  volumeLevel: scaleValueSchema,
  peakIntensity: scaleValueSchema,
  stimulusDensity: scaleValueSchema,
  soothingEffect: scaleValueSchema,
  submittedAt: z.string().datetime(),
});

export const titleRatingInputSchema = storedTitleRatingSchema.omit({
  submittedAt: true,
});

export type StoredTitleRating = z.infer<typeof storedTitleRatingSchema>;
export type TitleRatingInput = z.infer<typeof titleRatingInputSchema>;

const ratingAttemptStatusSchema = z.enum([
  "accepted",
  "rejected_rate_limited",
  "rejected_cooldown",
  "rejected_too_fast",
  "suspicious",
]);

const storedRatingAttemptSchema = z.object({
  titleId: z.string().min(1),
  ipHash: z.string().min(1),
  status: ratingAttemptStatusSchema,
  submittedAt: z.string().datetime(),
});

export type RatingAttemptStatus = z.infer<typeof ratingAttemptStatusSchema>;
export type StoredRatingAttempt = z.infer<typeof storedRatingAttemptSchema>;

export const ratingGuardConfig = {
  titleCooldownMs: 12 * 60 * 60 * 1000,
  titleRateLimitWindowMs: 12 * 60 * 60 * 1000,
  titleRateLimitMaxAttempts: 3,
  globalRateLimitWindowMs: 60 * 60 * 1000,
  globalRateLimitMaxAttempts: 12,
  minSubmitDurationMs: 1500,
  attemptsRetentionMs: 24 * 60 * 60 * 1000,
} as const;

export async function listStoredRatings(): Promise<StoredTitleRating[]> {
  return z.array(storedTitleRatingSchema).parse(await listPersistedAnonymousRatings());
}

function trimExpiredAttempts(
  attempts: StoredRatingAttempt[],
  now = Date.now(),
): StoredRatingAttempt[] {
  return attempts.filter(
    (attempt) => now - Date.parse(attempt.submittedAt) <= ratingGuardConfig.attemptsRetentionMs,
  );
}

export async function listStoredRatingAttempts(): Promise<StoredRatingAttempt[]> {
  return trimExpiredAttempts(
    z.array(storedRatingAttemptSchema).parse(await listPersistedRatingAttempts()),
  );
}

export async function appendStoredRating(input: TitleRatingInput): Promise<StoredTitleRating> {
  const rating = storedTitleRatingSchema.parse({
    ...titleRatingInputSchema.parse(input),
    submittedAt: new Date().toISOString(),
  });
  await appendPersistedAnonymousRating({
    titleSlug: rating.titleId,
    volumeLevel: rating.volumeLevel,
    peakIntensity: rating.peakIntensity,
    stimulusDensity: rating.stimulusDensity,
    soothingEffect: rating.soothingEffect,
    submittedAt: rating.submittedAt,
  });
  return rating;
}

export async function appendStoredRatingAttempt(input: {
  titleId: string;
  ipHash: string;
  status: RatingAttemptStatus;
  submittedAt?: string;
}): Promise<StoredRatingAttempt> {
  const attempt = storedRatingAttemptSchema.parse({
    ...input,
    submittedAt: input.submittedAt ?? new Date().toISOString(),
  });
  await appendPersistedRatingAttempt(attempt);
  return attempt;
}

export function getStoredRatingsForTitle(
  ratings: StoredTitleRating[],
  titleId: string,
): StoredTitleRating[] {
  return ratings.filter((rating) => rating.titleId === titleId);
}

export function mergeRatingSamples(
  seedRatings: RatingSampleSet,
  storedRatings: StoredTitleRating[],
): RatingSampleSet {
  return {
    volumeLevel: [
      ...seedRatings.volumeLevel,
      ...storedRatings.map((rating) => rating.volumeLevel as ScaleValue),
    ],
    peakIntensity: [
      ...seedRatings.peakIntensity,
      ...storedRatings.map((rating) => rating.peakIntensity as ScaleValue),
    ],
    stimulusDensity: [
      ...seedRatings.stimulusDensity,
      ...storedRatings.map((rating) => rating.stimulusDensity as ScaleValue),
    ],
    soothingEffect: [
      ...seedRatings.soothingEffect,
      ...storedRatings.map((rating) => rating.soothingEffect as ScaleValue),
    ],
  };
}

export function deriveAggregateSourceType(
  baseSourceType: AggregateSourceType,
  storedRatingCount: number,
): AggregateSourceType {
  if (!storedRatingCount) {
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

export function hashClientAddress(input: string): string {
  const salt = process.env.NULL_NOISE_RATE_LIMIT_SALT ?? "null-noise-local";
  return createHash("sha256").update(`${salt}:${input}`).digest("hex").slice(0, 32);
}

export function extractClientAddress(headers: {
  forwardedFor?: string | null;
  realIp?: string | null;
}): string {
  const forwardedFor = headers.forwardedFor?.split(",")[0]?.trim();
  if (forwardedFor) {
    return forwardedFor;
  }

  const realIp = headers.realIp?.trim();
  if (realIp) {
    return realIp;
  }

  return "local-anonymous";
}

function getHostCandidate(value?: string | null): string | null {
  const candidate = value?.trim().toLowerCase();
  return candidate ? candidate : null;
}

function getHostFromUrl(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).host.toLowerCase();
  } catch {
    return null;
  }
}

export function hasTrustedOrigin(values: {
  origin?: string | null;
  referer?: string | null;
  host?: string | null;
  forwardedHost?: string | null;
  secFetchSite?: string | null;
}): boolean {
  const requestHost = getHostCandidate(values.forwardedHost) ?? getHostCandidate(values.host);

  if (!requestHost) {
    return false;
  }

  const originHost = getHostFromUrl(values.origin);
  if (originHost) {
    return originHost === requestHost;
  }

  const refererHost = getHostFromUrl(values.referer);
  if (refererHost) {
    return refererHost === requestHost;
  }

  return (
    !values.secFetchSite ||
    values.secFetchSite === "same-origin" ||
    values.secFetchSite === "same-site" ||
    values.secFetchSite === "none"
  );
}

export function evaluateRatingAttempt(input: {
  titleId: string;
  ipHash: string;
  recentAttempts: StoredRatingAttempt[];
  now?: number;
  renderedAt?: number | null;
  hasTrustedOrigin: boolean;
  hasRecentCookieCooldown: boolean;
}): RatingAttemptStatus {
  const now = input.now ?? Date.now();

  if (!input.hasTrustedOrigin) {
    return "suspicious";
  }

  if (
    typeof input.renderedAt === "number" &&
    Number.isFinite(input.renderedAt) &&
    input.renderedAt > 0 &&
    now >= input.renderedAt &&
    now - input.renderedAt < ratingGuardConfig.minSubmitDurationMs
  ) {
    return "rejected_too_fast";
  }

  const globalAttempts = input.recentAttempts.filter(
    (attempt) =>
      attempt.ipHash === input.ipHash &&
      now - Date.parse(attempt.submittedAt) <= ratingGuardConfig.globalRateLimitWindowMs,
  );

  if (globalAttempts.length >= ratingGuardConfig.globalRateLimitMaxAttempts) {
    return "rejected_rate_limited";
  }

  const titleAttempts = input.recentAttempts.filter(
    (attempt) =>
      attempt.ipHash === input.ipHash &&
      attempt.titleId === input.titleId &&
      now - Date.parse(attempt.submittedAt) <= ratingGuardConfig.titleRateLimitWindowMs,
  );

  const recentAcceptedTitleAttempt = titleAttempts.find(
    (attempt) =>
      attempt.status === "accepted" &&
      now - Date.parse(attempt.submittedAt) <= ratingGuardConfig.titleCooldownMs,
  );

  if (input.hasRecentCookieCooldown || recentAcceptedTitleAttempt) {
    return "rejected_cooldown";
  }

  if (titleAttempts.length >= ratingGuardConfig.titleRateLimitMaxAttempts) {
    return "rejected_rate_limited";
  }

  return "accepted";
}

export function buildTitleRecordFromSeed(
  seed: TitleSeedRecord,
  storedRatings: StoredTitleRating[],
): TitleRecord {
  const mergedRatings = mergeRatingSamples(seed.ratingSamples, storedRatings);
  const sourceType = deriveAggregateSourceType(seed.aggregation.sourceType, storedRatings.length);
  const assessment = createAggregatedAssessment({
    ratings: mergedRatings,
    notes: seed.notes,
    sourceType,
    lastReviewedAt:
      storedRatings.at(-1)?.submittedAt?.slice(0, 10) ?? seed.aggregation.lastReviewedAt,
  });

  return {
    external: seed.external,
    stimulusProfile: assessment.stimulusProfile,
    soothingEffect: assessment.soothingEffect,
    contentFlags: seed.contentFlags,
    aggregation: assessment.aggregation,
  };
}

export function formatScaleLegend(
  minLabel: string,
  maxLabel: string,
): string {
  return `0 ${minLabel} · 4 ${maxLabel}`;
}

export function getScaleOptions(): ScaleValue[] {
  return [0, 1, 2, 3, 4];
}
