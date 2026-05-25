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
            genres: ["Science Fiction"],
          },
        ],
      }),
    );

    expect(html).toContain("Erste Einschätzung");
    expect(html).toContain("Erst kurz prüfen");
    expect(html).toContain("result-card-reading-block");
    expect(html).toContain("search-tone-scale-triad");
    expect(html).toContain("Eher ruhig");
    expect(html).toContain("Eher wechselhaft");
    expect(html).toContain("Eher intensiv");
    expect(html).toContain("poster-thumb-frame");
    expect(html).toContain("Film · Science Fiction · 2016");
    expect(html).toContain("Details");
    expect(html).not.toContain("Lokal anlegen");
    expect(html).toContain('aria-label="Erste Einschätzung: Eher wechselhaft"');
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
    expect(html).toContain("Kein Poster verfügbar");
  });

  it("uses situational not-now language for dense external cards", () => {
    const html = renderToStaticMarkup(
      createElement(ExternalResultList, {
        query: "",
        items: [
          {
            externalSource: "tmdb",
            externalId: "tmdb:movie:991001",
            sourceId: 991001,
            title: "Alarm Run",
            mediaType: "movie",
            releaseYear: 2024,
            synopsis: "Eine Verfolgung mit Alarm, Explosionen und Panik.",
            posterPath: "/alarm.jpg",
            genres: ["Action"],
            keywords: ["alarm", "explosion", "chase", "panic"],
          },
        ],
      }),
    );

    expect(html).toContain("Kann gerade zu dicht sein");
    expect(html).toContain("Film · Action · 2024");
    expect(html).not.toMatch(/Empfohlen für dich|Heute passend|Ranking|Score/);
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
    expect(html).toContain("Erste Einschätzung");
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

    expect(html).toContain("Nur Titeldaten. Lokale Einordnung ist hier deaktiviert.");
    expect(html).toContain("Erst kurz prüfen");
    expect(html).toContain("Details");
    expect(html).not.toContain("Lokal anlegen");
    expect(html).not.toContain('action="/api/local-titles"');
  });
});
