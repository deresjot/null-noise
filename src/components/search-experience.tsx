"use client";

import Link from "next/link";
import { flushSync } from "react-dom";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";

import { ExternalResultList } from "@/components/external-result-list";
import { ResultList } from "@/components/result-list";
import { SearchForm } from "@/components/search-form";
import { SearchLocalShelf } from "@/components/search-local-shelf";
import { StatusPanel } from "@/components/status-panel";
import type { MetadataSpikeBrowseSectionId } from "@/lib/metadata-spike";
import type { SearchPageState } from "@/lib/search-page-state";
import type { SearchFilters } from "@/lib/types";

const browseSectionByTone: Record<Exclude<SearchFilters["tone"], "all">, MetadataSpikeBrowseSectionId> = {
  balanced: "balanced",
  calm: "quiet",
  intense: "loud",
};

const softNavigationLinkSelector = [
  "a.search-direct-start-link",
  "a.search-filter-toggle",
  "a.search-kind-toggle-link",
  "a.search-layout-toggle-link",
  "a.search-browse-refresh",
  "a.search-browse-link",
].join(",");

type NavigationHistoryMode = "push" | "replace" | "none";
type SearchTransitionPhase = "idle" | "loading" | "settling";
type ViewTransitionDocument = {
  startViewTransition?: (updateCallback: () => void) => { finished: Promise<void> };
};

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

function getBrowseOrientation(filters: SearchFilters): string | null {
  if (filters.tone === "calm" || filters.avoidPeaks || filters.avoidDensity) {
    return "Die Auswahl bleibt bewusst ruhig.";
  }

  if (filters.tone === "intense") {
    return "Hier darf es dichter werden.";
  }

  return "Ruhig, durchwachsen oder intensiv: wähle einfach eine Richtung.";
}

function getAvoidanceStatusLine(filters: SearchFilters): string | null {
  if (filters.avoidPeaks && filters.avoidDensity) {
    return "Aktiv: Spitzen und Dichte werden zurückgenommen.";
  }

  if (filters.avoidPeaks) {
    return "Aktiv: Spitzen werden zurückgenommen.";
  }

  if (filters.avoidDensity) {
    return "Aktiv: Dichte wird zurückgenommen.";
  }

  return null;
}

function getActiveBrowseSectionId(filters: SearchFilters): MetadataSpikeBrowseSectionId | null {
  if (filters.tone === "all") {
    return null;
  }

  return browseSectionByTone[filters.tone];
}

function isBrowseSectionVisible(
  sectionId: MetadataSpikeBrowseSectionId,
  filters: SearchFilters,
): boolean {
  const activeSectionId = getActiveBrowseSectionId(filters);

  return activeSectionId ? sectionId === activeSectionId : true;
}

function getBrowseClusterLabel(filters: SearchFilters): string {
  if (filters.tone === "calm") {
    return "Browse-Kategorie ruhig";
  }

  if (filters.tone === "balanced") {
    return "Browse-Kategorie durchwachsen";
  }

  if (filters.tone === "intense") {
    return "Browse-Kategorie intensiv";
  }

  return "Browse-Kategorien von ruhig bis intensiv";
}

function normalizeSearchFormTarget(form: HTMLFormElement): string {
  const formData = new FormData(form);
  const searchParams = new URLSearchParams();
  const query = String(formData.get("q") ?? "").trim();
  const tone = String(formData.get("tone") ?? "all");
  const kind = String(formData.get("kind") ?? "all");

  if (query) {
    searchParams.set("q", query);
  }

  if (tone && tone !== "all") {
    searchParams.set("tone", tone);
  }

  if (kind && kind !== "all") {
    searchParams.set("kind", kind);
  }

  if (formData.get("avoidPeaks") === "true") {
    searchParams.set("avoidPeaks", "true");
  }

  if (formData.get("avoidDensity") === "true") {
    searchParams.set("avoidDensity", "true");
  }

  const queryString = searchParams.toString();

  return queryString ? `/suche?${queryString}` : "/suche";
}

function getCurrentSearchPath(): string {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export function SearchExperience({ initialState }: { initialState: SearchPageState }) {
  const [state, setState] = useState(initialState);
  const [transitionPhase, setTransitionPhase] = useState<SearchTransitionPhase>("idle");
  const [isPending, startTransition] = useTransition();
  const abortRef = useRef<AbortController | null>(null);
  const settlingTimerRef = useRef<number | null>(null);
  const stateRouteKeyRef = useRef(initialState.routeKey);

  useEffect(() => {
    if (stateRouteKeyRef.current === initialState.routeKey) {
      return;
    }

    stateRouteKeyRef.current = initialState.routeKey;
    setState(initialState);
  }, [initialState]);

  useEffect(() => {
    const root = document.documentElement;

    if (transitionPhase === "loading") {
      root.dataset.searchTransition = "loading";
      return;
    }

    if (transitionPhase === "settling") {
      root.dataset.searchTransition = "settling";
      return;
    }

    delete root.dataset.searchTransition;
  }, [transitionPhase]);

  const clearSettlingTimer = useCallback(() => {
    if (settlingTimerRef.current) {
      window.clearTimeout(settlingTimerRef.current);
      settlingTimerRef.current = null;
    }
  }, []);

  const finishSettling = useCallback(() => {
    clearSettlingTimer();
    settlingTimerRef.current = window.setTimeout(() => {
      setTransitionPhase("idle");
      settlingTimerRef.current = null;
    }, 360);
  }, [clearSettlingTimer]);

  const navigateInPlace = useCallback(
    async (
      targetPath: string,
      historyMode: NavigationHistoryMode = "push",
      forceRefresh = false,
    ) => {
      const targetUrl = new URL(targetPath, window.location.origin);

      if (targetUrl.origin !== window.location.origin || targetUrl.pathname !== "/suche") {
        window.location.assign(targetUrl.href);
        return;
      }

      const nextPath = `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`;

      if (!forceRefresh && nextPath === getCurrentSearchPath()) {
        return;
      }

      abortRef.current?.abort();
      clearSettlingTimer();

      const controller = new AbortController();
      abortRef.current = controller;
      setTransitionPhase("loading");

      try {
        const response = await fetch(`/api/search/page-state${targetUrl.search}`, {
          cache: "no-store",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Search state request failed with ${response.status}`);
        }

        const nextState = (await response.json()) as SearchPageState;

        stateRouteKeyRef.current = nextState.routeKey;

        const transitionDocument = document as unknown as ViewTransitionDocument;
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const startViewTransition = transitionDocument.startViewTransition;
        const viewTransition =
          startViewTransition && !prefersReducedMotion
            ? startViewTransition(() => {
                flushSync(() => {
                  setState(nextState);
                });
              })
            : null;

        if (!viewTransition) {
          startTransition(() => {
            setState(nextState);
          });
        }

        if (historyMode === "push") {
          window.history.pushState(null, "", nextPath);
        } else if (historyMode === "replace") {
          window.history.replaceState(null, "", nextPath);
        }

        setTransitionPhase("settling");
        if (viewTransition) {
          void viewTransition.finished.finally(finishSettling);
        } else {
          finishSettling();
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        window.location.assign(nextPath);
      }
    },
    [clearSettlingTimer, finishSettling, startTransition],
  );

  useEffect(() => {
    function handlePopState() {
      if (window.location.pathname === "/suche") {
        void navigateInPlace(getCurrentSearchPath(), "none", true);
      }
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      abortRef.current?.abort();
      clearSettlingTimer();
      delete document.documentElement.dataset.searchTransition;
    };
  }, [clearSettlingTimer, navigateInPlace]);

  function handleClickCapture(event: ReactMouseEvent<HTMLElement>) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }

    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    const link = target.closest<HTMLAnchorElement>(softNavigationLinkSelector);

    if (!link) {
      return;
    }

    const url = new URL(link.href);

    if (url.origin !== window.location.origin || url.pathname !== "/suche") {
      return;
    }

    const targetPath = `${url.pathname}${url.search}${url.hash}`;

    if (targetPath === getCurrentSearchPath()) {
      return;
    }

    event.preventDefault();
    void navigateInPlace(targetPath);
  }

  function handleSubmitCapture(event: FormEvent<HTMLElement>) {
    if (event.defaultPrevented) {
      return;
    }

    const form = event.target;

    if (!(form instanceof HTMLFormElement) || !form.classList.contains("search-form")) {
      return;
    }

    const action = new URL(form.action || "/suche", window.location.origin);

    if (action.origin !== window.location.origin || action.pathname !== "/suche") {
      return;
    }

    event.preventDefault();
    void navigateInPlace(normalizeSearchFormTarget(form));
  }

  const filters = state.filters;
  const localResultCount = state.localResults.length;
  const externalResultCount = state.externalResults.length;
  const showExternalResults = externalResultCount > 0;
  const showLocalResults = localResultCount > 0;
  const showExternalGroupHeader = showLocalResults;
  const showExternalEmptyAfterKindFilter =
    state.metadataState?.kind === "success" &&
    state.metadataState.items.length > 0 &&
    !state.externalResults.length;
  const showExternalEmptyAfterAvoidanceFilter =
    showExternalEmptyAfterKindFilter && (filters.avoidPeaks || filters.avoidDensity);
  const showExternalUnavailableNote =
    state.metadataState?.kind === "disabled" ||
    (state.metadataState?.kind === "error" && state.metadataState.reason === "misconfigured");
  const resultsHeading = filters.q ? `Treffer zu „${filters.q}“` : "Titel suchen";
  const resultsCountLine =
    showLocalResults || showExternalResults
      ? formatCombinedResultCount(localResultCount, externalResultCount)
      : filters.q
        ? "Gerade nichts da"
        : "Noch keine Suche";
  const searchReturnPath = buildSearchPath(filters);
  const browseSections = state.browseMetadataState?.kind === "success" ? state.browseMetadataState.sections : [];
  const activeBrowseSectionId = getActiveBrowseSectionId(filters);
  const visibleBrowseSections = browseSections.filter(
    (section) => section.items.length > 0 && isBrowseSectionVisible(section.id, filters),
  );
  const browseRefreshPath = `${buildSearchPath(filters, {
    mix: state.nextBrowseMix,
    view: state.resultDisplayMode,
  })}#results-heading`;
  const listViewPath = `${buildSearchPath(filters, {
    mix: state.showBrowseState ? state.browseMix : undefined,
    view: "list",
  })}#results-heading`;
  const gridViewPath = `${buildSearchPath(filters, {
    mix: state.showBrowseState ? state.browseMix : undefined,
    view: "grid",
  })}#results-heading`;
  const browseSuggestionCount = visibleBrowseSections.reduce(
    (total, section) => total + section.items.length,
    0,
  );
  const showBrowseRefresh = state.browseMetadataState?.kind === "success" && browseSuggestionCount > 0;
  const browseOrientation = getBrowseOrientation(filters);
  const avoidanceStatusLine = getAvoidanceStatusLine(filters);
  const browseClusterLabel = getBrowseClusterLabel(filters);
  const busy = transitionPhase === "loading" || isPending;
  const searchState = useMemo(() => {
    let title = "";
    let text = "";
    let tone: "neutral" | "success" | "warning" | "error" = "neutral";

    if (!showLocalResults && !showExternalResults) {
      if (state.localCatalogUnavailable) {
        title = "Der lokale Stand fehlt gerade";
        text = "Die Suche läuft weiter, nur eben ohne eigene Seiten.";
        tone = "warning";
      } else if (showExternalEmptyAfterAvoidanceFilter) {
        title = "Mit den aktiven Filtern bleibt gerade nichts übrig";
        text = "Nimm einen Entlastungsfilter raus, dann erscheinen wieder Treffer.";
        tone = "warning";
      } else if (showExternalEmptyAfterKindFilter) {
        title = "Gefunden, nur im anderen Format";
        text = "Nimm den Formatfilter raus, dann taucht wieder etwas auf.";
        tone = "warning";
      } else if (state.metadataState?.kind === "disabled") {
        title = "Weitere Treffer fehlen gerade";
        text = "Dann bleibt im Moment nur, was lokal schon da ist.";
        tone = "warning";
      } else if (state.metadataState?.kind === "error") {
        if (state.metadataState.reason === "misconfigured") {
          title = "Weitere Treffer fehlen gerade";
          text = "Dann bleibt im Moment nur, was lokal schon da ist.";
          tone = "warning";
        } else {
          title = "Die Suche hängt gerade kurz";
          text = state.metadataState.message;
          tone = "error";
        }
      } else if (state.metadataState?.kind === "empty") {
        title = "Gerade nichts Passendes";
        text = "Weder im vorhandenen Stand noch darüber hinaus.";
      } else if (filters.q) {
        title = "Gerade kein Treffer";
        text = "Ein anderer Titel oder ein kürzerer Suchbegriff hilft meist schon.";
      } else {
        title = "Noch keine Suche";
        text = "Such erst nach einem Film oder einer Serie. Danach wird es hier genauer.";
      }
    }

    return { text, title, tone };
  }, [
    filters.q,
    showExternalEmptyAfterAvoidanceFilter,
    showExternalEmptyAfterKindFilter,
    showExternalResults,
    showLocalResults,
    state.localCatalogUnavailable,
    state.metadataState,
  ]);

  return (
    <section
      className="section-stack search-results-page"
      aria-busy={busy ? "true" : undefined}
      data-search-experience="in-place"
      data-search-transition-state={transitionPhase}
      onClickCapture={handleClickCapture}
      onSubmitCapture={handleSubmitCapture}
    >
      {state.deleteStatus ? (
        <StatusPanel
          title={state.deleteStatus.title}
          text={state.deleteStatus.text}
          tone={state.deleteStatus.tone}
        />
      ) : null}

      {state.importStatus ? (
        <StatusPanel
          title={state.importStatus.title}
          text={state.importStatus.text}
          tone={state.importStatus.tone}
        />
      ) : null}

      <section className="search-results-layout">
        <div className="search-results-main" aria-live="polite">
          {state.showBrowseState ? (
            <section className="search-browse-state" aria-labelledby="results-heading">
              <header className="search-results-overview search-browse-intro">
                <div className="search-results-group-header search-results-group-header-actions">
                  <div className="search-results-group-copy">
                    <p className="eyebrow">Browse</p>
                    <h1 id="results-heading">Noch kein Titel im Kopf?</h1>
                    <p className="field-note search-results-context">
                      Wähle eine Richtung und entscheide direkt pro Karte.
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
                    <div className="search-action-block">
                      <p className="search-actions-label">Ansicht</p>
                      <nav className="search-layout-toggle" aria-label="Darstellung wechseln">
                        <Link
                          aria-current={state.resultDisplayMode === "list" ? "page" : undefined}
                          className="search-layout-toggle-link"
                          data-active={state.resultDisplayMode === "list" ? "true" : "false"}
                          href={listViewPath}
                        >
                          Liste
                        </Link>
                        <Link
                          aria-current={state.resultDisplayMode === "grid" ? "page" : undefined}
                          className="search-layout-toggle-link"
                          data-active={state.resultDisplayMode === "grid" ? "true" : "false"}
                          href={gridViewPath}
                        >
                          Karten
                        </Link>
                      </nav>
                    </div>
                    {showBrowseRefresh ? (
                      <div className="search-action-block">
                        <p className="search-actions-label">Auswahl</p>
                        <Link className="secondary-button-link search-browse-refresh" href={browseRefreshPath}>
                          Neu mischen
                        </Link>
                      </div>
                    ) : null}
                    {state.browseRefreshTriggered ? (
                      <p className="field-note search-browse-refresh-note" role="status">
                        Neue Auswahl geladen. Der Rahmen bleibt gleich.
                      </p>
                    ) : null}
                  </div>
                </div>
              </header>

              <div className="search-results-stack">
                <SearchLocalShelf />
                {state.browseMetadataState?.kind === "success" && browseSuggestionCount ? (
                  <section
                    className="search-browse-cluster"
                    aria-label={browseClusterLabel}
                    data-active-section={activeBrowseSectionId ?? "all"}
                  >
                    <p className="search-browse-cluster-label">{browseClusterLabel}</p>
                    <div className="search-browse-cluster-groups">
                      {visibleBrowseSections.map((section, index) => (
                        <section
                          key={section.id}
                          className="search-results-group search-browse-cluster-group"
                          aria-labelledby={`browse-${section.id}-heading`}
                          data-browse-id={section.id}
                          data-cluster-step={String(Math.min(index, 2))}
                        >
                          <header className="search-results-group-header">
                            <p className="eyebrow">Externe Titelseiten</p>
                            <h2 id={`browse-${section.id}-heading`}>{section.title}</h2>
                            <p className="field-note">
                              {section.description}
                            </p>
                          </header>
                          <ExternalResultList
                            displayMode={state.resultDisplayMode}
                            items={section.items.slice(0, 4)}
                            localTitleByExternalKey={{}}
                            query=""
                            writesEnabled={state.writesEnabled && !state.localTitleLookupUnavailable}
                          />
                        </section>
                      ))}
                    </div>
                  </section>
                ) : (
                  <StatusPanel
                    title={
                      state.browseMetadataState?.kind === "disabled"
                        ? "Externe Titelseiten fehlen gerade"
                        : state.browseMetadataState?.kind === "error"
                          ? "Die Vorschläge hängen gerade kurz"
                          : "Mit diesem Filterstand ist extern gerade nichts da"
                    }
                    text={
                      state.browseMetadataState?.kind === "disabled" || state.browseMetadataState?.kind === "error"
                        ? state.browseMetadataState.message
                        : "Nimm einen Filter raus oder such direkt."
                    }
                    tone={
                      state.browseMetadataState?.kind === "disabled" || state.browseMetadataState?.kind === "error"
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
                  Erst einschätzen, Details danach.
                </p>
                {avoidanceStatusLine ? <p className="search-filter-note" role="status">{avoidanceStatusLine}</p> : null}
                <div className="search-action-block search-action-block-inline">
                  <p className="search-actions-label">Ansicht</p>
                  <nav className="search-layout-toggle" aria-label="Darstellung wechseln">
                    <Link
                      aria-current={state.resultDisplayMode === "list" ? "page" : undefined}
                      className="search-layout-toggle-link"
                      data-active={state.resultDisplayMode === "list" ? "true" : "false"}
                      href={listViewPath}
                    >
                      Liste
                    </Link>
                    <Link
                      aria-current={state.resultDisplayMode === "grid" ? "page" : undefined}
                      className="search-layout-toggle-link"
                      data-active={state.resultDisplayMode === "grid" ? "true" : "false"}
                      href={gridViewPath}
                    >
                      Karten
                    </Link>
                  </nav>
                </div>
              </header>

              <section className="search-results-stack">
                <SearchLocalShelf />
                {showLocalResults ? (
                  <section className="search-results-group" aria-labelledby="local-results-heading">
                    <header className="search-results-group-header">
                      <p className="eyebrow">Eigener Stand</p>
                      <h2 id="local-results-heading">Schon mit eigenem Stand</h2>
                      <p className="field-note">Hier trägt die Einordnung meist besser.</p>
                    </header>
                    <ResultList
                      allowDelete={state.writesEnabled}
                      displayMode={state.resultDisplayMode}
                      emptyTitle="Hier liegt gerade nichts Passendes"
                      emptyText="Ein anderer Suchbegriff oder ein lockerer Filter hilft meistens."
                      returnPath={searchReturnPath}
                      titles={state.localResults}
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
                      <p className="field-note">Hier ist es noch eine erste Einschätzung.</p>
                    </header>
                    <ExternalResultList
                      displayMode={state.resultDisplayMode}
                      items={state.externalResults}
                      localTitleByExternalKey={state.localTitleByExternalKey}
                      query={filters.q}
                      writesEnabled={state.writesEnabled && !state.localTitleLookupUnavailable}
                    />
                  </section>
                ) : null}

                {!showLocalResults && !showExternalResults ? (
                  <StatusPanel
                    title={searchState.title}
                    text={searchState.text}
                    tone={searchState.tone}
                  />
                ) : null}

                <div className="search-results-notes">
                  {state.localCatalogUnavailable ? (
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
