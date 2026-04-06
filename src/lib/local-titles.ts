import { z } from "zod";

import {
  createOrGetPersistedLocalTitleSeed,
  deletePersistedLocalTitleSeedBySlug,
  getPersistedTitleSeedByExternal,
  listPersistedImportedTitleSeeds,
  listPersistedTitleImportAttempts,
  appendPersistedTitleImportAttempt,
  persistLocalTitleSeedRecord,
} from "@/lib/catalog-db";
import type { MetadataSpikeTitle } from "@/lib/metadata-spike";
import type { TitleSeedRecord } from "@/lib/types";

export { buildImportedTitleSeedFromMetadata } from "@/lib/catalog-db";

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

function trimExpiredImportAttempts(
  attempts: StoredTitleImportAttempt[],
  now = Date.now(),
): StoredTitleImportAttempt[] {
  return attempts.filter(
    (attempt) => now - Date.parse(attempt.submittedAt) <= titleImportGuardConfig.attemptsRetentionMs,
  );
}

export function createTitleExternalLookupKey(source: string, sourceId: string | number): string {
  return `${source}:${String(sourceId)}`;
}

export async function listStoredLocalTitleSeeds(): Promise<StoredLocalTitleSeed[]> {
  return listPersistedImportedTitleSeeds();
}

export async function listStoredTitleImportAttempts(): Promise<StoredTitleImportAttempt[]> {
  return trimExpiredImportAttempts(
    z.array(storedTitleImportAttemptSchema).parse(await listPersistedTitleImportAttempts()),
  );
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
  return persistLocalTitleSeedRecord(seed);
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

  await appendPersistedTitleImportAttempt(attempt);
  return attempt;
}

export async function createOrGetStoredLocalTitleSeed(item: MetadataSpikeTitle): Promise<{
  seed: StoredLocalTitleSeed;
  created: boolean;
}> {
  const existing = await getPersistedTitleSeedByExternal(item.externalSource, item.sourceId);

  if (existing) {
    return {
      seed: existing,
      created: false,
    };
  }

  return createOrGetPersistedLocalTitleSeed(item);
}

export async function deleteStoredLocalTitleSeedBySlug(slug: string): Promise<{
  deleted: boolean;
}> {
  return deletePersistedLocalTitleSeedBySlug(slug);
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
