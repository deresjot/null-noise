import { notFound } from "next/navigation";

import { ExplanationPanel } from "@/components/explanation-panel";
import { ProfileScale } from "@/components/profile-scale";
import { RatingFormGuard } from "@/components/rating-form-guard";
import { StatusPanel } from "@/components/status-panel";
import { soothingEffectLabels, stimulusDimensions } from "@/lib/constants";
import {
  getAggregatePresentation,
  formatDate,
  formatKind,
  formatRatingCount,
  formatSoothingEffect,
  formatSourceType,
  getConfidencePresentation,
} from "@/lib/format";
import { formatScaleLegend, getScaleOptions } from "@/lib/ratings";
import { getTitleBySlugState } from "@/lib/queries";
import { arePublicWritesEnabled } from "@/lib/runtime-config";
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

function getRatingStatus(value: string | string[] | undefined): RatingStatus {
  const rating = Array.isArray(value) ? value[0] : value;

  if (rating === "success") {
    return {
      title: "Einschätzung übernommen",
      text: "Danke. Deine Einschätzung wurde übernommen. Das sichtbare Profil wurde serverseitig neu verdichtet und zeigt jetzt den aktuellen Stand.",
      tone: "success",
    };
  }

  if (rating === "cooldown") {
    return {
      title: "Für diesen Titel liegt gerade schon eine frische Einschätzung vor",
      text: "Für diesen Titel wurde gerade bereits eine Einschätzung abgegeben. Bitte versuche es später noch einmal.",
      tone: "warning",
    };
  }

  if (rating === "limited") {
    return {
      title: "Gerade gehen schon viele Einschätzungen ein",
      text: "Bitte versuche es später noch einmal. Das bisher sichtbare Profil bleibt unverändert.",
      tone: "warning",
    };
  }

  if (rating === "too-fast") {
    return {
      title: "Die Einschätzung wurde noch nicht übernommen",
      text: "Bitte fülle das Formular in Ruhe vollständig aus und sende es dann erneut.",
      tone: "warning",
    };
  }

  if (rating === "invalid") {
    return {
      title: "Die Einschätzung konnte nicht übernommen werden",
      text: "Bitte beantworte alle vier Fragen mit einer Stufe von 0 bis 4.",
      tone: "error",
    };
  }

  if (rating === "error") {
    return {
      title: "Die Einschätzung konnte gerade nicht gespeichert werden",
      text: "Bitte versuche es in einem Moment noch einmal. Das bisherige Profil bleibt unverändert sichtbar.",
      tone: "error",
    };
  }

  if (rating === "inactive") {
    return {
      title: "Bewertungen sind auf dieser Beta noch nicht aktiv",
      text: "Die öffentliche Instanz bleibt vorerst lesend. Das sichtbare Profil bleibt nutzbar und wird weiter ausgebaut.",
      tone: "warning",
    };
  }

  return null;
}

function getImportStatus(value: string | string[] | undefined): RatingStatus {
  const status = Array.isArray(value) ? value[0] : value;

  if (status === "created") {
    return {
      title: "Titel lokal angelegt",
      text: "Dieser Titel hat jetzt in null-noise eine vorläufige Startbasis aus Metadaten und kann direkt eingeschätzt werden.",
      tone: "success",
    };
  }

  if (status === "exists") {
    return {
      title: "Titel bereits lokal vorhanden",
      text: "Für diesen Titel gab es bereits eine lokale Detailseite. Du kannst direkt mit den vorhandenen Einschätzungen weiterarbeiten.",
      tone: "neutral",
    };
  }

  return null;
}

export default async function TitleDetailPage({ params, searchParams }: DetailPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const importStatus = getImportStatus(resolvedSearchParams.import);
  const ratingStatus = getRatingStatus(resolvedSearchParams.rating);
  const { data: title, unavailable: titleUnavailable } = await getTitleBySlugState(slug);
  const writesEnabled = arePublicWritesEnabled();

  if (!title) {
    if (titleUnavailable) {
      return (
        <article className="section-stack">
          <header className="detail-hero">
            <div>
              <p className="eyebrow">Lokale Detailseite</p>
              <h1>Die lokale Titelbasis ist gerade nicht verfügbar</h1>
              <p className="lead">
                Dieser Titel konnte gerade nicht aus der lokalen Persistenz geladen werden. Bitte
                versuche es später noch einmal.
              </p>
            </div>
          </header>
          <StatusPanel
            title="Die lokale Titelbasis ist gerade nicht verfügbar"
            text="Reizprofil, Confidence und Bewertungsformular konnten gerade nicht geladen werden. Die getrennte Metadatenlogik bleibt davon unberührt."
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
  const aggregatePresentation = getAggregatePresentation(title.aggregation.sourceType);
  const confidencePresentation = getConfidencePresentation(
    title.aggregation,
    aggregatePresentation.state,
  );
  const orderedStimulusDimensions = [
    stimulusDimensions.find((dimension) => dimension.key === "peakIntensity"),
    stimulusDimensions.find((dimension) => dimension.key === "volumeLevel"),
    stimulusDimensions.find((dimension) => dimension.key === "stimulusDensity"),
  ].filter((dimension): dimension is StimulusDimension => Boolean(dimension));
  const inactiveRatingState: RatingStatus = !writesEnabled
    ? {
        title: "Auf dieser Beta bleibt die Bewertungsabgabe noch deaktiviert",
        text: "Die öffentliche Instanz konzentriert sich vorerst auf Suche, Reizprofile und getrennte Metadaten. Neue Einschätzungen werden erst mit belastbarer Persistenz öffentlich zugeschaltet.",
        tone: "warning",
      }
    : null;
  const visibleRatingStatus = ratingStatus ?? inactiveRatingState;

  return (
    <article className="section-stack">
      {importStatus ? (
        <StatusPanel
          title={importStatus.title}
          text={importStatus.text}
          tone={importStatus.tone}
        />
      ) : null}

      <header className="detail-hero">
        <div>
          <p className="eyebrow">
            {`${formatKind(title.external.kind)} - ${title.external.year ?? "Jahr offen"}`}
          </p>
          <h1>{title.external.title}</h1>
          <p className="lead">
            {title.external.synopsis ?? "Zu diesem Titel liegt lokal gerade nur eine knappe Inhaltsangabe vor."}
          </p>
        </div>
        <aside className="panel panel-emphasis" aria-labelledby="confidence-heading">
          <h2 id="confidence-heading">Wie belastbar ist die Einschätzung?</h2>
          <p className="confidence-callout-eyebrow">{confidencePresentation.eyebrow}</p>
          <p className="confidence-callout-title">{confidencePresentation.title}</p>
          <p>{confidencePresentation.text}</p>
        </aside>
      </header>

      <section className="detail-grid">
        <section aria-labelledby="profile-heading" className="panel detail-panel-profile">
          <h2 id="profile-heading">Einschätzung der Reizintensität</h2>
          <p className="lead detail-profile-lead">
            Die drei Werte sind grobe Einschätzungen, keine Messwerte. Besonders wichtig ist hier,
            wie deutlich plötzliche Spitzen auftreten.
          </p>
          <div className="profile-context-grid">
            <section
              aria-labelledby="profile-state-heading"
              className={`profile-context-card profile-context-card-${aggregatePresentation.state}`}
            >
              <p className="profile-context-eyebrow">{aggregatePresentation.state === "seed" ? "Vorläufige Basis" : "Aktueller Stand"}</p>
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
            <h3 id="effect-heading">Subjektive Wirkung</h3>
            <p className="effect-value">{`Beruhigende Wirkung: ${formatSoothingEffect(title.soothingEffect)}`}</p>
            <p className="scale-help">{soothingEffectLabels[title.soothingEffect].description}</p>
            <p className="field-note">
              Diese Einordnung bleibt getrennt vom Reizprofil. Ein Titel kann also reizintensiv
              und zugleich subjektiv regulierend wirken.
            </p>
          </section>
        </section>

        <section className="panel detail-panel-info" aria-labelledby="detail-info-heading">
          <h2 id="detail-info-heading">Transparenz und Einordnung</h2>
          <StatusPanel
            className={`profile-origin-panel profile-origin-panel-${aggregatePresentation.state}`}
            headingAs="h3"
            text={aggregatePresentation.text}
            title={aggregatePresentation.label}
            tone="neutral"
          />
          <dl className="detail-list">
            <div>
              <dt>Profilgrundlage</dt>
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
            <div>
              <dt>Hinweis</dt>
              <dd>{title.stimulusProfile.notes}</dd>
            </div>
          </dl>
          {title.external.externalSource === "tmdb" ? (
            <p className="field-note">
              Titel, Jahr und Synopsis stammen aus TMDb. Das Reizprofil gehört trotzdem nicht zu
              den externen Metadaten, sondern bleibt eine null-noise-interne Einordnung.
            </p>
          ) : null}

          <section aria-labelledby="flags-heading" className="subsection">
            <h3 id="flags-heading">Content Flags</h3>
            <ul className="plain-list">
              {title.contentFlags.map((flag) => (
                <li key={flag}>{flag}</li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="rating-heading" className="subsection rating-section">
            <h3 id="rating-heading">Bewertung ohne Login</h3>
            <p>
              Die Skala 0 bis 4 ist eine Einschätzung, kein Messwert. Reizprofil und beruhigende
              Wirkung bleiben getrennt, und ein Titel kann intensiv sein und trotzdem subjektiv
              regulierend wirken.
            </p>
            {writesEnabled ? (
              <>
                <form action={submitRating} className="rating-form">
                  <input type="hidden" name="titleId" value={title.external.slug} />
                  <RatingFormGuard />

                  <fieldset className="rating-fieldset">
                    <legend>Wie laut wirkt der Titel im Grundniveau?</legend>
                    <p className="field-note">{formatScaleLegend("sehr ruhig", "sehr intensiv")}</p>
                    <div className="rating-options">
                      {scaleOptions.map((value) => (
                        <label key={`volume-${value}`} className="rating-option">
                          <input type="radio" name="volumeLevel" value={value} required />
                          <span>{value}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className="rating-fieldset">
                    <legend>Wie stark oder häufig treten plötzliche Spitzen auf?</legend>
                    <p className="field-note">{formatScaleLegend("sehr ruhig", "sehr intensiv")}</p>
                    <div className="rating-options">
                      {scaleOptions.map((value) => (
                        <label key={`peak-${value}`} className="rating-option">
                          <input type="radio" name="peakIntensity" value={value} required />
                          <span>{value}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className="rating-fieldset">
                    <legend>Wie dicht ist die akustische Belastung insgesamt?</legend>
                    <p className="field-note">{formatScaleLegend("sehr ruhig", "sehr intensiv")}</p>
                    <div className="rating-options">
                      {scaleOptions.map((value) => (
                        <label key={`density-${value}`} className="rating-option">
                          <input type="radio" name="stimulusDensity" value={value} required />
                          <span>{value}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className="rating-fieldset">
                    <legend>Wie beruhigend wirkt der Titel für dich insgesamt?</legend>
                    <p className="field-note">
                      {formatScaleLegend("gar nicht beruhigend", "deutlich beruhigend")}
                    </p>
                    <div className="rating-options">
                      {scaleOptions.map((value) => (
                        <label key={`soothing-${value}`} className="rating-option">
                          <input type="radio" name="soothingEffect" value={value} required />
                          <span>{value}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <button className="primary-button" type="submit">
                    Einschätzung speichern
                  </button>
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
                <p className="field-note">
                  Die Abgabe bleibt anonym und ohne Konto. Wiederholte Direktabgaben werden kurz und
                  zurückhaltend gebremst.
                </p>
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
        </section>
      </section>

      <ExplanationPanel compact />
    </article>
  );
}
