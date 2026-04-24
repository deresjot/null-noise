import { describe, expect, it } from "vitest";

import type { MetadataSpikeBrowseSection } from "@/lib/metadata-spike";

import { buildFollowupFiltersFromProfile, pickNearbyFollowupItems } from "./detail-followups";

describe("detail followups", () => {
  it("maps a quieter profile to calm followup filters", () => {
    const filters = buildFollowupFiltersFromProfile(
      {
        peakIntensity: 1,
        stimulusDensity: 1,
        volumeLevel: 1,
      },
      "movie",
    );

    expect(filters.tone).toBe("calm");
    expect(filters.avoidPeaks).toBe(true);
    expect(filters.avoidDensity).toBe(true);
  });

  it("prefers louder items for intensive titles and excludes the current one", () => {
    const sections: MetadataSpikeBrowseSection[] = [
      {
        id: "quiet",
        title: "ruhig",
        description: "",
        items: [
          {
            externalSource: "tmdb",
            externalId: "tmdb:movie:1",
            sourceId: 1,
            title: "Stiller Hafen",
            mediaType: "movie",
            releaseYear: 2022,
            synopsis: null,
            posterPath: "/still.jpg",
          },
        ],
      },
      {
        id: "balanced",
        title: "durchwachsen",
        description: "",
        items: [],
      },
      {
        id: "loud",
        title: "intensiv",
        description: "",
        items: [
          {
            externalSource: "tmdb",
            externalId: "tmdb:movie:2",
            sourceId: 2,
            title: "Betonregen",
            mediaType: "movie",
            releaseYear: 2022,
            synopsis: null,
            posterPath: "/beton.jpg",
          },
          {
            externalSource: "tmdb",
            externalId: "tmdb:movie:3",
            sourceId: 3,
            title: "Sirenennacht",
            mediaType: "movie",
            releaseYear: 2024,
            synopsis: null,
            posterPath: "/sirenen.jpg",
          },
        ],
      },
    ];

    const items = pickNearbyFollowupItems(sections, "intensiv", new Set(["tmdb:movie:2"]), 4);

    expect(items.map((item) => item.externalId)).toEqual(["tmdb:movie:3"]);
  });
});
