import AxeBuilder from "@axe-core/playwright";
import { type Page, expect, test } from "@playwright/test";

type AxeImpact = "critical" | "serious" | "moderate" | "minor";

const mobileLayoutSelectors = [
  "main",
  ".site-main",
  ".section-stack",
  ".panel",
  ".status-panel",
  ".contact-form",
  ".contact-field",
  ".contact-form-summary",
  ".contact-form-success",
  ".wcag-level-axis",
  ".wcag-level-axis-list",
  ".wcag-level-axis-list li",
  ".wcag-status-legend",
  ".wcag-status-badge",
  ".result-card",
  ".result-card-title-zone",
  ".result-card-reading-block",
  ".result-card-footer-zone",
  ".result-card-cta-zone",
  ".result-card-memory-zone",
  ".title-pocket-actions-row",
  ".mobile-experiment-footer",
  ".mobile-experiment-footer-body",
  ".mobile-experiment-build-line",
  ".mobile-experiment-footer-links",
  ".mobile-experiment-footer-legal-links",
];

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

test.describe("preview gate", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("shows the teaser landing page and unlocks with preview", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Was passt heute in deinen Kopf?" })).toBeVisible();
    await expect(page.getByText("null-noise hilft dir, Filme und Serien")).toBeVisible();
    await expect(page.getByLabel("Passwort zur Vorschau")).not.toBeFocused();
    await expect(page.locator(".site-header")).toHaveCount(0);

    await page.getByLabel("Passwort zur Vorschau").fill("nope");
    await page.getByRole("button", { name: "Vorschau öffnen" }).click();
    await expect(page.locator(".preview-gate-error")).toHaveText("Das Passwort passt gerade nicht.");

    await page.getByLabel("Passwort zur Vorschau").fill("preview");
    await page.getByRole("button", { name: "Vorschau öffnen" }).click();

    await expect(page.locator(".site-header")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: "Drei Richtungen. Schau, was neugierig macht." })).toBeVisible();
  });

  test("keeps the intro controllable and static with reduced motion", async ({ page }) => {
    await page.goto("/");

    const motionButton = page.getByRole("button", { name: "Animation pausieren" });
    await expect(motionButton).toBeVisible();
    await motionButton.click();
    await expect(page.locator(".preview-gate")).toHaveAttribute("data-motion", "paused");
    await expect(page.getByRole("button", { name: "Animation fortsetzen" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    await expect(page.getByRole("button", { name: "Animation pausieren" })).toBeHidden();
    await expect(page.locator(".preview-signal-orbit").first()).toHaveCSS("animation-name", "none");
    await expect(page.getByLabel("Passwort zur Vorschau")).toBeVisible();
  });
});

async function expectNoAxeViolations(
  page: Page,
  path: string,
  routeLabel: string,
  readyCheck?: () => Promise<void>,
) {
  await page.goto(path);
  await readyCheck?.();
  await expect(page).toHaveTitle(/\S/);

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

async function expectMobileLayoutWithinViewport(page: Page, path: string, width: number) {
  const failures = await page.evaluate((selectors) => {
    const viewport = window.innerWidth;
    const documentWidth = document.documentElement.scrollWidth;
    const localFailures: string[] = [];

    if (documentWidth > viewport + 1) {
      localFailures.push(`document width ${documentWidth}px exceeds viewport ${viewport}px`);
    }

    for (const selector of selectors) {
      for (const element of Array.from(document.querySelectorAll(selector))) {
        const rect = element.getBoundingClientRect();

        if (rect.width === 0 || rect.height === 0) {
          continue;
        }

        const right = rect.x + rect.width;
        if (rect.x < -1 || right > viewport + 1) {
          const text = (element.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
          localFailures.push(
            `${selector} ${Math.round(rect.x)}..${Math.round(right)} outside ${viewport}px "${text}"`,
          );
        }
      }
    }

    return localFailures;
  }, mobileLayoutSelectors);

  expect(failures, `${path} has mobile layout overflow at ${width} CSS pixels`).toEqual([]);
}

async function expectElementBelowHeader(page: Page, selector: string, label: string) {
  await expect
    .poll(
      () =>
        page.evaluate((targetSelector) => {
          const header = document.querySelector(".site-header")?.getBoundingClientRect();
          const target = document.querySelector(targetSelector)?.getBoundingClientRect();

          return (target?.top ?? Number.NEGATIVE_INFINITY) >= (header?.bottom ?? 0) - 1;
        }, selector),
      { message: `${label} is not covered by the sticky header` },
    )
    .toBe(true);

  const metrics = await page.evaluate((targetSelector) => {
    const header = document.querySelector(".site-header")?.getBoundingClientRect();
    const target = document.querySelector(targetSelector)?.getBoundingClientRect();

    return {
      headerBottom: header?.bottom ?? 0,
      targetTop: target?.top ?? 0,
    };
  }, selector);

  expect(metrics.targetTop, `${label} is not covered by the sticky header`).toBeGreaterThanOrEqual(
    metrics.headerBottom - 1,
  );
}

test("homepage has no detectable axe violations", async ({ page }) => {
  await expectNoAxeViolations(page, "/", "home", async () => {
    await expect(
      page.getByRole("heading", {
        name: "Drei Richtungen. Schau, was neugierig macht.",
      }),
    ).toBeVisible();
  });
});

test("search page browse state has no detectable axe violations", async ({ page }) => {
  await expectNoAxeViolations(page, "/suche", "search-browse", async () => {
    await expect(page.getByRole("heading", { name: "Noch kein Titel im Kopf?" })).toBeVisible();
  });
});

test("offline page has no detectable axe violations", async ({ page }) => {
  await expectNoAxeViolations(page, "/offline", "offline", async () => {
    await expect(page.getByRole("heading", { name: "Gerade keine Verbindung." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Suche braucht Verbindung" })).toBeVisible();
  });
});

test("web app manifest exposes installable basics", async ({ request }) => {
  const response = await request.get("/manifest.webmanifest");
  expect(response.ok()).toBeTruthy();

  const manifest = await response.json();

  expect(manifest).toMatchObject({
    name: "null-noise",
    short_name: "null-noise",
    lang: "de",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fff6e5",
    theme_color: "#fff6e5",
  });
  expect(manifest.icons).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ sizes: "192x192", purpose: "any" }),
      expect.objectContaining({ sizes: "512x512", purpose: "any" }),
      expect.objectContaining({ sizes: "512x512", purpose: "maskable" }),
    ]),
  );
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
      heading: "Barrierefreiheit",
    },
    {
      path: "/kontakt",
      label: "contact",
      heading: "Kontakt",
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

test("homepage leads with discovery and keeps the product claim visible", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Drei Richtungen. Schau, was neugierig macht.",
    }),
  ).toBeVisible();
  await expect(page.locator(".home-fundstueck-card")).toHaveCount(3);
  await expect(page.locator(".home-fundstueck-card img:not([alt=''])")).toHaveCount(0);
  await expect(page.getByText("Eher ruhig", { exact: true })).toBeVisible();
  await expect(page.getByText("Eher wechselhaft", { exact: true })).toBeVisible();
  await expect(page.getByText("Eher intensiv", { exact: true })).toBeVisible();
  await expect(page.getByText("Du musst dich nicht auch noch in der Freizeit anschreien lassen.", { exact: true })).toHaveCount(1);
});

test("page titles identify search and detail context", async ({ page }) => {
  const cases = [
    { path: "/", expected: /null-noise – Filme und Serien ruhiger auswählen/ },
    { path: "/suche", expected: /Suche und stöbern/ },
    { path: "/suche?q=Arrival", expected: /Suche nach „Arrival“/ },
    { path: "/titel/mondfenster", expected: /Mondfenster/ },
    { path: "/spike/metadaten/movie/329865?q=Arrival", expected: /Arrival/ },
  ];
  const titles: string[] = [];

  for (const item of cases) {
    await page.goto(item.path);
    await expect(page).toHaveTitle(item.expected);
    titles.push(await page.title());
  }

  expect(new Set(titles).size).toBe(titles.length);
});

test("homepage and shared shell expose explicit Safari tab stops", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Drei Fundstücke. Drei Richtungen." })).toBeVisible();

  const tabStops = await page
    .locator(
      "header a[href], header button:not([disabled]), #main-content a[href], #main-content button:not([disabled]), #main-content input:not([type='hidden']), footer a[href]",
    )
    .evaluateAll((elements) =>
      elements.map((element) => ({
        label:
          element.getAttribute("aria-label") ??
          element.textContent?.replace(/\s+/g, " ").trim() ??
          (element as HTMLInputElement).name,
        tabIndex: element.getAttribute("tabindex"),
      })),
    );

  expect(tabStops.length).toBeGreaterThanOrEqual(20);
  expect(tabStops.every((stop) => stop.tabIndex === "0")).toBe(true);
  expect(tabStops.map((stop) => stop.label)).toEqual(
    expect.arrayContaining([
      "Zum Inhalt springen",
      "Null Noise – Startseite",
      "Menü öffnen",
      "Mehr Fundstücke",
      "Suchen",
      "Wie funktioniert null-noise?",
      "Alle Richtungen ansehen",
    ]),
  );
});

test("focus indicators stay compact and do not move focused controls", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Drei Fundstücke. Drei Richtungen." })).toBeVisible();

  const firstCardLink = page.locator(".home-fundstueck-link").first();
  await firstCardLink.focus();
  const cardStyles = await firstCardLink.evaluate((link) => {
    const linkStyle = getComputedStyle(link);
    const card = link.closest<HTMLElement>(".home-fundstueck-card");
    const cardStyle = card ? getComputedStyle(card) : null;

    return {
      cardOutlineOffset: cardStyle?.outlineOffset,
      cardOutlineWidth: cardStyle?.outlineWidth,
      cardTransform: cardStyle?.transform,
      linkOutlineWidth: linkStyle.outlineWidth,
    };
  });

  expect(cardStyles).toEqual({
    cardOutlineOffset: "-4px",
    cardOutlineWidth: "3px",
    cardTransform: "none",
    linkOutlineWidth: "0px",
  });

  const searchButton = page.getByRole("button", { name: "Suchen" });
  await searchButton.focus();
  const controlStyles = await searchButton.evaluate((button) => {
    const style = getComputedStyle(button);
    return {
      boxShadow: style.boxShadow,
      outlineOffset: style.outlineOffset,
      outlineWidth: style.outlineWidth,
      transform: style.transform,
    };
  });

  expect(controlStyles.outlineWidth).toBe("3px");
  expect(controlStyles.outlineOffset).toBe("1px");
  expect(controlStyles.boxShadow).toContain("1px");
  expect(controlStyles.transform).toBe("none");
});

test("direct starts expose three redundant category treatments", async ({ page }) => {
  await page.goto("/suche");
  await expect(page.locator(".search-direct-start-link")).toHaveCount(3);

  const categories = await page.locator(".search-direct-start-link").evaluateAll((links) =>
    links.map((link) => {
      const marker = link.querySelector<HTMLElement>(".search-direct-start-marker");
      const markerStyle = marker ? getComputedStyle(marker) : null;
      const linkStyle = getComputedStyle(link);
      return {
        backgroundColor: linkStyle.backgroundColor,
        borderColor: linkStyle.borderColor,
        borderLeftColor: linkStyle.borderLeftColor,
        label: link.querySelector(".search-direct-start-label")?.textContent?.trim(),
        marker: link.getAttribute("data-category-marker"),
        preset: link.getAttribute("data-preset"),
        tone: marker?.getAttribute("data-tone"),
        markerColor: markerStyle?.color,
      };
    }),
  );

  expect(categories.map((category) => category.label)).toEqual([
    "Eher ruhig",
    "Eher wechselhaft",
    "Eher intensiv",
  ]);
  expect(new Set(categories.map((category) => category.preset)).size).toBe(3);
  expect(new Set(categories.map((category) => category.marker)).size).toBe(3);
  expect(categories.map((category) => category.tone)).toEqual(["quiet", "balanced", "intense"]);
  expect(new Set(categories.map((category) => category.markerColor)).size).toBe(3);
  expect(new Set(categories.map((category) => category.backgroundColor)).size).toBe(3);
  expect(new Set(categories.map((category) => category.borderColor)).size).toBe(3);
  expect(new Set(categories.map((category) => category.borderLeftColor)).size).toBe(3);
  await expect(page.locator(".search-direct-start-arrow")).toHaveCount(0);
});

test("desktop home discovery heading keeps a calm line count and footer rhythm", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator(".home-screen-question")).toBeVisible();
  await expect(page.locator("#site-footer")).toBeVisible();

  const metrics = await page.evaluate(() => {
    const heading = document.querySelector<HTMLElement>(".home-screen-question");
    const hero = document.querySelector<HTMLElement>(".home-discovery-page");
    const footer = document.querySelector<HTMLElement>("#site-footer");
    if (!heading || !hero || !footer) return null;
    const range = document.createRange();
    range.selectNodeContents(heading);
    return {
      footerGap: footer.getBoundingClientRect().top - hero.getBoundingClientRect().bottom,
      lineCount: new Set(Array.from(range.getClientRects(), (rect) => Math.round(rect.top))).size,
    };
  });

  expect(metrics).not.toBeNull();
  expect(metrics?.lineCount).toBeGreaterThanOrEqual(3);
  expect(metrics?.lineCount).toBeLessThanOrEqual(4);
  expect(metrics?.footerGap).toBeLessThanOrEqual(64);
});

test("desktop search keeps results in a broad main column beside the filter column", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/suche?q=Arrival&view=grid");
  await expect(page.getByRole("heading", { name: 'Treffer zu „Arrival“' })).toBeVisible();
  await expect(page.locator(".search-sidebar")).toBeVisible();

  const metrics = await page.evaluate(() => {
    const layout = document.querySelector<HTMLElement>(".search-results-layout")?.getBoundingClientRect();
    const overview = document.querySelector<HTMLElement>(".search-results-overview")?.getBoundingClientRect();
    const main = document.querySelector<HTMLElement>(".search-results-main")?.getBoundingClientRect();
    const sidebar = document.querySelector<HTMLElement>(".search-sidebar")?.getBoundingClientRect();
    const results = document.querySelector<HTMLElement>(".search-results-stack")?.getBoundingClientRect();
    const grid = document.querySelector<HTMLElement>('.result-grid[data-layout="grid"]');
    return {
      cardColumns: grid ? getComputedStyle(grid).gridTemplateColumns.split(" ").length : 0,
      layoutWidth: layout?.width ?? 0,
      mainWidth: main?.width ?? 0,
      overviewWidth: overview?.width ?? 0,
      resultsWidth: results?.width ?? 0,
      sidebarWidth: sidebar?.width ?? 0,
    };
  });

  expect(metrics.sidebarWidth).toBeGreaterThanOrEqual(300);
  expect(metrics.mainWidth).toBeGreaterThan(metrics.sidebarWidth * 2);
  expect(metrics.overviewWidth).toBeGreaterThanOrEqual(metrics.mainWidth - 2);
  expect(metrics.resultsWidth).toBeGreaterThanOrEqual(metrics.mainWidth - 2);
  expect(metrics.mainWidth + metrics.sidebarWidth).toBeLessThanOrEqual(metrics.layoutWidth + 4);
  expect(metrics.cardColumns).toBeGreaterThanOrEqual(2);
});

test("homepage exposes a small beta note without turning into a banner", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText(/^Beta\./).first()).toBeVisible();
});

test("mobile homepage places the finite discovery before direct search", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/");

  const discovery = page.locator(".home-discovery-stage");
  const search = page.locator(".home-search-surface");

  await expect(page.getByRole("heading", { name: "Drei Fundstücke. Drei Richtungen." })).toBeVisible();
  await expect(discovery.locator(".home-fundstueck-card")).toHaveCount(3);
  await expect(discovery.getByText("Eher ruhig", { exact: true })).toBeVisible();
  await expect(discovery.getByText("Eher wechselhaft", { exact: true })).toBeVisible();
  await expect(discovery.getByText("Eher intensiv", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Schon einen Titel im Kopf?" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Wie funktioniert null-noise?" })).toHaveAttribute("href", "/erklaerung");

  const discoveryBox = await discovery.boundingBox();
  const searchBox = await search.boundingBox();
  expect(discoveryBox?.y ?? Number.POSITIVE_INFINITY).toBeLessThan(searchBox?.y ?? 0);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("homepage discovery stays static with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const cards = page.locator(".home-fundstueck-card");
  await expect(cards).toHaveCount(3);

  const motionStyles = await cards.evaluateAll((elements) =>
    elements.map((element) => {
      const style = getComputedStyle(element);
      return {
        transform: style.transform,
        transitionDuration: style.transitionDuration,
      };
    }),
  );

  expect(motionStyles).toEqual([
    { transform: "none", transitionDuration: "0s" },
    { transform: "none", transitionDuration: "0s" },
    { transform: "none", transitionDuration: "0s" },
  ]);
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
  await expect(page.locator(".search-suggestions[aria-live]")).toHaveCount(0);
  await expect(page.locator(".search-suggestions-status[role='status']")).toHaveCount(1);
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
  await expect(page.locator(".site-header")).toBeVisible();

  const topMenuLink = page.getByRole("link", { name: "Zum Top-Menü springen" });
  const contentLink = page.getByRole("link", { name: "Zum Inhalt springen" });
  const footerLink = page.getByRole("link", { name: "Zum Footer springen" });

  for (let step = 0; step < 4; step += 1) {
    await page.keyboard.press("Tab");
    if (await topMenuLink.evaluate((element) => element === document.activeElement)) {
      break;
    }
  }

  await expect(topMenuLink).toBeVisible();
  await expect(topMenuLink).toBeFocused();
  await expect(contentLink).toBeVisible();
  await expect(footerLink).toBeVisible();

  await page.keyboard.press("Tab");
  await expect(contentLink).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);

  await page.goto("/");
  await expect(page.locator(".site-header")).toBeVisible();

  for (let step = 0; step < 6; step += 1) {
    await page.keyboard.press("Tab");
    if (await footerLink.evaluate((element) => element === document.activeElement)) {
      break;
    }
  }
  await expect(footerLink).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#site-footer$/);
});

test("reload restores focus to the previously active control on the same page", async ({ page }) => {
  await page.setViewportSize({ width: 430, height: 900 });
  await page.goto("/erklaerung");
  await expect(page.getByRole("heading", { name: "null-noise verstehen und benutzen" })).toBeVisible();

  const disclosure = page.locator("summary").filter({ hasText: "Warum keine versteckten Tooltips?" });
  await disclosure.focus();
  await expect(disclosure).toBeFocused();

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "null-noise verstehen und benutzen" })).toBeVisible();

  await expect(
    page.locator("summary").filter({ hasText: "Warum keine versteckten Tooltips?" }),
  ).toBeFocused();

  const brandLink = page.getByRole("link", { name: "Null Noise – Startseite" });
  await brandLink.focus();
  await page.waitForTimeout(350);
  await expect(brandLink).toBeFocused();
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

test("external detail exposes local creation as one clear native action", async ({ page }) => {
  await page.goto("/spike/metadaten/movie/329865?q=Arrival");

  const panel = page.locator(".external-import-action-panel");
  await expect(panel.getByRole("heading", { name: "Lokal anlegen" })).toBeVisible();
  await expect(panel.getByRole("button", { name: "Lokal anlegen" })).toBeVisible();
  await expect(
    panel.getByText(
      "TMDb liefert die Basisdaten. null-noise erstellt daraus anschließend eine vorsichtige erste Einschätzung.",
      { exact: true },
    ),
  ).toHaveCount(1);
  await expect(panel.locator('form[action="/api/local-titles"][method="post"]')).toHaveCount(1);
});

test("footer exposes compact build metadata and links to the changelog", async ({ page }) => {
  await page.goto("/");

  const buildLine = page.locator("footer .build-line");

  await expect(buildLine).toHaveText(/Build 0\.8\.6-domain-cleanup\.20260822 · 2026-08-22/);
  await expect(buildLine).not.toContainText("Motion, Forced Colors and UI flow pass");
  await expect(page.locator("footer .release-note")).toHaveCount(0);
  await expect(page.locator("footer").getByRole("link", { name: "Release Notes / Changelog" })).toHaveAttribute(
    "href",
    "/changelog",
  );
});

test("changelog page exposes the full release history", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/changelog");

  await expect(page.getByRole("heading", { name: "Release Notes / Changelog" })).toBeVisible();
  const releaseNotes = page.locator(".changelog-page .release-note");
  expect(await releaseNotes.count()).toBeGreaterThan(20);
  await expect(releaseNotes.first()).toContainText("0.8.6-domain-cleanup.20260822");
  await expect(releaseNotes.first()).toContainText("Domain and contact cleanup");
  await expect(page.locator(".changelog-page")).toContainText("Accessible beta experience refresh");
  await expect(page.locator(".changelog-page")).toContainText("Mobile calm feedback and readability pass");
  await expect(page.locator(".changelog-page")).toContainText("Mobile brand and changelog documentation pass");
  await expect(page.locator(".changelog-page")).toContainText("Mobile title detail layout");

  const oldestRelease = releaseNotes.last();
  await oldestRelease.locator("summary").click();
  await expect(oldestRelease.locator(".release-note-panel")).toBeVisible();
});

test("footer links to the minimal legal pages", async ({ page }) => {
  await page.goto("/");

  const footer = page.locator("footer");

  await expect(footer.getByRole("link", { name: "Start" }).first()).toBeVisible();
  await expect(footer.getByRole("link", { name: "Suche" }).first()).toBeVisible();
  await expect(footer.getByRole("link", { name: "Erklärung und Hilfe" }).first()).toBeVisible();
  await expect(footer.getByRole("link", { name: "Barrierefreiheit" }).first()).toBeVisible();
  await expect(footer.getByRole("link", { name: "Kontakt" }).first()).toBeVisible();
  await expect(footer.getByRole("link", { name: "Datenschutz" }).first()).toBeVisible();
  await expect(footer.getByRole("link", { name: "Impressum" }).first()).toBeVisible();
});

test("footer exposes the contact page from core routes", async ({ page }) => {
  const routes = [
    "/",
    "/suche",
    "/suche?q=Arrival",
    "/barrierefreiheit",
    "/kontakt",
    "/datenschutz",
    "/impressum",
  ];

  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator("footer").getByRole("link", { name: "Kontakt" }).first()).toHaveAttribute(
      "href",
      "/kontakt",
    );
  }
});

test("mobile navigation separates primary header links from footer metadata links", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/");

  await page.getByRole("button", { name: "Menü" }).click();

  const headerNav = page.getByRole("navigation", { name: "Mobile Navigation" });

  await expect(headerNav.getByRole("link", { exact: true, name: "Start" })).toHaveAttribute("href", "/");
  await expect(headerNav.getByRole("link", { exact: true, name: "Suche" })).toHaveAttribute("href", "/suche");
  await expect(headerNav.getByRole("link", { exact: true, name: "Erklärung / Hilfe" })).toHaveAttribute("href", "/erklaerung");
  await expect(headerNav.getByRole("link", { name: "Barrierefreiheit" })).toHaveCount(0);
  await expect(headerNav.getByRole("link", { name: "Kontakt" })).toHaveCount(0);
  await expect(headerNav.getByRole("link", { name: "Datenschutz" })).toHaveCount(0);
  await expect(headerNav.getByRole("link", { name: "Impressum" })).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "Produktnavigation" })).toHaveCount(0);

  await headerNav.getByRole("button", { name: "Schließen" }).click();
  await expect(headerNav).toBeHidden();

  const footerProductNav = page.getByRole("navigation", { name: "Produktnavigation" });
  const footerLegalNav = page.getByRole("navigation", { name: "Rechtliches" }).first();

  await expect(footerProductNav.locator('a[href="/"]')).toHaveText("Start");
  await expect(footerProductNav.locator('a[href="/suche"]')).toHaveText("Suche");
  await expect(footerProductNav.locator('a[href="/erklaerung"]')).toHaveText("Erklärung und Hilfe");
  await expect(footerLegalNav.locator('a[href="/barrierefreiheit"]')).toHaveText("Barrierefreiheit");
  await expect(footerLegalNav.locator('a[href="/kontakt"]')).toHaveText("Kontakt");
  await expect(footerLegalNav.locator('a[href="/datenschutz"]')).toHaveText("Datenschutz");
  await expect(footerLegalNav.locator('a[href="/impressum"]')).toHaveText("Impressum");
});

test("mobile navigation returns focus to the menu button after Escape", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/");

  const menuButton = page.getByRole("button", { name: "Menü öffnen" });
  await menuButton.click();

  const mobileNav = page.getByRole("navigation", { name: "Mobile Navigation" });
  await expect(mobileNav).toBeVisible();
  await expect(mobileNav.getByRole("button", { name: "Schließen" })).toBeFocused();

  await mobileNav.getByRole("link", { name: "Suche" }).focus();
  await page.keyboard.press("Escape");

  await expect(page.getByRole("button", { name: "Menü öffnen" })).toBeFocused();
  await expect(mobileNav).toBeHidden();
});

test("detail feedback submits in place and focuses success or error status", async ({ page }) => {
  await page.goto("/titel/mondfenster");

  const feedbackIcons = page.locator(".reading-feedback-choice-icon");
  await expect(feedbackIcons).toHaveCount(3);

  const feedbackIconShapes = await feedbackIcons.evaluateAll((icons) =>
    icons.map((icon) => {
      const styles = window.getComputedStyle(icon);

      return {
        width: styles.width,
        height: styles.height,
        borderRadius: styles.borderRadius,
        borderWidth: styles.borderWidth,
        borderStyle: styles.borderStyle,
      };
    }),
  );

  expect(new Set(feedbackIconShapes.map((shape) => JSON.stringify(shape))).size).toBe(1);

  const initialUrl = page.url();
  await page.route("**/api/title-feedback", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ status: "success" }),
    });
  });

  await page.getByRole("button", { name: "Eher ruhig" }).click();

  const successStatus = page.getByRole("status").filter({ hasText: "Rückmeldung übernommen" });
  await expect(successStatus).toBeVisible();
  await expect(successStatus).toBeFocused();
  expect(page.url()).toBe(initialUrl);

  await page.unroute("**/api/title-feedback");
  await page.route("**/api/title-feedback", async (route) => {
    await route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({ status: "invalid" }),
    });
  });

  await page.getByRole("button", { name: "Eher intensiv" }).click();
  const errorStatus = page.getByRole("alert").filter({ hasText: "Die Rückmeldung war nicht vollständig" });
  await expect(errorStatus).toBeVisible();
  await expect(errorStatus).toBeFocused();
  expect(page.url()).toBe(initialUrl);
});

test("contact page uses a privacy-first native form with clear labels and status messages", async ({
  page,
}) => {
  let releaseContactRequest: (() => void) | undefined;
  const contactRequestStarted = new Promise<void>((resolve) => {
    releaseContactRequest = resolve;
  });

  await page.route("**/api/contact", async (route) => {
    await contactRequestStarted;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, delivered: true }),
    });
  });

  await page.goto("/kontakt");

  await expect(page.getByRole("heading", { name: "Kontakt", level: 1 })).toBeVisible();
  await expect(page.getByText("optional nach einer E-Mail-Adresse")).toBeVisible();
  await expect(page.getByText("Die E-Mail-Adresse ist freiwillig")).toBeVisible();
  await expect(page.getByText("Es gibt kein Tracking, keine Profile")).toBeVisible();

  const form = page.locator("form.contact-form");
  const email = page.getByLabel("E-Mail für Antwort (optional)");
  const message = page.getByLabel("Nachricht (Pflichtfeld)");
  const submit = page.getByRole("button", { name: "Nachricht senden" });

  await expect(form).toBeVisible();
  await expect(email).toHaveAttribute("type", "email");
  await expect(email).toHaveAttribute("autocomplete", "email");
  await expect(email).toHaveAttribute("aria-describedby", "contact-email-help");
  await expect(message).toHaveAttribute("required", "");
  await expect(message).toHaveAttribute("minlength", "10");
  await expect(message).toHaveAttribute("maxlength", "3000");
  await expect(message).toHaveAttribute("aria-describedby", "contact-message-help contact-message-counter");
  await expect(page.locator("#contact-message-counter")).not.toHaveAttribute("aria-live", /.+/);
  await expect(page.locator("#contact-message-counter")).toContainText("Noch 10 Zeichen fehlen.");

  await submit.click();
  await expect(page.getByRole("heading", { name: "Bitte prüfe die Eingaben" })).toBeVisible();
  await expect(page.getByText("Fehler: Bitte schreibe eine kurze Nachricht.")).toBeVisible();
  await expect(page.locator(".contact-form-summary")).toBeFocused();
  await expect(message).toHaveAttribute("aria-invalid", "true");
  await expect(email).not.toHaveAttribute("aria-invalid", "true");

  await email.fill("keine-adresse");
  await message.fill("Das Formular soll bitte gut bedienbar bleiben.");
  await expect(page.locator("#contact-message-counter")).toContainText("Mindestlänge erreicht.");
  await expect(page.locator("#contact-message-counter")).toHaveAttribute("data-ready", "true");
  await submit.click();
  await expect(page.getByText("Fehler: Bitte gib eine gültige E-Mail-Adresse ein")).toBeVisible();
  await expect(email).toHaveAttribute("aria-invalid", "true");

  await email.fill("");
  await submit.click();
  await expect(page.getByRole("button", { name: "Nachricht wird gesendet" })).toBeVisible();
  await expect(page.locator(".contact-form .sr-only[role='status']")).toHaveText("Nachricht wird gesendet.");
  releaseContactRequest?.();
  await expect(page.getByRole("heading", { name: "Deine Nachricht wurde gesendet." })).toBeVisible();
  await expect(page.getByText("Eine direkte Antwort ist deshalb nicht möglich.")).toBeVisible();
  await expect(form.locator('a[href^="mailto:"]')).toHaveCount(0);
});

test("contact form reports server errors without claiming delivery", async ({ page }) => {
  await page.route("**/api/contact", async (route) => {
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Die Nachricht konnte gerade nicht gesendet werden." }),
    });
  });

  await page.goto("/kontakt");
  await page.getByLabel("Nachricht (Pflichtfeld)").fill("Diese Nachricht ist lang genug.");
  await page.getByRole("button", { name: "Nachricht senden" }).click();

  await expect(page.getByRole("heading", { name: "Bitte prüfe die Eingaben" })).toBeVisible();
  await expect(page.getByText("gerade nicht gesendet werden")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Deine Nachricht wurde gesendet." })).toHaveCount(0);
});

test("contact form keeps keyboard order, reflow, text spacing and target sizes stable", async ({
  page,
}) => {
  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/kontakt");
    await expect(page.getByRole("heading", { name: "Kontakt", level: 1 })).toBeVisible();

    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth - document.documentElement.clientWidth;
    });
    expect(overflow, `/kontakt overflows at ${width} CSS pixels`).toBeLessThanOrEqual(1);
  }

  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/kontakt");

  const focusNames: string[] = [];
  for (let index = 0; index < 4; index += 1) {
    await page.keyboard.press("Tab");
    focusNames.push(
      await page.evaluate(() => {
        const active = document.activeElement;
        return (
          active?.getAttribute("aria-label") ??
          active?.textContent?.replace(/\s+/g, " ").trim() ??
          active?.getAttribute("name") ??
          active?.tagName ??
          ""
        );
      }),
    );
  }
  expect(focusNames.join(" ")).toContain("Zum Inhalt springen");

  const targetFailures = await page.evaluate(() => {
    const failures: string[] = [];
    for (const element of Array.from(
      document.querySelectorAll(".contact-form input, .contact-form textarea, .contact-form button"),
    )) {
      const rect = element.getBoundingClientRect();
      if (rect.width < 24 || rect.height < 24) {
        failures.push(`${element.tagName.toLowerCase()} ${Math.round(rect.width)}x${Math.round(rect.height)}`);
      }
    }
    return failures;
  });
  expect(targetFailures).toEqual([]);

  const spacingOverflow = await page.evaluate(() => {
    const style = document.createElement("style");
    style.textContent = `
      * {
        line-height: 1.5 !important;
        letter-spacing: 0.12em !important;
        word-spacing: 0.16em !important;
      }
      p, li, dd, dt, h1, h2, h3, h4, h5, h6, a, button, label, summary {
        margin-bottom: 2em !important;
      }
    `;
    document.head.append(style);
    const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    style.remove();
    return overflow;
  });
  expect(spacingOverflow).toBeLessThanOrEqual(1);
});

test("result cards keep poster links out of the keyboard flow", async ({ page }) => {
  await page.goto("/suche?q=Arrival");
  await expect(page.getByRole("heading", { name: 'Treffer zu „Arrival“' })).toBeVisible();

  const firstPosterLink = page.locator(".result-card .poster-thumb-link").first();

  await expect(firstPosterLink).toHaveAttribute("tabindex", "-1");
  await expect(firstPosterLink).toHaveAttribute("aria-hidden", "true");
  await expect(page.locator(".result-card .card-title a").first()).toBeVisible();
  await expect(page.locator(".result-card-cta-button").first()).toContainText("Details");
});

test("local title buttons expose understandable pressed actions", async ({ page }) => {
  await page.goto("/titel/mondfenster");

  const rememberButton = page.getByRole("button", {
    name: "Merken: Für später merken: Mondfenster",
  }).first();
  await expect(rememberButton).toHaveAttribute("aria-pressed", "false");

  await rememberButton.click();

  const removeRememberButton = page.getByRole("button", {
    name: "Gemerkt: Nicht mehr für später merken: Mondfenster",
  }).first();
  await expect(removeRememberButton).toHaveAttribute("aria-pressed", "true");

  const seenButton = page.getByRole("button", {
    name: "Schon gesehen?: Als schon gesehen markieren: Mondfenster",
  }).first();
  await seenButton.click();

  await expect(
    page.getByRole("button", {
      name: "Schon gesehen: Nicht mehr als gesehen markieren: Mondfenster",
    }).first(),
  ).toHaveAttribute("aria-pressed", "true");
});

test("search soft navigation exposes a concise live status", async ({ page }) => {
  let releaseSearchRequest: (() => void) | undefined;
  const searchRequestStarted = new Promise<void>((resolve) => {
    releaseSearchRequest = resolve;
  });

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/api/search/page-state**", async (route) => {
    await searchRequestStarted;
    await route.continue();
  });

  await page.goto("/suche?q=Arrival");
  await expect(page.getByRole("heading", { name: 'Treffer zu „Arrival“' })).toBeVisible();

  await page.getByRole("link", { name: "Karten" }).click();
  await expect(page.locator(".search-loading-state")).toContainText("Suchergebnisse werden geladen.");
  await expect(page.locator(".search-results-live-status")).toContainText("Suchergebnisse werden geladen.");
  await expect(page.locator(".search-results-main[aria-live]")).toHaveCount(0);

  const loadingBox = await page.locator(".search-loading-state").evaluate((loader) => {
    const rect = loader.getBoundingClientRect();
    const style = window.getComputedStyle(loader);
    return {
      backgroundColor: style.backgroundColor,
      borderLeftWidth: style.borderLeftWidth,
      height: rect.height,
      width: rect.width,
    };
  });
  expect(loadingBox.width).toBeGreaterThan(180);
  expect(loadingBox.height).toBeGreaterThanOrEqual(40);
  expect(loadingBox.borderLeftWidth).not.toBe("0px");
  expect(loadingBox.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");

  const loadingAnimationNames = await page.locator(".search-loading-state .loading-state-mark span").evaluateAll(
    (dots) => dots.map((dot) => window.getComputedStyle(dot).animationName),
  );
  expect(loadingAnimationNames).toEqual(["none", "none", "none"]);

  releaseSearchRequest?.();
  await page.waitForURL(/view=grid/);

  await expect(page.locator(".search-results-live-status")).toContainText("Suche aktualisiert:");
  await expect(page.locator(".search-results-live-status")).toContainText("externe Titel");
  await expect(page.getByRole("heading", { name: 'Treffer zu „Arrival“' })).toBeVisible();
});

test("global navigation progress is visible while route data is pending", async ({ page }) => {
  let markRouteRequestStarted: (() => void) | undefined;
  let releaseRouteRequest: (() => void) | undefined;
  const routeRequestStarted = new Promise<void>((resolve) => {
    markRouteRequestStarted = resolve;
  });
  const routeRequestHold = new Promise<void>((resolve) => {
    releaseRouteRequest = resolve;
  });

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/*", async (route) => {
    const url = route.request().url();

    if (url.includes("/erklaerung") && url.includes("_rsc=loader-test")) {
      markRouteRequestStarted?.();
      await routeRequestHold;
    }

    await route.continue();
  });

  await page.goto("/suche");
  await page.waitForFunction(() => {
    return document.documentElement.dataset.navigationProgressReady === "true";
  });
  const pendingRouteFetch = page.evaluate(() => {
    return fetch("/erklaerung?_rsc=loader-test").then(() => undefined);
  });
  await routeRequestStarted;

  const progress = page.locator('.navigation-progress[data-visible="true"]');
  await expect(progress).toBeVisible();
  await expect(progress).toHaveAttribute("role", "status");
  await expect(progress).toHaveAttribute("aria-live", "polite");
  await expect(progress.locator(".sr-only")).toHaveText("Seite wird geladen.");
  await expect(progress).toContainText("Seite lädt");

  const progressPlacement = await page.evaluate(() => {
    const header = document.querySelector(".site-header");
    const progressElement = document.querySelector(".navigation-progress");
    const headerBox = header?.getBoundingClientRect();
    const progressBox = progressElement?.getBoundingClientRect();

    return {
      headerBottom: headerBox?.bottom ?? 0,
      progressTop: progressBox?.top ?? 0,
      progressWidth: progressBox?.width ?? 0,
      viewportWidth: document.documentElement.clientWidth,
    };
  });
  expect(Math.abs(progressPlacement.progressTop - progressPlacement.headerBottom)).toBeLessThanOrEqual(2);
  expect(progressPlacement.progressWidth).toBeCloseTo(progressPlacement.viewportWidth, 0);

  const earlyProgressValue = await page.locator(".navigation-progress").evaluate((element) => {
    return Number.parseFloat(window.getComputedStyle(element).getPropertyValue("--navigation-progress-value"));
  });

  await page.waitForTimeout(420);

  const laterProgressValue = await page.locator(".navigation-progress").evaluate((element) => {
    return Number.parseFloat(window.getComputedStyle(element).getPropertyValue("--navigation-progress-value"));
  });

  expect(earlyProgressValue).toBeGreaterThan(0);
  expect(laterProgressValue).toBeGreaterThan(earlyProgressValue);

  const animationName = await page.locator(".navigation-progress-bar").evaluate((bar) => {
    return window.getComputedStyle(bar).animationName;
  });
  expect(animationName).toBe("none");

  releaseRouteRequest?.();
  await pendingRouteFetch;
  await page.waitForFunction(() => {
    const progress = document.querySelector(".navigation-progress");
    if (!(progress instanceof HTMLElement)) {
      return false;
    }

    return Number.parseFloat(
      window.getComputedStyle(progress).getPropertyValue("--navigation-progress-value"),
    ) >= 0.98;
  });
  await expect(page.locator(".navigation-progress")).toHaveAttribute("data-visible", "false");
});

test("reduced motion disables decorative motion while keeping status and navigation usable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/suche");

  await expect(page.getByRole("heading", { name: "Noch kein Titel im Kopf?" })).toBeVisible();

  const motionState = await page.evaluate(() => {
    const selectors = [
      ".site-main > *",
      ".search-browse-cluster-group",
      ".result-grid > li",
      ".mobile-navigation",
      ".navigation-progress-bar",
    ];

    return selectors.flatMap((selector) =>
      Array.from(document.querySelectorAll<HTMLElement>(selector)).map((element) => {
        const style = window.getComputedStyle(element);

        return {
          animationName: style.animationName,
          opacity: style.opacity,
          scrollBehavior: window.getComputedStyle(document.documentElement).scrollBehavior,
          selector,
          transitionDuration: style.transitionDuration,
          transform: style.transform,
        };
      }),
    );
  });

  expect(motionState.length).toBeGreaterThan(0);
  for (const state of motionState) {
    expect(state.animationName, state.selector).toBe("none");
    expect(state.transitionDuration, state.selector).toMatch(/^(0s|0\.00001s|0\.01ms)(, (0s|0\.00001s|0\.01ms))*$/);
    expect(state.transform, state.selector).toBe("none");
    expect(state.opacity, state.selector).toBe("1");
    expect(state.scrollBehavior).toBe("auto");
  }

  await page.getByRole("link", { name: "Karten" }).click();
  await expect(page.getByRole("heading", { name: "Noch kein Titel im Kopf?" })).toBeVisible();
  await expect(page).toHaveURL(/view=grid/);

  await page.setViewportSize({ width: 390, height: 900 });
  await page.getByRole("button", { name: "Menü öffnen" }).click();
  await expect(page.getByRole("navigation", { name: "Mobile Navigation" })).toBeVisible();
});

test("dark color preference does not switch the product out of its light theme", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/suche");
  await expect(page.getByRole("heading", { name: "Noch kein Titel im Kopf?" })).toBeVisible();

  const styles = await page.evaluate(() => {
    const read = (selector: string) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) {
        return null;
      }

      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();

      return {
        backgroundColor: style.backgroundColor,
        borderTopWidth: style.borderTopWidth,
        color: style.color,
        colorScheme: style.colorScheme,
        height: rect.height,
        outlineColor: style.outlineColor,
        width: rect.width,
      };
    };

    const input = document.querySelector<HTMLInputElement>("input[name='q']");
    input?.focus();
    const rootStyle = window.getComputedStyle(document.documentElement);

    return {
      activeRoute: read("[aria-current='page']"),
      body: read("body"),
      cluster: read(".search-browse-cluster-group"),
      footer: read("#site-footer"),
      header: read(".site-header"),
      input: read("input[name='q']"),
      posterFallback: read(".poster-thumb-fallback-tile, .poster-thumb-fallback"),
      rootColorScheme: rootStyle.colorScheme,
      rootPageColor: rootStyle.getPropertyValue("--color-page").trim(),
      rootSurfaceColor: rootStyle.getPropertyValue("--color-surface").trim(),
      status: read(".search-results-live-status"),
    };
  });

  for (const [name, style] of Object.entries(styles).filter(
    ([name]) => !["posterFallback", "rootColorScheme", "rootPageColor", "rootSurfaceColor", "status"].includes(name),
  )) {
    expect(style, `${name} exists`).not.toBeNull();
    expect(style?.backgroundColor, `${name} has nontransparent background`).not.toBe("rgba(0, 0, 0, 0)");
    expect(style?.color, `${name} has text color`).not.toBe("rgba(0, 0, 0, 0)");
    expect(style?.width ?? 0, `${name} width`).toBeGreaterThan(0);
    expect(style?.height ?? 0, `${name} height`).toBeGreaterThan(0);
  }

  expect(styles.rootColorScheme).toBe("light");
  expect(styles.rootPageColor).toBe("#fff6e5");
  expect(styles.rootSurfaceColor).toBe("#fffdf8");
  expect(styles.body?.backgroundColor).toBe("rgb(255, 246, 229)");
  expect(styles.body?.color).toBe("rgb(52, 40, 66)");
  expect(styles.cluster?.borderTopWidth).not.toBe("0px");
  expect(styles.status?.color).not.toBe("rgba(0, 0, 0, 0)");

  await page.goto("/titel/mondfenster");
  const detailPoster = await page.locator(".poster-thumb-frame-detail").first().evaluate((element) => {
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();

    return {
      backgroundColor: style.backgroundColor,
      borderColor: style.borderColor,
      height: rect.height,
      width: rect.width,
    };
  });
  expect(detailPoster.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  expect(detailPoster.borderColor).not.toBe("rgba(0, 0, 0, 0)");
  expect(detailPoster.width).toBeGreaterThan(0);
  expect(detailPoster.height).toBeGreaterThan(0);
});

test("browse categories are semantic clusters that do not rely on color alone", async ({ page }) => {
  await page.goto("/suche");

  const expectedHeadings = ["Eher ruhig", "Eher wechselhaft", "Eher intensiv"];

  for (const heading of expectedHeadings) {
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  }

  const clusterInfo = await page.evaluate(() => {
    const clusters = Array.from(document.querySelectorAll<HTMLElement>(".search-browse-cluster-group"));
    const viewportWidth = document.documentElement.clientWidth;

    return {
      clusterCount: clusters.length,
      labels: clusters.map((cluster) => cluster.querySelector(".search-browse-cluster-visible-label")?.textContent?.trim()),
      listCounts: clusters.map((cluster) => cluster.querySelectorAll("ul.result-grid > li").length),
      emptyNotes: clusters.map((cluster) => Boolean(cluster.querySelector(".search-browse-cluster-empty"))),
      overlap: clusters.some((cluster, index) => {
        const current = cluster.getBoundingClientRect();
        const next = clusters[index + 1]?.getBoundingClientRect();

        return next ? current.bottom > next.top && current.right > next.left && current.left < next.right : false;
      }),
      overflow: document.documentElement.scrollWidth - viewportWidth,
      references: clusters.map((cluster) => ({
        describedby: cluster.getAttribute("aria-describedby"),
        labelledby: cluster.getAttribute("aria-labelledby"),
      })),
    };
  });

  expect(clusterInfo.clusterCount).toBe(3);
  expect(clusterInfo.labels).toEqual(expectedHeadings);
  expect(
    clusterInfo.listCounts.every((count, index) => count > 0 || clusterInfo.emptyNotes[index]),
  ).toBe(true);
  expect(clusterInfo.references.every((reference) => reference.labelledby && reference.describedby)).toBe(true);
  expect(clusterInfo.overlap).toBe(false);
  expect(clusterInfo.overflow).toBeLessThanOrEqual(1);

  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/suche");
  const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(mobileOverflow).toBeLessThanOrEqual(1);

  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/suche");
  await expect(page.getByRole("heading", { name: "Eher ruhig" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Eher wechselhaft" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Eher intensiv" })).toBeVisible();
});

test("forced-colors rules preserve focus, controls and cluster boundaries", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await page.goto("/suche?avoidPeaks=true");

  await expect(page.getByRole("heading", { name: "Noch kein Titel im Kopf?" })).toBeVisible();

  const forcedColorState = await page.evaluate(() => {
    const active = window.matchMedia("(forced-colors: active)").matches;
    const rootStyles = Array.from(document.styleSheets)
      .flatMap((sheet) => {
        try {
          return Array.from(sheet.cssRules).map((rule) => rule.cssText);
        } catch {
          return [];
        }
      })
      .join("\n");
    const cluster = document.querySelector<HTMLElement>(".search-browse-cluster-group");
    const card = document.querySelector<HTMLElement>(".result-card");
    const header = document.querySelector<HTMLElement>(".site-header");
    const brand = document.querySelector<HTMLElement>(".brand");
    const brandImage = document.querySelector<HTMLElement>(".brand-image");
    const brandWordmarkImage = document.querySelector<HTMLElement>(".brand-wordmark-image");
    const activeFilter = document.querySelector<HTMLElement>(".search-filter-toggle[data-active='true']");
    const activeFilterLabel = activeFilter?.querySelector<HTMLElement>(".search-filter-toggle-state");
    const activeToneSegment = document.querySelector<HTMLElement>(".search-tone-scale-triad-segment[data-active='true']");
    const footerZone = document.querySelector<HTMLElement>(".result-card-footer-zone");
    const input = document.querySelector<HTMLInputElement>("input[name='q']");
    const button = document.querySelector<HTMLElement>("button, .primary-button, .secondary-button-link");
    input?.focus();
    const brandRect = brand?.getBoundingClientRect();
    const brandImageRect = brandImage?.getBoundingClientRect();
    const brandWordmarkImageRect = brandWordmarkImage?.getBoundingClientRect();
    const clusterStyle = cluster ? window.getComputedStyle(cluster) : null;
    const cardStyle = card ? window.getComputedStyle(card) : null;
    const headerStyle = header ? window.getComputedStyle(header) : null;
    const brandStyle = brand ? window.getComputedStyle(brand) : null;
    const brandImageStyle = brandImage ? window.getComputedStyle(brandImage) : null;
    const brandWordmarkImageStyle = brandWordmarkImage
      ? window.getComputedStyle(brandWordmarkImage)
      : null;
    const activeFilterStyle = activeFilter ? window.getComputedStyle(activeFilter) : null;
    const activeFilterLabelStyle = activeFilterLabel ? window.getComputedStyle(activeFilterLabel) : null;
    const activeToneSegmentStyle = activeToneSegment ? window.getComputedStyle(activeToneSegment) : null;
    const activeToneSegmentBeforeStyle = activeToneSegment
      ? window.getComputedStyle(activeToneSegment, "::before")
      : null;
    const footerZoneStyle = footerZone ? window.getComputedStyle(footerZone) : null;
    const footerZoneRect = footerZone?.getBoundingClientRect();
    const footerOverflowingChildren = Array.from(footerZone?.querySelectorAll<HTMLElement>("*") ?? []).filter(
      (child) => {
        const childRect = child.getBoundingClientRect();
        return footerZoneRect ? childRect.right > footerZoneRect.right + 1 : false;
      },
    ).length;
    const inputStyle = input ? window.getComputedStyle(input) : null;
    const buttonStyle = button ? window.getComputedStyle(button) : null;
    const focusStyle = input ? window.getComputedStyle(input) : null;

    return {
      active,
      brandColor: brandStyle?.color ?? "",
      brandImageVisible:
        brandImageStyle?.display !== "none" &&
        brandImageStyle?.visibility !== "hidden" &&
        (brandImageRect?.width ?? 0) > 0 &&
        (brandImageRect?.height ?? 0) > 0,
      brandRectHeight: brandRect?.height ?? 0,
      brandRectWidth: brandRect?.width ?? 0,
      brandWordmarkImageVisible:
        brandWordmarkImageStyle?.display !== "none" &&
        brandWordmarkImageStyle?.visibility !== "hidden" &&
        (brandWordmarkImageRect?.width ?? 0) > 0 &&
        (brandWordmarkImageRect?.height ?? 0) > 0,
      buttonBackground: buttonStyle?.backgroundColor ?? "",
      buttonColor: buttonStyle?.color ?? "",
      cardBorder: cardStyle?.borderTopWidth ?? "",
      clusterBorder: clusterStyle?.borderTopWidth ?? "",
      activeFilterBackground: activeFilterStyle?.backgroundColor ?? "",
      activeFilterLabelBackground: activeFilterLabelStyle?.backgroundColor ?? "",
      activeToneSegmentBackground: activeToneSegmentStyle?.backgroundColor ?? "",
      activeToneSegmentBeforeBackground: activeToneSegmentBeforeStyle?.backgroundColor ?? "",
      footerOverflow: footerZoneStyle?.overflow ?? "",
      footerOverflowingChildren,
      forcedColorAdjustNoneCount: (rootStyles.match(/forced-color-adjust:\s*none/g) ?? []).length,
      hasForcedColorsRules: rootStyles.includes("@media (forced-colors: active)"),
      headerBackground: headerStyle?.backgroundColor ?? "",
      headerColor: headerStyle?.color ?? "",
      inputBackground: inputStyle?.backgroundColor ?? "",
      inputColor: inputStyle?.color ?? "",
      outlineStyle: focusStyle?.outlineStyle ?? "",
      outlineWidth: focusStyle?.outlineWidth ?? "",
    };
  });

  expect(forcedColorState.active).toBe(true);
  expect(forcedColorState.hasForcedColorsRules).toBe(true);
  expect(forcedColorState.forcedColorAdjustNoneCount).toBe(0);
  expect(forcedColorState.brandRectWidth).toBeGreaterThan(0);
  expect(forcedColorState.brandRectHeight).toBeGreaterThan(0);
  expect(forcedColorState.brandImageVisible).toBe(true);
  expect(forcedColorState.brandWordmarkImageVisible).toBe(true);
  expect(forcedColorState.brandColor).not.toBe("rgba(0, 0, 0, 0)");
  expect(forcedColorState.buttonBackground).not.toBe("rgba(0, 0, 0, 0)");
  expect(forcedColorState.buttonColor).not.toBe("rgba(0, 0, 0, 0)");
  expect(forcedColorState.activeFilterBackground).not.toBe("rgba(0, 0, 0, 0)");
  expect(forcedColorState.activeFilterLabelBackground).toMatch(/rgba\(.+, 0\)/);
  expect(forcedColorState.activeToneSegmentBackground).toMatch(/rgba\(.+, 0\)/);
  expect(forcedColorState.activeToneSegmentBeforeBackground).toMatch(/rgba\(.+, 0\)/);
  expect(forcedColorState.cardBorder).not.toBe("0px");
  expect(forcedColorState.clusterBorder).not.toBe("0px");
  expect(forcedColorState.footerOverflow).toBe("visible");
  expect(forcedColorState.footerOverflowingChildren).toBe(0);
  expect(forcedColorState.headerBackground).not.toBe("rgba(0, 0, 0, 0)");
  expect(forcedColorState.headerColor).not.toBe("rgba(0, 0, 0, 0)");
  expect(forcedColorState.inputBackground).not.toBe("rgba(0, 0, 0, 0)");
  expect(forcedColorState.inputColor).not.toBe("rgba(0, 0, 0, 0)");
  expect(forcedColorState.outlineStyle).not.toBe("none");
  expect(forcedColorState.outlineWidth).not.toBe("0px");
});

test("empty query search URLs render the browse state without mobile layout artifacts", async ({
  page,
}) => {
  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/suche?q=&tone=all&kind=all");

    await expect(page.getByRole("heading", { name: "Noch kein Titel im Kopf?" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Treffer zu/ })).toHaveCount(0);

    const metrics = await page.evaluate(() => {
      const viewportWidth = document.documentElement.clientWidth;
      const firstCard = document.querySelector(".search-results-group .result-card");
      const groupHeader = document.querySelector(".search-results-group .search-results-group-header");
      const groupHeaderStyle = groupHeader ? window.getComputedStyle(groupHeader) : null;
      const groupHeaderHeading = groupHeader?.querySelector("h2");
      const resultsMain = document.querySelector(".search-results-main");
      const footer = document.querySelector("#site-footer");
      const loaderMarks = Array.from(document.querySelectorAll(".loading-state-mark"));
      const cardRect = firstCard?.getBoundingClientRect();
      const cardContentRect = firstCard?.querySelector(".poster-thumb-link")?.getBoundingClientRect();
      const groupHeaderRect = groupHeader?.getBoundingClientRect();
      const groupHeaderHeadingRect = groupHeaderHeading?.getBoundingClientRect();
      const resultsRect = resultsMain?.getBoundingClientRect();
      const footerRect = footer?.getBoundingClientRect();
      const strayLeftMarks = loaderMarks.filter((mark) => {
        const rect = mark.getBoundingClientRect();
        return rect.width > 0 && rect.left < 4;
      });

      return {
        cardHeight: cardRect?.height ?? 0,
        cardLeft: cardRect?.left ?? 0,
        cardContentLeft: cardContentRect?.left ?? 0,
        cardRight: cardRect?.right ?? 0,
        cardWidth: cardRect?.width ?? 0,
        footerHeight: footerRect?.height ?? 0,
        groupHeaderLeft: groupHeaderRect?.left ?? 0,
        groupHeaderContentLeft: groupHeaderHeadingRect?.left ?? 0,
        groupHeaderPaddingBottom: Number.parseFloat(groupHeaderStyle?.paddingBottom ?? "0"),
        groupHeaderPaddingLeft: Number.parseFloat(groupHeaderStyle?.paddingLeft ?? "0"),
        groupHeaderPaddingRight: Number.parseFloat(groupHeaderStyle?.paddingRight ?? "0"),
        groupHeaderPaddingTop: Number.parseFloat(groupHeaderStyle?.paddingTop ?? "0"),
        groupHeaderWidth: groupHeaderRect?.width ?? 0,
        overflow: document.documentElement.scrollWidth - viewportWidth,
        resultsLeft: resultsRect?.left ?? 0,
        resultsWidth: resultsRect?.width ?? 0,
        strayLeftMarkCount: strayLeftMarks.length,
      };
    });

    expect(metrics.overflow, `empty query overflows at ${width}`).toBeLessThanOrEqual(1);
    expect(metrics.resultsWidth, `results width at ${width}`).toBeGreaterThanOrEqual(width - 48);
    expect(metrics.cardWidth, `card width at ${width}`).toBeGreaterThanOrEqual(
      metrics.resultsWidth - metrics.groupHeaderPaddingLeft - metrics.groupHeaderPaddingRight - 4,
    );
    expect(metrics.groupHeaderPaddingLeft, `group header has horizontal padding at ${width}`)
      .toBeGreaterThanOrEqual(width === 320 ? 11 : 13);
    expect(metrics.groupHeaderPaddingRight, `group header has horizontal padding at ${width}`)
      .toBeGreaterThanOrEqual(width === 320 ? 11 : 13);
    expect(metrics.groupHeaderPaddingTop, `group header has vertical padding at ${width}`).toBeGreaterThanOrEqual(12);
    expect(metrics.groupHeaderPaddingBottom, `group header has vertical padding at ${width}`).toBeGreaterThanOrEqual(12);
    expect(Math.abs(metrics.groupHeaderContentLeft - metrics.cardContentLeft), `group header content aligns with card content at ${width}`)
      .toBeLessThanOrEqual(16);
    expect(metrics.groupHeaderWidth, `group header width follows cards at ${width}`)
      .toBeLessThanOrEqual(metrics.resultsWidth + 1);
    expect(metrics.cardLeft, `card starts inside result bounds at ${width}`).toBeGreaterThanOrEqual(metrics.resultsLeft - 1);
    expect(metrics.cardRight, `card ends inside result bounds at ${width}`).toBeLessThanOrEqual(
      metrics.resultsLeft + metrics.resultsWidth + 1,
    );
    expect(metrics.cardHeight, `card remains readable at ${width}`).toBeGreaterThan(120);
    expect(metrics.footerHeight, `footer remains available at ${width}`).toBeGreaterThan(0);
    expect(metrics.strayLeftMarkCount, `no loader dots on viewport edge at ${width}`).toBe(0);
  }
});

test("result card action zones stay contained with long content", async ({ page }) => {
  for (const view of ["grid", "list"]) {
    for (const width of [320, 390, 430, 1440]) {
      await page.setViewportSize({ width, height: 932 });
      await page.goto(`/suche?q=Arrival&view=${view}`);
      await expect(page.getByRole("heading", { name: 'Treffer zu „Arrival“' })).toBeVisible();

      const metrics = await page.locator(".result-card").first().evaluate((card) => {
        const title = card.querySelector<HTMLElement>(".card-title a");
        const status = card.querySelector<HTMLElement>(".result-card-reading-status");
        if (title) title.textContent = "Ein außergewöhnlich langer Filmtitel mit vielen beschreibenden Wörtern";
        if (status) status.textContent = "Ein außergewöhnlich langer Statuswert, der vollständig und ohne Abschneiden in der Karte umbrechen muss.";

        const rect = (selector: string) => card.querySelector<HTMLElement>(selector)?.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();
        const poster = rect(".poster-thumb-link");
        const titleZone = rect(".result-card-title-zone");
        const reading = rect(".result-card-reading-block");
        const footer = rect(".result-card-footer-zone");
        const cta = rect(".result-card-cta-zone");
        const memory = rect(".result-card-memory-zone");
        const localState = rect(".title-pocket-state");
        const controls = Array.from(card.querySelectorAll<HTMLElement>(".result-card-footer-zone a, .result-card-footer-zone button"));
        const overlap = (a?: DOMRect, b?: DOMRect) => Boolean(a && b && a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top);
        const contained = (child?: DOMRect) => Boolean(child && child.left >= cardRect.left - 1 && child.right <= cardRect.right + 1 && child.top >= cardRect.top - 1 && child.bottom <= cardRect.bottom + 1);

        return {
          contained: [titleZone, reading, footer, cta, memory].every(contained),
          footerOverlapsPoster: overlap(footer, poster),
          ctaOverlapsReading: overlap(cta, reading),
          ctaOverlapsMemory: overlap(cta, memory),
          clipped: Array.from(card.querySelectorAll<HTMLElement>(".result-card-title-zone, .result-card-reading-block, .result-card-footer-zone, .result-card-cta-zone, .result-card-memory-zone")).some((element) => element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 2),
          minControlHeight: Math.min(...controls.map((control) => control.getBoundingClientRect().height)),
          localStateWidth: localState?.width ?? 0,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      });

      expect(metrics.overflow, `${view} overflows at ${width}`).toBeLessThanOrEqual(1);
      expect(metrics.contained, `${view} zones stay inside card at ${width}`).toBe(true);
      expect(metrics.footerOverlapsPoster, `${view} footer clears poster at ${width}`).toBe(false);
      expect(metrics.ctaOverlapsReading, `${view} CTA clears reading at ${width}`).toBe(false);
      expect(metrics.ctaOverlapsMemory, `${view} CTA clears memory actions at ${width}`).toBe(false);
      expect(metrics.clipped, `${view} long content remains unclipped at ${width}`).toBe(false);
      expect(metrics.minControlHeight, `${view} touch targets at ${width}`).toBeGreaterThanOrEqual(44);
      expect(metrics.localStateWidth, `${view} status width at ${width}`).toBeGreaterThanOrEqual(120);
    }
  }
});

test("mobile detail posters sit directly below the title heading", async ({ page }) => {
  for (const route of ["/titel/mondfenster", "/spike/metadaten/series/4313"]) {
    for (const width of [320, 390, 430]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);
      await expect(page.locator(".detail-hero h1")).toBeVisible();
      await expect(page.locator(".poster-thumb-frame-detail").first()).toBeVisible();

      const metrics = await page.evaluate(() => {
        const h1 = document.querySelector(".detail-hero h1")?.getBoundingClientRect();
        const reading = document.querySelector(".detail-reading-block")?.getBoundingClientRect();
        const visiblePosters = Array.from(
          document.querySelectorAll<HTMLElement>(".poster-thumb-frame-detail"),
        )
          .map((poster) => {
            const rect = poster.getBoundingClientRect();
            const style = window.getComputedStyle(poster);

            return {
              bottom: rect.bottom,
              display: style.display,
              height: rect.height,
              top: rect.top,
              width: rect.width,
            };
          })
          .filter((poster) => poster.display !== "none" && poster.width > 0 && poster.height > 0);

        return {
          h1Bottom: h1?.bottom ?? 0,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          posterBottom: visiblePosters[0]?.bottom ?? 0,
          posterCount: visiblePosters.length,
          posterTop: visiblePosters[0]?.top ?? 0,
          readingTop: reading?.top ?? 0,
        };
      });

      expect(metrics.overflow, `${route} overflows at ${width}`).toBeLessThanOrEqual(1);
      expect(metrics.posterCount, `${route} has one visible mobile detail poster at ${width}`).toBe(1);
      expect(metrics.posterTop, `${route} poster follows h1 at ${width}`).toBeGreaterThan(metrics.h1Bottom);
      expect(metrics.posterBottom, `${route} poster precedes reading block at ${width}`)
        .toBeLessThanOrEqual(metrics.readingTop);
    }
  }
});

test("external detail prioritizes only one bounded TMDb poster source", async ({ page }) => {
  await page.setViewportSize({ width: 430, height: 900 });
  await page.goto("/spike/metadaten/series/4313");

  const detailPosters = page.locator("img[src*='/api/poster/tmdb/w780/']");
  await expect(detailPosters).toHaveCount(1);
  await expect(page.locator("img[src*='/api/poster/tmdb/w780/']:not([loading='lazy'])")).toHaveCount(1);

  const sources = await detailPosters.evaluateAll((images) =>
    images.map((image) => image.getAttribute("src")),
  );
  expect(new Set(sources).size).toBe(1);
  expect(sources[0]).not.toContain("/original/");
});

test("search local shelf keeps remembered and seen cards readable", async ({ page }) => {
  await page.addInitScript(() => {
    const rememberedEntry = {
      href: "/titel/mondfenster",
      key: "tmdb:movie:54321",
      meta: "Film · Animation · 2009",
      posterSrc: "/poster/mondfenster.svg",
      reason: "Eher ruhig",
      savedAt: Date.now(),
      title: "Ice Age 3 - Die Dinosaurier sind los",
      toneLabel: "Eher ruhig",
    };
    const seenEntry = {
      href: "/titel/mondfenster",
      key: "tmdb:movie:12345",
      meta: "Film · Animation · 2011",
      posterSrc: "/poster/mondfenster.svg",
      reason: "Eher ruhig",
      savedAt: Date.now(),
      title: "Cars 2",
      toneLabel: "Eher ruhig",
    };

    window.localStorage.setItem(
      "null-noise-remembered-titles",
      JSON.stringify({ [rememberedEntry.key]: rememberedEntry }),
    );
    window.localStorage.setItem(
      "null-noise-seen-titles",
      JSON.stringify({ [seenEntry.key]: seenEntry }),
    );
    window.localStorage.removeItem("null-noise-hide-seen");
  });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/suche");

  const shelf = page.locator(".search-local-shelf");
  await expect(shelf.getByRole("heading", { name: "Für später und schon gesehen" })).toBeVisible();
  await expect(shelf.getByRole("heading", { exact: true, name: "Für später gemerkt" })).toBeVisible();
  await expect(shelf.getByRole("heading", { exact: true, name: "Schon gesehen" })).toBeVisible();
  await expect(shelf.getByRole("link", { name: "Ice Age 3 - Die Dinosaurier sind los" })).toBeVisible();
  await expect(shelf.getByRole("link", { name: "Cars 2" })).toBeVisible();
  await expect(page.locator(".search-local-shelf-grid")).toHaveAttribute("data-groups", "2");

  const metrics = await page.evaluate(() => {
    const rect = (selector: string) => {
      const element = document.querySelector(selector);
      const box = element?.getBoundingClientRect();

      return box
        ? {
            bottom: box.bottom,
            height: box.height,
            left: box.left,
            right: box.right,
            top: box.top,
            width: box.width,
          }
        : null;
    };

    return {
      button: rect(".search-local-shelf-remove"),
      card: rect(".search-local-shelf-card"),
      copy: rect(".search-local-shelf-card-copy"),
      groupCount: document.querySelectorAll(".search-local-shelf-group").length,
      grid: rect(".search-local-shelf-grid"),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      title: rect(".search-local-shelf-card-copy h3"),
    };
  });

  expect(metrics.overflow).toBeLessThanOrEqual(1);
  expect(metrics.groupCount).toBe(2);
  expect(metrics.card?.width ?? 0).toBeGreaterThan(520);
  expect(metrics.copy?.width ?? 0).toBeGreaterThan(360);
  expect(metrics.title?.height ?? 0).toBeLessThan(60);
  expect(metrics.button?.left ?? 0).toBeGreaterThan(metrics.copy?.right ?? 0);
  expect(Math.abs((metrics.button?.top ?? 0) - (metrics.card?.top ?? 0))).toBeLessThan(90);

  await shelf.getByLabel("Schon gesehene Titel hier ausblenden").check();
  await expect(shelf.getByRole("heading", { exact: true, name: "Für später gemerkt" })).toBeVisible();
  await expect(shelf.getByRole("heading", { exact: true, name: "Schon gesehen" })).toHaveCount(0);
  await expect(shelf.getByRole("link", { name: "Cars 2" })).toHaveCount(0);
  await expect(shelf.getByText("1 schon gesehener Titel ist hier ausgeblendet.")).toBeVisible();
  await expect(page.locator(".search-local-shelf-grid")).toHaveAttribute("data-groups", "1");
});

test("mobile menu opens as a full-screen navigation mode", async ({ page }) => {
  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/erklaerung");
    await expect(page.getByRole("heading", { name: "null-noise verstehen und benutzen" })).toBeVisible();

    const menuButton = page.getByRole("button", { name: "Menü öffnen" });
    for (let index = 0; index < 10; index += 1) {
      if (await menuButton.evaluate((button) => button === document.activeElement)) {
        break;
      }

      await page.keyboard.press("Tab");
    }

    await expect(menuButton).toBeFocused();

    const buttonFocus = await menuButton.evaluate((button) => {
      const style = window.getComputedStyle(button);
      return {
        outlineOffset: style.outlineOffset,
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
      };
    });

    expect(buttonFocus.outlineStyle).toBe("solid");
    expect(buttonFocus.outlineWidth).toBe("3px");
    expect(buttonFocus.outlineOffset).toBe("1px");

    const closedHeaderState = await page.evaluate(() => {
      const header = document.querySelector(".site-header .header-inner")?.getBoundingClientRect();
      const brand = document.querySelector(".site-header .brand")?.getBoundingClientRect();
      const logo = document.querySelector(".site-header .brand-image-frame")?.getBoundingClientRect();
      const wordmark = document.querySelector(".site-header .brand-wordmark-frame")?.getBoundingClientRect();
      const button = document.querySelector(".mobile-menu-toggle")?.getBoundingClientRect();

      return {
        brandCenter: brand ? brand.top + brand.height / 2 : 0,
        buttonCenter: button ? button.top + button.height / 2 : 0,
        buttonRight: button?.right ?? 0,
        headerLeft: header?.left ?? 0,
        headerRight: header?.right ?? 0,
        logoLeft: logo?.left ?? 0,
        logoRight: logo?.right ?? 0,
        logoHeight: logo?.height ?? 0,
        logoWidth: logo?.width ?? 0,
        wordmarkLeft: wordmark?.left ?? 0,
        wordmarkHeight: wordmark?.height ?? 0,
        wordmarkWidth: wordmark?.width ?? 0,
      };
    });

    expect(closedHeaderState.logoLeft, `closed header logo follows content axis at ${width}`)
      .toBeGreaterThanOrEqual(closedHeaderState.headerLeft - 1);
    expect(closedHeaderState.logoLeft, `closed header logo does not drift from content axis at ${width}`)
      .toBeLessThanOrEqual(closedHeaderState.headerLeft + 8);
    expect(closedHeaderState.wordmarkLeft - closedHeaderState.logoRight, `closed header brand gap at ${width}`)
      .toBeGreaterThanOrEqual(5);
    expect(closedHeaderState.wordmarkLeft - closedHeaderState.logoRight, `closed header brand gap at ${width}`)
      .toBeLessThanOrEqual(12);
    expect(Math.abs(closedHeaderState.brandCenter - closedHeaderState.buttonCenter), `brand and menu baseline align at ${width}`)
      .toBeLessThanOrEqual(4);
    expect(closedHeaderState.buttonRight, `menu button stays on the right content axis at ${width}`)
      .toBeLessThanOrEqual(closedHeaderState.headerRight + 1);

    await menuButton.click();
    const mobileNav = page.getByRole("navigation", { name: "Mobile Navigation" });
    await expect(mobileNav).toBeVisible();
    await expect(mobileNav.getByRole("button", { name: "Schließen" })).toBeFocused();
    await expect(mobileNav.getByRole("link", { name: "Null Noise – Startseite" })).toBeVisible();

    const box = await mobileNav.boundingBox();
    expect(box, `mobile navigation has a box at ${width}`).not.toBeNull();
    expect(box?.height ?? 0, `mobile navigation fills the viewport at ${width}`).toBeGreaterThanOrEqual(880);
    expect(box?.x ?? 0, `mobile navigation starts at the viewport edge at ${width}`).toBeLessThanOrEqual(1);
    expect((box?.x ?? 0) + (box?.width ?? 0), `mobile navigation ends in viewport at ${width}`)
      .toBeLessThanOrEqual(width + 1);

    const menuState = await page.evaluate(() => {
      const brand = document.querySelector(".site-header .brand")?.getBoundingClientRect();
      const button = document.querySelector(".mobile-menu-toggle")?.getBoundingClientRect();
      const nav = document.querySelector(".mobile-navigation")?.getBoundingClientRect();
      const navBrand = document.querySelector(".mobile-navigation-brand")?.getBoundingClientRect();
      const navLogo = document.querySelector(".mobile-navigation-brand-image")?.getBoundingClientRect();
      const navWordmark = document.querySelector(".mobile-navigation-brand-wordmark")?.getBoundingClientRect();
      const navHead = document.querySelector(".mobile-navigation-head")?.getBoundingClientRect();
      const firstNavLink = document.querySelector(".mobile-nav-list a")?.getBoundingClientRect();
      const beforeScroll = window.scrollY;

      window.scrollBy(0, 320);

      return {
        brandLeft: brand?.left ?? 0,
        brandRight: brand?.right ?? 0,
        buttonLeft: button?.left ?? 0,
        buttonRight: button?.right ?? 0,
        buttonTop: button?.top ?? 0,
        bodyPosition: window.getComputedStyle(document.body).position,
        bodyTop: window.getComputedStyle(document.body).top,
        firstNavLinkTop: firstNavLink?.top ?? 0,
        navBrandLeft: navBrand?.left ?? 0,
        navBrandWidth: navBrand?.width ?? 0,
        navHeadBottom: navHead?.bottom ?? 0,
        navLogoHeight: navLogo?.height ?? 0,
        navLogoWidth: navLogo?.width ?? 0,
        navWordmarkHeight: navWordmark?.height ?? 0,
        navWordmarkWidth: navWordmark?.width ?? 0,
        navTop: nav?.top ?? 0,
        scrollChanged: window.scrollY !== beforeScroll,
      };
    });

    expect(menuState.brandLeft, `brand keeps the left header slot at ${width}`).toBeLessThan(width / 3);
    expect(menuState.buttonLeft, `menu toggle keeps the right header slot at ${width}`)
      .toBeGreaterThan(width / 2);
    expect(menuState.buttonRight, `menu toggle stays inside viewport at ${width}`)
      .toBeLessThanOrEqual(width - 8);
    expect(menuState.buttonTop, `menu toggle remains in the header row at ${width}`)
      .toBeLessThan(32);
    expect(menuState.buttonLeft, `menu toggle does not overlap the brand at ${width}`)
      .toBeGreaterThanOrEqual(menuState.brandRight + 4);
    expect(menuState.navTop, `mobile navigation covers the viewport at ${width}`).toBeLessThanOrEqual(1);
    expect(menuState.navBrandLeft, `mobile menu brand aligns with the content axis at ${width}`)
      .toBeGreaterThanOrEqual(width <= 320 ? 12 : 14);
    expect(menuState.navBrandWidth, `mobile menu brand has real width at ${width}`).toBeGreaterThan(120);
    expect(menuState.navLogoWidth, `mobile menu logo is visible at ${width}`).toBeGreaterThan(28);
    expect(menuState.navLogoHeight, `mobile menu logo is visible at ${width}`).toBeGreaterThan(24);
    expect(Math.abs(menuState.navLogoWidth - closedHeaderState.logoWidth), `open menu logo width matches closed header at ${width}`)
      .toBeLessThanOrEqual(1);
    expect(Math.abs(menuState.navLogoHeight - closedHeaderState.logoHeight), `open menu logo height matches closed header at ${width}`)
      .toBeLessThanOrEqual(1);
    expect(Math.abs(menuState.navWordmarkWidth - closedHeaderState.wordmarkWidth), `open menu wordmark width matches closed header at ${width}`)
      .toBeLessThanOrEqual(1);
    expect(Math.abs(menuState.navWordmarkHeight - closedHeaderState.wordmarkHeight), `open menu wordmark height matches closed header at ${width}`)
      .toBeLessThanOrEqual(1);
    expect(menuState.navWordmarkHeight, `mobile menu wordmark is visible at ${width}`).toBeGreaterThan(24);
    expect(menuState.firstNavLinkTop, `mobile links sit below the menu header at ${width}`)
      .toBeGreaterThanOrEqual(menuState.navHeadBottom + 12);
    expect(menuState.firstNavLinkTop, `mobile links are not vertically centered at ${width}`)
      .toBeLessThan(240);
    expect(menuState.bodyPosition, `page is fixed while menu is open at ${width}`).toBe("fixed");
    expect(menuState.bodyTop, `page stores its scroll offset while menu is open at ${width}`).toMatch(/^-?\d+px$/);
    expect(menuState.scrollChanged, `underlying page does not scroll at ${width}`).toBe(false);

    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(mobileNav.locator(":focus")).toHaveCount(1);

    await page.keyboard.press("Escape");
    await expect(menuButton).toBeFocused();
  }
});

test("accessibility page is reachable and explains the current testing scope", async ({ page }) => {
  await page.goto("/barrierefreiheit");
  const pageHeader = page.locator(".section-header");
  const statusPanel = page
    .locator("section.panel")
    .filter({ has: page.getByRole("heading", { name: "Aktueller Status" }) });
  const consideredPanel = page
    .locator("section.panel")
    .filter({ has: page.getByRole("heading", { name: "Was bereits berücksichtigt wird" }) });
  const testingPanel = page
    .locator("section.panel")
    .filter({ has: page.getByRole("heading", { name: "Wie geprüft wird" }) });
  const limitsPanel = page
    .locator("section.panel")
    .filter({ has: page.getByRole("heading", { name: "Bekannte Grenzen" }) });
  const contactPanel = page
    .locator("section.panel")
    .filter({ has: page.getByRole("heading", { name: "Kontakt" }) });

  await expect(page.locator("main h1")).toHaveText("Barrierefreiheit");
  await expect(pageHeader).toContainText("WCAG 2.2 AA");
  await expect(statusPanel).toContainText("keine abgeschlossene formale Konformitätsprüfung");
  await expect(consideredPanel).toContainText("HTML-first");
  await expect(consideredPanel).toContainText("sichtbarer Fokus");
  await expect(testingPanel).toContainText("Automatisierte Tests ersetzen keine manuelle Prüfung");
  await expect(testingPanel).toContainText("Automatisierte Tests im Projekt");
  await expect(testingPanel).toContainText("npm run test:a11y");
  await expect(testingPanel).toContainText("npm run test:wcag22-aa");
  await expect(testingPanel).toContainText("npm run test:wcag22-aaa");
  await expect(testingPanel).toContainText("Technische WCAG-2.2-A/AA/AAA-Matrix");
  await expect(testingPanel).toContainText("Im aktuellen Matrixstand");
  await expect(testingPanel).toContainText("Technischer Stand nach Level");
  await expect(testingPanel).toContainText("Barrierefreiheit, Kontakt, Datenschutz und Impressum");
  await expect(testingPanel).toContainText("A-Kriterien ohne automatischen Fail");
  await expect(testingPanel).toContainText("A- und AA-Kriterien ohne automatischen Fail");
  await expect(testingPanel).toContainText("AAA hat aktuell keinen automatischen Axe-Fail mehr");
  await expect(testingPanel).toContainText("1.1.1 Non-text Content");
  await expect(testingPanel).toContainText("1.4.6 Contrast Enhanced");
  await expect(testingPanel).toContainText("Header- und Footer-Navigation");
  await expect(testingPanel).toContainText("Automatisch: Pass");
  await expect(testingPanel).toContainText("Manuell offen");
  await expect(testingPanel).toContainText("Manuell offen");
  await expect(testingPanel).toContainText("Automatisch: nicht anwendbar");
  await expect(testingPanel).toContainText("kein AAA-Konformitätsziel");
  await expect(
    testingPanel.getByRole("link", { name: "2.4.5 Multiple Ways (AA)" }),
  ).toHaveAttribute("href", "https://www.w3.org/WAI/WCAG22/Understanding/multiple-ways.html");
  await expect(testingPanel).toContainText("keine vollständige manuelle WCAG-Konformitätsbewertung");
  await expect(testingPanel).toContainText("Playwright startet");
  await expect(testingPanel).toContainText("Wie die Tests hergeleitet wurden");
  await expect(limitsPanel).toContainText("Datenbasis und erste Einschätzungen bleiben unsicher");
  await expect(contactPanel.getByRole("link", { name: "Kontaktformular" })).toHaveAttribute(
    "href",
    "/kontakt",
  );
  await expect(contactPanel.getByRole("link", { name: "Kontaktformular" })).toHaveAttribute(
    "href",
    "/kontakt",
  );
  await expect(contactPanel.locator('a[href^="mailto:"]')).toHaveCount(0);
});

test("core routes keep central mobile surfaces inside 320, 390 and 430 CSS pixels", async ({
  page,
}) => {
  const routes = [
    {
      path: "/",
      ready: () =>
        page.getByRole("heading", {
          name: "Drei Richtungen. Schau, was neugierig macht.",
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
      ready: () => page.getByRole("heading", { name: "Barrierefreiheit" }),
    },
    {
      path: "/kontakt",
      ready: () => page.getByRole("heading", { name: "Kontakt" }),
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

  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 900 });

    for (const route of routes) {
      await page.goto(route.path);
      await expect(route.ready()).toBeVisible();
      await expectMobileLayoutWithinViewport(page, route.path, width);
    }
  }
});

test("core routes stay stable at common mobile widths with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });

  const routes = [
    {
      path: "/",
      ready: () =>
        page.getByRole("heading", {
          name: "Drei Richtungen. Schau, was neugierig macht.",
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
      ready: () => page.getByRole("heading", { name: "Barrierefreiheit" }),
    },
    {
      path: "/kontakt",
      ready: () => page.getByRole("heading", { name: "Kontakt" }),
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

  for (const width of [390, 430]) {
    await page.setViewportSize({ width, height: 900 });

    for (const route of routes) {
      await page.goto(route.path);
      await expect(route.ready()).toBeVisible();

      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth - document.documentElement.clientWidth;
      });

      expect(overflow, `${route.path} overflows at ${width} CSS pixels`).toBeLessThanOrEqual(1);
    }

    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        name: "Drei Richtungen. Schau, was neugierig macht.",
      }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Menü öffnen" }).click();

    const mobileNav = page.getByRole("navigation", { name: "Mobile Navigation" });
    await expect(mobileNav).toBeVisible();

    const box = await mobileNav.boundingBox();
    expect(box, `mobile navigation has a box at ${width} CSS pixels`).not.toBeNull();
    expect(box?.x ?? 0, `mobile navigation starts in the viewport at ${width}`).toBeGreaterThanOrEqual(0);
    expect(
      (box?.x ?? 0) + (box?.width ?? 0),
      `mobile navigation ends in the viewport at ${width}`,
    ).toBeLessThanOrEqual(width + 1);

    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Menü öffnen" })).toBeFocused();
  }
});

test.describe("iPhone Pro Max mobile layout", () => {
  test.use({
    deviceScaleFactor: 3,
    hasTouch: true,
    isMobile: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
    viewport: { width: 430, height: 932 },
  });

  test("keeps navigation, focus targets and bottom actions visible", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        name: "Drei Richtungen. Schau, was neugierig macht.",
      }),
    ).toBeVisible();

    const menuButton = page.getByRole("button", { name: "Menü öffnen" });
    await menuButton.click();

    const mobileNav = page.getByRole("navigation", { name: "Mobile Navigation" });
    await expect(mobileNav).toBeVisible();
    await expect(mobileNav.getByRole("button", { name: "Schließen" })).toBeFocused();

    const menuMetrics = await page.evaluate(() => {
      const header = document.querySelector(".site-header")?.getBoundingClientRect();
      const nav = document.querySelector(".mobile-navigation")?.getBoundingClientRect();

      return {
        headerBottom: header?.bottom ?? 0,
        navBottom: nav?.bottom ?? 0,
        navLeft: nav?.left ?? 0,
        navRight: nav?.right ?? 0,
        navTop: nav?.top ?? 0,
        viewportHeight: window.innerHeight,
        viewportWidth: window.innerWidth,
      };
    });

    expect(menuMetrics.navTop).toBeLessThanOrEqual(1);
    expect(menuMetrics.navLeft).toBeGreaterThanOrEqual(0);
    expect(menuMetrics.navRight).toBeLessThanOrEqual(menuMetrics.viewportWidth + 1);
    expect(menuMetrics.navBottom).toBeGreaterThanOrEqual(menuMetrics.viewportHeight - 8);

    await page.keyboard.press("Escape");
    await expect(menuButton).toBeFocused();

    await page.goto("/suche?q=Arrival");
    await expect(page.getByRole("heading", { name: 'Treffer zu „Arrival“' })).toBeVisible();
    await expectMobileLayoutWithinViewport(page, "/suche?q=Arrival", 430);
    await expectElementBelowHeader(page, "main h1", "search heading");

    await page.evaluate(() => window.scrollTo(0, 760));
    await page.locator(".result-card-cta-button").first().click();
    await page.waitForURL(/\/(titel|spike\/metadaten)\//);
    await expect(page.locator(".detail-hero h1")).toBeVisible();

    await expect
      .poll(() => page.evaluate(() => Math.round(window.scrollY)), {
        message: "detail navigation starts at the top",
      })
      .toBeLessThanOrEqual(2);
    await expect(page.locator("#main-content")).toBeFocused();
    await expectElementBelowHeader(page, ".detail-back-action", "detail back action");

    const detailOrder = await page.evaluate(() => {
      const h1 = document.querySelector(".detail-hero h1")?.getBoundingClientRect();
      const poster = document.querySelector(".poster-thumb-frame-detail")?.getBoundingClientRect();
      const reading = document.querySelector(".detail-reading-block")?.getBoundingClientRect();

      return {
        h1Bottom: h1?.bottom ?? 0,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        posterBottom: poster?.bottom ?? 0,
        posterTop: poster?.top ?? 0,
        readingTop: reading?.top ?? 0,
      };
    });

    expect(detailOrder.overflow).toBeLessThanOrEqual(1);
    expect(detailOrder.posterTop).toBeGreaterThan(detailOrder.h1Bottom);
    expect(detailOrder.posterBottom).toBeLessThanOrEqual(detailOrder.readingTop);

    await page.goto("/kontakt");
    await expect(page.getByRole("heading", { name: "Kontakt", level: 1 })).toBeVisible();
    await page.getByRole("button", { name: "Nachricht senden" }).click();
    await expect(page.locator(".contact-form-summary")).toBeFocused();
    await expectElementBelowHeader(page, ".contact-form-summary", "contact error summary");

    await page.getByRole("button", { name: "Nachricht senden" }).scrollIntoViewIfNeeded();

    const contactMetrics = await page.evaluate(() => {
      const form = document.querySelector(".contact-form");
      const submit = document.querySelector(".contact-form .primary-button")?.getBoundingClientRect();
      const formStyle = form instanceof HTMLElement ? window.getComputedStyle(form) : null;

      return {
        formPaddingBottom: formStyle ? Number.parseFloat(formStyle.paddingBottom) : 0,
        submitBottom: submit?.bottom ?? 0,
        submitHeight: submit?.height ?? 0,
        viewportHeight: window.innerHeight,
      };
    });

    expect(contactMetrics.submitHeight).toBeGreaterThanOrEqual(44);
    expect(contactMetrics.formPaddingBottom).toBeGreaterThanOrEqual(80);
    expect(contactMetrics.submitBottom).toBeLessThanOrEqual(contactMetrics.viewportHeight);
  });
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
