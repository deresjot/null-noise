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
              <p className="eyebrow">null-noise</p>
              <p className="hero-kicker-note">Beta</p>
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
              Film oder Serie. Dann sieht man weiter.
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
