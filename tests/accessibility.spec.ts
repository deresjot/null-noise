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
  await expect(page.getByRole("heading", { name: "Richtung starten", level: 2 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ohne Titel stöbern", exact: true })).toBeVisible();
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

test("reload restores focus to the previously active control on the same page", async ({ page }) => {
  await page.setViewportSize({ width: 430, height: 900 });
  await page.goto("/suche?q=Mythbusters");

  const detailsLink = page.locator(".result-card-cta-button").first();
  await detailsLink.focus();
  await expect(detailsLink).toBeFocused();

  await page.reload({ waitUntil: "networkidle" });

  await expect(page.locator(".result-card-cta-button").first()).toBeFocused();
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
  const footerProductNav = page.getByRole("navigation", { name: "Produktnavigation" });
  const footerLegalNav = page.getByRole("navigation", { name: "Rechtliches" }).first();

  await expect(headerNav.getByRole("link", { name: "Start" })).toHaveAttribute("href", "/");
  await expect(headerNav.getByRole("link", { name: "Suche" })).toHaveAttribute("href", "/suche");
  await expect(headerNav.getByRole("link", { name: "Erklärung / Hilfe" })).toHaveAttribute("href", "/erklaerung");
  await expect(headerNav.getByRole("link", { name: "Barrierefreiheit" })).toHaveCount(0);
  await expect(headerNav.getByRole("link", { name: "Kontakt" })).toHaveCount(0);
  await expect(headerNav.getByRole("link", { name: "Datenschutz" })).toHaveCount(0);
  await expect(headerNav.getByRole("link", { name: "Impressum" })).toHaveCount(0);

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

  await mobileNav.getByRole("link", { name: "Suche" }).focus();
  await page.keyboard.press("Escape");

  await expect(page.getByRole("button", { name: "Menü öffnen" })).toBeFocused();
  await expect(mobileNav).toBeHidden();
});

test("contact page uses a privacy-first native form with clear labels and status messages", async ({
  page,
}) => {
  await page.goto("/kontakt");

  await expect(page.getByRole("heading", { name: "Kontakt", level: 1 })).toBeVisible();
  await expect(page.getByText("E-Mail-Adresse für die Antwort")).toBeVisible();
  await expect(page.getByText("Die E-Mail-Adresse wird nur für die Antwort")).toBeVisible();
  await expect(page.getByText("Es gibt kein Tracking, keine Profile")).toBeVisible();

  const form = page.locator("form.contact-form");
  const email = page.getByLabel("E-Mail für Antwort (Pflichtfeld)");
  const message = page.getByLabel("Nachricht (Pflichtfeld)");
  const submit = page.getByRole("button", { name: "Nachricht absenden" });

  await expect(form).toBeVisible();
  await expect(email).toHaveAttribute("type", "email");
  await expect(email).toHaveAttribute("autocomplete", "email");
  await expect(email).toHaveAttribute("required", "");
  await expect(email).toHaveAttribute("aria-describedby", "contact-email-help");
  await expect(message).toHaveAttribute("required", "");
  await expect(message).toHaveAttribute("minlength", "10");
  await expect(message).toHaveAttribute("aria-describedby", "contact-message-help contact-message-counter");
  await expect(page.locator("#contact-message-counter")).toContainText("Noch 10 Zeichen fehlen.");

  await submit.click();
  await expect(page.getByRole("heading", { name: "Bitte prüfe die Eingaben" })).toBeVisible();
  await expect(page.getByText("Fehler: Bitte schreibe eine kurze Nachricht.")).toBeVisible();
  await expect(page.getByText("Fehler: Bitte gib eine E-Mail-Adresse an")).toBeVisible();
  await expect(page.locator(".contact-form-summary")).toBeFocused();
  await expect(message).toHaveAttribute("aria-invalid", "true");
  await expect(email).toHaveAttribute("aria-invalid", "true");

  await email.fill("keine-adresse");
  await message.fill("Das Formular soll bitte gut bedienbar bleiben.");
  await expect(page.locator("#contact-message-counter")).toContainText("Mindestlänge erreicht.");
  await expect(page.locator("#contact-message-counter")).toHaveAttribute("data-ready", "true");
  await submit.click();
  await expect(page.getByText("Fehler: Bitte gib eine gültige E-Mail-Adresse ein")).toBeVisible();
  await expect(email).toHaveAttribute("aria-invalid", "true");

  await email.fill("mail@example.com");
  await submit.click();
  await expect(page.getByRole("heading", { name: "Nachricht bereit zum Absenden" })).toBeVisible();
  await expect(page.getByText("Sende die Nachricht im Mailprogramm ab.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Im Mailprogramm absenden" })).toHaveAttribute(
    "href",
    /mailto:mail@sebastianjansen\.com/,
  );
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
  await page.goto("/suche?q=Arrival");
  await expect(page.getByRole("heading", { name: 'Treffer zu „Arrival“' })).toBeVisible();

  await page.getByRole("link", { name: "Karten" }).click();
  await page.waitForURL(/view=grid/);

  await expect(page.locator(".search-results-live-status")).toContainText("Suche aktualisiert:");
  await expect(page.locator(".search-results-live-status")).toContainText("externe Titel");
  await expect(page.getByRole("heading", { name: 'Treffer zu „Arrival“' })).toBeVisible();
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
  await expect(testingPanel).toContainText("npm run test:wcag22-aaa");
  await expect(testingPanel).toContainText("Technische WCAG-2.2-A/AA/AAA-Matrix");
  await expect(testingPanel).toContainText("86 WCAG-2.2-A/AA/AAA-Erfolgskriterien");
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
  await expect(contactPanel).toContainText("mail@sebastianjansen.com");
  await expect(contactPanel.getByRole("link", { name: "mail@sebastianjansen.com" })).toHaveAttribute(
    "href",
    "mailto:mail@sebastianjansen.com",
  );
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

  for (const route of routes) {
    await page.goto(route.path);
    await expect(route.ready()).toBeVisible();

    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth - document.documentElement.clientWidth;
    });

    expect(overflow, `${route.path} overflows at 320 CSS pixels`).toBeLessThanOrEqual(1);
  }
});

test("core routes stay stable at common mobile widths with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });

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
        name: "Du musst dich nicht auch noch in der Freizeit anschreien lassen.",
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
