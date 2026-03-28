import { notFound } from "next/navigation";

import { ExplanationPanel } from "@/components/explanation-panel";
import { ProfileScale } from "@/components/profile-scale";
import { RatingFormGuard } from "@/components/rating-form-guard";
import { StatusPanel } from "@/components/status-panel";
import { confidenceLabels, soothingEffectLabels, stimulusDimensions } from "@/lib/constants";
import {
  formatConfidenceSummary,
  formatDate,
  formatKind,
  formatSoothingEffect,
  formatSourceType,
} from "@/lib/format";
import { formatScaleLegend, getScaleOptions } from "@/lib/ratings";
import { getTitleBySlug } from "@/lib/queries";
import { arePublicWritesEnabled } from "@/lib/runtime-config";
import { submitTitleRatingAction } from "./actions";

type DetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type RatingStatus = {
  title: string;
  text: string;
  tone: "neutral" | "warning" | "error";
} | null;

function getRatingStatus(value: string | string[] | undefined): RatingStatus {
  const rating = Array.isArray(value) ? value[0] : value;

  if (rating === "success") {
    return {
      title: "Einschätzung übernommen",
      text: "Danke. Deine Einschätzung wurde übernommen. Das sichtbare Profil wurde serverseitig neu verdichtet und zeigt jetzt den aktuellen Stand.",
      tone: "neutral",
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
      text: "Dieser Titel hat jetzt in null-noise eine vorläufige Startbasis und kann direkt eingeschätzt werden.",
      tone: "neutral",
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
  const title = await getTitleBySlug(slug);
  const writesEnabled = arePublicWritesEnabled();

  if (!title) {
    notFound();
  }

  const submitRating = submitTitleRatingAction.bind(null, title.external.slug);
  const scaleOptions = getScaleOptions();

  return (
    <article className="section-stack">
      {importStatus ?? ratingStatus ? (
        <StatusPanel
          title={(importStatus ?? ratingStatus)?.title ?? ""}
          text={(importStatus ?? ratingStatus)?.text ?? ""}
          tone={(importStatus ?? ratingStatus)?.tone ?? "neutral"}
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
          <h2 id="confidence-heading">Confidence</h2>
          <p>{`Confidence: ${formatConfidenceSummary(title.aggregation)}`}</p>
          <p>{confidenceLabels[title.aggregation.level].description}</p>
        </aside>
      </header>

      <section className="detail-grid">
        <section aria-labelledby="profile-heading" className="panel">
          <h2 id="profile-heading">Reizprofil</h2>
          <div className="scale-grid">
            {stimulusDimensions.map((dimension) => (
              <ProfileScale
                key={dimension.key}
                label={dimension.label}
                help={dimension.help}
                value={title.stimulusProfile[dimension.key]}
              />
            ))}
          </div>

          <section className="subsection effect-summary" aria-labelledby="effect-heading">
            <h3 id="effect-heading">Zusätzliche subjektive Wirkung</h3>
            <p className="effect-value">{`Beruhigende Wirkung: ${formatSoothingEffect(title.soothingEffect)}`}</p>
            <p className="scale-help">{soothingEffectLabels[title.soothingEffect].description}</p>
            <p className="field-note">
              Diese Einordnung bleibt getrennt vom Reizprofil. Ein Titel kann also reizintensiv
              und zugleich subjektiv regulierend wirken.
            </p>
          </section>
        </section>

        <section className="panel" aria-labelledby="detail-info-heading">
          <h2 id="detail-info-heading">Transparenz und Einordnung</h2>
          <dl className="detail-list">
            <div>
              <dt>Profilgrundlage</dt>
              <dd>{formatSourceType(title.aggregation.sourceType)}</dd>
            </div>
            <div>
              <dt>Anzahl Einschätzungen</dt>
              <dd>{title.aggregation.ratingCount}</dd>
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
              Titel, Jahr und Synopsis stammen aus TMDb. Das Reizprofil gehört nicht zu den
              externen Metadaten, sondern entsteht in null-noise aus einer vorläufigen Startbasis
              und späteren anonymen Einschätzungen.
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

          <section aria-labelledby="rating-heading" className="subsection">
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
                <p className="field-note">
                  Die Abgabe bleibt anonym und ohne Konto. Wiederholte Direktabgaben werden kurz und
                  zurückhaltend gebremst.
                </p>
              </>
            ) : (
              <div className="status-panel panel" data-tone="warning">
                <h4>Auf dieser Beta bleibt die Bewertungsabgabe noch deaktiviert</h4>
                <p>
                  Die öffentliche Instanz konzentriert sich vorerst auf Suche, Reizprofile und
                  getrennte Metadaten. Neue Einschätzungen werden erst mit belastbarer Persistenz
                  öffentlich zugeschaltet.
                </p>
              </div>
            )}
          </section>
        </section>
      </section>

      <ExplanationPanel compact />
    </article>
  );
}
