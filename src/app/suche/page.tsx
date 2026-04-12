import Link from "next/link";

import { ExternalResultList } from "@/components/external-result-list";
import { ResultList } from "@/components/result-list";
import { SearchLocalShelf } from "@/components/search-local-shelf";
import { SearchForm } from "@/components/search-form";
import { StatusPanel } from "@/components/status-panel";
import { createTitleExternalLookupKey } from "@/lib/local-titles";
import { browseTmdbMetadata, searchTmdbMetadata } from "@/lib/metadata-spike";
import {
  getLocalTitleLookupByExternalIdsState,
  searchCatalogState,
} from "@/lib/queries";
import { arePublicWritesEnabled } from "@/lib/runtime-config";
import { parseSearchFilters } from "@/lib/search";
import type { SearchFilters } from "@/lib/types";

type SearchPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type SearchStateTone = "neutral" | "success" | "warning" | "error";

type SearchNotice = {
  title: string;
  text: string;
  tone: SearchStateTone;
} | null;

function buildSearchPath(
  filters: SearchFilters,
  extras: Record<string, string | undefined> = {},
): string {
  const searchParams = new URLSearchParams();

  if (filters.q) {
    searchParams.set("q", filters.q);
  }

  if (filters.tone !== "all") {
    searchParams.set("tone", filters.tone);
  }

  if (filters.kind !== "all") {
    searchParams.set("kind", filters.kind);
  }

  if (filters.avoidPeaks) {
    searchParams.set("avoidPeaks", "true");
  }

  if (filters.avoidDensity) {
    searchParams.set("avoidDensity", "true");
  }

  for (const [key, value] of Object.entries(extras)) {
    if (value) {
      searchParams.set(key, value);
    }
  }

  const queryString = searchParams.toString();

  return queryString ? `/suche?${queryString}` : "/suche";
}

function formatCombinedResultCount(localCount: number, externalCount: number): string {
  const parts: string[] = [];

  if (localCount > 0) {
    parts.push(`${localCount} ${localCount === 1 ? "eigene Seite" : "eigene Seiten"}`);
  }

  if (externalCount > 0) {
    parts.push(`${externalCount} ${externalCount === 1 ? "weiterer Titel" : "weitere Titel"}`);
  }

  return parts.join(" · ");
}

function takeFirst(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function getBrowseOrientation(filters: SearchFilters): string | null {
  if (filters.tone === "calm" || filters.avoidPeaks || filters.avoidDensity) {
    return "Der Rahmen bleibt hier bewusst vorsichtiger und ruhiger.";
  }

  if (filters.tone === "intense") {
    return "Hier darf es dichter werden. Wenn etwas kippt, kannst du jederzeit enger filtern.";
  }

  return "Heute eher ruhig? Dann fang links an. Darf es dichter sein, geh weiter nach rechts.";
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

function getAvoidanceStatusLine(filters: SearchFilters): string | null {
  if (filters.avoidPeaks && filters.avoidDensity) {
    return "Aktiv: harte Spitzen raus, dichte Klangflächen raus.";
  }

  if (filters.avoidPeaks) {
    return "Aktiv: harte Spitzen raus.";
  }

  if (filters.avoidDensity) {
    return "Aktiv: dichte Klangflächen raus.";
  }

  return null;
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

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const filters = parseSearchFilters(resolvedSearchParams);
  const showBrowseState = !filters.q;
  const defaultBrowseMix = createStableBrowseMix(filters);
  const browseMix = takeFirst(resolvedSearchParams.mix).trim().slice(0, 64) || defaultBrowseMix;
  const nextBrowseMix = crypto.randomUUID().slice(0, 8);
  const browseRefreshTriggered = showBrowseState && browseMix !== defaultBrowseMix;
  const importStatus = getImportStatus(resolvedSearchParams.import);
  const deleteStatus = getDeleteStatus(resolvedSearchParams.deleted);
  const {
    data: localResults,
    unavailable: localCatalogUnavailable,
  } = await searchCatalogState(filters);
  const writesEnabled = arePublicWritesEnabled();
  const browseMetadataState = showBrowseState ? await browseTmdbMetadata(filters, browseMix) : null;
  const shouldLoadExternalResults = Boolean(filters.q);
  const metadataState = shouldLoadExternalResults
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
  const localResultCount = localResults.length;
  const externalResultCount = externalResults.length;
  const showExternalResults = externalResultCount > 0;
  const showLocalResults = localResultCount > 0;
  const showExternalGroupHeader = showLocalResults;
  const {
    data: localTitleByExternalKey,
    unavailable: localTitleLookupUnavailable,
  } = showExternalResults
    ? await getLocalTitleLookupByExternalIdsState(externalResults)
    : { data: {}, unavailable: false };
  const showExternalEmptyAfterKindFilter =
    metadataState?.kind === "success" && metadataState.items.length > 0 && !externalResults.length;
  const showExternalUnavailableNote =
    metadataState?.kind === "disabled" ||
    (metadataState?.kind === "error" && metadataState.reason === "misconfigured");
  const resultsHeading = filters.q ? `Treffer zu „${filters.q}“` : "Titel suchen";
  const resultsCountLine =
    showLocalResults || showExternalResults
      ? formatCombinedResultCount(localResultCount, externalResultCount)
      : filters.q
        ? "Gerade nichts da"
        : "Noch keine Suche";
  const searchReturnPath = buildSearchPath(filters);
  const browseSections = browseMetadataState?.kind === "success" ? browseMetadataState.sections : [];
  const browseRefreshPath = `${buildSearchPath(filters, { mix: nextBrowseMix })}#results-heading`;
  const browseSuggestionCount = browseSections.reduce(
    (total, section) => total + section.items.length,
    0,
  );
  const showBrowseRefresh = browseMetadataState?.kind === "success" && browseSuggestionCount > 0;
  const browseOrientation = getBrowseOrientation(filters);
  const avoidanceStatusLine = getAvoidanceStatusLine(filters);
  let searchStateTitle = "";
  let searchStateText = "";
  let searchStateTone: SearchStateTone = "neutral";

  if (!showLocalResults && !showExternalResults) {
    if (localCatalogUnavailable) {
      searchStateTitle = "Der lokale Stand fehlt gerade";
      searchStateText = "Die Suche läuft weiter, nur eben ohne eigene Seiten.";
      searchStateTone = "warning";
    } else if (showExternalEmptyAfterKindFilter) {
      searchStateTitle = "Gefunden, nur im anderen Format";
      searchStateText = "Nimm den Formatfilter raus, dann taucht wieder etwas auf.";
      searchStateTone = "warning";
    } else if (metadataState?.kind === "disabled") {
      searchStateTitle = "Weitere Treffer fehlen gerade";
      searchStateText = "Dann bleibt im Moment nur, was lokal schon da ist.";
      searchStateTone = "warning";
    } else if (metadataState?.kind === "error") {
      if (metadataState.reason === "misconfigured") {
        searchStateTitle = "Weitere Treffer fehlen gerade";
        searchStateText = "Dann bleibt im Moment nur, was lokal schon da ist.";
        searchStateTone = "warning";
      } else {
        searchStateTitle = "Die Suche hängt gerade kurz";
        searchStateText = metadataState.message;
        searchStateTone = "error";
      }
    } else if (metadataState?.kind === "empty") {
      searchStateTitle = "Gerade nichts Passendes";
      searchStateText = "Weder im vorhandenen Stand noch darüber hinaus.";
      searchStateTone = "neutral";
    } else if (filters.q) {
      searchStateTitle = "Gerade kein Treffer";
      searchStateText = "Ein anderer Titel oder ein kürzerer Suchbegriff hilft meist schon.";
      searchStateTone = "neutral";
    } else {
      searchStateTitle = "Noch keine Suche";
      searchStateText = "Such erst nach einem Film oder einer Serie. Danach wird es hier genauer.";
      searchStateTone = "neutral";
    }
  }

  return (
    <section className="section-stack search-results-page">
      {deleteStatus ? (
        <StatusPanel
          title={deleteStatus.title}
          text={deleteStatus.text}
          tone={deleteStatus.tone}
        />
      ) : null}

      {importStatus ? (
        <StatusPanel
          title={importStatus.title}
          text={importStatus.text}
          tone={importStatus.tone}
        />
      ) : null}

      <section className="search-results-layout">
        <div className="search-results-main">
          {showBrowseState ? (
            <section className="search-browse-state" aria-labelledby="results-heading">
              <header className="search-results-overview search-browse-intro">
                <div className="search-results-group-header search-results-group-header-actions">
                  <div className="search-results-group-copy">
                    <p className="eyebrow">Browse</p>
                    <h1 id="results-heading">Noch kein Titel im Kopf?</h1>
                    <p className="field-note search-results-context">
                      Kein Titel im Kopf? Dann fang erst grob nach Reizlage an. Die Auswahl bleibt
                      im selben Rahmen, statt wild zu springen.
                    </p>
                    {browseOrientation ? (
                      <p className="field-note search-results-context search-browse-orientation">
                        {browseOrientation}
                      </p>
                    ) : null}
                    {avoidanceStatusLine ? (
                      <p className="search-filter-note" role="status">{avoidanceStatusLine}</p>
                    ) : null}
                  </div>
                  <div className="search-results-group-actions">
                    {showBrowseRefresh ? (
                      <Link className="secondary-button-link search-browse-refresh" href={browseRefreshPath}>
                        Andere zeigen
                      </Link>
                    ) : null}
                    {browseRefreshTriggered ? (
                      <p className="field-note search-browse-refresh-note" role="status">
                        Neue Auswahl, gleicher Rahmen.
                      </p>
                    ) : null}
                  </div>
                </div>
              </header>

              <div className="search-results-stack">
                <SearchLocalShelf showWhenEmpty />
                {browseMetadataState?.kind === "success" && browseSuggestionCount ? (
                  browseSections.map((section) => (
                    <section
                      key={section.id}
                      className="search-results-group"
                      aria-labelledby={`browse-${section.id}-heading`}
                    >
                      <header className="search-results-group-header">
                        <p className="eyebrow">Externe Titelseiten</p>
                        <h2 id={`browse-${section.id}-heading`}>{section.title}</h2>
                        <p className="field-note">
                          {section.items.length} {section.items.length === 1 ? "Titel" : "Titel"} zum Start.{" "}
                          {section.description}
                        </p>
                      </header>
                      {section.items.length ? (
                        <ExternalResultList
                          items={section.items}
                          localTitleByExternalKey={{}}
                          query=""
                          writesEnabled={writesEnabled && !localTitleLookupUnavailable}
                        />
                      ) : (
                        <StatusPanel
                          title="Hier blieb gerade nichts Greifbares übrig"
                          text="Mit dem aktuellen Filterstand gibt es in dieser Richtung gerade nichts Sauberes zu zeigen."
                          tone="neutral"
                        />
                      )}
                    </section>
                  ))
                ) : (
                  <StatusPanel
                    title={
                      browseMetadataState?.kind === "disabled"
                        ? "Externe Titelseiten fehlen gerade"
                        : browseMetadataState?.kind === "error"
                          ? "Die Vorschläge hängen gerade kurz"
                          : "Mit diesem Profil blieb extern gerade nichts übrig"
                    }
                    text={
                      browseMetadataState?.kind === "disabled" || browseMetadataState?.kind === "error"
                        ? browseMetadataState.message
                        : "Nimm einen Filter raus oder such direkt nach einem Titel."
                    }
                    tone={
                      browseMetadataState?.kind === "disabled" || browseMetadataState?.kind === "error"
                        ? "warning"
                        : "neutral"
                    }
                  />
                )}
              </div>
            </section>
          ) : (
            <>
              <header className="search-results-overview">
                <p className="eyebrow">Treffer</p>
                <h1 id="results-heading">{resultsHeading}</h1>
                <p className="search-results-count">{resultsCountLine}</p>
                <p className="field-note search-results-context">
                  Erst grob lesen, dann entscheiden.
                </p>
                {avoidanceStatusLine ? <p className="search-filter-note" role="status">{avoidanceStatusLine}</p> : null}
              </header>

              <section className="search-results-stack">
                <SearchLocalShelf />
                {showLocalResults ? (
                  <section className="search-results-group" aria-labelledby="local-results-heading">
                    <header className="search-results-group-header">
                      <p className="eyebrow">Eigener Stand</p>
                      <h2 id="local-results-heading">Schon mit eigenem Stand</h2>
                      <p className="field-note">Hier trägt die Einordnung schon etwas mehr.</p>
                    </header>
                    <ResultList
                      allowDelete={writesEnabled}
                      emptyTitle="Hier liegt gerade nichts Passendes"
                      emptyText="Ein anderer Suchbegriff oder ein lockerer Filter hilft meistens."
                      returnPath={searchReturnPath}
                      titles={localResults}
                    />
                  </section>
                ) : null}

                {showExternalResults ? (
                  <section
                    className={`search-results-group ${showExternalGroupHeader ? "" : "search-results-group-primary"}`.trim()}
                    aria-labelledby={showExternalGroupHeader ? "external-results-heading" : undefined}
                  >
                    <header className="search-results-group-header">
                      <p className="eyebrow">Weitere Titel</p>
                      <h2 id="external-results-heading">Noch ohne eigenen Stand</h2>
                      <p className="field-note">Hier ist es erst eine grobe Lesart.</p>
                    </header>
                    <ExternalResultList
                      items={externalResults}
                      localTitleByExternalKey={localTitleByExternalKey}
                      query={filters.q}
                      writesEnabled={writesEnabled && !localTitleLookupUnavailable}
                    />
                  </section>
                ) : null}

                {!showLocalResults && !showExternalResults ? (
                  <StatusPanel
                    title={searchStateTitle}
                    text={searchStateText}
                    tone={searchStateTone}
                  />
                ) : null}

                <div className="search-results-notes">
                  {localCatalogUnavailable ? (
                    <StatusPanel
                      title="Der lokale Stand fehlt gerade"
                      text="Profilierte Treffer konnten gerade nicht geladen werden. Der Rest der Suche bleibt davon getrennt nutzbar."
                      tone="warning"
                    />
                  ) : null}
                  {showExternalUnavailableNote ? (
                    <p className="field-note">Weitere Treffer sind gerade nicht erreichbar.</p>
                  ) : null}
                </div>
              </section>
            </>
          )}
        </div>

        <div className="search-sidebar">
          <section
            className="search-command-stage search-command-stage-sticky search-module-surface"
            aria-labelledby="search-refinement-heading"
          >
            <div className="search-stage-copy">
              <p className="eyebrow">Suche ändern</p>
              <h2 id="search-refinement-heading">Suche und Filter</h2>
              <p className="field-note search-results-context">Finde etwas, das gerade passt.</p>
            </div>
            <SearchForm action="/suche" filters={filters} submitLabel="Suchen" variant="stage" />
          </section>
        </div>
      </section>
    </section>
  );
}
