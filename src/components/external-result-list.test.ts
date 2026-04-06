import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createTitleExternalLookupKey } from "@/lib/local-titles";

import { ExternalResultList } from "./external-result-list";

describe("external result list poster rendering", () => {
  it("renders external results as poster tiles with a metadata-based tendency", () => {
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

    expect(html).toContain("Bisher nur grob gelesen");
    expect(html).toContain("zwischen leise und laut");
    expect(html).toContain("result-card-reading-block");
    expect(html).toContain("Eigene Rückmeldungen fehlen noch.");
    expect(html).toContain("zwischen ruhigeren und dichteren Momenten");
    expect(html).toContain("poster-thumb-frame");
    expect(html).toContain("Details");
    expect(html).toContain("Lokales Anlegen liegt erst auf der Detailseite.");
    expect(html).not.toContain("Lokal anlegen");
  });

  it("renders a fallback poster tile when no poster is available", () => {
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

    expect(html).toContain("Arrival");
    expect(html).toContain("poster-thumb-fallback");
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
    expect(html).toContain("Schon lokal");
    expect(html).toContain("Einordnung lesen");
    expect(html).not.toContain("Lokal anlegen");
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

    expect(html).toContain("Diese Instanz bleibt gerade lesend.");
    expect(html).toContain("Bisher nur grob gelesen");
    expect(html).toContain("Details");
    expect(html).not.toContain("Lokal anlegen");
    expect(html).not.toContain('action="/api/local-titles"');
  });
});
