import Link from "next/link";

import { HomeDiscovery } from "@/components/home-discovery";
import { SearchForm } from "@/components/search-form";
import { browseTmdbMetadata } from "@/lib/metadata-spike";
import { getBetaNoteText } from "@/lib/runtime-config";

const homeFilters = {
  q: "",
  tone: "all" as const,
  kind: "all" as const,
  avoidPeaks: false,
  avoidDensity: false,
};

export default async function HomePage() {
  const betaNote = getBetaNoteText().replace(/^(Beta\.\s*)+/u, "");
  const browseState = await browseTmdbMetadata(
    homeFilters,
    "stable:all:all:allow-peaks:allow-density",
  );

  return (
    <section
      className="home-page home-discovery-page page-layout"
      aria-labelledby="home-hero-heading"
    >
      <header className="home-discovery-hero">
        <div className="home-discovery-kicker-row">
          <p className="eyebrow">null-noise</p>
          <p className="home-discovery-beta">Beta</p>
        </div>
        <h1 className="home-screen-question" id="home-hero-heading">
          Drei Richtungen. Schau, was neugierig macht.
        </h1>
        <p className="lead home-discovery-lead">
          Filme und Serien fühlen sich unterschiedlich an. Starte mit einem Fundstück – eher
          ruhig, wechselhaft oder intensiv.
        </p>
      </header>

      <HomeDiscovery state={browseState} />

      <div className="home-entry-grid">
        <section className="home-search-surface" aria-labelledby="home-search-heading">
          <p className="eyebrow">Direkter Weg</p>
          <h2 id="home-search-heading">Schon einen Titel im Kopf?</h2>
          <p className="field-note">Dann spring direkt zur ersten Einschätzung.</p>
          <SearchForm
            action="/suche"
            filters={homeFilters}
            submitLabel="Suchen"
            variant="home"
          />
        </section>

        <section className="home-purpose-surface" aria-labelledby="home-purpose-heading">
          <p className="eyebrow">Warum null-noise?</p>
          <h2 id="home-purpose-heading">
            Du musst dich nicht auch noch in der Freizeit anschreien lassen.
          </h2>
          <p>
            Null Noise gibt eine grobe erste Einschätzung, wie ruhig, wechselhaft oder intensiv ein
            Titel wirken kann. Ohne Bewertungen, Rankings oder Social-Druck.
          </p>
          <p className="field-note">
            Keine objektive Messung. Unsicherheit bleibt sichtbar.
          </p>
          <Link className="secondary-link" href="/erklaerung" tabIndex={0}>
            Wie funktioniert null-noise?
          </Link>
        </section>
      </div>

      <div className="home-discovery-meta">
        <p className="field-note">{`Beta. ${betaNote}`}</p>
        <Link className="secondary-link" href="/suche#results-heading" tabIndex={0}>
          Alle Richtungen ansehen
        </Link>
      </div>
    </section>
  );
}
