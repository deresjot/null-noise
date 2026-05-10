import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { mockTitles } from "@/lib/mock-data";

import { ResultList } from "./result-list";

describe("result list quick scale", () => {
  it("renders a clearly marked metadata-based seed for imported local titles", () => {
    const importedTitle = {
      ...mockTitles[0],
      aggregation: {
        ...mockTitles[0].aggregation,
        sourceType: "metadata_inference" as const,
      },
    };
    const html = renderToStaticMarkup(
      createElement(ResultList, {
        emptyText: "",
        emptyTitle: "",
        titles: [importedTitle],
      }),
    );

    expect(html).toContain("Situative Lesart");
    expect(html).toContain("Metadaten · keine Szenenprüfung");
    expect(html).toContain("search-tone-scale-triad");
    expect(html).toContain("Eher ruhig");
    expect(html).toContain("Eher wechselhaft");
    expect(html).toContain("Eher intensiv");
    expect(html).toContain('data-tone="ruhig"');
    expect(html).toContain("Einordnung lesen");
    expect(html).not.toContain("wenig harte Spitzen");
  });
});
