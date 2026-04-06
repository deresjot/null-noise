import {
  CatalogStoreUnavailableError,
  getPersistedLocalTitleLookupByExternalIds,
  getPersistedTitleBySlug,
  listPersistedTitleRecords,
} from "@/lib/catalog-db";
import { filterTitles } from "@/lib/search";
import type { SearchFilters, TitleRecord } from "@/lib/types";

export type CatalogQueryState<T> = {
  data: T;
  unavailable: boolean;
};

async function safeCatalogQuery<T>(
  loader: () => Promise<T>,
  fallback: T,
): Promise<CatalogQueryState<T>> {
  try {
    return {
      data: await loader(),
      unavailable: false,
    };
  } catch (error) {
    if (error instanceof CatalogStoreUnavailableError) {
      return {
        data: fallback,
        unavailable: true,
      };
    }

    throw error;
  }
}

export async function getAllTitlesState(): Promise<CatalogQueryState<TitleRecord[]>> {
  return safeCatalogQuery(() => listPersistedTitleRecords(), []);
}

export async function getFeaturedTitlesState(): Promise<CatalogQueryState<TitleRecord[]>> {
  return safeCatalogQuery(async () => {
    const titles = await listPersistedTitleRecords();
    return titles.filter((title) => title.external.externalSource !== "tmdb_seed").slice(0, 3);
  }, []);
}

export async function searchCatalogState(
  filters: SearchFilters,
): Promise<CatalogQueryState<TitleRecord[]>> {
  return safeCatalogQuery(async () => filterTitles(await listPersistedTitleRecords(), filters), []);
}

export async function getTitleBySlugState(
  slug: string,
): Promise<CatalogQueryState<TitleRecord | undefined>> {
  return safeCatalogQuery(() => getPersistedTitleBySlug(slug), undefined);
}

export async function getLocalTitleLookupByExternalIdsState(
  items: Array<{ externalSource: string; sourceId: string | number }>,
): Promise<CatalogQueryState<Record<string, string>>> {
  return safeCatalogQuery(() => getPersistedLocalTitleLookupByExternalIds(items), {});
}

export async function getAllTitles(): Promise<TitleRecord[]> {
  return (await getAllTitlesState()).data;
}

export async function getFeaturedTitles(): Promise<TitleRecord[]> {
  return (await getFeaturedTitlesState()).data;
}

export async function searchCatalog(filters: SearchFilters): Promise<TitleRecord[]> {
  return (await searchCatalogState(filters)).data;
}

export async function getTitleBySlug(slug: string): Promise<TitleRecord | undefined> {
  return (await getTitleBySlugState(slug)).data;
}

export async function getLocalTitleLookupByExternalIds(
  items: Array<{ externalSource: string; sourceId: string | number }>,
): Promise<Record<string, string>> {
  return (await getLocalTitleLookupByExternalIdsState(items)).data;
}
