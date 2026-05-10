import { describe, expect, it, vi } from "vitest";

import { createMetadataInferencePreview } from "./metadata-inference";
import {
  browseTmdbMetadata,
  createTmdbSearchDiagnostics,
  getTmdbMetadataDetail,
  getTmdbPosterProxyPath,
  getTmdbWatchProviders,
  mapImdbSearchPayload,
  mapTmdbSearchPayload,
  searchImdbMetadata,
  searchTmdbMetadata,
} from "./metadata-spike";

function getBrowseScore(item: {
  genres?: string[];
  keywords?: string[];
  synopsis: string | null;
  posterPath: string | null;
  title: string;
  mediaType: "movie" | "series";
  releaseYear: number | null;
  externalSource: "tmdb" | "imdb";
  externalId: string;
  sourceId: string | number;
}) {
  const profile = createMetadataInferencePreview(item).stimulusProfile;

  return profile.peakIntensity * 0.55 + profile.stimulusDensity * 0.3 + profile.volumeLevel * 0.15;
}

describe("metadata spike mapping", () => {
  it("maps a TMDb poster path to the local poster proxy", () => {
    expect(getTmdbPosterProxyPath("/arrival.jpg")).toBe("/api/poster/tmdb/arrival.jpg");
    expect(getTmdbPosterProxyPath("/arrival.jpg", "w780")).toBe("/api/poster/tmdb/w780/arrival.jpg");
    expect(getTmdbPosterProxyPath(null)).toBeNull();
  });

  it("maps a successful TMDB search response to the minimal internal model", () => {
    const payload = {
      results: [
        {
          id: 157336,
          media_type: "movie",
          title: "Interstellar",
          release_date: "2014-11-05",
          overview: "Ein Sci-Fi-Epos.",
          poster_path: "/poster.jpg",
          genre_ids: [878, 12],
        },
        {
          id: 1399,
          media_type: "tv",
          name: "Game of Thrones",
          first_air_date: "2011-04-17",
          overview: null,
          poster_path: null,
          genre_ids: [18, 10768],
        },
        {
          id: 99,
          media_type: "person",
          name: "Ignored Person",
        },
      ],
    };

    expect(mapTmdbSearchPayload(payload)).toEqual([
      {
        externalSource: "tmdb",
        externalId: "tmdb:movie:157336",
        sourceId: 157336,
        title: "Interstellar",
        mediaType: "movie",
        releaseYear: 2014,
        synopsis: "Ein Sci-Fi-Epos.",
        posterPath: "/poster.jpg",
        genres: ["Science Fiction", "Adventure"],
      },
      {
        externalSource: "tmdb",
        externalId: "tmdb:series:1399",
        sourceId: 1399,
        title: "Game of Thrones",
        mediaType: "series",
        releaseYear: 2011,
        synopsis: null,
        posterPath: null,
        genres: ["Drama", "War & Politics"],
      },
    ]);
  });

  it("maps a successful IMDb search response to the minimal internal model", () => {
    const payload = {
      data: {
        mainSearch: {
          edges: [
            {
              node: {
                entity: {
                  id: "tt0816692",
                  titleText: { text: "Interstellar" },
                  titleType: { text: "Movie", canHaveEpisodes: false },
                  releaseDate: { year: 2014 },
                  plots: {
                    edges: [
                      {
                        node: {
                          plotText: {
                            plainText: "Ein Vater fliegt durch Raum und Zeit.",
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            {
              node: {
                entity: {
                  id: "tt0944947",
                  titleText: { text: "Game of Thrones" },
                  titleType: { text: "TV Series", canHaveEpisodes: true },
                  releaseDate: { year: 2011 },
                  plots: { edges: [] },
                },
              },
            },
            {
              node: {
                entity: {
                  id: "tt9999999",
                  titleText: { text: "Random Episode" },
                  titleType: { text: "TV Episode", canHaveEpisodes: false },
                  releaseDate: { year: 2020 },
                },
              },
            },
          ],
        },
      },
    };

    expect(mapImdbSearchPayload(payload)).toEqual([
      {
        externalSource: "imdb",
        externalId: "imdb:movie:tt0816692",
        sourceId: "tt0816692",
        title: "Interstellar",
        mediaType: "movie",
        releaseYear: 2014,
        synopsis: "Ein Vater fliegt durch Raum und Zeit.",
        posterPath: null,
      },
      {
        externalSource: "imdb",
        externalId: "imdb:series:tt0944947",
        sourceId: "tt0944947",
        title: "Game of Thrones",
        mediaType: "series",
        releaseYear: 2011,
        synopsis: null,
        posterPath: null,
      },
    ]);
  });

  it("maps TMDb detail genres into the metadata model for later local inference", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 329865,
          title: "Arrival",
          original_title: "Arrival",
          release_date: "2016-11-10",
          overview: "Eine Linguistin versucht Kontakt mit Fremden aufzunehmen.",
          poster_path: "/arrival.jpg",
          genres: [{ name: "Science-Fiction" }, { name: "Thriller" }],
          keywords: {
            keywords: [{ name: "first contact" }, { name: "linguistics" }],
          },
        }),
        { status: 200 },
      ),
    );

    const result = await getTmdbMetadataDetail("movie", 329865, {
      accessToken: "token",
      fetchImpl,
    });

    expect(result.kind).toBe("success");

    if (result.kind !== "success") {
      return;
    }

    expect(result.item.genres).toEqual(["Science-Fiction", "Thriller"]);
    expect(result.item.keywords).toEqual(["first contact", "linguistics"]);
  });

  it("maps TMDb watch providers into grouped availability hints", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 169,
          results: {
            DE: {
              link: "https://www.themoviedb.org/movie/169/watch?locale=DE",
              flatrate: [
                {
                  provider_id: 337,
                  provider_name: "Disney Plus",
                  display_priority: 3,
                },
              ],
              rent: [
                {
                  provider_id: 10,
                  provider_name: "Amazon Video",
                  display_priority: 7,
                },
                {
                  provider_id: 2,
                  provider_name: "Apple TV Store",
                  display_priority: 4,
                },
              ],
            },
          },
        }),
        { status: 200 },
      ),
    );

    const result = await getTmdbWatchProviders("movie", 169, {
      accessToken: "token",
      fetchImpl,
    });

    expect(result.kind).toBe("success");

    if (result.kind !== "success") {
      return;
    }

    expect(result.region).toBe("DE");
    expect(result.groups).toEqual([
      {
        id: "flatrate",
        label: "Im Abo",
        providers: [
          {
            id: 337,
            name: "Disney Plus",
            offerUrl: "https://www.themoviedb.org/movie/169/watch?locale=DE",
            offerMode: "listing",
            format: null,
            price: null,
          },
        ],
      },
      {
        id: "rent",
        label: "Leihen",
        providers: [
          {
            id: 2,
            name: "Apple TV Store",
            offerUrl: "https://www.themoviedb.org/movie/169/watch?locale=DE",
            offerMode: "listing",
            format: null,
            price: null,
          },
          {
            id: 10,
            name: "Amazon Video",
            offerUrl: "https://www.themoviedb.org/movie/169/watch?locale=DE",
            offerMode: "listing",
            format: null,
            price: null,
          },
        ],
      },
    ]);
  });

  it("prefers Watchmode direct provider links when configured", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 169,
            results: {
              DE: {
                link: "https://www.themoviedb.org/movie/169/watch?locale=DE",
                flatrate: [
                  {
                    provider_id: 337,
                    provider_name: "Disney Plus",
                    display_priority: 3,
                  },
                ],
                rent: [
                  {
                    provider_id: 2,
                    provider_name: "Apple TV Store",
                    display_priority: 4,
                  },
                ],
              },
            },
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              source_id: 337,
              name: "Disney Plus",
              type: "sub",
              region: "DE",
              web_url: "https://www.disneyplus.com/browse/entity-123",
              format: "HD",
              price: null,
            },
            {
              source_id: 2,
              name: "Apple TV Store",
              type: "rent",
              region: "DE",
              web_url: "https://tv.apple.com/de/movie/umc.cmc.123",
              format: "HD",
              price: 3.99,
            },
          ]),
          { status: 200 },
        ),
      );

    const result = await getTmdbWatchProviders("movie", 169, {
      accessToken: "token",
      watchmodeApiKey: "watchmode",
      fetchImpl,
    });

    expect(result.kind).toBe("success");

    if (result.kind !== "success") {
      return;
    }

    expect(result.source).toBe("watchmode");
    expect(result.link).toBe("https://www.themoviedb.org/movie/169/watch?locale=DE");
    expect(result.groups).toEqual([
      {
        id: "flatrate",
        label: "Im Abo",
        providers: [
          {
            id: 337,
            name: "Disney Plus",
            offerUrl: "https://www.disneyplus.com/browse/entity-123",
            offerMode: "direct",
            format: "HD",
            price: null,
          },
        ],
      },
      {
        id: "rent",
        label: "Leihen",
        providers: [
          {
            id: 2,
            name: "Apple TV Store",
            offerUrl: "https://tv.apple.com/de/movie/umc.cmc.123",
            offerMode: "direct",
            format: "HD",
            price: 3.99,
          },
        ],
      },
    ]);
  });

  it("returns an empty state when no watch providers exist for the target region", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 169,
          results: {
            US: {
              link: "https://www.themoviedb.org/movie/169/watch?locale=US",
              flatrate: [
                {
                  provider_id: 8,
                  provider_name: "Netflix",
                  display_priority: 0,
                },
              ],
            },
          },
        }),
        { status: 200 },
      ),
    );

    const result = await getTmdbWatchProviders("movie", 169, {
      accessToken: "token",
      fetchImpl,
    });

    expect(result.kind).toBe("empty");

    if (result.kind !== "empty") {
      return;
    }

    expect(result.region).toBe("DE");
    expect(result.message).toContain("DE");
  });

  it("returns an api_error state when the upstream request fails", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("fail", { status: 502 }));

    const result = await searchTmdbMetadata("dark", {
      accessToken: "token",
      fetchImpl,
    });

    expect(result.kind).toBe("error");
    expect(result.reason).toBe("api_error");
  });

  it("builds two browse sections for quieter and louder external titles", async () => {
    const fetchImpl = vi.fn().mockImplementation(async () =>
      new Response(
        JSON.stringify({
          results: [
            {
              id: 1,
              title: "Quiet Harbour",
              original_title: "Quiet Harbour",
              release_date: "2022-01-01",
              overview: "A quiet and gentle walk by the sea.",
              poster_path: "/quiet.jpg",
              genre_ids: [18, 10749],
              popularity: 14,
            },
            {
              id: 2,
              title: "Calm Letters",
              original_title: "Calm Letters",
              release_date: "2020-01-01",
              overview: "An intimate and reflective portrait told quietly.",
              poster_path: "/letters.jpg",
              genre_ids: [18],
              popularity: 16,
            },
            {
              id: 3,
              title: "War Alarm",
              original_title: "War Alarm",
              release_date: "2019-01-01",
              overview: "Explosions, panic and gunfire everywhere.",
              poster_path: "/alarm.jpg",
              genre_ids: [28, 10752],
              popularity: 18,
            },
          ],
        }),
        { status: 200 },
      ),
    );

    const result = await browseTmdbMetadata(
      {
        q: "",
        tone: "all",
        kind: "movie",
        avoidPeaks: false,
        avoidDensity: false,
      },
      "alpha",
      {
        accessToken: "token",
        fetchImpl,
      },
    );

    expect(result.kind).toBe("success");

    if (result.kind !== "success") {
      return;
    }

    const quietSection = result.sections.find((section) => section.id === "quiet");
    const balancedSection = result.sections.find((section) => section.id === "balanced");
    const loudSection = result.sections.find((section) => section.id === "loud");

    expect(result.sections).toHaveLength(3);
    expect(result.sections.map((section) => section.title)).toEqual([
      "Eher ruhig",
      "Eher wechselhaft",
      "Eher intensiv",
    ]);
    expect(quietSection?.items.every((item) => item.mediaType === "movie")).toBe(true);
    expect(balancedSection?.items.every((item) => item.mediaType === "movie")).toBe(true);
    expect(loudSection?.items.every((item) => item.mediaType === "movie")).toBe(true);
    expect(quietSection?.items.some((item) => item.title === "War Alarm")).toBe(false);
    expect(balancedSection?.items.some((item) => item.title === "War Alarm")).toBe(false);
    expect(loudSection?.items.some((item) => item.title === "War Alarm")).toBe(true);
  });

  it("changes external browse picks when the mix changes", async () => {
    const fetchImpl = vi.fn().mockImplementation(async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      const page = Number(new URL(url).searchParams.get("page") ?? "1");
      const pageOffset = page * 100;
      const results = [
        {
          id: pageOffset + 11,
          title: `Amber Lake ${page}`,
          original_title: `Amber Lake ${page}`,
          release_date: "2022-01-01",
          overview: "A calm and intimate portrait.",
          poster_path: "/amber.jpg",
          genre_ids: [18],
          popularity: 13,
        },
        {
          id: pageOffset + 12,
          title: `Blue Room ${page}`,
          original_title: `Blue Room ${page}`,
          release_date: "2021-01-01",
          overview: "Quiet letters and stillness.",
          poster_path: "/blue.jpg",
          genre_ids: [18],
          popularity: 12,
        },
        {
          id: pageOffset + 13,
          title: `Cedar Walk ${page}`,
          original_title: `Cedar Walk ${page}`,
          release_date: "2020-01-01",
          overview: "Gentle travel and reflective healing.",
          poster_path: "/cedar.jpg",
          genre_ids: [18, 10749],
          popularity: 11,
        },
        {
          id: pageOffset + 21,
          title: `Heat Signal ${page}`,
          original_title: `Heat Signal ${page}`,
          release_date: "2017-01-01",
          overview: "Sirens, crashes and a loud chase through the night.",
          poster_path: "/heat-signal.jpg",
          genre_ids: [28, 80],
          popularity: 8,
        },
        {
          id: pageOffset + 22,
          title: `Night Current ${page}`,
          original_title: `Night Current ${page}`,
          release_date: "2016-01-01",
          overview: "A violent attack throws the city into chaos.",
          poster_path: "/night-current.jpg",
          genre_ids: [28, 53],
          popularity: 7,
        },
      ];

      return new Response(JSON.stringify({ results }), { status: 200 });
    });

    const alphaResult = await browseTmdbMetadata(
      {
        q: "",
        tone: "all",
        kind: "movie",
        avoidPeaks: false,
        avoidDensity: false,
      },
      "alpha",
      {
        accessToken: "token",
        fetchImpl,
      },
    );

    const betaResult = await browseTmdbMetadata(
      {
        q: "",
        tone: "all",
        kind: "movie",
        avoidPeaks: false,
        avoidDensity: false,
      },
      "beta",
      {
        accessToken: "token",
        fetchImpl,
      },
    );

    expect(alphaResult.kind).toBe("success");
    expect(betaResult.kind).toBe("success");

    if (alphaResult.kind !== "success" || betaResult.kind !== "success") {
      return;
    }

    expect(alphaResult.items.map((item) => item.externalId)).not.toEqual(
      betaResult.items.map((item) => item.externalId),
    );
  });

  it("keeps browse sections clearly separated into quieter and louder suggestions", async () => {
    const fetchImpl = vi.fn().mockImplementation(async () =>
      new Response(
        JSON.stringify({
          results: [
            {
              id: 101,
              title: "Harbour Notes",
              original_title: "Harbour Notes",
              release_date: "2022-01-01",
              overview: "A quiet documentary portrait about healing by the sea.",
              poster_path: "/harbour.jpg",
              genre_ids: [99],
              popularity: 12,
            },
            {
              id: 102,
              title: "Soft Summer",
              original_title: "Soft Summer",
              release_date: "2021-01-01",
              overview: "A gentle family story told quietly and without rush.",
              poster_path: "/summer.jpg",
              genre_ids: [10751, 18],
              popularity: 13,
            },
            {
              id: 103,
              title: "After Work",
              original_title: "After Work",
              release_date: "2020-01-01",
              overview: "Two colleagues drift through an uneasy week in the city.",
              poster_path: "/after-work.jpg",
              genre_ids: [18],
              popularity: 14,
            },
            {
              id: 104,
              title: "City Turn",
              original_title: "City Turn",
              release_date: "2019-01-01",
              overview: "A drama about pressure, routine and one bad evening.",
              poster_path: "/city-turn.jpg",
              genre_ids: [18],
              popularity: 15,
            },
            {
              id: 105,
              title: "War Alarm",
              original_title: "War Alarm",
              release_date: "2018-01-01",
              overview: "Explosions, panic and gunfire everywhere.",
              poster_path: "/war-alarm.jpg",
              genre_ids: [28, 10752],
              popularity: 16,
            },
            {
              id: 106,
              title: "Night Siege",
              original_title: "Night Siege",
              release_date: "2017-01-01",
              overview: "A violent attack throws the city into chaos.",
              poster_path: "/night-siege.jpg",
              genre_ids: [28, 53],
              popularity: 17,
            },
            {
              id: 107,
              title: "Letters Home",
              original_title: "Letters Home",
              release_date: "2016-01-01",
              overview: "A reflective drama about friendship and small routines.",
              poster_path: "/letters-home.jpg",
              genre_ids: [18],
              popularity: 11,
            },
            {
              id: 108,
              title: "Riot Train",
              original_title: "Riot Train",
              release_date: "2015-01-01",
              overview: "Sirens, chase scenes and a loud crash in the dark.",
              poster_path: "/riot-train.jpg",
              genre_ids: [28, 80],
              popularity: 18,
            },
          ],
        }),
        { status: 200 },
      ),
    );

    const result = await browseTmdbMetadata(
      {
        q: "",
        tone: "all",
        kind: "movie",
        avoidPeaks: false,
        avoidDensity: false,
      },
      "balanced",
      {
        accessToken: "token",
        fetchImpl,
      },
    );

    expect(result.kind).toBe("success");

    if (result.kind !== "success") {
      return;
    }

    const quietSection = result.sections.find((section) => section.id === "quiet");
    const loudSection = result.sections.find((section) => section.id === "loud");

    expect(quietSection?.items.length).toBeGreaterThan(0);
    expect(loudSection?.items.length).toBeGreaterThan(0);

    const quietScores = quietSection?.items.map((item) => getBrowseScore(item)) ?? [];
    const loudScores = loudSection?.items.map((item) => getBrowseScore(item)) ?? [];

    expect(quietScores).toEqual([...quietScores].sort((left, right) => left - right));
    expect(loudScores).toEqual([...loudScores].sort((left, right) => right - left));
    expect(Math.max(...quietScores)).toBeLessThan(Math.min(...loudScores));
  });

  it("returns a friendly misconfigured state when TMDB rejects the server token", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("unauthorized", { status: 401 }));
    const diagnostics = createTmdbSearchDiagnostics({ accessToken: "token" });

    const result = await searchTmdbMetadata("arrival", {
      accessToken: "token",
      fetchImpl,
      tmdbDiagnostics: diagnostics,
    });

    expect(result.kind).toBe("error");
    expect(result.reason).toBe("misconfigured");
    expect(result.message).toContain("TMDb");
    expect(diagnostics.tokenPresent).toBe(true);
    expect(diagnostics.authorizationScheme).toBe("Bearer");
    expect(diagnostics.requestStarted).toBe(true);
    expect(diagnostics.upstreamStatusCode).toBe(401);
    expect(diagnostics.finalStateKind).toBe("error");
    expect(diagnostics.finalReason).toBe("misconfigured");
  });

  it("returns an empty state when no movie or series results are found", async () => {
    const fetchImpl = vi
      .fn()
      .mockImplementation(async () => new Response(JSON.stringify({ results: [] }), { status: 200 }));

    const result = await searchTmdbMetadata("unknown", {
      accessToken: "token",
      fetchImpl,
    });

    expect(result).toMatchObject({
      kind: "empty",
      query: "unknown",
    });
  });

  it("retries TMDB search with a relaxed query when the first run misses a typo", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ results: [] }), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            results: [
              {
                id: 329865,
                media_type: "movie",
                title: "Arrival",
                release_date: "2016-11-10",
                overview: "Eine Linguistin versucht Kontakt mit Fremden aufzunehmen.",
                poster_path: "/arrival.jpg",
              },
              {
                id: 333333,
                media_type: "movie",
                title: "Aria",
                release_date: "1987-01-01",
                overview: "Ein anderer Film.",
                poster_path: null,
              },
            ],
          }),
          { status: 200 },
        ),
      );
    const diagnostics = createTmdbSearchDiagnostics({ accessToken: "token" });

    const result = await searchTmdbMetadata("Arival", {
      accessToken: "token",
      fetchImpl,
      tmdbDiagnostics: diagnostics,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(result.kind).toBe("success");

    if (result.kind !== "success") {
      return;
    }

    expect(result.items[0]?.title).toBe("Arrival");
    expect(result.message).toContain("fehlertoleranten Suche");
    expect(diagnostics.requestCount).toBe(2);
    expect(diagnostics.usedRetry).toBe(true);
    expect(diagnostics.mappingSuccessful).toBe(true);
    expect(diagnostics.finalStateKind).toBe("success");
  });

  it("uses the relaxed TMDB retry when early results are only weak matches", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            results: [
              {
                id: 278394,
                media_type: "movie",
                title: "Arival Chuttika Nakshathram",
                release_date: null,
                overview: null,
                poster_path: null,
                popularity: 0.2,
              },
              {
                id: 261725,
                media_type: "movie",
                title: "Arivaali",
                release_date: "1963-01-01",
                overview: null,
                poster_path: null,
                popularity: 0.4,
              },
            ],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            results: [
              {
                id: 329865,
                media_type: "movie",
                title: "Arrival",
                release_date: "2016-11-10",
                overview: "Eine Linguistin versucht Kontakt mit Fremden aufzunehmen.",
                poster_path: "/arrival.jpg",
                popularity: 48.5,
              },
            ],
          }),
          { status: 200 },
        ),
      );
    const diagnostics = createTmdbSearchDiagnostics({ accessToken: "token" });

    const result = await searchTmdbMetadata("Arival", {
      accessToken: "token",
      fetchImpl,
      tmdbDiagnostics: diagnostics,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(result.kind).toBe("success");

    if (result.kind !== "success") {
      return;
    }

    expect(result.items[0]?.title).toBe("Arrival");
    expect(result.message).toContain("fehlertoleranten Suche");
    expect(diagnostics.usedRetry).toBe(true);
  });

  it("returns an invalid_response state for malformed upstream payloads", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ nope: true }), { status: 200 }));

    const result = await searchTmdbMetadata("arrival", {
      accessToken: "token",
      fetchImpl,
    });

    expect(result.kind).toBe("error");
    expect(result.reason).toBe("invalid_response");
  });

  it("prefers shorter and more likely title completions in TMDB suggestions", async () => {
    const fetchImpl = vi.fn().mockImplementation(async () =>
      new Response(
        JSON.stringify({
          results: [
            {
              id: 888001,
              media_type: "movie",
              title: "Arriva Eldorado",
              release_date: "1972-01-01",
              overview: "Ein alter Seitentreffer.",
              poster_path: null,
              popularity: 1,
            },
            {
              id: 329865,
              media_type: "movie",
              title: "Arrival",
              release_date: "2016-11-10",
              overview: "Eine Linguistin versucht Kontakt mit Fremden aufzunehmen.",
              poster_path: "/arrival.jpg",
              popularity: 42,
            },
          ],
        }),
        { status: 200 },
      ),
    );

    const result = await searchTmdbMetadata("Arri", {
      accessToken: "token",
      fetchImpl,
    });

    expect(result.kind).toBe("success");

    if (result.kind !== "success") {
      return;
    }

    expect(result.items[0]?.title).toBe("Arrival");
  });

  it("returns a disabled state when the official IMDb path is not configured", async () => {
    const result = await searchImdbMetadata("dark", {
      imdbConfig: {},
    });

    expect(result.kind).toBe("disabled");
    expect(result.source).toBe("imdb");
  });
});
