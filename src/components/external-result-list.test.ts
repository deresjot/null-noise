import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createTitleExternalLookupKey } from "@/lib/local-titles";

import { ExternalResultList } from "./external-result-list";

describe("external result list poster rendering", () => {
  it("renders a small poster thumbnail for the featured external result when a poster path exists", () => {
    const html = renderToStaticMarkup(
      createElement(ExternalResultList, {
        query: "Arrival",
        items: [
          {
            externalSource: "tmdb",
            externalId: "tmdb:movie:329865",
            sourceId: 329865,
            title: "Arrival",
            mediaType: "movie",
            releaseYear: 2016,
            synopsis: "Kontaktaufnahme mit außerirdischen Besuchern.",
            posterPath: "/arrival.jpg",
          },
        ],
      }),
    );

    expect(html).toContain('class="poster-thumb-frame"');
    expect(html).toContain('src="/api/poster/tmdb/arrival.jpg"');
    expect(html).toContain('alt="Poster zu Arrival"');
    expect(html).toContain("Für null-noise anlegen");
  });

  it("omits the poster frame entirely when no poster path exists", () => {
    const html = renderToStaticMarkup(
      createElement(ExternalResultList, {
        query: "Arrival",
        items: [
          {
            externalSource: "tmdb",
            externalId: "tmdb:movie:329865",
            sourceId: 329865,
            title: "Arrival",
            mediaType: "movie",
            releaseYear: 2016,
            synopsis: "Kontaktaufnahme mit außerirdischen Besuchern.",
            posterPath: null,
          },
        ],
      }),
    );

    expect(html).not.toContain('class="poster-thumb-frame"');
    expect(html).not.toContain('Poster zu Arrival');
  });

  it("links to the local detail page when the external title already exists locally", () => {
    const html = renderToStaticMarkup(
      createElement(ExternalResultList, {
        query: "Arrival",
        localTitleByExternalKey: {
          [createTitleExternalLookupKey("tmdb", 329865)]: "arrival-2016",
        },
        items: [
          {
            externalSource: "tmdb",
            externalId: "tmdb:movie:329865",
            sourceId: 329865,
            title: "Arrival",
            mediaType: "movie",
            releaseYear: 2016,
            synopsis: "Kontaktaufnahme mit außerirdischen Besuchern.",
            posterPath: null,
          },
        ],
      }),
    );

    expect(html).toContain('href="/titel/arrival-2016"');
    expect(html).toContain("Bereits lokal angelegt");
    expect(html).not.toContain("Für null-noise anlegen");
  });

  it("shows a calm read-only note instead of an import button when writes are disabled", () => {
    const html = renderToStaticMarkup(
      createElement(ExternalResultList, {
        query: "Arrival",
        writesEnabled: false,
        items: [
          {
            externalSource: "tmdb",
            externalId: "tmdb:movie:329865",
            sourceId: 329865,
            title: "Arrival",
            mediaType: "movie",
            releaseYear: 2016,
            synopsis: "Kontaktaufnahme mit außerirdischen Besuchern.",
            posterPath: null,
          },
        ],
      }),
    );

    expect(html).toContain("Auf dieser Beta bleibt die lokale Anlage noch deaktiviert.");
    expect(html).not.toContain("Für null-noise anlegen");
    expect(html).not.toContain('action="/api/local-titles"');
  });
});
