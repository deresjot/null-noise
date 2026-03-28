import { MetadataSpikeList } from "@/components/metadata-spike-list";
import { SpikeSearchForm } from "@/components/spike-search-form";
import { StatusPanel } from "@/components/status-panel";
import {
  formatMetadataSpikeSource,
  getPreferredMetadataSpikeSource,
  parseSpikeQuery,
  searchMetadata,
} from "@/lib/metadata-spike";

type MetadataSpikePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MetadataSpikePage({ searchParams }: MetadataSpikePageProps) {
  const params = (await searchParams) ?? {};
  const query = parseSpikeQuery(params.q);
  const preferredSource = getPreferredMetadataSpikeSource();
  const sourceLabel = formatMetadataSpikeSource(preferredSource);
  const state = await searchMetadata(query);

  return (
    <section className="section-stack">
      <div className="section-header">
        <p className="eyebrow">Technischer Spike</p>
        <h1>Externe Metadaten getrennt testen</h1>
        <p>
          Dieser Bereich prüft nur, ob `null-noise` externe Titelinformationen serverseitig
          abrufen und reduziert abbilden kann.
        </p>
      </div>

      <div className="content-grid">
        <section className="panel" aria-labelledby="spike-form-heading">
          <h2 id="spike-form-heading">Metadaten testweise abrufen</h2>
          <SpikeSearchForm query={query} />
        </section>

        <section className="panel" aria-labelledby="spike-scope-heading">
          <h2 id="spike-scope-heading">Nur Metadaten, kein Reizprofil</h2>
          <ul className="plain-list">
            <li>{`${sourceLabel} liefert hier nur Katalog-Metadaten.`}</li>
            <li>Reizprofile, Confidence und Bewertungen entstehen daraus nicht automatisch.</li>
            <li>Die Mock-Daten des MVP bleiben weiterhin die Hauptlogik.</li>
            <li>Es gibt keine Persistenz, keinen Account und keine Nutzerbewertung in diesem Spike.</li>
          </ul>
          <p className="field-note">
            Für lokale Tests ist TMDb der pragmatische Standard. IMDb bleibt als spätere
            Option dokumentiert.
          </p>
        </section>
      </div>

      {state.kind === "success" ? (
        <section className="section-stack" aria-labelledby="spike-results-heading">
          <div className="section-header">
            <h2 id="spike-results-heading">Gemappte Treffer</h2>
            <p>{state.message}</p>
          </div>
          <MetadataSpikeList items={state.items} />
        </section>
      ) : null}

      {state.kind === "idle" ? <StatusPanel title="Noch kein Suchlauf" text={state.message} /> : null}
      {state.kind === "disabled" ? (
        <StatusPanel title="Spike lokal nicht aktiviert" text={state.message} tone="warning" />
      ) : null}
      {state.kind === "empty" ? (
        <StatusPanel title="Keine externen Treffer" text={state.message} />
      ) : null}
      {state.kind === "error" ? (
        <StatusPanel title="Serverseitiger Abruf fehlgeschlagen" text={state.message} tone="error" />
      ) : null}
    </section>
  );
}
