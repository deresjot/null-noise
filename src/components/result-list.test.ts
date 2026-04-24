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

    expect(html).toContain("Erste Einschätzung");
    expect(html).toContain("Noch ohne Rückmeldungen");
    expect(html).toContain("search-tone-scale-triad");
    expect(html).toContain("ruhig");
    expect(html).toContain("durchwachsen");
    expect(html).toContain("intensiv");
    expect(html).toContain('data-tone="ruhig"');
    expect(html).toContain("Einordnung lesen");
    expect(html).not.toContain("wenig harte Spitzen");
  });
});
