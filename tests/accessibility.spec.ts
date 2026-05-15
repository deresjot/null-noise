import AxeBuilder from "@axe-core/playwright";
import { type Page, expect, test } from "@playwright/test";

type AxeImpact = "critical" | "serious" | "moderate" | "minor";

const emptyImpactCounts: Record<AxeImpact, number> = {
  critical: 0,
  serious: 0,
  moderate: 0,
  minor: 0,
};

function summarizeViolations(
  violations: Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"],
) {
  const impactCounts = { ...emptyImpactCounts };

  for (const violation of violations) {
    const impact = violation.impact;

    if (impact && impact in impactCounts) {
      impactCounts[impact as AxeImpact] += 1;
    }
  }

  return impactCounts;
}

function formatViolationReport(
  routeLabel: string,
  violations: Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"],
) {
  const impactCounts = summarizeViolations(violations);
  const details = violations
    .map((violation) => {
      const nodeTargets = violation.nodes
        .map((node) => node.target.join(" "))
        .filter(Boolean)
        .slice(0, 3)
        .join(" | ");

      return `- ${violation.id} [${violation.impact ?? "unknown"}] ${nodeTargets}`;
    })
    .join("\n");

  return [
    `Axe-Fundstellen auf ${routeLabel}:`,
    `critical=${impactCounts.critical}, serious=${impactCounts.serious}, moderate=${impactCounts.moderate}, minor=${impactCounts.minor}`,
    details,
  ]
    .filter(Boolean)
    .join("\n");
}

async function expectNoAxeViolations(
  page: Page,
  path: string,
  routeLabel: string,
  readyCheck?: () => Promise<void>,
) {
  await page.goto(path);
  await readyCheck?.();

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  const impactCounts = summarizeViolations(accessibilityScanResults.violations);

  await test.info().attach(`axe-${routeLabel}.json`, {
    body: JSON.stringify(
      {
        path,
        impactCounts,
        violations: accessibilityScanResults.violations.map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          nodes: violation.nodes.map((node) => node.target),
        })),
      },
      null,
      2,
    ),
    contentType: "application/json",
  });

  expect(
    accessibilityScanResults.violations,
    formatViolationReport(routeLabel, accessibilityScanResults.violations),
  ).toEqual([]);
}

test("homepage has no detectable axe violations", async ({ page }) => {
  await expectNoAxeViolations(page, "/", "home", async () => {
    await expect(
      page.getByRole("heading", {
        name: "Du musst dich nicht auch noch in der Freizeit anschreien lassen.",
      }),
    ).toBeVisible();
  });
});

test("search page browse state has no detectable axe violations", async ({ page }) => {
  await expectNoAxeViolations(page, "/suche", "search-browse", async () => {
    await expect(page.getByRole("heading", { name: "Noch kein Titel im Kopf?" })).toBeVisible();
  });
});

test("search page query state has no detectable axe violations", async ({ page }) => {
  await expectNoAxeViolations(page, "/suche?q=Arrival", "search-arrival", async () => {
    await expect(page.getByRole("heading", { name: 'Treffer zu „Arrival“' })).toBeVisible();
  });
});

test("detail page has no detectable axe violations", async ({ page }) => {
  await expectNoAxeViolations(page, "/titel/mondfenster", "detail-mondfenster", async () => {
    await expect(page.getByRole("heading", { name: "Mondfenster" })).toBeVisible();
  });
});

test("info and legal pages have no detectable axe violations", async ({ page }) => {
  const routes = [
    {
      path: "/erklaerung",
      label: "explanation",
      heading: "null-noise verstehen und benutzen",
    },
    {
      path: "/bedienung",
      label: "bedienung-redirect",
      heading: "null-noise verstehen und benutzen",
    },
    {
      path: "/barrierefreiheit",
      label: "accessibility-statement",
      heading: "Erklärung zur Barrierefreiheit",
    },
    {
      path: "/datenschutz",
      label: "privacy",
      heading: "Datenschutz",
    },
    {
      path: "/impressum",
      label: "imprint",
      heading: "Impressum",
    },
  ];

  for (const route of routes) {
    await expectNoAxeViolations(page, route.path, route.label, async () => {
      await expect(page.getByRole("heading", { name: route.heading })).toBeVisible();
    });
  }
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

test("mobile homepage explains the first visit context without a modal", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/");

  const onboarding = page.locator(".home-onboarding");

  await expect(page.getByRole("heading", { name: "Kurz gesagt" })).toBeVisible();
  await expect(onboarding.getByText("Filme oder Serien suchen.")).toBeVisible();
  await expect(onboarding.getByText("Eher ruhig")).toBeVisible();
  await expect(onboarding.getByText("Eher wechselhaft")).toBeVisible();
  await expect(onboarding.getByText("Eher intensiv")).toBeVisible();
  await expect(onboarding.getByText("Keine Qualitätswertung, keine objektive Messung.")).toBeVisible();
  await expect(
    onboarding.getByRole("link", { name: "Wie funktioniert null-noise?" }),
  ).toHaveAttribute("href", "/erklaerung");
  await expect(page.getByRole("dialog")).toHaveCount(0);
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

test("mobile detail page keeps the decision callout visible at 320 CSS pixels", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/titel/mondfenster");

  await expect(page.getByRole("heading", { name: "Mondfenster" })).toBeVisible();
  const readingBlock = page.getByLabel("Erste Einschätzung", { exact: true });
  await expect(readingBlock.getByText("Erste Einschätzung", { exact: true })).toBeVisible();
  await expect(page.getByText("Passt das gerade?")).toBeVisible();
  const callout = page.locator(".detail-callout-panel");
  await expect(callout).toBeVisible();
  await expect(callout.getByRole("heading", { name: "Worauf das gerade ruht" })).toBeVisible();
  await expect(callout.getByText("Rückmeldungen", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Wie funktioniert die erste Einschätzung?" }),
  ).toHaveAttribute("href", "/erklaerung");
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

test("search suggestions stay keyboard-reachable without combobox-only behavior", async ({
  page,
}) => {
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
  await input.focus();
  await input.fill("Arr");
  await expect(page.getByRole("button", { name: /Arrival/ })).toBeVisible();

  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: /Arrival/ })).toBeFocused();
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

test("search page keeps one clear empty state when strict filters still return no match", async ({ page }) => {
  await page.goto("/suche?q=Qwxz987&tone=intense");

  await expect(page.getByRole("heading", { name: "Gerade nichts Passendes" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Keine passenden Titel gefunden" })).toHaveCount(0);
});

test("keyboard users can reach and use the skip link", async ({ page }) => {
  await page.goto("/");

  await page.keyboard.press("Tab");

  const topMenuLink = page.getByRole("link", { name: "Zum Top-Menü springen" });
  const contentLink = page.getByRole("link", { name: "Zum Inhalt springen" });
  const footerLink = page.getByRole("link", { name: "Zum Footer springen" });

  await expect(topMenuLink).toBeVisible();
  await expect(topMenuLink).toBeFocused();
  await expect(contentLink).toBeVisible();
  await expect(footerLink).toBeVisible();

  await page.keyboard.press("Tab");
  await expect(contentLink).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);

  await page.goto("/");

  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(footerLink).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#site-footer$/);
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

test("bedienung route redirects to the consolidated explanation page", async ({ page }) => {
  await page.goto("/bedienung");

  await expect(page).toHaveURL(/\/erklaerung$/);
  await expect(page.locator("main h1")).toHaveText("null-noise verstehen und benutzen");
});

test("metadata spike path stays clearly separated from the main product flow", async ({ page }) => {
  await page.goto("/spike/metadaten");

  await expect(page.getByRole("heading", { name: "Externe Metadaten getrennt testen" })).toBeVisible();
  await expect(page.getByText("TMDb liefert hier nur Katalog-Metadaten.")).toBeVisible();
});

test("footer exposes the current build version and changelog", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("footer .build-line")).toContainText("Build");

  const changelog = page
    .locator("summary")
    .filter({ hasText: "Release Notes / Changelog" });

  await changelog.click();
  await expect(page.locator(".release-notes h3").first()).toContainText("v");
});

test("footer links to the minimal legal pages", async ({ page }) => {
  await page.goto("/");

  const footer = page.locator("footer");

  await expect(footer.getByRole("link", { name: "Start" }).first()).toBeVisible();
  await expect(footer.getByRole("link", { name: "Suche" }).first()).toBeVisible();
  await expect(footer.getByRole("link", { name: "Erklärung und Hilfe" }).first()).toBeVisible();
  await expect(footer.getByRole("link", { name: "Barrierefreiheit" }).first()).toBeVisible();
  await expect(footer.getByRole("link", { name: "Datenschutz" }).first()).toBeVisible();
  await expect(footer.getByRole("link", { name: "Impressum" }).first()).toBeVisible();
});

test("mobile navigation separates primary header links from footer metadata links", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/");

  const headerNav = page.getByRole("navigation", { name: "Hauptnavigation" });
  const footerNav = page.getByRole("navigation", { name: "Info und Rechtliches" });

  await expect(headerNav.getByRole("link", { name: "Start" })).toHaveAttribute("href", "/");
  await expect(headerNav.getByRole("link", { name: "Suche" })).toHaveAttribute("href", "/suche");
  await expect(headerNav.getByRole("link", { name: "Erklärung / Hilfe" })).toHaveAttribute("href", "/erklaerung");
  await expect(headerNav.getByRole("link", { name: "Barrierefreiheit" })).toHaveCount(0);
  await expect(headerNav.getByRole("link", { name: "Datenschutz" })).toHaveCount(0);
  await expect(headerNav.getByRole("link", { name: "Impressum" })).toHaveCount(0);

  await expect(footerNav.locator('a[href="/"]')).toHaveText("Start");
  await expect(footerNav.locator('a[href="/suche"]')).toHaveText("Suche");
  await expect(footerNav.locator('a[href="/erklaerung"]')).toHaveText("Erklärung und Hilfe");
  await expect(footerNav.locator('a[href="/barrierefreiheit"]')).toHaveText("Barrierefreiheit");
  await expect(footerNav.locator('a[href="/datenschutz"]')).toHaveText("Datenschutz");
  await expect(footerNav.locator('a[href="/impressum"]')).toHaveText("Impressum");
});

test("accessibility page is reachable and explains the current testing scope", async ({ page }) => {
  await page.goto("/barrierefreiheit");
  const pageHeader = page.locator(".section-header");
  const scopePanel = page
    .locator("section.panel")
    .filter({ has: page.getByRole("heading", { name: "Prüfgrundlage und Prüfumfang" }) });
  const statusPanel = page
    .locator("section.panel")
    .filter({
      has: page.getByRole("heading", { name: "Stand der Vereinbarkeit mit den Anforderungen" }),
    });
  const manualPanel = page
    .locator("section.panel")
    .filter({ has: page.getByRole("heading", { name: "Manuelle Prüfungen" }) });
  const contactPanel = page
    .locator("section.panel")
    .filter({ has: page.getByRole("heading", { name: "Kontakt und Feedback" }) });

  await expect(page.locator("main h1")).toHaveText("Erklärung zur Barrierefreiheit");
  await expect(page.getByRole("heading", { name: "Automatisierte Prüfungen" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Manuelle Prüfungen" })).toBeVisible();
  await expect(scopePanel).toContainText("Kernrouten");
  await expect(scopePanel.locator(".field-note")).toContainText("Externe");
  await expect(statusPanel).toContainText("BITV-Testverfahrens");
  await expect(manualPanel).toContainText("BIK BITV- / WCAG-Tests für Webangebote");
  await expect(manualPanel).toContainText("Beschreibung des Prüfverfahrens für Web");
  await expect(manualPanel).toContainText("Prüfschritt-Verzeichnis zum WCAG 2.2 Test für Web");
  await expect(
    manualPanel.getByRole("link", { name: "BIK BITV- / WCAG-Tests für Webangebote" }),
  ).toHaveAttribute("href", "https://bitvtest.de/tests-und-beratung/bik-bitv-test-web");
  await expect(
    manualPanel.getByRole("link", { name: "Beschreibung des Prüfverfahrens für Web" }),
  ).toHaveAttribute(
    "href",
    "https://bitvtest.de/test-methodik/web/beschreibung-des-pruefverfahrens",
  );
  await expect(
    manualPanel.getByRole("link", { name: "Prüfschritt-Verzeichnis zum WCAG 2.2 Test für Web" }),
  ).toHaveAttribute("href", "https://bitvtest.de/pruefverfahren/wcag-22-web");
  await expect(contactPanel).toContainText("mail@sebastianjansen.com");
  await expect(pageHeader).toContainText("keine amtliche oder vollständige Konformitätsbehauptung");
});

test("core routes avoid horizontal overflow at 320 CSS pixels", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });

  const routes = [
    {
      path: "/",
      ready: () =>
        page.getByRole("heading", {
          name: "Du musst dich nicht auch noch in der Freizeit anschreien lassen.",
        }),
    },
    {
      path: "/suche",
      ready: () => page.getByRole("heading", { name: "Noch kein Titel im Kopf?" }),
    },
    {
      path: "/suche?q=Arrival",
      ready: () => page.getByRole("heading", { name: 'Treffer zu „Arrival“' }),
    },
    {
      path: "/titel/mondfenster",
      ready: () => page.getByRole("heading", { name: "Mondfenster" }),
    },
    {
      path: "/erklaerung",
      ready: () => page.getByRole("heading", { name: "null-noise verstehen und benutzen" }),
    },
    {
      path: "/bedienung",
      ready: () => page.getByRole("heading", { name: "null-noise verstehen und benutzen" }),
    },
    {
      path: "/barrierefreiheit",
      ready: () => page.getByRole("heading", { name: "Erklärung zur Barrierefreiheit" }),
    },
    {
      path: "/datenschutz",
      ready: () => page.getByRole("heading", { name: "Datenschutz" }),
    },
    {
      path: "/impressum",
      ready: () => page.getByRole("heading", { name: "Impressum" }),
    },
  ];

  for (const route of routes) {
    await page.goto(route.path);
    await expect(route.ready()).toBeVisible();

    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth - document.documentElement.clientWidth;
    });

    expect(overflow, `${route.path} overflows at 320 CSS pixels`).toBeLessThanOrEqual(1);
  }
});

test("legal pages are reachable and keep TMDb attribution separate from the profile logic", async ({
  page,
}) => {
  await page.goto("/impressum");
  await expect(page.getByRole("heading", { name: "Impressum" })).toBeVisible();
  await expect(page.getByText("serverseitig aus TMDb")).toBeVisible();

  await page.goto("/datenschutz");
  await expect(page.locator("main h1")).toHaveText("Datenschutz");
  await expect(page.getByText("Es gibt kein Tracking und keine Analytics.")).toBeVisible();
});
