import { describe, expect, it, vi } from "vitest";

import {
  createTmdbSearchDiagnostics,
  getTmdbPosterProxyPath,
  mapImdbSearchPayload,
  mapTmdbSearchPayload,
  searchImdbMetadata,
  searchTmdbMetadata,
} from "./metadata-spike";

describe("metadata spike mapping", () => {
  it("maps a TMDb poster path to the local poster proxy", () => {
    expect(getTmdbPosterProxyPath("/arrival.jpg")).toBe("/api/poster/tmdb/arrival.jpg");
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
        },
        {
          id: 1399,
          media_type: "tv",
          name: "Game of Thrones",
          first_air_date: "2011-04-17",
          overview: null,
          poster_path: null,
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

  it("returns an api_error state when the upstream request fails", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("fail", { status: 502 }));

    const result = await searchTmdbMetadata("dark", {
      accessToken: "token",
      fetchImpl,
    });

    expect(result.kind).toBe("error");
    expect(result.reason).toBe("api_error");
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
