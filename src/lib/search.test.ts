import { describe, expect, it } from "vitest";

import { mockTitles } from "./mock-data";
import { filterTitles, hasSensoryFilters } from "./search";

describe("catalog search", () => {
  it("matches exact title input for local catalog titles", () => {
    const results = filterTitles(mockTitles, {
      q: "Mondfenster",
      tone: "all",
      kind: "all",
      avoidPeaks: false,
      avoidDensity: false,
    });

    expect(results[0]?.external.slug).toBe("mondfenster");
  });

  it("matches typo-tolerant title input for local catalog titles", () => {
    const results = filterTitles(mockTitles, {
      q: "Hafn ohne Eile",
      tone: "all",
      kind: "all",
      avoidPeaks: false,
      avoidDensity: false,
    });

    expect(results.map((item) => item.external.slug)).toContain("hafen-ohne-eile");
  });

  it("keeps sensory filters detectable for external fallback decisions", () => {
    expect(
      hasSensoryFilters({
        q: "Arrival",
        tone: "all",
        kind: "all",
        avoidPeaks: false,
        avoidDensity: false,
      }),
    ).toBe(false);

    expect(
      hasSensoryFilters({
        q: "Arrival",
        tone: "calm",
        kind: "all",
        avoidPeaks: false,
        avoidDensity: false,
      }),
    ).toBe(true);
  });

  it("filters stronger when peak avoidance is active", () => {
    const results = filterTitles(mockTitles, {
      q: "",
      tone: "all",
      kind: "all",
      avoidPeaks: true,
      avoidDensity: false,
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((item) => item.stimulusProfile.peakIntensity < 4)).toBe(true);
    expect(results.some((item) => item.stimulusProfile.peakIntensity >= 2)).toBe(true);
  });

  it("filters stronger when density avoidance is active", () => {
    const results = filterTitles(mockTitles, {
      q: "",
      tone: "all",
      kind: "all",
      avoidPeaks: false,
      avoidDensity: true,
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((item) => item.stimulusProfile.stimulusDensity < 4)).toBe(true);
    expect(results.some((item) => item.stimulusProfile.stimulusDensity >= 2)).toBe(true);
  });
});
