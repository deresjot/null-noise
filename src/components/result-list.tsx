import Link from "next/link";

import {
  getCardReadingStatus,
  formatKind,
  getSearchAggregatePresentation,
  getProfileTendency,
} from "@/lib/format";
import { getTmdbPosterProxyPath } from "@/lib/metadata-shared";
import { buildTitlePocketEntryFromTitle } from "@/lib/title-pocket";
import type { TitleRecord } from "@/lib/types";
import { SearchToneScale } from "./search-tone-scale";
import { ResultPoster } from "./result-poster";
import { TitlePocketActions } from "./title-pocket-actions";

interface ResultListProps {
  titles: TitleRecord[];
  emptyTitle: string;
  emptyText: string;
  allowDelete?: boolean;
  detailMode?: "local" | "external";
  displayMode?: "list" | "grid";
  returnPath?: string;
}

function formatMetaLine(title: TitleRecord): string {
  return `${formatKind(title.external.kind)} · ${title.external.year ?? "Jahr offen"}`;
}

function getLocalPosterPath(title: TitleRecord): string | null {
  if (title.external.externalSource !== "tmdb" && title.external.externalSource !== "tmdb_seed") {
    return null;
  }

  return getTmdbPosterProxyPath(title.external.posterPath);
}

function getExternalDetailPath(title: TitleRecord): string | null {
  if (title.external.externalSource !== "tmdb" && title.external.externalSource !== "tmdb_seed") {
    return null;
  }

  if (!/^\d+$/.test(title.external.externalSourceId)) {
    return null;
  }

  return `/spike/metadaten/${title.external.kind}/${title.external.externalSourceId}`;
}

export function ResultList({
  titles,
  emptyTitle,
  emptyText,
  allowDelete = false,
  detailMode = "local",
  displayMode = "list",
  returnPath = "/suche",
}: ResultListProps) {
  if (!titles.length) {
    return (
      <section className="panel panel-emphasis" aria-labelledby="empty-results-heading">
        <h2 id="empty-results-heading">{emptyTitle}</h2>
        <p>{emptyText}</p>
      </section>
    );
  }

  return (
    <ul className="result-grid" data-layout={displayMode}>
      {titles.map((title) => {
        const tendency = getProfileTendency(title.stimulusProfile);
        const aggregatePresentation = getSearchAggregatePresentation(title.aggregation);
        const cardReadingStatus = getCardReadingStatus(title.aggregation);
        const localDetailPath = `/titel/${title.external.slug}`;
        const externalDetailPath = getExternalDetailPath(title);
        const detailPath =
          detailMode === "external" && externalDetailPath ? externalDetailPath : localDetailPath;
        const showDeleteAction =
          detailMode === "local" && allowDelete && title.external.externalSource !== "tmdb_seed";
        const actionLabel =
          detailMode === "external" && externalDetailPath ? "Details" : "Einordnung lesen";
        const actionClassName =
          detailMode === "external" && externalDetailPath
            ? "secondary-button-link result-card-action-link"
            : "secondary-button-link result-card-action-link";
        const pocketEntry = buildTitlePocketEntryFromTitle(title, detailPath);

        return (
          <li key={title.external.slug}>
            <article
              className="result-card"
              data-profile-state={aggregatePresentation.state}
              data-title-pocket-key={pocketEntry.key}
              data-tone={tendency.tone}
            >
              <Link
                aria-label={`Poster und Einordnung zu ${title.external.title} öffnen`}
                className="poster-thumb-link"
                href={detailPath}
              >
                <ResultPoster
                  sizes="(max-width: 980px) min(100vw - 2rem, 32rem), 15rem"
                  src={getLocalPosterPath(title)}
                  title={title.external.title}
                />
              </Link>

              <header className="result-card-title-zone">
                <p className="card-topline">{formatMetaLine(title)}</p>
                <h3 className="card-title">
                  <Link href={detailPath}>{title.external.title}</Link>
                </h3>
              </header>

              <div className="result-card-reading-block">
                <p className="result-card-reading-kicker">Erste Einschätzung</p>
                <SearchToneScale
                  caption="Erste Einschätzung"
                  emphasis="card"
                  mode={aggregatePresentation.state}
                  showCaption={false}
                  showValueLabel
                  startLabel="ruhig"
                  endLabel="intensiv"
                  value={tendency.tone}
                  valueLabel={tendency.label}
                />
                <p className="result-card-reading-status">{cardReadingStatus}</p>
              </div>

              <footer className="result-card-footer-zone">
                <div className="result-card-cta-zone">
                  <Link
                    aria-label={`${actionLabel === "Details" ? "Titeldaten" : "Einordnung"} zu ${title.external.title} öffnen`}
                    className={`${actionClassName} result-card-cta-button`}
                    href={detailPath}
                  >
                    {actionLabel}
                  </Link>
                </div>

                {showDeleteAction ? (
                  <div className="result-card-note-zone">
                    <details className="disclosure">
                      <summary>Titel entfernen</summary>
                      <p className="field-note">
                        Löscht nur den lokalen Stand. Der Titel kann später wieder neu angelegt
                        werden.
                      </p>
                      <form action="/api/local-titles/delete" className="external-import-form" method="post">
                        <input type="hidden" name="slug" value={title.external.slug} />
                        <input type="hidden" name="successPath" value={returnPath} />
                        <input type="hidden" name="errorPath" value={returnPath} />
                        <button className="quiet-button quiet-button-danger" type="submit">
                          Jetzt entfernen
                        </button>
                      </form>
                    </details>
                  </div>
                ) : null}
                <div className="result-card-memory-zone">
                  <TitlePocketActions entry={pocketEntry} variant="tile" />
                </div>
              </footer>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
