import { describe, expect, it } from "vitest";

import { GET } from "./route";

describe("TMDb poster proxy", () => {
  it("rejects original and nested poster paths before an upstream request", async () => {
    const response = await GET(new Request("http://localhost/api/poster/tmdb/original/poster.jpg"), {
      params: Promise.resolve({ path: ["original", "poster.jpg"] }),
    });

    expect(response.status).toBe(400);
    await expect(response.text()).resolves.toBe("ungueltiger_poster_pfad");
  });
});
