import { createTitleExternalLookupKey } from "@/lib/local-title-shared";
import {
  browseTmdbMetadata,
  searchTmdbMetadata,
  type MetadataSpikeBrowseState,
  type MetadataSpikeSearchState,
  type MetadataSpikeTitle,
} from "@/lib/metadata-spike";
import {
  getLocalTitleLookupByExternalIdsState,
  searchCatalogState,
} from "@/lib/queries";
import { arePublicWritesEnabled } from "@/lib/runtime-config";
import { parseSearchFilters } from "@/lib/search";
import type { SearchFilters, TitleRecord } from "@/lib/types";

type SearchPageParams = Record<string, string | string[] | undefined>;

export type SearchStateTone = "neutral" | "success" | "warning" | "error";

export type SearchNotice = {
  title: string;
  text: string;
  tone: SearchStateTone;
} | null;

export type ResultDisplayMode = "list" | "grid";

export interface SearchPageState {
  browseMetadataState: MetadataSpikeBrowseState | null;
  browseMix: string;
  browseRefreshTriggered: boolean;
  defaultBrowseMix: string;
  deleteStatus: SearchNotice;
  externalResults: MetadataSpikeTitle[];
  filters: SearchFilters;
  importStatus: SearchNotice;
  localCatalogUnavailable: boolean;
  localResults: TitleRecord[];
  localTitleByExternalKey: Record<string, string>;
  localTitleLookupUnavailable: boolean;
  metadataState: MetadataSpikeSearchState | null;
  nextBrowseMix: string;
  resultDisplayMode: ResultDisplayMode;
  routeKey: string;
  showBrowseState: boolean;
  writesEnabled: boolean;
}

function takeFirst(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function parseResultDisplayMode(value: string | string[] | undefined): ResultDisplayMode {
  const candidate = takeFirst(value).trim().toLowerCase();
  return candidate === "grid" ? "grid" : "list";
}

function createStableBrowseMix(filters: SearchFilters): string {
  return [
    "stable",
    filters.tone,
    filters.kind,
    filters.avoidPeaks ? "avoid-peaks" : "allow-peaks",
    filters.avoidDensity ? "avoid-density" : "allow-density",
  ].join(":");
}

function getImportStatus(value: string | string[] | undefined): SearchNotice {
  const status = Array.isArray(value) ? value[0] : value;

  if (status === "limited") {
    return {
      title: "Das lokale Anlegen bremst gerade",
      text: "Die Treffer bleiben stehen. Ein neuer Versuch geht später wieder.",
      tone: "warning",
    };
  }

  if (status === "unavailable") {
    return {
      title: "Lokales Anlegen ging gerade nicht",
      text: "Der Titel bleibt sichtbar. Ein zweiter Versuch sollte später wieder gehen.",
      tone: "warning",
    };
  }

  if (status === "inactive") {
    return {
      title: "Lokales Anlegen bleibt hier zu",
      text: "Lesen geht schon. Eine eigene Seite anzulegen geht in dieser Instanz gerade nicht.",
      tone: "warning",
    };
  }

  return null;
}

function getDeleteStatus(value: string | string[] | undefined): SearchNotice {
  const status = Array.isArray(value) ? value[0] : value;

  if (status === "success") {
    return {
      title: "Lokaler Stand entfernt",
      text: "Der Titel ist aus null-noise raus. Bei Bedarf lässt er sich später neu anlegen.",
      tone: "success",
    };
  }

  if (status === "inactive") {
    return {
      title: "Löschen bleibt hier gerade zu",
      text: "Diese Instanz ist im Moment nur lesend unterwegs.",
      tone: "warning",
    };
  }

  if (status === "missing") {
    return {
      title: "Der lokale Stand war schon weg",
      text: "Es gibt dazu gerade nichts mehr zu löschen.",
      tone: "neutral",
    };
  }

  if (status === "error") {
    return {
      title: "Löschen ging gerade nicht",
      text: "Versuch es in einem Moment noch einmal.",
      tone: "error",
    };
  }

  return null;
}

function buildRouteKey(params: SearchPageParams): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const entry of value) {
        searchParams.append(key, entry);
      }
      continue;
    }

    if (value !== undefined) {
      searchParams.set(key, value);
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `/suche?${queryString}` : "/suche";
}

export async function createSearchPageState(params: SearchPageParams): Promise<SearchPageState> {
  const filters = parseSearchFilters(params);
  const resultDisplayMode = parseResultDisplayMode(params.view);
  const showBrowseState = !filters.q;
  const defaultBrowseMix = createStableBrowseMix(filters);
  const browseMix = takeFirst(params.mix).trim().slice(0, 64) || defaultBrowseMix;
  const browseRefreshTriggered = showBrowseState && browseMix !== defaultBrowseMix;
  const importStatus = getImportStatus(params.import);
  const deleteStatus = getDeleteStatus(params.deleted);
  const {
    data: localResults,
    unavailable: localCatalogUnavailable,
  } = await searchCatalogState(filters);
  const writesEnabled = arePublicWritesEnabled();
  const browseMetadataState = showBrowseState ? await browseTmdbMetadata(filters, browseMix) : null;
  const metadataState = filters.q
    ? await searchTmdbMetadata(filters.q, {}, {
        avoidDensity: filters.avoidDensity,
        avoidPeaks: filters.avoidPeaks,
      })
    : null;
  const visibleLocalExternalKeys = new Set(
    localResults
      .filter((title) => title.external.externalSource !== "tmdb_seed")
      .map((title) =>
        createTitleExternalLookupKey(title.external.externalSource, title.external.externalSourceId),
      ),
  );
  const externalResults =
    metadataState?.kind === "success"
      ? metadataState.items
          .filter((item) => filters.kind === "all" || item.mediaType === filters.kind)
          .filter(
            (item) =>
              !visibleLocalExternalKeys.has(
                createTitleExternalLookupKey(item.externalSource, item.sourceId),
              ),
          )
      : [];
  const showExternalResults = externalResults.length > 0;
  const {
    data: localTitleByExternalKey,
    unavailable: localTitleLookupUnavailable,
  } = showExternalResults
    ? await getLocalTitleLookupByExternalIdsState(externalResults)
    : { data: {}, unavailable: false };

  return {
    browseMetadataState,
    browseMix,
    browseRefreshTriggered,
    defaultBrowseMix,
    deleteStatus,
    externalResults,
    filters,
    importStatus,
    localCatalogUnavailable,
    localResults,
    localTitleByExternalKey,
    localTitleLookupUnavailable,
    metadataState,
    nextBrowseMix: crypto.randomUUID().slice(0, 8),
    resultDisplayMode,
    routeKey: buildRouteKey(params),
    showBrowseState,
    writesEnabled,
  };
}
