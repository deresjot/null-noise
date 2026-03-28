import { afterAll, afterEach, describe, expect, it } from "vitest";

import { disconnectPrisma } from "./prisma";
import {
  createOrGetStoredLocalTitleSeed,
  listStoredLocalTitleSeeds,
} from "./local-titles";
import { getTitleBySlug, getLocalTitleLookupByExternalIds, searchCatalog } from "./queries";
import { appendStoredRating } from "./ratings";
import { resetCatalogStoreForTests } from "./test-db";

afterEach(async () => {
  await resetCatalogStoreForTests();
});

afterAll(async () => {
  await disconnectPrisma();
});

describe("local titles from external TMDb metadata", () => {
  it("creates a cautious metadata-based start seed for a newly imported TMDb title", async () => {
    const result = await createOrGetStoredLocalTitleSeed({
      externalSource: "tmdb",
      externalId: "tmdb:movie:991001",
      sourceId: 991001,
      title: "Feuerlinie",
      originalTitle: "Feuerlinie",
      mediaType: "movie",
      releaseYear: 2024,
      synopsis: "Ein Team gerät zwischen Sirenen, Verfolgung und Explosionen unter Druck.",
      posterPath: "/feuerlinie.jpg",
      genres: ["Action", "Thriller"],
    });

    expect(result.created).toBe(true);
    expect(result.seed.external.slug).toBe("feuerlinie-2024");
    expect(result.seed.external.posterPath).toBe("/feuerlinie.jpg");
    expect(result.seed.aggregation.sourceType).toBe("metadata_inference");
    expect(result.seed.notes).toContain("Vorläufige Startbasis aus Metadaten.");
    expect(result.seed.ratingSamples.volumeLevel[0]).toBeGreaterThanOrEqual(2);
    expect(result.seed.ratingSamples.peakIntensity[0]).toBe(3);
    expect(result.seed.ratingSamples.stimulusDensity[0]).toBeGreaterThanOrEqual(2);
    expect(result.seed.ratingSamples.soothingEffect[0]).toBeLessThanOrEqual(2);
  });

  it("keeps metadata-based seeds defensive and away from extreme start values", async () => {
    const result = await createOrGetStoredLocalTitleSeed({
      externalSource: "tmdb",
      externalId: "tmdb:movie:991002",
      sourceId: 991002,
      title: "Stilles Ufer",
      mediaType: "movie",
      releaseYear: 2024,
      synopsis: "Ein ruhiger Dokumentarfilm über Meer, Reise und beobachtende Naturmomente.",
      posterPath: null,
      genres: ["Dokumentarfilm"],
    });

    const values = [
      result.seed.ratingSamples.volumeLevel[0],
      result.seed.ratingSamples.peakIntensity[0],
      result.seed.ratingSamples.stimulusDensity[0],
      result.seed.ratingSamples.soothingEffect[0],
    ];

    expect(values.every((value) => value >= 1 && value <= 3)).toBe(true);
    expect(result.seed.ratingSamples.volumeLevel[0]).toBeLessThanOrEqual(2);
    expect(result.seed.ratingSamples.peakIntensity[0]).toBe(1);
    expect(result.seed.ratingSamples.soothingEffect[0]).toBe(3);
  });

  it("prevents duplicate local imports for the same TMDb title", async () => {
    const first = await createOrGetStoredLocalTitleSeed({
      externalSource: "tmdb",
      externalId: "tmdb:movie:329865",
      sourceId: 329865,
      title: "Arrival",
      mediaType: "movie",
      releaseYear: 2016,
      synopsis: "Kontaktaufnahme mit ausserirdischen Besuchern.",
      posterPath: null,
    });
    const second = await createOrGetStoredLocalTitleSeed({
      externalSource: "tmdb",
      externalId: "tmdb:movie:329865",
      sourceId: 329865,
      title: "Arrival",
      mediaType: "movie",
      releaseYear: 2016,
      synopsis: "Kontaktaufnahme mit ausserirdischen Besuchern.",
      posterPath: null,
    });

    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(second.seed.external.slug).toBe(first.seed.external.slug);
    expect(await listStoredLocalTitleSeeds()).toHaveLength(1);
  });

  it("makes a newly created title searchable, detail-ready and directly ratable", async () => {
    await createOrGetStoredLocalTitleSeed({
      externalSource: "tmdb",
      externalId: "tmdb:movie:329865",
      sourceId: 329865,
      title: "Arrival",
      mediaType: "movie",
      releaseYear: 2016,
      synopsis: "Kontaktaufnahme mit ausserirdischen Besuchern.",
      posterPath: "/arrival.jpg",
    });

    const lookup = await getLocalTitleLookupByExternalIds([
      {
        externalSource: "tmdb",
        sourceId: 329865,
      },
    ]);
    const foundInSearch = await searchCatalog({
      q: "Arrival",
      tone: "all",
      kind: "all",
      avoidPeaks: false,
      avoidDensity: false,
    });
    const beforeRating = await getTitleBySlug("arrival-2016");

    expect(lookup["tmdb:329865"]).toBe("arrival-2016");
    expect(foundInSearch.some((title) => title.external.slug === "arrival-2016")).toBe(true);
    expect(beforeRating?.aggregation.sourceType).toBe("metadata_inference");
    expect(beforeRating?.aggregation.ratingCount).toBe(1);
    expect(beforeRating?.stimulusProfile.notes).toContain("Vorläufige Startbasis aus Metadaten.");

    await appendStoredRating({
      titleId: beforeRating?.external.slug ?? "arrival-2016",
      volumeLevel: 4,
      peakIntensity: 3,
      stimulusDensity: 3,
      soothingEffect: 1,
    });

    const afterRating = await getTitleBySlug("arrival-2016");

    expect(afterRating?.aggregation.sourceType).toBe("mixed");
    expect(afterRating?.aggregation.ratingCount).toBe(2);
    expect(afterRating?.soothingEffect).toBe(2);
  });
});
