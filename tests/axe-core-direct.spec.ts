import axe from "axe-core";
import { type Page, expect, test } from "@playwright/test";

const axeSource = axe.source;

type AxeImpact = "critical" | "serious" | "moderate" | "minor";

const emptyImpactCounts: Record<AxeImpact, number> = {
  critical: 0,
  serious: 0,
  moderate: 0,
  minor: 0,
};

function summarizeViolations(
  violations: Array<{ impact: AxeImpact | null }>,
) {
  const impactCounts = { ...emptyImpactCounts };

  for (const violation of violations) {
    const impact = violation.impact;

    if (impact) {
      impactCounts[impact] += 1;
    }
  }

  return impactCounts;
}

function formatViolationReport(
  routeLabel: string,
  violations: Array<{
    id: string;
    impact: AxeImpact | null;
    nodes: Array<{ target: string[] }>;
  }>,
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
    `Direkter axe-core-Fund auf ${routeLabel}:`,
    `critical=${impactCounts.critical}, serious=${impactCounts.serious}, moderate=${impactCounts.moderate}, minor=${impactCounts.minor}`,
    details,
  ]
    .filter(Boolean)
    .join("\n");
}

async function injectAxeCore(page: Page) {
  await page.addScriptTag({ content: axeSource });
}

async function expectNoDirectAxeViolations(
  page: Page,
  path: string,
  routeLabel: string,
  readyCheck?: () => Promise<void>,
) {
  await page.goto(path);
  await readyCheck?.();
  await injectAxeCore(page);

  const results = await page.evaluate(async () => {
    const axe = (window as Window & {
      axe: {
        run: (
          context?: Document,
          options?: Record<string, unknown>,
        ) => Promise<{
          violations: Array<{
            id: string;
            impact: "critical" | "serious" | "moderate" | "minor" | null;
            nodes: Array<{ target: string[] }>;
          }>;
          incomplete: Array<{
            id: string;
            impact: "critical" | "serious" | "moderate" | "minor" | null;
            nodes: Array<{ target: string[] }>;
          }>;
        }>;
      };
    }).axe;

    return axe.run(document, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa", "best-practice"],
      },
      resultTypes: ["violations", "incomplete"],
    });
  });

  const impactCounts = summarizeViolations(results.violations);

  await test.info().attach(`axe-core-direct-${routeLabel}.json`, {
    body: JSON.stringify(
      {
        path,
        impactCounts,
        violations: results.violations,
        incomplete: results.incomplete.map((item) => ({
          id: item.id,
          impact: item.impact,
          nodes: item.nodes.map((node) => node.target),
        })),
      },
      null,
      2,
    ),
    contentType: "application/json",
  });

  expect(results.violations, formatViolationReport(routeLabel, results.violations)).toEqual([]);
}

test("direct axe-core scan stays clean on home", async ({ page }) => {
  await expectNoDirectAxeViolations(page, "/", "home", async () => {
    await expect(
      page.getByRole("heading", {
        name: "Du musst dich nicht auch noch in der Freizeit anschreien lassen.",
      }),
    ).toBeVisible();
  });
});

test("direct axe-core scan stays clean on search browse", async ({ page }) => {
  await expectNoDirectAxeViolations(page, "/suche", "search-browse", async () => {
    await expect(page.getByRole("heading", { name: "Noch kein Titel im Kopf?" })).toBeVisible();
  });
});

test("direct axe-core scan stays clean on search query", async ({ page }) => {
  await expectNoDirectAxeViolations(page, "/suche?q=Arrival", "search-arrival", async () => {
    await expect(page.getByRole("heading", { name: 'Treffer zu „Arrival“' })).toBeVisible();
  });
});

test("direct axe-core scan stays clean on detail page", async ({ page }) => {
  await expectNoDirectAxeViolations(page, "/titel/mondfenster", "detail-mondfenster", async () => {
    await expect(page.getByRole("heading", { name: "Mondfenster" })).toBeVisible();
  });
});
