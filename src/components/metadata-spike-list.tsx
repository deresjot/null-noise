import Link from "next/link";

import {
  formatMetadataSpikeSource,
  type MetadataSpikeTitle,
} from "@/lib/metadata-spike";

interface MetadataSpikeListProps {
  items: MetadataSpikeTitle[];
}

function formatMediaType(value: MetadataSpikeTitle["mediaType"]): string {
  return value === "movie" ? "Film" : "Serie";
}

export function MetadataSpikeList({ items }: MetadataSpikeListProps) {
  return (
    <ul className="result-grid">
      {items.map((item) => (
        <li key={item.externalId}>
          <article className="result-card metadata-card">
            <div className="card-topline">
              <p className="eyebrow">
                {`${formatMediaType(item.mediaType)} - ${formatMetadataSpikeSource(item.externalSource)} ${item.sourceId}`}
              </p>
              <span className="tone-chip">Technischer Spike</span>
            </div>

            <h2 className="card-title">
              <Link href={`/spike/metadaten/${item.mediaType}/${item.sourceId}`}>{item.title}</Link>
            </h2>

            <p>{item.synopsis ?? "Keine Kurzbeschreibung von der externen Quelle geliefert."}</p>

            <dl className="meta-grid metadata-meta-grid">
              <div>
                <dt>Erscheinungsjahr</dt>
                <dd>{item.releaseYear ?? "Unbekannt"}</dd>
              </div>
              <div>
                <dt>Posterpfad</dt>
                <dd>{item.posterPath ? "Vorhanden" : "Nicht vorhanden"}</dd>
              </div>
              <div>
                <dt>Quelle</dt>
                <dd>{formatMetadataSpikeSource(item.externalSource)}</dd>
              </div>
            </dl>

            <p className="field-note">
              {item.posterPath
                ? "Ein Posterpfad ist vorhanden, wird im Spike aber bewusst nicht direkt im Browser geladen."
                : item.externalSource === "imdb"
                  ? "Im ersten offiziellen IMDb-Versuch wird aktuell noch kein Bildpfad gemappt."
                  : "Es wurde kein Posterpfad geliefert."}
            </p>
          </article>
        </li>
      ))}
    </ul>
  );
}
