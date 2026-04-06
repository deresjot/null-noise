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

    expect(html).toContain("Bisher nur grob gelesen");
    expect(html).toContain("Eigene Rückmeldungen fehlen noch.");
    expect(html).toContain("eher leise");
    expect(html).toContain("wenig harte Spitzen");
    expect(html).toContain('data-tone="ruhig"');
    expect(html).toContain("Einordnung lesen");
  });
});
