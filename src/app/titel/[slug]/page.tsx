import { notFound } from "next/navigation";

import { DetailFollowupSection } from "@/components/detail-followup-section";
import { ExplanationPanel } from "@/components/explanation-panel";
import { LetterboxdPanel } from "@/components/letterboxd-panel";
import { ReadingDecisionSupport } from "@/components/reading-decision-support";
import { ReadingEvidenceDetails } from "@/components/reading-evidence-details";
import { ReadingFeedbackForm } from "@/components/reading-feedback-form";
import { ProfileScale } from "@/components/profile-scale";
import { RatingFormGuard } from "@/components/rating-form-guard";
import { ResultPoster } from "@/components/result-poster";
import { SearchToneScale } from "@/components/search-tone-scale";
import { StatusPanel } from "@/components/status-panel";
import { TitlePocketActions } from "@/components/title-pocket-actions";
import { WatchProvidersPanel } from "@/components/watch-providers-panel";
import { soothingEffectLabels, stimulusDimensions } from "@/lib/constants";
import { getDetailFollowupSections } from "@/lib/detail-followups";
import {
  getAggregatePresentation,
  formatKind,
  formatDate,
  formatRatingCount,
  formatSoothingEffect,
  formatSourceType,
  getCautionHints,
  getConfidencePresentation,
  getDecisionPresentation,
  getProfileTendency,
} from "@/lib/format";
import { getLetterboxdFilmByTmdbId } from "@/lib/letterboxd";
import { getMetadataDetail, getTmdbPosterProxyPath, getTmdbWatchProviders } from "@/lib/metadata-spike";
import { createTitleExternalLookupKey } from "@/lib/local-titles";
import { formatScaleLegend, getScaleOptions } from "@/lib/ratings";
import { buildTitlePocketEntryFromTitle } from "@/lib/title-pocket";
import { getLocalTitleLookupByExternalIdsState, getTitleBySlugState } from "@/lib/queries";
import { arePublicWritesEnabled } from "@/lib/runtime-config";
import type { ScaleValue } from "@/lib/types";
import { submitTitleRatingAction } from "./actions";

type DetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type RatingStatus = {
  title: string;
  text: string;
  tone: "neutral" | "success" | "warning" | "error";
} | null;

type StimulusDimension = (typeof stimulusDimensions)[number];

function buildSearchPath(query: string): string {
  const searchParams = new URLSearchParams({ q: query });
  return `/suche?${searchParams.toString()}`;
}

function buildMetadataDetailPath(
  item: { mediaType: "movie" | "series"; sourceId: string | number },
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

function getRatingStatus(value: string | string[] | undefined): RatingStatus {
  const rating = Array.isArray(value) ? value[0] : value;

  if (rating === "success") {
    return {
      title: "Einschätzung übernommen",
      text: "Danke. Der sichtbare Stand wurde neu sortiert.",
      tone: "success",
    };
  }

  if (rating === "cooldown") {
    return {
      title: "Hier kam gerade schon etwas rein",
      text: "Lass dem Titel kurz Ruhe, dann geht es wieder.",
      tone: "warning",
    };
  }

  if (rating === "limited") {
    return {
      title: "Gerade zu viele Einschätzungen auf einmal",
      text: "Versuch es später noch einmal. Der sichtbare Stand bleibt bis dahin, wie er ist.",
      tone: "warning",
    };
  }

  if (rating === "too-fast") {
    return {
      title: "Das war noch zu schnell",
      text: "Bitte einmal in Ruhe ausfüllen und dann noch mal senden.",
      tone: "warning",
    };
  }

  if (rating === "invalid") {
    return {
      title: "Ein Feld fehlt noch",
      text: "Bitte alle vier Fragen mit einer Stufe von 0 bis 4 beantworten.",
      tone: "error",
    };
  }

  if (rating === "error") {
    return {
      title: "Speichern ging gerade nicht",
      text: "Versuch es in einem Moment noch einmal. Der sichtbare Stand bleibt unverändert.",
      tone: "error",
    };
  }

  if (rating === "inactive") {
    return {
      title: "Einschätzen bleibt hier gerade zu",
      text: "Lesen geht schon. Schreiben kommt in dieser Instanz später dazu.",
      tone: "warning",
    };
  }

  return null;
}

function getImportStatus(value: string | string[] | undefined): RatingStatus {
  const status = Array.isArray(value) ? value[0] : value;

  if (status === "created") {
    return {
      title: "Lokaler Stand angelegt",
      text: "Der Titel hat jetzt hier eine eigene Seite. Mehr kann mit der Zeit dazukommen.",
      tone: "success",
    };
  }

  if (status === "exists") {
    return {
      title: "Der Titel war schon da",
      text: "Für diesen Titel gibt es bereits eine lokale Seite.",
      tone: "neutral",
    };
  }

  return null;
}

function getDeleteStatus(value: string | string[] | undefined): RatingStatus {
  const status = Array.isArray(value) ? value[0] : value;

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

function getFeedbackStatus(value: string | string[] | undefined): RatingStatus {
  const status = Array.isArray(value) ? value[0] : value;

  if (status === "success") {
    return {
      title: "Rückmeldung übernommen",
      text: "Danke. Der sichtbare Stand wurde damit leise nachgezogen.",
      tone: "success",
    };
  }

  if (status === "cooldown") {
    return {
      title: "Hier kam gerade schon etwas rein",
      text: "Lass dem Titel kurz Ruhe, dann geht es wieder.",
      tone: "warning",
    };
  }

  if (status === "limited") {
    return {
      title: "Gerade zu viele Rückmeldungen auf einmal",
      text: "Versuch es später noch einmal.",
      tone: "warning",
    };
  }

  if (status === "too-fast") {
    return {
      title: "Das war noch zu schnell",
      text: "Bitte einmal in Ruhe schauen und dann noch einmal senden.",
      tone: "warning",
    };
  }

  if (status === "inactive") {
    return {
      title: "Rückmeldung bleibt hier gerade zu",
      text: "Lesen geht schon. Schreiben kommt in dieser Instanz später dazu.",
      tone: "warning",
    };
  }

  if (status === "invalid") {
    return {
      title: "Die Rückmeldung war nicht vollständig",
      text: "Bitte noch einmal über einen der drei Wege senden.",
      tone: "error",
    };
  }

  if (status === "error") {
    return {
      title: "Rückmeldung ging gerade nicht durch",
      text: "Versuch es in einem Moment noch einmal.",
      tone: "error",
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

function renderScaleOptions(
  name: string,
  legend: string,
  lowLabel: string,
  highLabel: string,
  scaleOptions: ScaleValue[],
) {
  return (
    <fieldset className="rating-fieldset">
      <legend>{legend}</legend>
      <p className="field-note">{formatScaleLegend(lowLabel, highLabel)}</p>
      <div className="rating-options">
        {scaleOptions.map((value) => (
          <label key={`${name}-${value}`} className="rating-option">
            <input type="radio" name={name} value={value} required />
            <span>{value}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function getTmdbWatchProviderLookup(title: {
  external: { externalSource: string; externalSourceId: string };
}): number | null {
  if (title.external.externalSource !== "tmdb" && title.external.externalSource !== "tmdb_seed") {
    return null;
  }

  if (!/^\d+$/.test(title.external.externalSourceId)) {
    return null;
  }

  return Number(title.external.externalSourceId);
}

function getLetterboxdLookup(title: {
  external: { externalSource: string; externalSourceId: string; kind: "movie" | "series" };
}): number | null {
  if (title.external.kind !== "movie") {
    return null;
  }

  return getTmdbWatchProviderLookup(title);
}

function getDetailPosterPath(title: {
  external: { externalSource: string; posterPath?: string | null };
}): string | null {
  if (title.external.externalSource !== "tmdb" && title.external.externalSource !== "tmdb_seed") {
    return null;
  }

  return getTmdbPosterProxyPath(title.external.posterPath ?? null, "original");
}

export default async function TitleDetailPage({ params, searchParams }: DetailPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const importStatus = getImportStatus(resolvedSearchParams.import);
  const deleteStatus = getDeleteStatus(resolvedSearchParams.deleted);
  const ratingStatus = getRatingStatus(resolvedSearchParams.rating);
  const feedbackStatus = getFeedbackStatus(resolvedSearchParams.feedback);
  const { data: title, unavailable: titleUnavailable } = await getTitleBySlugState(slug);
  const writesEnabled = arePublicWritesEnabled();

  if (!title) {
    if (titleUnavailable) {
      return (
        <article className="section-stack">
          <header className="detail-hero page-bleed">
            <div className="detail-hero-copy">
              <p className="eyebrow">Lokaler Stand</p>
              <h1>Der lokale Titelstand ist gerade nicht erreichbar</h1>
              <p className="lead">
                Dieser Titel konnte gerade nicht aus der lokalen Basis geladen werden. Versuch es
                später noch einmal.
              </p>
            </div>
          </header>
          <StatusPanel
            title="Der lokale Titelstand ist gerade nicht erreichbar"
            text="Reizprofil, Stand und Formular konnten gerade nicht geladen werden."
            tone="warning"
          />
          <ExplanationPanel compact />
        </article>
      );
    }

    notFound();
  }

  const submitRating = submitTitleRatingAction.bind(null, title.external.slug);
  const scaleOptions = getScaleOptions();
  const aggregatePresentation = getAggregatePresentation(title.aggregation);
  const profileTendency = getProfileTendency(title.stimulusProfile);
  const confidencePresentation = getConfidencePresentation(
    title.aggregation,
    aggregatePresentation.state,
  );
  const decision = getDecisionPresentation({
    profile: title.stimulusProfile,
    state: aggregatePresentation.state,
  });
  const cautionHints = getCautionHints(title.stimulusProfile);
  const orderedStimulusDimensions = [
    stimulusDimensions.find((dimension) => dimension.key === "peakIntensity"),
    stimulusDimensions.find((dimension) => dimension.key === "volumeLevel"),
    stimulusDimensions.find((dimension) => dimension.key === "stimulusDensity"),
  ].filter((dimension): dimension is StimulusDimension => Boolean(dimension));
  const inactiveRatingState: RatingStatus = !writesEnabled
    ? {
        title: "Einschätzen bleibt hier gerade zu",
        text: "Lesen geht schon. Schreiben kommt in dieser Instanz später dazu.",
        tone: "warning",
      }
    : null;
  const visibleRatingStatus = ratingStatus ?? inactiveRatingState;
  const deleteSuccessPath = buildSearchPath(title.external.title);
  const showDeleteAction = writesEnabled && title.external.externalSource !== "tmdb_seed";
  const tmdbWatchProviderId = getTmdbWatchProviderLookup(title);
  const letterboxdLookupId = getLetterboxdLookup(title);
  const detailPosterPath = getDetailPosterPath(title);
  const tmdbExternalId =
    title.external.externalSource === "tmdb" || title.external.externalSource === "tmdb_seed"
      ? /^\d+$/.test(title.external.externalSourceId)
        ? `tmdb:${title.external.kind}:${title.external.externalSourceId}`
        : null
      : null;
  const titlePocketEntry = buildTitlePocketEntryFromTitle(title, `/titel/${title.external.slug}`);
  const [watchProviderState, letterboxdState, metadataDetailState, followupSections] = await Promise.all([
    tmdbWatchProviderId ? getTmdbWatchProviders(title.external.kind, tmdbWatchProviderId) : Promise.resolve(null),
    letterboxdLookupId ? getLetterboxdFilmByTmdbId(letterboxdLookupId) : Promise.resolve(null),
    tmdbWatchProviderId
      ? getMetadataDetail({
          source: "tmdb",
          mediaType: title.external.kind,
          externalId: tmdbWatchProviderId,
        })
      : Promise.resolve(null),
    getDetailFollowupSections({
      excludeExternalIds: tmdbExternalId ? [tmdbExternalId] : [],
      kind: title.external.kind,
      profile: title.stimulusProfile,
      seed: title.external.externalSourceId || title.external.slug,
    }),
  ]);
  const relatedFollowupItems = [
    ...followupSections.sections.flatMap((section) => section.items),
    ...followupSections.comparison.items.map((entry) => entry.item),
  ].filter(
    (candidate, index, collection) =>
      collection.findIndex((entry) => entry.externalId === candidate.externalId) === index,
  );
  const followupLocalLookupState = relatedFollowupItems.length
    ? await getLocalTitleLookupByExternalIdsState(
        relatedFollowupItems.map((followup) => ({
          externalSource: followup.externalSource,
          sourceId: followup.sourceId,
        })),
      )
    : { data: {}, unavailable: false };
  const comparisonItems = followupSections.comparison.items.map((entry) => {
    const localSlug =
      followupLocalLookupState.data[
        createTitleExternalLookupKey(entry.item.externalSource, entry.item.sourceId)
      ];

    return {
      href: localSlug ? `/titel/${localSlug}` : buildMetadataDetailPath(entry.item, title.external.title),
      relationLabel: entry.relationLabel,
      title: entry.item.title,
    };
  });
  const readingEvidenceEntries = [
    compactList(metadataDetailState?.kind === "success" ? metadataDetailState.item.genres : undefined, 3)
      ? {
          label: "Genres",
          value: compactList(
            metadataDetailState?.kind === "success" ? metadataDetailState.item.genres : undefined,
            3,
          ) as string,
        }
      : null,
    compactList(metadataDetailState?.kind === "success" ? metadataDetailState.item.keywords : undefined, 5)
      ? {
          label: "Keywords",
          value: compactList(
            metadataDetailState?.kind === "success" ? metadataDetailState.item.keywords : undefined,
            5,
          ) as string,
        }
      : null,
    title.external.synopsis ? { label: "Kurzbeschreibung", value: title.external.synopsis } : null,
    {
      label: "Rückmeldungen",
      value:
        title.aggregation.ratingCount <= 1
          ? "Noch keine eigenen Rückmeldungen."
          : `${title.aggregation.ratingCount - 1} anonyme Rückmeldungen liegen schon dazu vor.`,
    },
  ].filter((entry): entry is { label: string; value: string } => Boolean(entry));
  const visibleFeedbackStatus =
    feedbackStatus ??
    (!writesEnabled
      ? {
          title: "Rückmeldung bleibt hier gerade zu",
          text: "Lesen geht schon. Schreiben kommt in dieser Instanz später dazu.",
          tone: "warning" as const,
        }
      : null);

  return (
    <article className="section-stack detail-page">
      {importStatus ? (
        <StatusPanel
          title={importStatus.title}
          text={importStatus.text}
          tone={importStatus.tone}
        />
      ) : null}

      <header className="detail-hero page-bleed">
        <div className="detail-hero-copy">
          <p className="eyebrow">
            {`${formatKind(title.external.kind)} · ${title.external.year ?? "Jahr offen"}`}
          </p>
          <h1>{title.external.title}</h1>
          <section className="detail-reading-block" aria-label="Einordnung">
            <p className="detail-reading-kicker">Einordnung</p>
            <p className="detail-hero-tendency">{profileTendency.label}</p>
            <SearchToneScale
              caption="Leise bis laut"
              emphasis="hero"
              mode={aggregatePresentation.state}
              note={profileTendency.text}
              showCaption={false}
              showValueLabel={false}
              value={profileTendency.tone}
              valueLabel={profileTendency.label}
            />
            <p className="field-note detail-reading-basis">{aggregatePresentation.basis}</p>
            <p className="field-note detail-hero-status">
              <strong>{aggregatePresentation.label}.</strong> {aggregatePresentation.text}
            </p>
          </section>
          <div className="detail-reading-followups">
            <ReadingDecisionSupport
              cautions={{
                items: cautionHints,
                notice:
                  !cautionHints.length && profileTendency.tone !== "ruhig"
                    ? "Hier wäre alles andere zu geraten."
                    : null,
              }}
              comparisons={{
                items: comparisonItems,
                notice: followupSections.comparison.notice,
              }}
              decision={decision}
            />
            <ReadingEvidenceDetails
              entries={readingEvidenceEntries}
              intro="Kurz und ehrlich: Das hier wird aus Basisdaten und – wenn schon da – aus anonymen Rückmeldungen zusammengesetzt."
            />

            <div id="reading-feedback">
              {writesEnabled ? (
                <ReadingFeedbackForm
                  fields={[
                    { name: "mode", value: "local" },
                    { name: "slug", value: title.external.slug },
                    { name: "returnPath", value: `/titel/${title.external.slug}` },
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
            {title.external.synopsis ?? "Zu diesem Titel liegt gerade nur ein knapper Abriss vor."}
          </p>
        </div>

        <aside className="detail-callout-panel" aria-labelledby="confidence-heading">
          <ResultPoster
            priority
            src={detailPosterPath}
            title={title.external.title}
            variant="detail"
          />
          <p className="eyebrow">Stand heute</p>
          <h2 id="confidence-heading">Worauf das gerade ruht</h2>
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
              <dd>{formatSourceType(title.aggregation.sourceType)}</dd>
            </div>
            <div>
              <dt>Rückmeldungen</dt>
              <dd>{formatRatingCount(title.aggregation.ratingCount)}</dd>
            </div>
            {title.aggregation.lastReviewedAt ? (
              <div>
                <dt>Zuletzt geprüft</dt>
                <dd>{formatDate(title.aggregation.lastReviewedAt)}</dd>
              </div>
            ) : null}
          </dl>

          {writesEnabled ? (
            <p className="detail-callout-action">
              <a className="secondary-button-link" href="#rating-heading">
                Eigene Einschätzung geben
              </a>
            </p>
          ) : null}
        </aside>
      </header>

      {followupSections.sections.length || followupSections.notices.length ? (
        <section className="detail-followups-stack" aria-label="Weiterführende Titel">
          {followupSections.sections.map((section) => (
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
          {followupSections.notices.map((notice) => (
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

      <section className="detail-grid">
        <section aria-labelledby="profile-heading" className="panel detail-panel-profile">
          <h2 id="profile-heading">Die Einordnung</h2>
          <p className="lead detail-profile-lead">
            Grob, absichtlich unaufgeregt und etwas vorsichtig. Genau dafür ist diese Seite da.
          </p>

          <div className="profile-context-grid">
            <section
              aria-labelledby="profile-state-heading"
              className={`profile-context-card profile-context-card-${aggregatePresentation.state}`}
            >
              <p className="profile-context-eyebrow">Status</p>
              <h3 id="profile-state-heading">{aggregatePresentation.label}</h3>
              <p>{aggregatePresentation.text}</p>
            </section>
            <section
              aria-labelledby="profile-confidence-heading"
              className={`profile-context-card profile-context-card-${aggregatePresentation.state}`}
            >
              <p className="profile-context-eyebrow">{confidencePresentation.eyebrow}</p>
              <h3 id="profile-confidence-heading">{confidencePresentation.title}</h3>
              <p>{confidencePresentation.text}</p>
            </section>
          </div>

          <div className="scale-grid">
            {orderedStimulusDimensions.map((dimension) => (
              <ProfileScale
                key={dimension.key}
                featured={dimension.key === "peakIntensity"}
                label={dimension.label}
                help={dimension.help}
                rangeHigh={dimension.rangeHigh}
                rangeLow={dimension.rangeLow}
                value={title.stimulusProfile[dimension.key]}
                valueLabel={dimension.valueLabels[title.stimulusProfile[dimension.key]]}
              />
            ))}
          </div>

          <section className="subsection effect-summary" aria-labelledby="effect-heading">
            <h3 id="effect-heading">Wirkung daneben</h3>
            <p className="effect-value">{`Beruhigende Wirkung: ${formatSoothingEffect(title.soothingEffect)}`}</p>
            <p className="scale-help">{soothingEffectLabels[title.soothingEffect].description}</p>
            <p className="field-note">
              Ein Titel kann anstrengend sein und trotzdem beruhigend wirken. Deshalb bleibt diese
              Achse separat.
            </p>
          </section>
        </section>

        <section className="panel detail-panel-info" aria-labelledby="detail-info-heading">
          <h2 id="detail-info-heading">Mehr Kontext</h2>
          <p className="field-note">
            Kurznotiz, markierte Flags, eine eigene Einschätzung und bei Bedarf auch der Exit.
          </p>

          <dl className="detail-list">
            <div>
              <dt>Kurznotiz</dt>
              <dd>{title.stimulusProfile.notes}</dd>
            </div>
          </dl>

          {watchProviderState ? <WatchProvidersPanel state={watchProviderState} /> : null}
          {letterboxdState?.kind === "success" ? <LetterboxdPanel state={letterboxdState} /> : null}

          <section aria-labelledby="flags-heading" className="subsection">
            <h3 id="flags-heading">Content Flags</h3>
            {title.contentFlags.length ? (
              <ul className="plain-list">
                {title.contentFlags.map((flag) => (
                  <li key={flag}>{flag}</li>
                ))}
              </ul>
            ) : (
              <p className="field-note">Gerade keine markierten Flags.</p>
            )}
          </section>

          <section aria-labelledby="rating-heading" className="subsection rating-section">
            <h3 id="rating-heading">Eigene Einschätzung</h3>
            <p>Vier kurze Fragen. Ohne Konto. Ohne Pomp.</p>
            {writesEnabled ? (
              <>
                <form action={submitRating} className="rating-form">
                  <input type="hidden" name="titleId" value={title.external.slug} />
                  <RatingFormGuard />

                  {renderScaleOptions(
                    "volumeLevel",
                    "Wie laut wirkt der Titel im Grundniveau?",
                    "sehr ruhig",
                    "sehr intensiv",
                    scaleOptions,
                  )}

                  {renderScaleOptions(
                    "peakIntensity",
                    "Wie stark oder häufig treten plötzliche Spitzen auf?",
                    "sehr ruhig",
                    "sehr intensiv",
                    scaleOptions,
                  )}

                  {renderScaleOptions(
                    "stimulusDensity",
                    "Wie dicht ist die akustische Belastung insgesamt?",
                    "sehr ruhig",
                    "sehr intensiv",
                    scaleOptions,
                  )}

                  {renderScaleOptions(
                    "soothingEffect",
                    "Wie beruhigend wirkt der Titel für dich insgesamt?",
                    "gar nicht beruhigend",
                    "deutlich beruhigend",
                    scaleOptions,
                  )}

                  <button className="primary-button" type="submit">Einschätzung senden</button>
                </form>

                {visibleRatingStatus ? (
                  <StatusPanel
                    id="rating-feedback"
                    className="status-panel-inline"
                    headingAs="h4"
                    title={visibleRatingStatus.title}
                    text={visibleRatingStatus.text}
                    tone={visibleRatingStatus.tone}
                  />
                ) : null}

                <p className="field-note">Anonym, mit kleiner Bremse gegen Dauerfeuer.</p>
              </>
            ) : (
              <StatusPanel
                id="rating-feedback"
                className="status-panel-inline"
                headingAs="h4"
                title={visibleRatingStatus?.title ?? ""}
                text={visibleRatingStatus?.text ?? ""}
                tone={visibleRatingStatus?.tone ?? "warning"}
              />
            )}
          </section>

          {showDeleteAction ? (
            <section aria-labelledby="delete-heading" className="subsection">
              <h3 id="delete-heading">Titel entfernen</h3>
              <p className="field-note">
                Löscht nur den lokalen Stand in null-noise. Der reale Titel bleibt derselbe.
              </p>
              <details className="disclosure">
                <summary>Lokalen Stand entfernen</summary>
                <p>Das ist absichtlich noch ein zweiter Schritt.</p>
                <form action="/api/local-titles/delete" className="external-import-form" method="post">
                  <input type="hidden" name="slug" value={title.external.slug} />
                  <input type="hidden" name="successPath" value={deleteSuccessPath} />
                  <input
                    type="hidden"
                    name="errorPath"
                    value={`/titel/${title.external.slug}#title-delete-feedback`}
                  />
                  <button className="quiet-button quiet-button-danger" type="submit">
                    Jetzt entfernen
                  </button>
                </form>
              </details>
              {deleteStatus ? (
                <StatusPanel
                  id="title-delete-feedback"
                  className="status-panel-inline"
                  headingAs="h4"
                  title={deleteStatus.title}
                  text={deleteStatus.text}
                  tone={deleteStatus.tone}
                />
              ) : null}
            </section>
          ) : null}
        </section>
      </section>

      <ExplanationPanel compact />
    </article>
  );
}
