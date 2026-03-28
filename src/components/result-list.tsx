import Link from "next/link";

import { formatConfidenceSummary, formatKind, formatScaleCompact } from "@/lib/format";
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
      {titles.map((title) => (
        <li key={title.external.slug}>
          <article className="result-card">
            <div className="card-topline">
              <p className="eyebrow">
                {`${formatKind(title.external.kind)} - ${title.external.year ?? "Jahr offen"}`}
              </p>
              <span className="tone-chip">{getToneLabel(title)}</span>
            </div>
            <h3 className="card-title">
              <Link href={`/titel/${title.external.slug}`}>{title.external.title}</Link>
            </h3>
            <p>{title.external.synopsis ?? "Zu diesem Titel liegt lokal gerade nur eine knappe Inhaltsangabe vor."}</p>
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
          </article>
        </li>
      ))}
    </ul>
  );
}
