import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  createOrGetStoredLocalTitleSeed,
  listStoredLocalTitleSeeds,
} from "./local-titles";
import { getTitleBySlug, getLocalTitleLookupByExternalIds, searchCatalog } from "./queries";
import { appendStoredRating } from "./ratings";

const tempDirectories: string[] = [];

async function withTempLocalTitleFiles(): Promise<void> {
  const tempDirectory = await mkdtemp(path.join(os.tmpdir(), "null-noise-local-titles-"));
  tempDirectories.push(tempDirectory);
  process.env.NULL_NOISE_LOCAL_TITLES_FILE = path.join(tempDirectory, "titles.json");
  process.env.NULL_NOISE_TITLE_IMPORT_ATTEMPTS_FILE = path.join(tempDirectory, "title-imports.json");
  process.env.NULL_NOISE_RATINGS_FILE = path.join(tempDirectory, "ratings.json");
}

afterEach(async () => {
  delete process.env.NULL_NOISE_LOCAL_TITLES_FILE;
  delete process.env.NULL_NOISE_TITLE_IMPORT_ATTEMPTS_FILE;
  delete process.env.NULL_NOISE_RATINGS_FILE;

  while (tempDirectories.length) {
    const tempDirectory = tempDirectories.pop();

    if (tempDirectory) {
      await rm(tempDirectory, { recursive: true, force: true });
    }
  }
});

describe("local titles from external TMDb metadata", () => {
  it("creates a local provisional title seed from TMDb metadata", async () => {
    await withTempLocalTitleFiles();

    const result = await createOrGetStoredLocalTitleSeed({
      externalSource: "tmdb",
      externalId: "tmdb:movie:329865",
      sourceId: 329865,
      title: "Arrival",
      originalTitle: "Arrival",
      mediaType: "movie",
      releaseYear: 2016,
      synopsis: "Kontaktaufnahme mit außerirdischen Besuchern.",
      posterPath: "/arrival.jpg",
    });

    expect(result.created).toBe(true);
    expect(result.seed.external.slug).toBe("arrival-2016");
    expect(result.seed.external.posterPath).toBe("/arrival.jpg");
    expect(result.seed.aggregation.sourceType).toBe("provisional_seed");
    expect(result.seed.ratingSamples.volumeLevel).toEqual([2]);
    expect(result.seed.ratingSamples.soothingEffect).toEqual([2]);
  });

  it("prevents duplicate local imports for the same TMDb title", async () => {
    await withTempLocalTitleFiles();

    const first = await createOrGetStoredLocalTitleSeed({
      externalSource: "tmdb",
      externalId: "tmdb:movie:329865",
      sourceId: 329865,
      title: "Arrival",
      mediaType: "movie",
      releaseYear: 2016,
      synopsis: "Kontaktaufnahme mit außerirdischen Besuchern.",
      posterPath: null,
    });
    const second = await createOrGetStoredLocalTitleSeed({
      externalSource: "tmdb",
      externalId: "tmdb:movie:329865",
      sourceId: 329865,
      title: "Arrival",
      mediaType: "movie",
      releaseYear: 2016,
      synopsis: "Kontaktaufnahme mit außerirdischen Besuchern.",
      posterPath: null,
    });

    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(second.seed.external.slug).toBe(first.seed.external.slug);
    expect(await listStoredLocalTitleSeeds()).toHaveLength(1);
  });

  it("makes a newly created title searchable, detail-ready and directly ratable", async () => {
    await withTempLocalTitleFiles();

    await createOrGetStoredLocalTitleSeed({
      externalSource: "tmdb",
      externalId: "tmdb:movie:329865",
      sourceId: 329865,
      title: "Arrival",
      mediaType: "movie",
      releaseYear: 2016,
      synopsis: "Kontaktaufnahme mit außerirdischen Besuchern.",
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
    expect(beforeRating?.aggregation.sourceType).toBe("provisional_seed");
    expect(beforeRating?.aggregation.ratingCount).toBe(1);

    await appendStoredRating({
      titleId: "arrival-2016",
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
