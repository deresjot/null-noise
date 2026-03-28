import Image from "next/image";
import Link from "next/link";

import { createTitleExternalLookupKey } from "@/lib/local-titles";
import {
  formatMetadataSpikeSource,
  getTmdbPosterProxyPath,
  type MetadataSpikeTitle,
} from "@/lib/metadata-spike";
import { normalizeSearchText } from "@/lib/search";

interface ExternalResultListProps {
  items: MetadataSpikeTitle[];
  localTitleByExternalKey?: Record<string, string>;
  query: string;
  writesEnabled?: boolean;
}

function formatMediaType(value: MetadataSpikeTitle["mediaType"]): string {
  return value === "movie" ? "Film" : "Serie";
}

function truncateText(value: string | null, maxLength: number): string {
  const normalized = value?.trim();

  if (!normalized) {
    return "Zu diesem Titel liegt gerade nur ein knapper externer Metadatentreffer vor.";
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const shortened = normalized.slice(0, maxLength).trimEnd();
  const safeCut = shortened.lastIndexOf(" ");

  return `${(safeCut > 72 ? shortened.slice(0, safeCut) : shortened).trimEnd()}…`;
}

function formatMetaLine(item: MetadataSpikeTitle): string {
  return `${formatMediaType(item.mediaType)} · ${item.releaseYear ?? "Jahr offen"} · ${formatMetadataSpikeSource(item.externalSource)}`;
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

  if (item.posterPath) {
    score += 16;
  }

  if (item.title === item.title.toLocaleLowerCase("de")) {
    score -= 140;
  }

  return score;
}

function pickFeaturedItem(items: MetadataSpikeTitle[], query: string): MetadataSpikeTitle {
  return [...items].sort((left, right) => {
    const leftScore = getFeaturedScore(left, query);
    const rightScore = getFeaturedScore(right, query);

    if (leftScore !== rightScore) {
      return rightScore - leftScore;
    }

    return items.indexOf(left) - items.indexOf(right);
  })[0];
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
      <div className="external-card-actions">
        <Link className="secondary-link" href={localPath}>
          Lokale Detailseite öffnen
        </Link>
        <p className="field-note">Für diesen Titel gibt es in null-noise bereits eine lokale Startbasis.</p>
      </div>
    );
  }

  if (!writesEnabled) {
    return (
      <div className="external-card-actions">
        <p className="field-note">
          Auf dieser Beta bleibt die lokale Anlage noch deaktiviert. Die Titeldaten helfen hier
          nur beim Wiederfinden.
        </p>
      </div>
    );
  }

  return (
    <form action="/api/local-titles" className="external-import-form" method="post">
      <input type="hidden" name="source" value={item.externalSource} />
      <input type="hidden" name="mediaType" value={item.mediaType} />
      <input type="hidden" name="sourceId" value={String(item.sourceId)} />
      <input type="hidden" name="q" value={query} />
      <button className="quiet-button" type="submit">
        Für null-noise anlegen
      </button>
      <p className="field-note">Danach kann der Titel lokal eingeschätzt werden.</p>
    </form>
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

  const primaryItem = pickFeaturedItem(items, query);
  const secondaryItems = items.filter((item) => item.externalId !== primaryItem.externalId);
  const primaryPosterPath = getTmdbPosterProxyPath(primaryItem.posterPath);
  const primaryLocalPath = getLocalTitlePath(primaryItem, localTitleByExternalKey);

  return (
    <div className="external-results-stack">
      <article className="result-card metadata-card metadata-card-primary">
        <div className="card-topline">
          <p className="eyebrow">Naheliegendster Treffer</p>
          <span className="tone-chip">
            {primaryLocalPath ? "Bereits lokal angelegt" : "Nur Titeldaten · ohne Reizprofil"}
          </span>
        </div>
        <div
          className={
            primaryPosterPath
              ? "external-primary-layout external-primary-layout-with-poster"
              : "external-primary-layout"
          }
        >
          {primaryPosterPath ? (
            <div className="poster-thumb-frame">
              <Image
                alt={`Poster zu ${primaryItem.title}`}
                className="poster-thumb-image"
                height="126"
                loading="lazy"
                src={primaryPosterPath}
                unoptimized
                width="84"
              />
            </div>
          ) : null}

          <div className="external-primary-copy">
            <p className="result-context-line">{formatMetaLine(primaryItem)}</p>
            <h3>
              <Link
                href={
                  primaryLocalPath ??
                  `/spike/metadaten/${primaryItem.mediaType}/${primaryItem.sourceId}`
                }
              >
                {primaryItem.title}
              </Link>
            </h3>
            <p>{truncateText(primaryItem.synopsis, 240)}</p>
            <dl className="meta-grid result-meta-grid">
              <div>
                <dt>Reizprofil</dt>
                <dd>{primaryLocalPath ? "Lokal vorhanden" : "Noch nicht vorhanden"}</dd>
              </div>
              <div>
                <dt>Quelle</dt>
                <dd>{formatMetadataSpikeSource(primaryItem.externalSource)}</dd>
              </div>
            </dl>
            <ExternalItemAction
              item={primaryItem}
              query={query}
              localPath={primaryLocalPath}
              writesEnabled={writesEnabled}
            />
          </div>
        </div>
      </article>

      {secondaryItems.length ? (
        <details className="disclosure external-results-disclosure">
          <summary>{`Weitere ${secondaryItems.length} ähnliche Titel anzeigen`}</summary>
          <ul className="external-secondary-list">
            {secondaryItems.map((item) => (
              <li key={item.externalId}>
                <article className="compact-result-card">
                  <p className="result-context-line">{formatMetaLine(item)}</p>
                  <h4>
                    <Link
                      href={
                        getLocalTitlePath(item, localTitleByExternalKey) ??
                        `/spike/metadaten/${item.mediaType}/${item.sourceId}`
                      }
                    >
                      {item.title}
                    </Link>
                  </h4>
                  <p>{truncateText(item.synopsis, 140)}</p>
                  <ExternalItemAction
                    item={item}
                    query={query}
                    localPath={getLocalTitlePath(item, localTitleByExternalKey)}
                    writesEnabled={writesEnabled}
                  />
                </article>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
