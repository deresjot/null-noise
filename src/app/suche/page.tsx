import { ExternalResultList } from "@/components/external-result-list";
import { ResultList } from "@/components/result-list";
import { SearchForm } from "@/components/search-form";
import { StatusPanel } from "@/components/status-panel";
import { searchTmdbMetadata } from "@/lib/metadata-spike";
import {
  getLocalTitleLookupByExternalIdsState,
  searchCatalogState,
} from "@/lib/queries";
import { arePublicWritesEnabled } from "@/lib/runtime-config";
import { hasSensoryFilters, parseSearchFilters } from "@/lib/search";

type SearchPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type SearchStateTone = "neutral" | "warning" | "error";

type ImportStatus = {
  title: string;
  text: string;
  tone: SearchStateTone;
} | null;

function getImportStatus(value: string | string[] | undefined): ImportStatus {
  const status = Array.isArray(value) ? value[0] : value;

  if (status === "limited") {
    return {
      title: "Gerade können nicht noch mehr Titel lokal angelegt werden",
      text: "Bitte versuche es später noch einmal. Die externen Titeldaten bleiben davon unberührt sichtbar.",
      tone: "warning",
    };
  }

  if (status === "unavailable") {
    return {
      title: "Der Titel konnte gerade nicht lokal übernommen werden",
      text: "Die externen Titeldaten bleiben sichtbar. Bitte versuche die lokale Übernahme in einem Moment noch einmal.",
      tone: "warning",
    };
  }

  if (status === "inactive") {
    return {
      title: "Lokale Titelanlage ist auf dieser Beta noch nicht aktiv",
      text: "Die getrennten Titeldaten bleiben sichtbar. Sobald ein belastbarer Schreibpfad öffentlich bereitsteht, kann ein externer Titel auch live lokal angelegt werden.",
      tone: "warning",
    };
  }

  return null;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const filters = parseSearchFilters(resolvedSearchParams);
  const importStatus = getImportStatus(resolvedSearchParams.import);
  const {
    data: localResults,
    unavailable: localCatalogUnavailable,
  } = await searchCatalogState(filters);
  const writesEnabled = arePublicWritesEnabled();
  const profileOnlyFiltersActive = hasSensoryFilters(filters);
  const shouldTryExternalFallback = Boolean(filters.q) && !profileOnlyFiltersActive && !localResults.length;
  const metadataState = shouldTryExternalFallback ? await searchTmdbMetadata(filters.q) : null;
  const externalResults =
    metadataState?.kind === "success"
      ? metadataState.items.filter((item) => filters.kind === "all" || item.mediaType === filters.kind)
      : [];
  const localResultCount = localResults.length;
  const externalResultCount = externalResults.length;
  const externalResultsSuppressedByProfileFilters = Boolean(filters.q) && profileOnlyFiltersActive;
  const showMetadataFallback = externalResultCount > 0;
  const {
    data: localTitleByExternalKey,
    unavailable: localTitleLookupUnavailable,
  } = showMetadataFallback
    ? await getLocalTitleLookupByExternalIdsState(externalResults)
    : { data: {}, unavailable: false };
  const showExternalEmptyAfterKindFilter =
    metadataState?.kind === "success" && metadataState.items.length > 0 && !externalResults.length;
  const showExternalCount = metadataState?.kind === "success" && externalResultCount > 0;
  const showExternalUnavailableNote =
    metadataState?.kind === "disabled" ||
    (metadataState?.kind === "error" && metadataState.reason === "misconfigured");
  let searchStateTitle = "";
  let searchStateText = "";
  let searchStateTone: SearchStateTone = "neutral";

  if (!localResults.length && !showMetadataFallback) {
    if (localCatalogUnavailable) {
      searchStateTitle = "Die lokale Titelbasis ist gerade nicht verfügbar";
      searchStateText =
        "Profilierte Treffer konnten gerade nicht geladen werden. Versuche es später noch einmal oder suche ohne aktive Reizfilter nach ergänzenden Titeldaten.";
      searchStateTone = "warning";
    } else if (externalResultsSuppressedByProfileFilters) {
      searchStateTitle = "Mit diesen Filtern bleibt die Suche im Katalog";
      searchStateText =
        "Ton-, Peak- und Dichte-Filter brauchen ein Reizprofil. Entferne sie, wenn du zusätzlich getrennte Titeldaten sehen möchtest.";
      searchStateTone = "warning";
    } else if (showExternalEmptyAfterKindFilter) {
      searchStateTitle = "Passende Titel nur in einem anderen Typ gefunden";
      searchStateText =
        "Zu deiner Suche wurden ergänzende Titeldaten gefunden, aber nicht im gewählten Medientyp. Passe den Typ-Filter an, wenn du sie sehen möchtest.";
      searchStateTone = "warning";
    } else if (metadataState?.kind === "disabled") {
      searchStateTitle = "Keine passenden Titel im Katalog";
      searchStateText =
        "Ergänzende Titeldaten sind gerade nicht verfügbar. Die Suche bleibt deshalb beim profilierten Katalog.";
      searchStateTone = "warning";
    } else if (metadataState?.kind === "error") {
      if (metadataState.reason === "misconfigured") {
        searchStateTitle = "Keine passenden Titel im Katalog";
        searchStateText =
          "Ergänzende Titeldaten sind gerade nicht verfügbar. Die Suche bleibt deshalb beim profilierten Katalog.";
        searchStateTone = "warning";
      } else {
        searchStateTitle = "Die Suche bleibt gerade beim Katalog";
        searchStateText = metadataState.message;
        searchStateTone = "error";
      }
    } else if (metadataState?.kind === "empty") {
      searchStateTitle = "Kein passender Titel gefunden";
      searchStateText =
        "Weder im profilierten Katalog noch in den ergänzenden Titeldaten wurde ein passender Titel gefunden.";
      searchStateTone = "neutral";
    } else if (filters.q) {
      searchStateTitle = "Kein passender Titel gefunden";
      searchStateText =
        "Prüfe die Schreibweise oder versuche einen kürzeren Titel. Tippfehler im Katalog werden bereits möglichst sanft ausgeglichen.";
      searchStateTone = "neutral";
    } else {
      searchStateTitle = "Mit diesen Filtern ist der Katalog gerade leer";
      searchStateText =
        "Entferne einen Filter oder lockere den Gesamteindruck, um wieder profilierte Titel zu sehen.";
      searchStateTone = "neutral";
    }
  }

  return (
    <section className="section-stack">
      {importStatus ? (
        <StatusPanel
          title={importStatus.title}
          text={importStatus.text}
          tone={importStatus.tone}
        />
      ) : null}

      <div className="section-header">
        <p className="eyebrow">Suche</p>
        <h1>Titel mit passendem Reizprofil finden</h1>
        <p>
          Finde Titel, die dich nicht unnötig belasten. Zuerst erscheinen Einordnungen mit
          Reizprofil. Nur wenn dort noch nichts passt, können getrennte Titeldaten ergänzen.
        </p>
      </div>

      <div className="content-grid">
        <section className="panel search-panel search-panel-primary" aria-labelledby="search-form-heading">
          <p className="eyebrow">Suchfeld und Filter</p>
          <h2 id="search-form-heading">Erst filtern, dann bei Bedarf ergänzen</h2>
          <SearchForm action="/suche" filters={filters} />
        </section>

        <section className="panel search-panel search-panel-secondary" aria-labelledby="search-summary-heading">
          <p className="eyebrow">Reihenfolge</p>
          <h2 id="search-summary-heading">Lokale Reizprofile bleiben immer zuerst sichtbar</h2>
          <p>
            Das Reizprofil bleibt die Primärinformation. Externe Titeldaten tauchen nur in einer
            zweiten Ebene auf und ersetzen kein Reizprofil.
          </p>
          <dl className="overview-metrics">
            <div>
              <dt>Im Katalog</dt>
              <dd>{localResultCount}</dd>
            </div>
            {showExternalCount ? (
              <div>
                <dt>Externe Titeldaten</dt>
                <dd>{externalResultCount}</dd>
              </div>
            ) : null}
          </dl>
          {externalResultsSuppressedByProfileFilters ? (
            <p className="field-note">
              Aktive Reizfilter bleiben bewusst auf den profilierten Katalog beschränkt.
            </p>
          ) : null}
          {localCatalogUnavailable ? (
            <p className="field-note">
              Die lokale Titelbasis ist gerade nicht verfügbar. Externe Titeldaten bleiben davon
              getrennt nutzbar.
            </p>
          ) : null}
          {showExternalUnavailableNote ? (
            <p className="field-note">Ergänzende Titeldaten sind gerade nicht erreichbar.</p>
          ) : null}
        </section>
      </div>

      <section aria-labelledby="results-heading" className="section-stack">
        <div className="section-header">
          <h2 id="results-heading">Ergebnisse</h2>
        </div>
        {localResults.length ? (
          <ResultList
            titles={localResults}
            emptyTitle="Keine passenden Titel gefunden"
            emptyText="Passe die Filter an oder entferne einzelne Ausschlüsse, um mehr Treffer zu sehen."
          />
        ) : null}

        {!localResults.length && showMetadataFallback ? (
          <div className="section-stack">
            {localCatalogUnavailable ? (
              <StatusPanel
                title="Die lokale Titelbasis ist gerade nicht verfügbar"
                text="Darum erscheinen hier nur getrennte Titeldaten. Sie helfen beim Wiederfinden, ersetzen aber kein Reizprofil."
                tone="warning"
              />
            ) : null}
            <StatusPanel
              title="Im Katalog liegt dazu noch kein Reizprofil vor"
              text="Darum erscheinen darunter nur ergänzende Titeldaten. Sie helfen beim Wiederfinden, ersetzen aber keine Reizeinschätzung."
              tone="warning"
            />
            <section aria-labelledby="external-results-heading">
              <div className="section-header">
                <p className="eyebrow">Ergänzende Titeldaten</p>
              <h3 id="external-results-heading">Externe Treffer ohne Reizprofil</h3>
              <p>
                  Zuerst erscheint der naheliegendste Treffer. Weitere ähnliche Titel lassen sich
                  bei Bedarf aufklappen. Reizprofil und Confidence entstehen daraus nicht
                  automatisch.
              </p>
              </div>
              <ExternalResultList
                items={externalResults}
                localTitleByExternalKey={localTitleByExternalKey}
                query={filters.q}
                writesEnabled={writesEnabled && !localTitleLookupUnavailable}
              />
            </section>
          </div>
        ) : null}

        {!localResults.length && !showMetadataFallback ? (
          <StatusPanel
            title={searchStateTitle}
            text={searchStateText}
            tone={searchStateTone}
          />
        ) : null}
      </section>
    </section>
  );
}
