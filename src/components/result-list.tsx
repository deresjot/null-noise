import Link from "next/link";

import { SearchToneScale } from "@/components/search-tone-scale";
import {
  getAggregatePresentation,
  formatConfidenceSummary,
  formatKind,
  formatScaleCompact,
  formatSourceType,
} from "@/lib/format";
import { getToneLabel } from "@/lib/search";
import type { TitleRecord } from "@/lib/types";

interface ResultListProps {
  titles: TitleRecord[];
  emptyTitle: string;
  emptyText: string;
}

export function ResultList({ titles, emptyTitle, emptyText }: ResultListProps) {
  if (!titles.length) {
    return (
      <section className="panel" aria-labelledby="empty-results-heading">
        <h2 id="empty-results-heading">{emptyTitle}</h2>
        <p>{emptyText}</p>
      </section>
    );
  }

  return (
    <ul className="result-grid">
      {titles.map((title) => {
        const tone = getToneLabel(title);
        const aggregatePresentation = getAggregatePresentation(title.aggregation.sourceType);

        return (
          <li key={title.external.slug}>
            <article
              className="result-card"
              data-profile-state={aggregatePresentation.state}
              data-tone={tone}
            >
              <div className="card-topline">
                <p className="eyebrow">
                  {`${formatKind(title.external.kind)} - ${title.external.year ?? "Jahr offen"}`}
                </p>
                <div className="card-chip-row">
                  <span className="tone-chip" data-tone={tone}>
                    {tone}
                  </span>
                  <span className="state-chip" data-profile-state={aggregatePresentation.state}>
                    {aggregatePresentation.chip}
                  </span>
                </div>
              </div>
              <h3 className="card-title">
                <Link href={`/titel/${title.external.slug}`}>{title.external.title}</Link>
              </h3>
              <p>
                {title.external.synopsis ??
                  "Zu diesem Titel liegt lokal gerade nur eine knappe Inhaltsangabe vor."}
              </p>
              <div className="result-card-state" data-profile-state={aggregatePresentation.state}>
                <p className="result-card-state-kicker">{aggregatePresentation.label}</p>
                <p className="result-card-state-text">{aggregatePresentation.text}</p>
              </div>
              <SearchToneScale mode={aggregatePresentation.state} value={tone} />
              <dl className="profile-summary-grid">
                <div>
                  <dt>Grundlautstärke</dt>
                  <dd>{formatScaleCompact(title.stimulusProfile.volumeLevel)}</dd>
                </div>
                <div>
                  <dt>Spitzen</dt>
                  <dd>{formatScaleCompact(title.stimulusProfile.peakIntensity)}</dd>
                </div>
                <div>
                  <dt>Dichte</dt>
                  <dd>{formatScaleCompact(title.stimulusProfile.stimulusDensity)}</dd>
                </div>
              </dl>
              <p className="confidence-line">{`Confidence: ${formatConfidenceSummary(title.aggregation)}`}</p>
              <p className="field-note">{`Profilgrundlage: ${formatSourceType(title.aggregation.sourceType)}`}</p>
              <div className="card-actions">
                <Link
                  aria-label={`Details zu ${title.external.title} ansehen`}
                  className="secondary-button-link"
                  href={`/titel/${title.external.slug}`}
                >
                  {`Details zu ${title.external.title} ansehen`}
                </Link>
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
