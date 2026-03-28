import { afterAll, afterEach, describe, expect, it } from "vitest";

import { disconnectPrisma } from "./prisma";
import { createAggregatedAssessment } from "./profile";
import {
  appendStoredRating,
  appendStoredRatingAttempt,
  deriveAggregateSourceType,
  evaluateRatingAttempt,
  getStoredRatingsForTitle,
  hasTrustedOrigin,
  hashClientAddress,
  listStoredRatings,
  ratingGuardConfig,
} from "./ratings";
import { resetCatalogStoreForTests } from "./test-db";

afterEach(async () => {
  await resetCatalogStoreForTests();
});

afterAll(async () => {
  await disconnectPrisma();
});

describe("stored ratings", () => {
  it("persists a submitted rating server-side", async () => {
    await appendStoredRating({
      titleId: "mondfenster",
      volumeLevel: 1,
      peakIntensity: 1,
      stimulusDensity: 0,
      soothingEffect: 3,
    });

    const ratings = await listStoredRatings();

    expect(ratings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          titleId: "mondfenster",
          soothingEffect: 3,
        }),
      ]),
    );
  });

  it("recalculates the aggregate after a new rating", async () => {
    const storedRating = await appendStoredRating({
      titleId: "mondfenster",
      volumeLevel: 4,
      peakIntensity: 3,
      stimulusDensity: 4,
      soothingEffect: 0,
    });

    const ratings = await listStoredRatings();
    const titleRatings = getStoredRatingsForTitle(ratings, storedRating.titleId);
    const assessment = createAggregatedAssessment({
      ratings: {
        volumeLevel: [0, 0, 0, 1, ...titleRatings.map((rating) => rating.volumeLevel)],
        peakIntensity: [1, 1, 0, 1, ...titleRatings.map((rating) => rating.peakIntensity)],
        stimulusDensity: [0, 0, 0, 1, ...titleRatings.map((rating) => rating.stimulusDensity)],
        soothingEffect: [2, 2, 3, 2, ...titleRatings.map((rating) => rating.soothingEffect)],
      },
      notes: "Test",
      sourceType: "mixed",
      lastReviewedAt: titleRatings.at(-1)?.submittedAt.slice(0, 10),
    });

    expect(assessment.stimulusProfile.volumeLevel).toBe(0);
    expect(assessment.stimulusProfile.peakIntensity).toBe(1);
    expect(assessment.stimulusProfile.stimulusDensity).toBe(0);
    expect(assessment.soothingEffect).toBe(2);
    expect(assessment.aggregation.ratingCount).toBe(5);
    expect(assessment.aggregation.level).toBe("hoch");
  });

  it("keeps soothingEffect separate from the main profile axes", () => {
    expect(deriveAggregateSourceType("editorial_seed", 1)).toBe("mixed");
    expect(deriveAggregateSourceType("metadata_inference", 1)).toBe("mixed");
    expect(deriveAggregateSourceType("community_median", 2)).toBe("community_median");
  });

  it("accepts a normal anonymous submission with trusted origin", () => {
    expect(
      evaluateRatingAttempt({
        titleId: "mondfenster",
        ipHash: hashClientAddress("127.0.0.1"),
        recentAttempts: [],
        now: Date.parse("2026-03-28T12:00:00.000Z"),
        renderedAt: Date.parse("2026-03-28T11:59:56.000Z"),
        hasTrustedOrigin: true,
        hasRecentCookieCooldown: false,
      }),
    ).toBe("accepted");
  });

  it("rejects repeated title submissions during cooldown", () => {
    const now = Date.parse("2026-03-28T12:00:00.000Z");

    expect(
      evaluateRatingAttempt({
        titleId: "mondfenster",
        ipHash: "same-ip",
        recentAttempts: [
          {
            titleId: "mondfenster",
            ipHash: "same-ip",
            status: "accepted",
            submittedAt: new Date(now - 60_000).toISOString(),
          },
        ],
        now,
        renderedAt: now - 10_000,
        hasTrustedOrigin: true,
        hasRecentCookieCooldown: false,
      }),
    ).toBe("rejected_cooldown");
  });

  it("rejects a recent device-level cooldown flag for the same title", () => {
    const now = Date.parse("2026-03-28T12:00:00.000Z");

    expect(
      evaluateRatingAttempt({
        titleId: "mondfenster",
        ipHash: "same-ip",
        recentAttempts: [],
        now,
        renderedAt: now - 10_000,
        hasTrustedOrigin: true,
        hasRecentCookieCooldown: true,
      }),
    ).toBe("rejected_cooldown");
  });

  it("rejects very fast submissions", () => {
    const now = Date.parse("2026-03-28T12:00:00.000Z");

    expect(
      evaluateRatingAttempt({
        titleId: "mondfenster",
        ipHash: "same-ip",
        recentAttempts: [],
        now,
        renderedAt: now - 500,
        hasTrustedOrigin: true,
        hasRecentCookieCooldown: false,
      }),
    ).toBe("rejected_too_fast");
  });

  it("rejects global rate-limit bursts per hashed IP", () => {
    const now = Date.parse("2026-03-28T12:00:00.000Z");
    const recentAttempts = Array.from(
      { length: ratingGuardConfig.globalRateLimitMaxAttempts },
      (_, index) => ({
        titleId: `title-${index}`,
        ipHash: "same-ip",
        status: "accepted" as const,
        submittedAt: new Date(now - 30_000).toISOString(),
      }),
    );

    expect(
      evaluateRatingAttempt({
        titleId: "mondfenster",
        ipHash: "same-ip",
        recentAttempts,
        now,
        renderedAt: now - 10_000,
        hasTrustedOrigin: true,
        hasRecentCookieCooldown: false,
      }),
    ).toBe("rejected_rate_limited");
  });

  it("marks requests with untrusted origin as suspicious", () => {
    expect(
      hasTrustedOrigin({
        origin: "https://evil.example",
        host: "localhost:3000",
        forwardedHost: null,
        referer: null,
        secFetchSite: "cross-site",
      }),
    ).toBe(false);
  });

  it("stores attempt statuses without keeping raw IP addresses", async () => {
    const storedAttempt = await appendStoredRatingAttempt({
      titleId: "mondfenster",
      ipHash: hashClientAddress("127.0.0.1"),
      status: "accepted",
    });

    expect(storedAttempt.ipHash).not.toBe("127.0.0.1");
    expect(storedAttempt.status).toBe("accepted");
  });
});
