import Link from "next/link";

import { SearchForm } from "@/components/search-form";
import { siteClaim } from "@/lib/constants";
import { getBetaNoteText } from "@/lib/runtime-config";

export default async function HomePage() {
  const betaNote = getBetaNoteText().replace(/^(Beta\.\s*)+/u, "");

  return (
    <section className="home-page hero hero-home mobile-command-screen" aria-labelledby="home-hero-heading">
      <div className="hero-home-stage home-hero-stage">
        <div className="hero-copy hero-copy-home">
          <div className="hero-copy-intro">
            <div className="hero-kicker-row">
              <p className="eyebrow hero-kicker-badge">null-noise</p>
              <p className="hero-kicker-note hero-kicker-badge">Beta</p>
            </div>
            <h2 className="home-screen-question">Was passt gerade?</h2>
            <p className="lead hero-purpose-text">
              Null Noise ordnet Filme und Serien danach ein, wie ruhig, wechselhaft oder intensiv
              sie wirken können. So findest du schneller etwas, das gerade zu deiner Stimmung,
              Energie und Aufmerksamkeit passt – ohne Bewertungen, Rankings oder Social-Druck.
            </p>
            <section className="home-onboarding" aria-labelledby="home-onboarding-heading">
              <h3 id="home-onboarding-heading">Kurz gesagt</h3>
              <ol>
                <li>Filme oder Serien suchen.</li>
                <li>
                  Eine grobe erste Einschätzung lesen: <strong>Eher ruhig</strong>,{" "}
                  <strong>Eher wechselhaft</strong> oder <strong>Eher intensiv</strong>.
                </li>
                <li>Dann entscheiden, ob der Titel gerade passt.</li>
              </ol>
              <p>
                Keine Qualitätswertung, keine objektive Messung.{" "}
                <Link href="/erklaerung">Wie funktioniert null-noise?</Link>
              </p>
            </section>
            <h1 id="home-hero-heading">{siteClaim}</h1>
            <p className="lead hero-home-context">Titel suchen oder erst eine Richtung wählen.</p>
          </div>
        </div>

        <section
          className="search-module-surface hero-home-searchdeck home-search-deck"
          aria-labelledby="home-search-heading"
        >
          <div className="hero-search-head">
            <h2 id="home-search-heading">Suche</h2>
            <p className="field-note hero-search-note">Titel suchen oder erst eine Richtung wählen.</p>
          </div>

          <SearchForm
            action="/suche"
            filters={{
              q: "",
              tone: "all",
              kind: "all",
              avoidPeaks: false,
              avoidDensity: false,
            }}
            submitLabel="Suchen"
            variant="hero"
          />
          <section className="home-checkin-zone" aria-labelledby="home-checkin-heading">
            <h3 id="home-checkin-heading">Ohne Titel starten</h3>
            <p className="field-note">Tertiär, wenn du keinen Suchbegriff hast.</p>
            <nav className="home-checkin-actions" aria-label="Schneller Einstieg">
              <Link className="home-checkin-action" href="/suche?tone=calm#results-heading">
                Eher ruhig starten
              </Link>
              <Link className="home-checkin-action" href="/suche#results-heading">
                Einfach stöbern
              </Link>
              <a className="home-checkin-action" href="#home-search-heading">
                Direkt suchen
              </a>
            </nav>
          </section>
        </section>

        <div className="hero-home-meta">
          <p className="field-note hero-beta-note">{`Beta. ${betaNote}`}</p>
          <Link className="secondary-link" href="/erklaerung">
            Skalen kurz lesen
          </Link>
        </div>
      </div>
    </section>
  );
}
