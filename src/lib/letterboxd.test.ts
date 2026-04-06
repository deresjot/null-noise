import { describe, expect, it, vi } from "vitest";

import { getLetterboxdFilmByTmdbId, getLetterboxdTmdbWebsiteUrl } from "./letterboxd";

describe("letterboxd integration", () => {
  it("returns a quiet fallback when no api credentials are configured", async () => {
    const result = await getLetterboxdFilmByTmdbId(169, {
      clientId: "",
      clientSecret: "",
    });

    expect(result).toEqual({
      kind: "disabled",
      source: "letterboxd",
      websiteUrl: getLetterboxdTmdbWebsiteUrl(169),
      message: "Hier hängt Letterboxd gerade nur als direkter Weiterweg dran.",
    });
  });

  it("fetches film details by tmdb id when credentials are present", async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: "token-123" }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "film-id",
            name: "Predator 2",
            rating: 3.4,
            top250Position: null,
          }),
          { status: 200 },
        ),
      );

    const result = await getLetterboxdFilmByTmdbId(169, {
      clientId: "client-id",
      clientSecret: "client-secret",
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      kind: "success",
      source: "letterboxd",
      websiteUrl: getLetterboxdTmdbWebsiteUrl(169),
      message: "Zusatzblick von Letterboxd.",
      filmName: "Predator 2",
      averageRating: 3.4,
      top250Position: null,
    });
  });
});
