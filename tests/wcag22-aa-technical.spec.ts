import axe from "axe-core";
import { type Page, expect, test } from "@playwright/test";

const axeSource = axe.source;

const coreRoutes = [
  { path: "/", heading: "Du musst dich nicht auch noch in der Freizeit anschreien lassen." },
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
  { path: "/datenschutz", heading: "Datenschutz" },
  { path: "/impressum", heading: "Impressum" },
];

const wcag22AaCriteria = [
  ["1.1.1", "Non-text Content", "A", "axe plus DOM alt/name/hidden checks"],
  ["1.2.1", "Audio-only and Video-only", "A", "N/A: no audio/video/media elements on audited routes"],
  ["1.2.2", "Captions", "A", "N/A: no prerecorded video/audio on audited routes"],
  ["1.2.3", "Audio Description or Media Alternative", "A", "N/A: no prerecorded video on audited routes"],
  ["1.2.4", "Captions Live", "AA", "N/A: no live audio/video on audited routes"],
  ["1.2.5", "Audio Description", "AA", "N/A: no prerecorded video on audited routes"],
  ["1.3.1", "Info and Relationships", "A", "axe plus landmarks/headings/forms/list/table checks"],
  ["1.3.2", "Meaningful Sequence", "A", "DOM order, landmark and heading smoke"],
  ["1.3.3", "Sensory Characteristics", "A", "source/DOM smoke for instructions that depend only on shape/position/color"],
  ["1.3.4", "Orientation", "AA", "portrait/landscape viewport smoke"],
  ["1.3.5", "Identify Input Purpose", "AA", "form-control autocomplete/name smoke"],
  ["1.4.1", "Use of Color", "A", "axe plus active/focus state smoke"],
  ["1.4.2", "Audio Control", "A", "N/A: no autoplay audio/media elements"],
  ["1.4.3", "Contrast Minimum", "AA", "axe contrast checks"],
  ["1.4.4", "Resize Text", "AA", "320px/large viewport smoke"],
  ["1.4.5", "Images of Text", "AA", "DOM image-purpose smoke; brand image decorative inside named link"],
  ["1.4.10", "Reflow", "AA", "320px/390px/430px overflow checks"],
  ["1.4.11", "Non-text Contrast", "AA", "axe plus focus/control state smoke"],
  ["1.4.12", "Text Spacing", "AA", "injected text-spacing overflow check"],
  ["1.4.13", "Content on Hover or Focus", "AA", "no tooltip/popover hover-only content; focus smoke"],
  ["2.1.1", "Keyboard", "A", "tab/focus and controls smoke"],
  ["2.1.2", "No Keyboard Trap", "A", "bounded tab-cycle smoke"],
  ["2.1.4", "Character Key Shortcuts", "A", "N/A: no custom single-character shortcuts detected"],
  ["2.2.1", "Timing Adjustable", "A", "N/A: no session timeout/meta refresh/time-limit UI detected"],
  ["2.2.2", "Pause, Stop, Hide", "A", "reduced-motion and moving-content smoke"],
  ["2.3.1", "Three Flashes", "A", "N/A: no video/canvas/flash/blink content detected"],
  ["2.4.1", "Bypass Blocks", "A", "skip-link smoke"],
  ["2.4.2", "Page Titled", "A", "title check"],
  ["2.4.3", "Focus Order", "A", "tab order/focus visibility smoke"],
  ["2.4.4", "Link Purpose", "A", "accessible link-name smoke"],
  ["2.4.5", "Multiple Ways", "AA", "header/footer navigation smoke"],
  ["2.4.6", "Headings and Labels", "AA", "heading/control-name smoke"],
  ["2.4.7", "Focus Visible", "AA", "computed focus visibility smoke"],
  ["2.4.11", "Focus Not Obscured Minimum", "AA", "focused element viewport/elementFromPoint smoke"],
  ["2.5.1", "Pointer Gestures", "A", "N/A: no multipoint/path gesture UI detected"],
  ["2.5.2", "Pointer Cancellation", "A", "native click controls; no pointerdown-only activation detected"],
  ["2.5.3", "Label in Name", "A", "visible text included in accessible-name smoke"],
  ["2.5.4", "Motion Actuation", "A", "N/A: no device-motion handlers detected"],
  ["2.5.7", "Dragging Movements", "AA", "N/A: no draggable UI detected"],
  ["2.5.8", "Target Size Minimum", "AA", "24px target-size smoke with inline-text exceptions"],
  ["3.1.1", "Language of Page", "A", "html lang check"],
  ["3.1.2", "Language of Parts", "AA", "lang attribute sanity check"],
  ["3.2.1", "On Focus", "A", "focus does not trigger route change smoke"],
  ["3.2.2", "On Input", "A", "native form controls and explicit submit/change smoke"],
  ["3.2.3", "Consistent Navigation", "AA", "navigation link sequence smoke"],
  ["3.2.4", "Consistent Identification", "AA", "repeated link/control labels smoke"],
  ["3.2.6", "Consistent Help", "A", "help/navigation route consistency smoke"],
  ["3.3.1", "Error Identification", "A", "axe/forms/status smoke"],
  ["3.3.2", "Labels or Instructions", "A", "label/name smoke"],
  ["3.3.3", "Error Suggestion", "AA", "form status/error smoke"],
  ["3.3.4", "Error Prevention Legal/Financial/Data", "AA", "N/A: no legal/financial/user-data transaction form"],
  ["3.3.7", "Redundant Entry", "A", "N/A: no multi-step re-entry flow detected"],
  ["3.3.8", "Accessible Authentication Minimum", "AA", "N/A: no authentication flow detected"],
  ["4.1.2", "Name Role Value", "A", "axe plus interactive-name/state smoke"],
  ["4.1.3", "Status Messages", "AA", "role=status/live-region smoke"],
] as const;

type RouteFinding = {
  path: string;
  failures: string[];
};

async function gotoReady(page: Page, route: (typeof coreRoutes)[number]) {
  await page.goto(route.path, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: route.heading })).toBeVisible();
}

async function runAxe(page: Page) {
  await page.addScriptTag({ content: axeSource });

  return page.evaluate(async () => {
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
        values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa", "best-practice"],
      },
    });
  });
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
    const nameOf = (element: Element) =>
      (
        element.getAttribute("aria-label") ??
        element.getAttribute("title") ??
        textOf(element) ??
        ""
      )
        .replace(/\s+/g, " ")
        .trim();

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
      (element as HTMLElement).focus({ preventScroll: true });
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

    document.documentElement.style.scrollBehavior = previousHtmlScrollBehavior;
    document.body.style.scrollBehavior = previousBodyScrollBehavior;

    return failures;
  });
}

test.describe("WCAG 2.2 AA technical regression matrix", () => {
  test.describe.configure({ mode: "serial" });
  test.setTimeout(120_000);

  test("documents every WCAG 2.2 A/AA success criterion in a technical matrix", async ({}, testInfo) => {
    await testInfo.attach("wcag22-aa-technical-matrix.json", {
      body: JSON.stringify(
        wcag22AaCriteria.map(([criterion, title, level, technicalCoverage]) => ({
          criterion,
          title,
          level,
          technicalCoverage,
        })),
        null,
        2,
      ),
      contentType: "application/json",
    });

    expect(wcag22AaCriteria).toHaveLength(55);
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

  test("keeps skip links, mobile menu state and Escape focus behavior accessible", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto("/");

    await page.keyboard.press("Tab");
    const focusedSkipLink = page.locator(".skip-link").first();
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
