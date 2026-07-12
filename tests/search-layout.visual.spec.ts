import { expect, test, type Page } from "@playwright/test";

const viewports = [
  { width: 320, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 1024, height: 768 },
  { width: 1280, height: 900 },
  { width: 1440, height: 1000 },
  { width: 1920, height: 1080 },
] as const;

const routes = [
  { id: "browse-default", path: "/suche" },
  { id: "browse-grid", path: "/suche?view=grid" },
  { id: "browse-list", path: "/suche?view=list" },
  { id: "arrival", path: "/suche?q=Arrival" },
] as const;

async function openSearch(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await expect(page.locator(".search-results-layout")).toBeVisible();
  await expect(page.locator(".search-results-overview h1")).toBeVisible();
}

test.describe("search layout geometry", () => {
  test("all required routes and viewports keep plausible rendered geometry", async ({ page }) => {
    test.setTimeout(180_000);

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      for (const route of routes) {
        await openSearch(page, route.path);

        const metrics = await page.evaluate(() => {
          const rect = (selector: string) =>
            document.querySelector<HTMLElement>(selector)?.getBoundingClientRect() ?? null;
          const layout = rect(".search-results-layout");
          const main = rect(".search-results-main");
          const overview = rect(".search-results-overview");
          const heading = rect(".search-results-overview h1");
          const sidebar = rect(".search-sidebar");
          const stack = rect(".search-results-stack");
          const firstGroup = rect(".search-results-group");
          const header = rect(".site-header");
          const footer = rect(".site-footer");

          return {
            blankBeforeHeading:
              overview && heading ? heading.top - overview.top : Number.POSITIVE_INFINITY,
            gapAfterOverview:
              overview && stack ? stack.top - overview.bottom : Number.POSITIVE_INFINITY,
            groupWidth: firstGroup?.width ?? 0,
            headerBottom: header?.bottom ?? 0,
            layoutWidth: layout?.width ?? 0,
            mainTop: main?.top ?? 0,
            mainWidth: main?.width ?? 0,
            overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            overviewTop: overview?.top ?? 0,
            overviewWidth: overview?.width ?? 0,
            sidebarBottom: sidebar?.bottom ?? 0,
            sidebarTop: sidebar?.top ?? 0,
            sidebarWidth: sidebar?.width ?? 0,
            stackWidth: stack?.width ?? 0,
            footerTop: footer?.top ?? Number.POSITIVE_INFINITY,
          };
        });

        expect(metrics.overflow, `${route.id} at ${viewport.width}px`).toBeLessThanOrEqual(1);

        if (viewport.width < 1024) {
          expect(metrics.mainWidth).toBeGreaterThanOrEqual(metrics.layoutWidth - 2);
          expect(metrics.sidebarWidth).toBeGreaterThanOrEqual(metrics.layoutWidth - 2);
          expect(metrics.sidebarTop).toBeLessThanOrEqual(metrics.mainTop);
        } else {
          expect(metrics.blankBeforeHeading).toBeLessThanOrEqual(180);
          expect(metrics.gapAfterOverview).toBeLessThanOrEqual(64);
          expect(metrics.mainWidth).toBeGreaterThan(metrics.sidebarWidth * 1.4);
          expect(metrics.overviewWidth).toBeGreaterThanOrEqual(metrics.mainWidth - 2);
          expect(metrics.stackWidth).toBeGreaterThanOrEqual(metrics.mainWidth - 2);
          expect(metrics.groupWidth).toBeGreaterThanOrEqual(metrics.mainWidth * 0.94);
          expect(Math.abs(metrics.overviewTop - metrics.sidebarTop)).toBeLessThanOrEqual(2);
          expect(metrics.sidebarTop).toBeGreaterThan(metrics.headerBottom);
          expect(metrics.sidebarBottom).toBeLessThanOrEqual(metrics.footerTop);
        }
      }
    }
  });

  test("wide grid views render multiple cards per row", async ({ page }) => {
    for (const width of [1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 });

      for (const path of ["/suche?view=grid", "/suche?q=Arrival&view=grid"]) {
        await openSearch(page, path);
        const firstGrid = page.locator('.result-grid[data-layout="grid"]').filter({ has: page.locator("li") }).first();
        const cards = firstGrid.locator(":scope > li");
        const count = await cards.count();
        expect(count).toBeGreaterThan(1);

        const boxes = await Promise.all(
          Array.from({ length: Math.min(count, 4) }, (_, index) => cards.nth(index).boundingBox()),
        );
        const firstRowCount = boxes.filter(
          (box) => box && boxes[0] && Math.abs(box.y - boxes[0].y) <= 2,
        ).length;
        expect(firstRowCount, `${path} at ${width}px`).toBeGreaterThan(1);
      }
    }
  });

  test("list views use the main-column width without clipping", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });

    for (const path of ["/suche?view=list", "/suche?q=Arrival&view=list"]) {
      await openSearch(page, path);
      const mainBox = await page.locator(".search-results-main").boundingBox();
      const cards = page.locator('.result-grid[data-layout="list"] .result-card');
      await expect(cards.first()).toBeVisible();

      for (const card of await cards.all()) {
        const box = await card.boundingBox();
        expect(box?.width ?? 0).toBeGreaterThan((mainBox?.width ?? 0) * 0.9);
      }
    }
  });
});

test.describe("search full-page visual baselines", () => {
  test.describe.configure({ mode: "serial" });

  const cases = [
    { id: "browse-list-mobile", path: "/suche?view=list", width: 390, height: 844 },
    { id: "browse-default-desktop", path: "/suche", width: 1440, height: 1000 },
    { id: "browse-grid-desktop", path: "/suche?view=grid", width: 1440, height: 1000 },
    { id: "browse-grid-wide", path: "/suche?view=grid", width: 1920, height: 1080 },
    { id: "browse-list-wide", path: "/suche?view=list", width: 1920, height: 1080 },
    { id: "arrival-grid-desktop", path: "/suche?q=Arrival&view=grid", width: 1440, height: 1000 },
    { id: "arrival-list-desktop", path: "/suche?q=Arrival&view=list", width: 1440, height: 1000 },
    { id: "arrival-grid-wide", path: "/suche?q=Arrival&view=grid", width: 1920, height: 1080 },
  ] as const;

  for (const visualCase of cases) {
    test(`${visualCase.id} matches its full-page baseline`, async ({ page }) => {
      test.setTimeout(180_000);
      await page.setViewportSize({ width: visualCase.width, height: visualCase.height });
      await openSearch(page, visualCase.path);

      await expect(page).toHaveScreenshot(`${visualCase.id}.png`, {
        animations: "disabled",
        fullPage: true,
        maxDiffPixelRatio: 0.01,
        mask: [page.locator(".poster-thumb-image")],
        timeout: 120_000,
      });
    });
  }
});
