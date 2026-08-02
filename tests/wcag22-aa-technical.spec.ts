import axe from "axe-core";
import { type Page, expect, test } from "@playwright/test";

import { wcag22AaTechnicalMatrix } from "@/lib/wcag22-technical-matrix";

const axeSource = axe.source;
const wcag22Scope = process.env.WCAG22_SCOPE === "aaa" ? "aaa" : "aa";

const coreRoutes = [
  { path: "/", heading: "Drei Richtungen. Schau, was neugierig macht." },
  { path: "/suche", heading: "Noch kein Titel im Kopf?" },
  { path: "/suche?q=Arrival", heading: 'Treffer zu „Arrival“' },
  { path: "/suche?q=Predator", heading: 'Treffer zu „Predator“' },
  { path: "/suche?q=Gladiator", heading: 'Treffer zu „Gladiator“' },
  { path: "/suche?q=Cars", heading: 'Treffer zu „Cars“' },
  { path: "/suche?q=Past%20Lives", heading: 'Treffer zu „Past Lives“' },
  { path: "/titel/mondfenster", heading: "Mondfenster" },
  { path: "/erklaerung", heading: "null-noise verstehen und benutzen" },
  { path: "/bedienung", heading: "null-noise verstehen und benutzen" },
  { path: "/barrierefreiheit", heading: "Barrierefreiheit" },
  { path: "/kontakt", heading: "Kontakt" },
  { path: "/datenschutz", heading: "Datenschutz" },
  { path: "/impressum", heading: "Impressum" },
];

type RouteFinding = {
  path: string;
  failures: string[];
};

async function gotoReady(page: Page, route: (typeof coreRoutes)[number]) {
  await page.goto(route.path, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: route.heading })).toBeVisible();
  await expect(page).toHaveTitle(/\S/);
}

async function runAxe(
  page: Page,
  values = ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa", "best-practice"],
) {
  await page.addScriptTag({ content: axeSource });

  return page.evaluate(async (runOnlyValues) => {
    const axeApi = (window as Window & {
      axe: {
        run: (
          context?: Document,
          options?: Record<string, unknown>,
        ) => Promise<{
          violations: Array<{ id: string; impact: string | null; nodes: Array<{ target: string[] }> }>;
        }>;
      };
    }).axe;

    return axeApi.run(document, {
      runOnly: {
        type: "tag",
        values: runOnlyValues,
      },
    });
  }, values);
}

async function collectTechnicalFailures(page: Page) {
  return page.evaluate(async () => {
    const failures: string[] = [];
    const previousHtmlScrollBehavior = document.documentElement.style.scrollBehavior;
    const previousBodyScrollBehavior = document.body.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    document.body.style.scrollBehavior = "auto";
    const visible = (element: Element) => {
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return (
        style.visibility !== "hidden" &&
        style.display !== "none" &&
        rect.width > 0 &&
        rect.height > 0 &&
        !element.closest("details:not([open]) :not(summary)") &&
        !element.closest("[hidden], [aria-hidden='true']")
      );
    };
    const textOf = (element: Element) => (element.textContent ?? "").replace(/\s+/g, " ").trim();
    const nameOf = (element: Element) => {
      const formLabel =
        element instanceof HTMLInputElement ||
        element instanceof HTMLSelectElement ||
        element instanceof HTMLTextAreaElement
          ? Array.from(element.labels ?? []).map(textOf).find(Boolean)
          : undefined;

      return (
        element.getAttribute("aria-label") ??
        formLabel ??
        element.getAttribute("title") ??
        textOf(element) ??
        ""
      )
        .replace(/\s+/g, " ")
        .trim();
    };

    if (document.documentElement.lang !== "de") {
      failures.push(`html lang should be de, got ${document.documentElement.lang || "empty"}`);
    }

    if (!document.title.trim()) {
      failures.push("document title is empty");
    }

    if (document.querySelectorAll("main").length !== 1) {
      failures.push("route should expose exactly one main landmark");
    }

    if (document.querySelectorAll("h1").length !== 1) {
      failures.push("route should expose exactly one h1");
    }

    for (const heading of Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6"))) {
      if (visible(heading) && !textOf(heading)) {
        failures.push("visible heading has no text");
      }
    }

    for (const image of Array.from(document.images)) {
      const hidden = image.closest("[aria-hidden='true']") || image.getAttribute("role") === "presentation";
      const decorative = image.alt === "";

      if (!hidden && !decorative && !image.alt.trim()) {
        failures.push(`image missing alt: ${image.currentSrc || image.src || "unknown"}`);
      }
    }

    const media = document.querySelectorAll("audio, video, track");
    if (media.length > 0) {
      failures.push("audio/video media found; time-based-media criteria need route-specific checks");
    }

    if (document.querySelector("canvas, blink, marquee")) {
      failures.push("canvas/blink/marquee found; flashing/moving-content criteria need route-specific checks");
    }

    if (document.querySelector("meta[http-equiv='refresh' i]")) {
      failures.push("meta refresh found");
    }

    if (document.querySelector("[draggable='true'], [ondragstart], [ondragover], [ondrop]")) {
      failures.push("dragging UI found");
    }

    const positiveTabIndex = Array.from(document.querySelectorAll("[tabindex]")).filter((element) => {
      const value = Number(element.getAttribute("tabindex"));
      return Number.isFinite(value) && value > 0;
    });
    if (positiveTabIndex.length) {
      failures.push(`${positiveTabIndex.length} elements use positive tabindex`);
    }

    const interactiveSelector = [
      "a[href]",
      "button",
      "input",
      "select",
      "textarea",
      "summary",
      "[role='button']",
      "[role='link']",
      "[role='checkbox']",
      "[role='switch']",
      "[role='tab']",
      "[tabindex]:not([tabindex='-1'])",
    ].join(",");

    for (const element of Array.from(document.querySelectorAll(interactiveSelector))) {
      if (!visible(element) || (element as HTMLButtonElement).disabled) {
        continue;
      }

      const name = nameOf(element);
      if (!name && element.tagName !== "INPUT") {
        failures.push(`interactive element lacks an accessible text/name: ${element.tagName.toLowerCase()}`);
      }

      const visibleText = textOf(element);
      const ariaLabel = element.getAttribute("aria-label")?.replace(/\s+/g, " ").trim();
      if (visibleText && ariaLabel && !ariaLabel.toLowerCase().includes(visibleText.toLowerCase())) {
        failures.push(`label-in-name mismatch: visible "${visibleText}" vs aria-label "${ariaLabel}"`);
      }

      if (
        element.matches("input:not([type='hidden']):not([type='submit']):not([type='button']), select, textarea") &&
        !element.closest("label") &&
        !element.getAttribute("aria-label") &&
        !element.getAttribute("aria-labelledby") &&
        !document.querySelector(`label[for="${CSS.escape((element as HTMLInputElement).id)}"]`)
      ) {
        failures.push(`form control lacks label: ${(element as HTMLInputElement).name || element.id || element.tagName}`);
      }
    }

    const focusableTargets = Array.from(document.querySelectorAll(interactiveSelector)).filter(
      (element) => visible(element) && !(element as HTMLButtonElement).disabled,
    );

    for (const element of focusableTargets.slice(0, 80)) {
      const previousScrollBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";
      const initialRect = element.getBoundingClientRect();
      window.scrollTo({
        top: Math.max(
          0,
          window.scrollY + initialRect.top - window.innerHeight / 2 + initialRect.height / 2,
        ),
        left: 0,
        behavior: "auto",
      });
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
      // Use native focus scrolling so controls inside nested scroll containers are tested
      // the same way keyboard users reach them.
      (element as HTMLElement).focus();
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
      const active = document.activeElement === element || element.contains(document.activeElement);
      if (!active) {
        failures.push(`focus did not land on ${element.tagName.toLowerCase()} ${nameOf(element)}`);
        continue;
      }

      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      const focusVisible =
        Number.parseFloat(style.outlineWidth) > 0 ||
        style.outlineStyle !== "none" ||
        style.boxShadow !== "none" ||
        style.borderColor !== window.getComputedStyle(document.body).borderColor;

      if (!focusVisible) {
        failures.push(`focused element has no obvious computed focus style: ${nameOf(element) || element.tagName}`);
      }

      const intersectsViewport =
        rect.bottom > 0 &&
        rect.right > 0 &&
        rect.top < window.innerHeight &&
        rect.left < window.innerWidth;

      if (!intersectsViewport) {
        failures.push(`focused element is outside the viewport: ${nameOf(element) || element.tagName}`);
      }
    }

    for (const target of focusableTargets) {
      const rect = target.getBoundingClientRect();
      const style = window.getComputedStyle(target);
      const isInlineTextLink =
        target.tagName === "A" &&
        style.display === "inline" &&
        Boolean(target.closest("p, li, dd, dt"));
      const isNativeSmallControl =
        target.matches("input[type='checkbox'], input[type='radio']");

      if (!isInlineTextLink && !isNativeSmallControl && (rect.width < 24 || rect.height < 24)) {
        failures.push(
          `target smaller than 24px: ${target.tagName.toLowerCase()} "${nameOf(target)}" ${Math.round(
            rect.width,
          )}x${Math.round(rect.height)}`,
        );
      }
    }

    const navTexts = Array.from(document.querySelectorAll("header nav a")).map(textOf).filter(Boolean);
    const expectedNav = ["Start", "Suche", "Erklärung / Hilfe"];
    for (const label of expectedNav) {
      if (!navTexts.includes(label)) {
        failures.push(`header navigation missing ${label}`);
      }
    }

    if (!document.querySelector("a.skip-link[href='#main-content']")) {
      failures.push("main skip link missing");
    }

    if (document.querySelector("[role='tooltip'], [popover]")) {
      failures.push("tooltip/popover found; hover/focus dismissal needs route-specific checks");
    }

    if (window.location.pathname === "/kontakt") {
      const form = document.querySelector("form.contact-form");
      const email = document.querySelector<HTMLInputElement>("#contact-email");
      const message = document.querySelector<HTMLTextAreaElement>("#contact-message");
      const submit = document.querySelector<HTMLButtonElement>(".contact-form button[type='submit']");

      if (!form) {
        failures.push("contact form missing native form element");
      }

      if (!email || email.type !== "email" || email.autocomplete !== "email" || email.required) {
        failures.push("contact email field should be optional type=email with autocomplete=email");
      }

      if (!message || !message.required || message.minLength < 10) {
        failures.push("contact message field should be required with a modest minlength");
      }

      for (const control of [email, message]) {
        if (!control) {
          continue;
        }
        const describedBy = control.getAttribute("aria-describedby") ?? "";
        if (!describedBy.includes(`${control.id}-help`)) {
          failures.push(`${control.id} should be connected to visible help text`);
        }
      }

      if (!submit || !["Nachricht senden", "Nachricht wird gesendet"].includes(textOf(submit))) {
        failures.push("contact submit button should have a visible descriptive label");
      }
    }

    document.documentElement.style.scrollBehavior = previousHtmlScrollBehavior;
    document.body.style.scrollBehavior = previousBodyScrollBehavior;

    return failures;
  });
}

test.describe("WCAG 2.2 technical regression matrix", () => {
  test.describe.configure({ mode: "serial" });
  test.setTimeout(300_000);

  test("documents every WCAG 2.2 A/AA/AAA success criterion in a technical matrix", async ({}, testInfo) => {
    await testInfo.attach("wcag22-technical-matrix.json", {
      body: JSON.stringify(
        wcag22AaTechnicalMatrix.map((criterion) => ({
          criterion: criterion.criterion,
          title: criterion.title,
          level: criterion.level,
          status: criterion.status,
          technicalCoverage: criterion.technicalCoverage,
          wcagUrl: criterion.wcagUrl,
        })),
        null,
        2,
      ),
      contentType: "application/json",
    });

    expect(wcag22AaTechnicalMatrix).toHaveLength(86);
    expect(wcag22AaTechnicalMatrix.filter((criterion) => criterion.level === "AAA")).toHaveLength(
      31,
    );
    expect(wcag22AaTechnicalMatrix.find((criterion) => criterion.criterion === "1.4.6"))
      .toMatchObject({
        level: "AAA",
        status: "pass",
      });
  });

  test("has no axe WCAG 2.2 A/AA violations on checked routes", async ({ page }, testInfo) => {
    const routeFindings: RouteFinding[] = [];

    for (const route of coreRoutes) {
      await gotoReady(page, route);
      const results = await runAxe(page);
      routeFindings.push({
        path: route.path,
        failures: results.violations.map(
          (violation) =>
            `${violation.id} [${violation.impact ?? "unknown"}] ${violation.nodes
              .flatMap((node) => node.target)
              .slice(0, 3)
              .join(" | ")}`,
        ),
      });
    }

    await testInfo.attach("wcag22-aa-axe-route-findings.json", {
      body: JSON.stringify(routeFindings, null, 2),
      contentType: "application/json",
    });

    expect(routeFindings.flatMap((finding) => finding.failures)).toEqual([]);
  });

  test("records current exploratory WCAG 2.2 AAA axe findings without treating AAA as the release gate", async ({
    page,
  }, testInfo) => {
    test.skip(wcag22Scope === "aa", "AAA findings are exploratory and not part of the AA release gate.");

    const routeFindings: Array<{
      path: string;
      violations: Array<{
        id: string;
        impact: string | null;
        targets: string[];
      }>;
    }> = [];

    for (const route of coreRoutes) {
      await gotoReady(page, route);
      const results = await runAxe(page, ["wcag2aaa"]);
      routeFindings.push({
        path: route.path,
        violations: results.violations.map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          targets: violation.nodes.flatMap((node) => node.target).slice(0, 8),
        })),
      });
    }

    await testInfo.attach("wcag22-aaa-exploratory-axe-findings.json", {
      body: JSON.stringify(routeFindings, null, 2),
      contentType: "application/json",
    });

    const violationIds = [
      ...new Set(routeFindings.flatMap((finding) => finding.violations.map((violation) => violation.id))),
    ];

    expect(violationIds).toEqual([]);
  });

  test("passes route-level semantic, media, keyboard, focus and target-size checks", async ({
    page,
  }, testInfo) => {
    const routeFindings: RouteFinding[] = [];

    for (const route of coreRoutes) {
      await gotoReady(page, route);
      routeFindings.push({
        path: route.path,
        failures: await collectTechnicalFailures(page),
      });
    }

    await testInfo.attach("wcag22-aa-dom-route-findings.json", {
      body: JSON.stringify(routeFindings, null, 2),
      contentType: "application/json",
    });

    expect(routeFindings.flatMap((finding) => finding.failures)).toEqual([]);
  });

  test("passes reflow, orientation, reduced-motion and text-spacing checks", async ({
    page,
  }, testInfo) => {
    const routeFindings: RouteFinding[] = [];

    await page.emulateMedia({ reducedMotion: "reduce" });

    for (const width of [320, 390, 430, 900]) {
      await page.setViewportSize({ width, height: width === 900 ? 390 : 900 });

      for (const route of coreRoutes) {
        await gotoReady(page, route);
        const failures = await page.evaluate(() => {
          const localFailures: string[] = [];
          const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;

          if (overflow > 1) {
            localFailures.push(`horizontal overflow ${overflow}px`);
          }

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
          const spacingOverflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
          style.remove();

          if (spacingOverflow > 1) {
            localFailures.push(`text-spacing overflow ${spacingOverflow}px`);
          }

          return localFailures;
        });

        routeFindings.push({
          path: `${route.path} @ ${width}px`,
          failures,
        });
      }
    }

    await testInfo.attach("wcag22-aa-reflow-route-findings.json", {
      body: JSON.stringify(routeFindings, null, 2),
      contentType: "application/json",
    });

    expect(routeFindings.flatMap((finding) => finding.failures)).toEqual([]);
  });

  test("keeps representative routes usable at the 320px equivalent of 400 percent zoom", async ({
    page,
  }, testInfo) => {
    const representativeRoutes = coreRoutes.filter((route) =>
      ["/", "/suche", "/titel/mondfenster", "/kontakt"].includes(route.path),
    );
    const routeFindings: RouteFinding[] = [];

    await page.setViewportSize({ width: 320, height: 900 });

    for (const route of representativeRoutes) {
      await gotoReady(page, route);
      const failures = await page.evaluate(async () => {
        const localFailures: string[] = [];
        const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
        if (overflow > 1) {
          localFailures.push(`320px zoom-equivalent horizontal overflow ${overflow}px`);
        }

        const heading = document.querySelector("h1");
        if (!heading || heading.getBoundingClientRect().width <= 0) {
          const headingRect = heading?.getBoundingClientRect();
          localFailures.push(
            `320px zoom-equivalent hides the page heading (rect ${headingRect?.width ?? "missing"}x${headingRect?.height ?? "missing"}, display ${heading ? getComputedStyle(heading).display : "missing"})`,
          );
        }

        return localFailures;
      });

      routeFindings.push({
        path: `${route.path} @ 320px zoom equivalent`,
        failures: failures.map((failure) => `${route.path}: ${failure}`),
      });
    }

    await testInfo.attach("wcag22-aa-400-percent-zoom-findings.json", {
      body: JSON.stringify(routeFindings, null, 2),
      contentType: "application/json",
    });

    expect(routeFindings.flatMap((finding) => finding.failures)).toEqual([]);
  });

  test("keeps skip links, mobile menu state and Escape focus behavior accessible", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto("/");

    const focusedSkipLink = page.locator(".skip-link").first();
    for (let step = 0; step < 4; step += 1) {
      await page.keyboard.press("Tab");
      if (await focusedSkipLink.evaluate((element) => element === document.activeElement)) {
        break;
      }
    }
    await expect(focusedSkipLink).toBeFocused();
    await expect(focusedSkipLink).toBeVisible();

    const menuButton = page.getByRole("button", { name: "Menü öffnen" });
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
    await menuButton.click();
    await expect(page.getByRole("button", { name: "Menü schließen" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    const mobileNav = page.getByRole("navigation", { name: "Mobile Navigation" });
    await expect(mobileNav).toBeVisible();
    await mobileNav.getByRole("link", { name: "Suche" }).focus();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Menü öffnen" })).toBeFocused();
    await expect(mobileNav).toBeHidden();
  });
});
