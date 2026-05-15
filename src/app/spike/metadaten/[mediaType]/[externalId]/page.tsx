import Link from "next/link";

import { DetailFollowupSection } from "@/components/detail-followup-section";
import { LetterboxdPanel } from "@/components/letterboxd-panel";
import { ReadingDecisionSupport } from "@/components/reading-decision-support";
import { ReadingEvidenceDetails } from "@/components/reading-evidence-details";
import { ReadingFeedbackForm } from "@/components/reading-feedback-form";
import { ResultPoster } from "@/components/result-poster";
import { SearchToneScale } from "@/components/search-tone-scale";
import { StatusPanel } from "@/components/status-panel";
import { TitlePocketActions } from "@/components/title-pocket-actions";
import { WatchProvidersPanel } from "@/components/watch-providers-panel";
import {
  getAggregatePresentation,
  getCautionHints,
  getConfidencePresentation,
  getDecisionPresentation,
  formatRatingCount,
  getSearchAggregatePresentation,
  getProfileTendency,
} from "@/lib/format";
import { getDetailFollowupSections } from "@/lib/detail-followups";
import { getLetterboxdFilmByTmdbId } from "@/lib/letterboxd";
import { createTitleExternalLookupKey } from "@/lib/local-titles";
import { createMetadataInferencePreview } from "@/lib/metadata-inference";
import {
  formatMetadataSpikeSource,
  getMetadataDetail,
  getTmdbPosterProxyPath,
  getTmdbWatchProviders,
  parseSpikeDetailParams,
  type MetadataSpikeTitle,
} from "@/lib/metadata-spike";
import { buildTitlePocketEntryFromMetadata } from "@/lib/title-pocket";
import { getLocalTitleLookupByExternalIdsState, getTitleBySlugState } from "@/lib/queries";
import { arePublicWritesEnabled } from "@/lib/runtime-config";

type MetadataSpikeDetailPageProps = {
  params: Promise<{ mediaType: string; externalId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function formatMediaType(mediaType: "movie" | "series"): string {
  return mediaType === "movie" ? "Film" : "Serie";
}

function getQueryValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function buildMetadataDetailPath(
  item: Pick<MetadataSpikeTitle, "mediaType" | "sourceId">,
  query: string,
): string {
  const searchParams = new URLSearchParams();

  if (query) {
    searchParams.set("q", query);
  }

  const queryString = searchParams.toString();
  const path = `/spike/metadaten/${item.mediaType}/${item.sourceId}`;

  return queryString ? `${path}?${queryString}` : path;
}

function buildSearchPath(query: string): string {
  const searchParams = new URLSearchParams();

  if (query) {
    searchParams.set("q", query);
  }

  const queryString = searchParams.toString();

  return queryString ? `/suche?${queryString}` : "/suche";
}

function getImportStatus(value: string | string[] | undefined) {
  const status = Array.isArray(value) ? value[0] : value;

  if (status === "limited") {
    return {
      title: "Lokales Anlegen bremst gerade",
      text: "Nur ansehen geht weiter. Ein neuer Versuch geht später wieder.",
      tone: "warning" as const,
    };
  }

  if (status === "unavailable") {
    return {
      title: "Lokales Anlegen ging gerade nicht",
      text: "Der Titel bleibt sichtbar. Ein zweiter Versuch sollte später wieder gehen.",
      tone: "warning" as const,
    };
  }

  if (status === "inactive") {
    return {
      title: "Lokales Anlegen bleibt hier zu",
      text: "Lesen geht schon. Anlegen geht in dieser Instanz gerade nicht.",
      tone: "warning" as const,
    };
  }

  return null;
}

function getFeedbackStatus(value: string | string[] | undefined) {
  const status = Array.isArray(value) ? value[0] : value;

  if (status === "success") {
    return {
      title: "Rückmeldung übernommen",
      text: "Danke. Die Startbasis zieht das beim nächsten Mal mit.",
      tone: "success" as const,
    };
  }

  if (status === "cooldown") {
    return {
      title: "Hier kam gerade schon etwas rein",
      text: "Lass dem Titel kurz Ruhe, dann geht es wieder.",
      tone: "warning" as const,
    };
  }

  if (status === "limited") {
    return {
      title: "Gerade zu viele Rückmeldungen auf einmal",
      text: "Versuch es später noch einmal.",
      tone: "warning" as const,
    };
  }

  if (status === "too-fast") {
    return {
      title: "Das war noch zu schnell",
      text: "Bitte einmal in Ruhe schauen und dann noch einmal senden.",
      tone: "warning" as const,
    };
  }

  if (status === "inactive") {
    return {
      title: "Rückmeldung bleibt hier gerade zu",
      text: "Lesen geht schon. Schreiben geht in dieser Instanz gerade nicht.",
      tone: "warning" as const,
    };
  }

  if (status === "invalid") {
    return {
      title: "Die Rückmeldung war nicht vollständig",
      text: "Bitte noch einmal über einen der drei Wege senden.",
      tone: "error" as const,
    };
  }

  if (status === "error") {
    return {
      title: "Rückmeldung ging gerade nicht durch",
      text: "Versuch es in einem Moment noch einmal.",
      tone: "error" as const,
    };
  }

  return null;
}

function compactList(values: string[] | undefined, limit = 4): string | null {
  if (!values?.length) {
    return null;
  }

  return values.slice(0, limit).join(", ");
}

function getMetadataSignalExplanation(signalState: "thin" | "mixed" | "supported"): string {
  if (signalState === "thin") {
    return "Die verfügbaren Hinweise bleiben noch dünn.";
  }

  if (signalState === "mixed") {
    return "Ruhigere und dichtere Hinweise stehen hier nebeneinander.";
  }

  return "Mehrere Metadaten zeigen in eine ähnliche Richtung.";
}

function getTmdbMovieLookup(item: { externalSource: string; mediaType: "movie" | "series"; sourceId: string | number }) {
  if (item.externalSource !== "tmdb" || item.mediaType !== "movie") {
    return null;
  }

  const numericId = typeof item.sourceId === "number" ? item.sourceId : Number(item.sourceId);

  return Number.isFinite(numericId) ? numericId : null;
}

export default async function MetadataSpikeDetailPage({
  params,
  searchParams,
}: MetadataSpikeDetailPageProps) {
  const rawParams = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const parsed = parseSpikeDetailParams(rawParams);

  if (!parsed) {
    return (
      <section className="section-stack">
        <StatusPanel
          title="Ungültiger Spike-Pfad"
          text="Der Detailpfad konnte nicht ausgewertet werden. Nutze bitte die Trefferliste des Spikes."
          tone="error"
        />
        <p>
          <Link href="/spike/metadaten">Zurück zum Metadaten-Spike</Link>
        </p>
      </section>
    );
  }

  const state = await getMetadataDetail(parsed);

  if (state.kind !== "success") {
    return (
      <section className="section-stack">
        <StatusPanel
          title={
            state.kind === "disabled"
              ? "Externe Detaildaten fehlen gerade"
              : "Detaildaten fehlen gerade"
          }
          text="Dazu gibt es gerade zu wenig belastbare Hinweise."
          tone={state.kind === "disabled" ? "warning" : "error"}
        />
        <p>
          <Link href="/spike/metadaten">Zurück zum Metadaten-Spike</Link>
        </p>
      </section>
    );
  }

  const { item } = state;
  const query = getQueryValue(resolvedSearchParams.q).trim();
  const writesEnabled = arePublicWritesEnabled();
  const importStatus = getImportStatus(resolvedSearchParams.import);
  const feedbackStatus = getFeedbackStatus(resolvedSearchParams.feedback);
  const preview = createMetadataInferencePreview(item);
  const searchPath = buildSearchPath(query);
  const canCreateLocalTitle = writesEnabled && item.externalSource === "tmdb";
  const tmdbMovieId = getTmdbMovieLookup(item);
  const localTitleLookupKey = `${item.externalSource}:${String(item.sourceId)}`;
  const [localTitleLookupState, watchProviderState, letterboxdState] = await Promise.all([
    getLocalTitleLookupByExternalIdsState([{ externalSource: item.externalSource, sourceId: item.sourceId }]),
    item.externalSource === "tmdb"
      ? getTmdbWatchProviders(item.mediaType, Number(item.sourceId))
      : Promise.resolve(null),
    tmdbMovieId ? getLetterboxdFilmByTmdbId(tmdbMovieId) : Promise.resolve(null),
  ]);
  const localTitleSlug = localTitleLookupState.data[localTitleLookupKey];
  const localTitleState = localTitleSlug ? await getTitleBySlugState(localTitleSlug) : { data: undefined };
  const localTitle = localTitleState.data;
  const aggregatePresentation = localTitle
    ? getAggregatePresentation(localTitle.aggregation)
    : getSearchAggregatePresentation(preview.aggregation);
  const confidencePresentation = localTitle
    ? getConfidencePresentation(localTitle.aggregation, aggregatePresentation.state)
    : {
        eyebrow: "Stand heute",
        title: "Kaum Hinweise",
        text: "Das ruht hier erst auf Basisdaten und einer vorsichtigen ersten Einschätzung. Eine eigene Seite kommt erst danach.",
      };
  const activeProfile = localTitle ? localTitle.stimulusProfile : preview.stimulusProfile;
  const tendency = getProfileTendency(activeProfile);
  const decision = getDecisionPresentation({
    profile: activeProfile,
    state: aggregatePresentation.state,
  });
  const cautionHints = getCautionHints(activeProfile);
  const returnPath = query
    ? `/spike/metadaten/${item.mediaType}/${item.sourceId}?q=${encodeURIComponent(query)}`
    : `/spike/metadaten/${item.mediaType}/${item.sourceId}`;
  const canonicalDetailPath = `/spike/metadaten/${item.mediaType}/${item.sourceId}`;
  const localDetailPath = localTitleSlug ? `/titel/${localTitleSlug}` : null;
  const titlePocketEntry = buildTitlePocketEntryFromMetadata(item, {
    href: canonicalDetailPath,
    profile: activeProfile,
  });
  const visibleFeedbackStatus =
    feedbackStatus ??
    (!writesEnabled
      ? {
          title: "Rückmeldung bleibt hier gerade zu",
          text: "Lesen geht schon. Schreiben geht in dieser Instanz gerade nicht.",
          tone: "warning" as const,
        }
      : null);
  const readingEvidenceEntries = [
    compactList(item.genres, 3)
      ? { label: "Genres", value: compactList(item.genres, 3) as string }
      : null,
    compactList(item.keywords, 5)
      ? { label: "Keywords", value: compactList(item.keywords, 5) as string }
      : null,
    item.synopsis ? { label: "Kurzbeschreibung", value: item.synopsis } : null,
    localTitle
      ? {
          label: "Rückmeldungen",
          value:
            localTitle.aggregation.ratingCount === 1
              ? "Noch keine eigenen Rückmeldungen."
              : `${localTitle.aggregation.ratingCount - 1} anonyme Rückmeldungen liegen schon dazu vor.`,
        }
      : {
          label: "Signalbild",
          value: getMetadataSignalExplanation(preview.signalState),
        },
  ].filter((entry): entry is { label: string; value: string } => Boolean(entry));
  const followupState = await getDetailFollowupSections({
    excludeExternalIds: [item.externalId],
    kind: item.mediaType,
    profile: activeProfile,
    seed: `${item.mediaType}:${item.sourceId}`,
  });
  const relatedLookupItems = [
    ...followupState.sections.flatMap((section) => section.items),
    ...followupState.comparison.items.map((entry) => entry.item),
  ].filter(
    (candidate, index, collection) =>
      collection.findIndex((entry) => entry.externalId === candidate.externalId) === index,
  );
  const followupLocalLookupState = relatedLookupItems.length
    ? await getLocalTitleLookupByExternalIdsState(
        relatedLookupItems.map((followup) => ({
          externalSource: followup.externalSource,
          sourceId: followup.sourceId,
        })),
      )
    : { data: {}, unavailable: false };
  const comparisonItems = followupState.comparison.items.map((entry) => {
    const localSlug =
      followupLocalLookupState.data[
        createTitleExternalLookupKey(entry.item.externalSource, entry.item.sourceId)
      ];

    return {
      href: localSlug ? `/titel/${localSlug}` : buildMetadataDetailPath(entry.item, query),
      relationLabel: entry.relationLabel,
      title: entry.item.title,
    };
  });

  return (
    <article className="section-stack detail-page metadata-detail-page">
      <p>
        <Link href={searchPath}>Zurück zur Suche</Link>
      </p>

      {importStatus ? (
        <StatusPanel title={importStatus.title} text={importStatus.text} tone={importStatus.tone} />
      ) : null}

      <header className="detail-hero">
        <div className="detail-hero-copy">
          <p className="eyebrow">{`${formatMediaType(item.mediaType)} · ${item.releaseYear ?? "Jahr offen"}`}</p>
          <h1>{item.title}</h1>
          <section className="detail-reading-block" aria-label="Erste Einschätzung">
            <p className="detail-reading-kicker">Erste Einschätzung</p>
            <p className="detail-hero-tendency">{tendency.label}</p>
            <SearchToneScale
              caption="Eher ruhig bis eher intensiv"
              emphasis="hero"
              mode={aggregatePresentation.state}
              note={tendency.text}
              showCaption={false}
              showValueLabel={false}
              value={tendency.tone}
              valueLabel={tendency.label}
            />
            <p className="field-note detail-reading-basis">{aggregatePresentation.basis}</p>
            <p className="field-note detail-hero-status">
              <strong>{aggregatePresentation.label}.</strong> {aggregatePresentation.text}
            </p>
            <p className="field-note detail-reading-explain-link">
              <a href="#reading-basis">Worauf basiert das?</a>{" "}
              <span aria-hidden="true">·</span>{" "}
              <a href="/erklaerung">Wie funktioniert die erste Einschätzung?</a>
            </p>
          </section>
          <div className="detail-reading-followups" id="reading-basis">
            <ReadingDecisionSupport
              cautions={{
                items: cautionHints,
                notice:
                  !cautionHints.length && tendency.tone !== "ruhig"
                    ? "Hier wäre alles andere zu geraten."
                    : null,
              }}
              comparisons={{
                items: comparisonItems,
                notice: followupState.comparison.notice,
              }}
              decision={decision}
            />
            <ReadingEvidenceDetails
              entries={readingEvidenceEntries}
              intro="Kurz und ehrlich: Das ist eine vorsichtige erste Einschätzung aus Genres, Keywords, Kurzbeschreibung und, wenn vorhanden, Rückmeldungen. Keine Szenenprüfung, keine Entwarnung."
            />

            <div id="reading-feedback">
              {writesEnabled ? (
                <ReadingFeedbackForm
                  fields={[
                    { name: "mode", value: "external" },
                    { name: "source", value: "tmdb" },
                    { name: "mediaType", value: item.mediaType },
                    { name: "sourceId", value: String(item.sourceId) },
                    { name: "returnPath", value: returnPath },
                  ]}
                />
              ) : null}
              {visibleFeedbackStatus ? (
                <StatusPanel
                  className="status-panel-inline"
                  headingAs="h4"
                  title={visibleFeedbackStatus.title}
                  text={visibleFeedbackStatus.text}
                  tone={visibleFeedbackStatus.tone}
                />
              ) : null}
            </div>
            <TitlePocketActions entry={titlePocketEntry} variant="detail" />
          </div>
          <p className="lead">
            {item.synopsis ??
              "Für diesen Titel wurde keine Kurzbeschreibung von der externen Quelle geliefert."}
          </p>
        </div>

        <aside className="detail-callout-panel" aria-labelledby="detail-spike-heading">
          <ResultPoster
            priority
            src={getTmdbPosterProxyPath(item.posterPath, "original")}
            title={item.title}
            variant="detail"
          />
          <p className="eyebrow">Stand heute</p>
          <h2 id="detail-spike-heading">Worauf das gerade ruht</h2>
          <p className="confidence-callout-eyebrow">{confidencePresentation.eyebrow}</p>
          <p className="confidence-callout-title">{confidencePresentation.title}</p>
          <p>{confidencePresentation.text}</p>

          <dl className="detail-list">
            <div>
              <dt>Status</dt>
              <dd>{aggregatePresentation.label}</dd>
            </div>
            <div>
              <dt>Grundlage</dt>
              <dd>{localTitle ? "Eigene Seite plus vorhandene Rückmeldungen" : "Erste Einschätzung aus Basisdaten"}</dd>
            </div>
            <div>
              <dt>Quelle</dt>
              <dd>{formatMetadataSpikeSource(item.externalSource)}</dd>
            </div>
            <div>
              <dt>Rückmeldungen</dt>
              <dd>
                {localTitle ? formatRatingCount(localTitle.aggregation.ratingCount) : "Noch keine eigene Seite"}
              </dd>
            </div>
          </dl>

          {localDetailPath ? (
            <p className="detail-callout-action">
              <Link className="secondary-button-link" href={localDetailPath}>
                Zur eigenen Seite
              </Link>
            </p>
          ) : canCreateLocalTitle ? (
            <form
              action="/api/local-titles"
              className="external-import-form detail-callout-action"
              method="post"
            >
              <input type="hidden" name="source" value={item.externalSource} />
              <input type="hidden" name="mediaType" value={item.mediaType} />
              <input type="hidden" name="sourceId" value={String(item.sourceId)} />
              <input type="hidden" name="q" value={query} />
              <input type="hidden" name="returnPath" value={returnPath} />
              <button className="secondary-button-link result-card-action-link" type="submit">
                Lokal anlegen
              </button>
            </form>
          ) : item.externalSource !== "tmdb" ? (
            <p className="field-note">Direktes Anlegen gibt es hier nur für TMDb-Titel.</p>
          ) : (
            <p className="field-note">Diese Instanz bleibt gerade lesend. Nur ansehen geht trotzdem.</p>
          )}
          <p className="field-note">{state.message}</p>
          <p className="field-note">
            Basisdaten von {formatMetadataSpikeSource(item.externalSource)}. Die lokale Seite kommt
            erst danach.
          </p>
        </aside>
      </header>

      {watchProviderState ? <WatchProvidersPanel state={watchProviderState} /> : null}
      {letterboxdState?.kind === "success" ? <LetterboxdPanel state={letterboxdState} /> : null}

      {followupState.sections.length || followupState.notices.length ? (
        <section className="detail-followups-stack" aria-label="Weiterführende Titel">
          {followupState.sections.map((section) => (
            <DetailFollowupSection
              key={section.id}
              eyebrow={section.eyebrow}
              heading={section.title}
              intro={section.intro}
              items={section.items}
              localTitleByExternalKey={followupLocalLookupState.data}
              writesEnabled={writesEnabled && !followupLocalLookupState.unavailable}
            />
          ))}
          {followupState.notices.map((notice) => (
            <StatusPanel
              key={`followup-${notice.id}`}
              className="status-panel-inline"
              headingAs="h3"
              title={notice.title}
              text={notice.text}
              tone={notice.tone}
            />
          ))}
        </section>
      ) : null}
    </article>
  );
}
