import { describe, expect, it } from "vitest";

import { mockTitles } from "@/lib/mock-data";

import {
  buildTitlePocketEntryFromTitle,
  createTitlePocketKey,
} from "./title-pocket";

describe("title pocket helpers", () => {
  it("uses the TMDb identity when a local title is backed by TMDb", () => {
    const title = {
      ...mockTitles[0],
      external: {
        ...mockTitles[0].external,
        externalSource: "tmdb",
        externalSourceId: "109445",
        kind: "movie" as const,
      },
    };

    expect(
      createTitlePocketKey({
        externalSource: title.external.externalSource,
        externalSourceId: title.external.externalSourceId,
        kind: title.external.kind,
        slug: title.external.slug,
      }),
    ).toBe("tmdb:movie:109445");
  });

  it("builds a compact local snapshot with title, tone and reason", () => {
    const entry = buildTitlePocketEntryFromTitle(mockTitles[0], "/titel/mondfenster");

    expect(entry.href).toBe("/titel/mondfenster");
    expect(entry.title).toBe("Mondfenster");
    expect(entry.meta).toContain("Film");
    expect(entry.toneLabel.length).toBeGreaterThan(0);
    expect(entry.reason.length).toBeGreaterThan(0);
  });
});
