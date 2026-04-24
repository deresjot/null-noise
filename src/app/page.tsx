import Link from "next/link";

import { SearchForm } from "@/components/search-form";
import { siteClaim } from "@/lib/constants";
import { getBetaNoteText } from "@/lib/runtime-config";

export default async function HomePage() {
  const betaNote = getBetaNoteText().replace(/^(Beta\.\s*)+/u, "");

  return (
    <section className="home-page hero hero-home" aria-labelledby="home-hero-heading">
      <div className="hero-home-stage home-hero-stage">
        <div className="hero-copy hero-copy-home">
          <div className="hero-copy-intro">
            <div className="hero-kicker-row">
              <p className="eyebrow hero-kicker-badge">null-noise</p>
              <p className="hero-kicker-note hero-kicker-badge">Beta</p>
            </div>
            <h1 id="home-hero-heading">{siteClaim}</h1>
            <p className="lead hero-home-context">
              Außer du willst es.
            </p>
          </div>
        </div>

        <section
          className="search-module-surface hero-home-searchdeck home-search-deck"
          aria-labelledby="home-search-heading"
        >
          <div className="hero-search-head">
            <h2 id="home-search-heading">Suche</h2>
            <p className="field-note hero-search-note">
              Filme und Serien finden, grob nach Reizwirkung einschätzen und ruhiger auswählen.
            </p>
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
            <p className="field-note">Diese Einstiege führen direkt in bestehende Browse-Zustände.</p>
            <nav className="home-checkin-actions" aria-label="Schneller Einstieg">
              <Link className="home-checkin-action" href="/suche?tone=calm#results-heading">
                Etwas Ruhiges finden
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
