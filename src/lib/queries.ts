import { createTitleExternalLookupKey, listStoredLocalTitleSeeds } from "@/lib/local-titles";
import { mockTitleSeeds } from "@/lib/mock-data";
import { buildTitleRecordFromSeed, getStoredRatingsForTitle, listStoredRatings } from "@/lib/ratings";
import { filterTitles } from "@/lib/search";
import type { SearchFilters, TitleRecord } from "@/lib/types";

async function getHydratedTitles(): Promise<TitleRecord[]> {
  let storedRatings = [] as Awaited<ReturnType<typeof listStoredRatings>>;
  let storedLocalTitleSeeds = [] as Awaited<ReturnType<typeof listStoredLocalTitleSeeds>>;

  try {
    storedRatings = await listStoredRatings();
  } catch {
    storedRatings = [];
  }

  try {
    storedLocalTitleSeeds = await listStoredLocalTitleSeeds();
  } catch {
    storedLocalTitleSeeds = [];
  }

  return [...mockTitleSeeds, ...storedLocalTitleSeeds].map((seed) =>
    buildTitleRecordFromSeed(
      seed,
      getStoredRatingsForTitle(storedRatings, seed.external.slug),
    ),
  );
}

export async function getAllTitles(): Promise<TitleRecord[]> {
  return getHydratedTitles();
}

export async function getFeaturedTitles(): Promise<TitleRecord[]> {
  return (await getHydratedTitles()).slice(0, 3);
}

export async function searchCatalog(filters: SearchFilters): Promise<TitleRecord[]> {
  return filterTitles(await getHydratedTitles(), filters);
}

export async function getTitleBySlug(slug: string): Promise<TitleRecord | undefined> {
  return (await getHydratedTitles()).find((title) => title.external.slug === slug);
}

export async function getLocalTitleLookupByExternalIds(
  items: Array<{ externalSource: string; sourceId: string | number }>,
): Promise<Record<string, string>> {
  if (!items.length) {
    return {};
  }

  const requestedKeys = new Set(
    items.map((item) => createTitleExternalLookupKey(item.externalSource, item.sourceId)),
  );

  return Object.fromEntries(
    (await getHydratedTitles())
      .map((title) => [
        createTitleExternalLookupKey(
          title.external.externalSource,
          title.external.externalSourceId,
        ),
        title.external.slug,
      ] as const)
      .filter(([key]) => requestedKeys.has(key)),
  );
}
