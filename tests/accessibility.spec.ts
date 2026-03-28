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
    page.getByRole("heading", { name: "Lass dich in deiner Freizeit nicht anschreien." }),
  ).toBeVisible();
});

test("homepage exposes a small beta note without turning into a banner", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator(".hero-copy .field-note").filter({ hasText: /^Beta\./ })).toBeVisible();
});

test("search page exposes a visible results heading", async ({ page }) => {
  await page.goto("/suche?q=mond");

  await expect(page.getByRole("heading", { name: "Ergebnisse" })).toBeVisible();
});

test("search page tolerates typos for local catalog titles", async ({ page }) => {
  await page.goto("/suche?q=Hafn%20ohne%20Eile");

  await expect(page.getByRole("link", { name: "Hafen ohne Eile" })).toBeVisible();
});

test("detail page explains the three profile axes clearly", async ({ page }) => {
  await page.goto("/titel/mondfenster");

  await expect(page.getByRole("heading", { name: "Grundlautstärke" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Plötzliche Spitzen" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Belastungsdichte" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Zusätzliche subjektive Wirkung" })).toBeVisible();
  await expect(page.getByText("Beruhigende Wirkung: gemischt / neutral")).toBeVisible();
});

test("detail page keeps low confidence understandable for small data", async ({ page }) => {
  await page.goto("/titel/scherbennacht");

  await expect(page.getByText("Confidence: niedrig (1 Einschätzung)")).toBeVisible();
});

test("detail page exposes the fourth prepared rating question", async ({ page }) => {
  await page.goto("/titel/nachtzug-nord");

  await expect(
    page.getByText("Wie beruhigend wirkt der Titel für dich insgesamt?"),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Einschätzung speichern" })).toBeVisible();
});

test("detail page keeps submit feedback calm when a cooldown is active", async ({ page }) => {
  await page.goto("/titel/mondfenster?rating=cooldown");

  await expect(
    page.getByRole("heading", { name: "Für diesen Titel liegt gerade schon eine frische Einschätzung vor" }),
  ).toBeVisible();
  await expect(
    page.getByText("Für diesen Titel wurde gerade bereits eine Einschätzung abgegeben. Bitte versuche es später noch einmal."),
  ).toBeVisible();
});

test("detail page explains a freshly imported title as a local start basis", async ({ page }) => {
  await page.goto("/titel/mondfenster?import=created");

  await expect(page.getByRole("heading", { name: "Titel lokal angelegt" })).toBeVisible();
  await expect(
    page.getByText("Dieser Titel hat jetzt in null-noise eine vorläufige Startbasis und kann direkt eingeschätzt werden."),
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

  const input = page.getByRole("searchbox", { name: "Film oder Serie suchen" });
  await input.focus();
  await input.fill("Arr");

  await expect(page.locator(".search-suggestions-label")).toHaveText("TMDb-Vorschläge");
  await expect(page.getByRole("button", { name: /Arrival/ })).toBeVisible();
});

test("search field explains when external suggestions are unavailable", async ({ page }) => {
  await page.route("**/api/search/suggestions?*", async (route) => {
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

  const input = page.getByRole("searchbox", { name: "Film oder Serie suchen" });
  await input.focus();
  await input.fill("Dark");

  await expect(page.getByText("Externe Vorschläge sind gerade nicht verfügbar.")).toBeVisible();
});

test("search page shows one clear empty state when profile filters exclude external fallback", async ({ page }) => {
  await page.goto("/suche?q=Zimmer&tone=intense");

  await expect(
    page.getByRole("heading", { name: "Mit diesen Filtern bleibt die Suche im Katalog" }),
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
    page.getByText("Zusatzhilfe soll in null-noise nicht flüchtig oder nur per Hover erscheinen."),
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
    .filter({ hasText: "Changelog zu Version" });

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
