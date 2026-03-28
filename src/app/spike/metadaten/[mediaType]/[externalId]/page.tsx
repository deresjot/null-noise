import Link from "next/link";

import { StatusPanel } from "@/components/status-panel";
import {
  formatMetadataSpikeSource,
  getMetadataDetail,
  parseSpikeDetailParams,
} from "@/lib/metadata-spike";

type MetadataSpikeDetailPageProps = {
  params: Promise<{ mediaType: string; externalId: string }>;
};

function formatMediaType(mediaType: "movie" | "series"): string {
  return mediaType === "movie" ? "Film" : "Serie";
}

export default async function MetadataSpikeDetailPage({
  params,
}: MetadataSpikeDetailPageProps) {
  const rawParams = await params;
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
              ? "Spike lokal nicht aktiviert"
              : "Detaildaten konnten nicht geladen werden"
          }
          text={state.message}
          tone={state.kind === "disabled" ? "warning" : "error"}
        />
        <p>
          <Link href="/spike/metadaten">Zurück zum Metadaten-Spike</Link>
        </p>
      </section>
    );
  }

  const { item } = state;

  return (
    <article className="section-stack">
      <p>
        <Link href="/spike/metadaten">Zurück zum Metadaten-Spike</Link>
      </p>

      <header className="detail-hero">
        <div>
          <p className="eyebrow">
            {`${formatMediaType(item.mediaType)} - ${formatMetadataSpikeSource(item.externalSource)} ${item.sourceId}`}
          </p>
          <h1>{item.title}</h1>
          <p className="lead">
            {item.synopsis ??
              "Für diesen Titel wurde keine Kurzbeschreibung von der externen Quelle geliefert."}
          </p>
        </div>

        <aside className="panel panel-emphasis" aria-labelledby="detail-spike-heading">
          <h2 id="detail-spike-heading">Technische Einordnung</h2>
          <p>{state.message}</p>
          <p>Diese Ansicht ersetzt keinen Reizprofil-Datensatz aus dem eigentlichen MVP.</p>
        </aside>
      </header>

      <section className="panel" aria-labelledby="detail-fields-heading">
        <h2 id="detail-fields-heading">Gemappte Felder</h2>
        <dl className="detail-list">
          <div>
            <dt>Externe ID</dt>
            <dd>{item.externalId}</dd>
          </div>
          <div>
            <dt>Medientyp</dt>
            <dd>{formatMediaType(item.mediaType)}</dd>
          </div>
          <div>
            <dt>Erscheinungsjahr</dt>
            <dd>{item.releaseYear ?? "Unbekannt"}</dd>
          </div>
          <div>
            <dt>Posterpfad</dt>
            <dd>
              {item.posterPath ??
                (item.externalSource === "imdb"
                  ? "Im aktuellen IMDb-Versuch noch nicht gemappt"
                  : "Nicht vorhanden")}
            </dd>
          </div>
          <div>
            <dt>Quelle</dt>
            <dd>{formatMetadataSpikeSource(item.externalSource)}</dd>
          </div>
        </dl>
      </section>
    </article>
  );
}
