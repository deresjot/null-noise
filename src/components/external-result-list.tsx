import Link from "next/link";

import {
  getCompactProfileTendencyLabel,
  getReadingReasonLine,
  getSearchAggregatePresentation,
  getProfileTendency,
} from "@/lib/format";
import { createTitleExternalLookupKey } from "@/lib/local-titles";
import { createMetadataInferencePreview } from "@/lib/metadata-inference";
import { getTmdbPosterProxyPath, type MetadataSpikeTitle } from "@/lib/metadata-spike";
import { normalizeSearchText } from "@/lib/search";
import { buildTitlePocketEntryFromMetadata } from "@/lib/title-pocket";
import { ResultPoster } from "./result-poster";
import { SearchToneScale } from "./search-tone-scale";
import { TitlePocketActions } from "./title-pocket-actions";

interface ExternalResultListProps {
  items: MetadataSpikeTitle[];
  localTitleByExternalKey?: Record<string, string>;
  query: string;
  writesEnabled?: boolean;
}

function formatMediaType(value: MetadataSpikeTitle["mediaType"]): string {
  return value === "movie" ? "Film" : "Serie";
}

function formatMetaLine(item: MetadataSpikeTitle): string {
  return `${formatMediaType(item.mediaType)} · ${item.releaseYear ?? "Jahr offen"}`;
}

function getEditDistance(a: string, b: string): number {
  if (a === b) {
    return 0;
  }

  if (!a.length) {
    return b.length;
  }

  if (!b.length) {
    return a.length;
  }

  const matrix = Array.from({ length: a.length + 1 }, (_, rowIndex) =>
    Array.from({ length: b.length + 1 }, (_, columnIndex) => {
      if (rowIndex === 0) {
        return columnIndex;
      }

      if (columnIndex === 0) {
        return rowIndex;
      }

      return 0;
    }),
  );

  for (let row = 1; row <= a.length; row += 1) {
    for (let column = 1; column <= b.length; column += 1) {
      const substitutionCost = a[row - 1] === b[column - 1] ? 0 : 1;

      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + substitutionCost,
      );
    }
  }

  return matrix[a.length][b.length];
}

function getFeaturedScore(item: MetadataSpikeTitle, query: string): number {
  const normalizedTitle = normalizeSearchText(item.title);
  const normalizedQuery = normalizeSearchText(query);
  const titleDistance =
    normalizedTitle && normalizedQuery
      ? getEditDistance(normalizedTitle, normalizedQuery)
      : Number.POSITIVE_INFINITY;
  let score = 0;

  if (normalizedTitle === normalizedQuery) {
    score += 260;
  } else if (titleDistance === 1) {
    score += 240;
  } else if (normalizedTitle.startsWith(normalizedQuery)) {
    score += 180;
  } else if (normalizedTitle.includes(normalizedQuery)) {
    score += 120;
  }

  if (item.synopsis) {
    score += Math.min(Math.round(item.synopsis.length / 8), 120);
  }

  return score;
}

function getSortedItems(items: MetadataSpikeTitle[], query: string): MetadataSpikeTitle[] {
  if (!normalizeSearchText(query)) {
    return [...items];
  }

  return [...items].sort((left, right) => {
    const leftScore = getFeaturedScore(left, query);
    const rightScore = getFeaturedScore(right, query);

    if (leftScore !== rightScore) {
      return rightScore - leftScore;
    }

    return items.indexOf(left) - items.indexOf(right);
  });
}

function getLocalTitlePath(
  item: MetadataSpikeTitle,
  localTitleByExternalKey: Record<string, string>,
): string | null {
  const slug = localTitleByExternalKey[
    createTitleExternalLookupKey(item.externalSource, item.sourceId)
  ];

  return slug ? `/titel/${slug}` : null;
}

function getExternalDetailPath(item: MetadataSpikeTitle, query: string): string {
  const searchParams = new URLSearchParams();

  if (query) {
    searchParams.set("q", query);
  }

  const queryString = searchParams.toString();
  const path = `/spike/metadaten/${item.mediaType}/${item.sourceId}`;

  return queryString ? `${path}?${queryString}` : path;
}

function ExternalItemAction({
  item,
  query,
  localPath,
  writesEnabled,
}: {
  item: MetadataSpikeTitle;
  query: string;
  localPath: string | null;
  writesEnabled: boolean;
}) {
  if (localPath) {
    return (
      <>
        <div className="result-card-cta-zone">
          <Link
            aria-label={`Einordnung zu ${item.title} öffnen`}
            className="secondary-button-link result-card-cta-button"
            href={localPath}
          >
            Einordnung lesen
          </Link>
        </div>
        <div className="result-card-note-zone">
          <p className="result-card-note">Hier liegt schon eine eigene Seite bereit.</p>
        </div>
      </>
    );
  }

  if (!writesEnabled) {
    return (
      <>
        <div className="result-card-cta-zone">
          <Link
            aria-label={`Titeldaten zu ${item.title} öffnen`}
            className="secondary-button-link result-card-action-link result-card-cta-button"
            href={getExternalDetailPath(item, query)}
          >
            Details
          </Link>
        </div>
        <div className="result-card-note-zone">
          <p className="result-card-note">Diese Instanz bleibt gerade lesend.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="result-card-cta-zone">
        <Link
          aria-label={`Titeldaten zu ${item.title} öffnen`}
          className="secondary-button-link result-card-action-link result-card-cta-button"
          href={getExternalDetailPath(item, query)}
        >
          Details
        </Link>
      </div>
      <div className="result-card-note-zone">
        <p className="result-card-note">Lokales Anlegen liegt erst auf der Detailseite.</p>
      </div>
    </>
  );
}

export function ExternalResultList({
  items,
  localTitleByExternalKey = {},
  query,
  writesEnabled = true,
}: ExternalResultListProps) {
  if (!items.length) {
    return null;
  }

  const sortedItems = getSortedItems(items, query);

  return (
    <ul className="result-grid result-grid-external">
      {sortedItems.map((item) => {
        const preview = createMetadataInferencePreview(item);
        const tendency = getProfileTendency(preview.stimulusProfile);
        const aggregatePresentation = getSearchAggregatePresentation(preview.aggregation);
        const localPath = getLocalTitlePath(item, localTitleByExternalKey);
        const detailPath = localPath ?? getExternalDetailPath(item, query);
        const pocketEntry = buildTitlePocketEntryFromMetadata(item, {
          href: detailPath,
          profile: preview.stimulusProfile,
        });

        return (
          <li key={item.externalId}>
            <article
              className="result-card metadata-card"
              data-profile-state={localPath ? "rated" : "seed"}
              data-title-pocket-key={pocketEntry.key}
              data-tone={tendency.tone}
            >
              <Link
                aria-label={`Poster und Details zu ${item.title} öffnen`}
                className="poster-thumb-link"
                href={detailPath}
              >
                <ResultPoster
                  sizes="(max-width: 980px) min(100vw - 2rem, 32rem), 15rem"
                  src={getTmdbPosterProxyPath(item.posterPath)}
                  title={item.title}
                />
              </Link>

              <header className="result-card-title-zone">
                <p className="card-topline">{formatMetaLine(item)}</p>
                <h3 className="card-title">
                  {localPath ? (
                    <Link href={localPath}>{item.title}</Link>
                  ) : (
                    <Link href={detailPath}>{item.title}</Link>
                  )}
                </h3>
              </header>

              <section
                className="result-card-reading-block"
                aria-label={localPath ? "Einordnung" : "Erstlesart"}
              >
                <p className="result-card-reading-kicker">{localPath ? "Einordnung" : "Erstlesart"}</p>
                <p className="result-card-reading-value">
                  {getCompactProfileTendencyLabel(tendency.tone)}
                </p>
                <SearchToneScale
                  caption={localPath ? "Einordnung" : "Erstlesart"}
                  emphasis="card"
                  mode={aggregatePresentation.state}
                  showCaption={false}
                  showValueLabel={false}
                  value={tendency.tone}
                  valueLabel={getCompactProfileTendencyLabel(tendency.tone)}
                />
                <p className="result-card-reading-reason">
                  {getReadingReasonLine(preview.stimulusProfile)}
                </p>
                <p className="result-card-reading-status">
                  <strong>{localPath ? "Schon lokal" : aggregatePresentation.label}</strong>
                  <span>
                    {localPath
                      ? "Dafür gibt es hier schon einen eigenen Stand."
                      : aggregatePresentation.text}
                  </span>
                </p>
              </section>

              <footer className="result-card-footer-zone">
                <ExternalItemAction
                  item={item}
                  localPath={localPath}
                  query={query}
                  writesEnabled={writesEnabled}
                />
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
