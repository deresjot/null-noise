import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("homepage has no detectable axe violations", async ({ page }) => {
  await page.goto("/");

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});

test("homepage renders the claim as the main heading", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "Du musst dich nicht auch noch in der Freizeit anschreien lassen.",
    }),
  ).toBeVisible();
});

test("homepage exposes a small beta note without turning into a banner", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText(/^Beta\./).first()).toBeVisible();
});

test("search page exposes a visible results heading", async ({ page }) => {
  await page.goto("/suche?q=mond");

  await expect(page.getByRole("heading", { name: 'Treffer zu „mond“' })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Suche und Filter" })).toBeVisible();
  await expect(page.getByRole("searchbox", { name: "Titel" })).toHaveValue("mond");
  await expect(page.locator(".result-card .secondary-button-link").first()).toBeVisible();
});

test("search page tolerates typos for local catalog titles", async ({ page }) => {
  await page.goto("/suche?q=Hafn%20ohne%20Eile");

  await expect(page.getByRole("link", { name: "Hafen ohne Eile", exact: true })).toBeVisible();
});

test("detail page explains the three profile axes clearly", async ({ page }) => {
  await page.goto("/titel/mondfenster");

  await expect(page.getByRole("heading", { name: "Die Einordnung" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Grundlautstärke" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Plötzliche Spitzen" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Belastungsdichte" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Wirkung daneben" })).toBeVisible();
  await expect(page.getByText("Beruhigende Wirkung: gemischt / neutral")).toBeVisible();
});

test("detail page keeps low confidence understandable for small data", async ({ page }) => {
  await page.goto("/titel/scherbennacht");

  await expect(page.getByText("Worauf das gerade ruht")).toBeVisible();
  await expect(page.locator(".confidence-callout-eyebrow")).toHaveText("Stand heute");
  await expect(page.locator(".confidence-callout-title")).toHaveText("Erste Rückmeldungen da");
});

test("detail page exposes the fourth prepared rating question", async ({ page }) => {
  await page.goto("/titel/nachtzug-nord");

  await expect(
    page.getByText("Wie beruhigend wirkt der Titel für dich insgesamt?"),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Einschätzung senden" })).toBeVisible();
});

test("detail page keeps submit feedback calm when a cooldown is active", async ({ page }) => {
  await page.goto("/titel/mondfenster?rating=cooldown#rating-feedback");

  await expect(
    page.getByRole("heading", { name: "Hier kam gerade schon etwas rein" }),
  ).toBeVisible();
  await expect(
    page.getByText("Lass dem Titel kurz Ruhe, dann geht es wieder."),
  ).toBeVisible();
  await expect(page.locator("#rating-feedback")).toBeVisible();
});

test("detail page explains a freshly imported title as a local start basis", async ({ page }) => {
  await page.goto("/titel/mondfenster?import=created");

  await expect(page.getByRole("heading", { name: "Lokaler Stand angelegt" })).toBeVisible();
  await expect(
    page.getByText("Der Titel hat jetzt hier eine eigene Seite. Mehr kann mit der Zeit dazukommen."),
  ).toBeVisible();
});

test("search field can show TMDb-based suggestions while typing", async ({ page }) => {
  await page.route("**/api/search/suggestions?*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        kind: "success",
        message: "Vorschläge aus TMDb.",
        items: [
          {
            externalId: "tmdb:movie:329865",
            title: "Arrival",
            mediaType: "movie",
            releaseYear: 2016,
            source: "tmdb",
          },
        ],
      }),
    });
  });

  await page.goto("/");

  const input = page.getByRole("searchbox", { name: "Film oder Serie" });
  const suggestionsResponse = page.waitForResponse((response) =>
    response.url().includes("/api/search/suggestions?"),
  );
  await input.focus();
  await input.fill("Arr");
  await suggestionsResponse;

  await expect(page.locator(".search-suggestions-label")).toHaveText("Vorschläge");
  await expect(page.getByRole("button", { name: /Arrival/ })).toBeVisible();
});

test("search field explains when external suggestions are unavailable", async ({ page }) => {
  let resolveSuggestionsHit: (() => void) | null = null;
  const suggestionsHit = new Promise<void>((resolve) => {
    resolveSuggestionsHit = resolve;
  });

  await page.route("**/api/search/suggestions?*", async (route) => {
    resolveSuggestionsHit?.();
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({
        kind: "disabled",
        message: "Nicht verfügbar.",
        items: [],
      }),
    });
  });

  await page.goto("/");

  const input = page.getByRole("searchbox", { name: "Film oder Serie" });
  await input.focus();
  await input.fill("Dark");
  await suggestionsHit;

  await expect(page.getByText("Vorschläge fehlen gerade.")).toBeVisible();
});

test("search page shows one clear empty state when profile filters exclude external fallback", async ({ page }) => {
  await page.goto("/suche?q=Qwxz987&tone=intense");

  await expect(
    page.getByRole("heading", { name: "Mit diesen Filtern bleibt die Suche beim vorhandenen Stand" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Keine passenden Titel gefunden" })).toHaveCount(0);
});

test("keyboard users can reach and use the skip link", async ({ page }) => {
  await page.goto("/");

  await page.keyboard.press("Tab");

  const skipLink = page.getByRole("link", { name: "Zum Inhalt springen" });
  await expect(skipLink).toBeVisible();
  await expect(skipLink).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
});

test("explanation page uses native disclosure for deeper help", async ({ page }) => {
  await page.goto("/erklaerung");

  const disclosure = page
    .locator("summary")
    .filter({ hasText: "Warum keine versteckten Tooltips?" });

  await disclosure.focus();
  await page.keyboard.press("Enter");

  await expect(
    page.getByText("Zusatzhilfe soll hier nicht flüchtig oder nur per Hover auftauchen."),
  ).toBeVisible();
});

test("metadata spike path stays clearly separated from the main product flow", async ({ page }) => {
  await page.goto("/spike/metadaten");

  await expect(page.getByRole("heading", { name: "Externe Metadaten getrennt testen" })).toBeVisible();
  await expect(page.getByText("TMDb liefert hier nur Katalog-Metadaten.")).toBeVisible();
});

test("footer exposes the current build version and changelog", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("footer .build-line")).toContainText("Version");

  const changelog = page
    .locator("summary")
    .filter({ hasText: "Was zuletzt geändert wurde" });

  await changelog.click();
  await expect(page.locator(".release-notes h3").first()).toContainText("Version");
});

test("footer links to the minimal legal pages", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: "Datenschutz" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Impressum" })).toBeVisible();
});

test("legal pages are reachable and keep TMDb attribution separate from the profile logic", async ({
  page,
}) => {
  await page.goto("/impressum");
  await expect(page.getByRole("heading", { name: "Impressum" })).toBeVisible();
  await expect(page.getByText("serverseitig aus TMDb")).toBeVisible();

  await page.goto("/datenschutz");
  await expect(page.locator("main h1")).toHaveText("Datenschutz");
  await expect(page.getByText("keine Tracker")).toBeVisible();
});
