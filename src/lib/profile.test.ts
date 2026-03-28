import { describe, expect, it } from "vitest";

import {
  createAggregatedAssessment,
  createRatingAggregate,
  getConfidenceLevel,
  getMedianScaleValue,
} from "./profile";

describe("confidence model", () => {
  it("maps one Einschätzung to niedrig confidence", () => {
    expect(getConfidenceLevel(1)).toBe("niedrig");
  });

  it("maps two to four Einschätzungen to mittel confidence", () => {
    expect(getConfidenceLevel(2)).toBe("mittel");
    expect(getConfidenceLevel(4)).toBe("mittel");
  });

  it("maps five or more Einschätzungen to hoch confidence", () => {
    expect(getConfidenceLevel(5)).toBe("hoch");
    expect(getConfidenceLevel(9)).toBe("hoch");
  });

  it("derives the stored confidence level from the rating count", () => {
    expect(
      createRatingAggregate({
        ratingCount: 3,
        sourceType: "mixed",
        lastReviewedAt: "2026-03-27",
      }),
    ).toMatchObject({
      ratingCount: 3,
      level: "mittel",
    });
  });
});

describe("aggregated title assessment", () => {
  it("uses the median for discrete scale values", () => {
    expect(getMedianScaleValue([0, 1, 1, 2, 4])).toBe(1);
    expect(getMedianScaleValue([1, 3])).toBe(2);
  });

  it("keeps soothingEffect separate while aggregating all rating fields", () => {
    expect(
      createAggregatedAssessment({
        ratings: {
          volumeLevel: [3, 2, 3],
          peakIntensity: [2, 3, 2],
          stimulusDensity: [3, 3, 2],
          soothingEffect: [4, 3, 3],
        },
        notes: "Test",
        sourceType: "mixed",
        lastReviewedAt: "2026-03-27",
      }),
    ).toMatchObject({
      stimulusProfile: {
        volumeLevel: 3,
        peakIntensity: 2,
        stimulusDensity: 3,
      },
      soothingEffect: 3,
      aggregation: {
        ratingCount: 3,
        level: "mittel",
      },
    });
  });
});
