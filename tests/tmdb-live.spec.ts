import { expect, test } from "@playwright/test";

const liveCheckEnabled = process.env.TMDB_LIVE_CHECK === "1";

test.describe("TMDb live fallback", () => {
  test.skip(!liveCheckEnabled, "TMDB_LIVE_CHECK=1 ist fuer den lokalen Live-Check erforderlich.");

  for (const query of ["Arrival", "Arival"]) {
    test(`verifies server-side TMDb fallback for ${query}`, async ({ request }) => {
      const localResponse = await request.get(`/api/titles?q=${encodeURIComponent(query)}`);
      const localPayload = await localResponse.json();

      const fallbackResponse = await request.get(
        `/api/spike/titles?q=${encodeURIComponent(query)}&diagnostics=1`,
      );
      const fallbackPayload = await fallbackResponse.json();

      console.log(
        JSON.stringify(
          {
            query,
            localCatalogCount: localPayload.count ?? null,
            fallbackHttpStatus: fallbackResponse.status(),
            fallbackKind: fallbackPayload.kind ?? null,
            fallbackItemCount: Array.isArray(fallbackPayload.items)
              ? fallbackPayload.items.length
              : null,
            diagnostics: fallbackPayload.diagnostics ?? null,
          },
          null,
          2,
        ),
      );

      expect(localResponse.ok(), JSON.stringify(localPayload, null, 2)).toBeTruthy();
      expect(fallbackResponse.ok(), JSON.stringify(fallbackPayload, null, 2)).toBeTruthy();
      expect(fallbackPayload.kind, JSON.stringify(fallbackPayload, null, 2)).toBe("success");
      expect(Array.isArray(fallbackPayload.items), JSON.stringify(fallbackPayload, null, 2)).toBe(
        true,
      );
      expect(fallbackPayload.items.length, JSON.stringify(fallbackPayload, null, 2)).toBeGreaterThan(
        0,
      );
      expect(fallbackPayload.diagnostics?.serverOnly).toBe(true);
      expect(fallbackPayload.diagnostics?.tokenPresent).toBe(true);
      expect(fallbackPayload.diagnostics?.authorizationScheme).toBe("Bearer");
      expect(fallbackPayload.diagnostics?.requestStarted).toBe(true);
      expect(fallbackPayload.diagnostics?.mappingSuccessful).toBe(true);
      expect(fallbackPayload.diagnostics?.finalStateKind).toBe("success");
    });
  }
});
