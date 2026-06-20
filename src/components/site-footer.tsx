import Link from "next/link";

import { currentBuild } from "@/lib/release-info";

export function SiteFooter() {
  return (
    <footer className="site-footer" id="site-footer">
      <div className="mobile-experiment-footer">
        <div className="mobile-experiment-footer-body">
          <p className="mobile-experiment-build-line">
            <strong>{`Build ${currentBuild.version}`}</strong>
            {` · ${currentBuild.releasedAt}`}
          </p>
          <Link className="footer-changelog-link" href="/changelog">
            Release Notes / Changelog
          </Link>
          <nav className="mobile-experiment-footer-links" aria-label="Produktnavigation">
            <Link href="/">Start</Link>
            <Link href="/suche">Suche</Link>
            <Link href="/erklaerung">Erklärung und Hilfe</Link>
          </nav>
          <nav className="mobile-experiment-footer-legal-links" aria-label="Rechtliches">
            <Link href="/barrierefreiheit">Barrierefreiheit</Link>
            <Link href="/kontakt">Kontakt</Link>
            <Link href="/datenschutz">Datenschutz</Link>
            <Link href="/impressum">Impressum</Link>
          </nav>
        </div>
      </div>
      <div className="shell footer-stage">
        <section className="footer-atmosphere" aria-labelledby="privacy-summary-heading">
          <div className="footer-signoff">
            <p className="eyebrow">null-noise</p>
            <h2 id="privacy-summary-heading">Ein Titel zuerst. Alles Weitere danach.</h2>
            <p>Die Oberfläche bleibt absichtlich knapp. Mehr als eine erste Einschätzung will sie nicht sein.</p>
            <p className="field-note">
              Ohne Konto. Ohne Tracker. Ohne großes Theater.
            </p>
          </div>

          <div className="footer-link-cloud" aria-label="Direkt erreichbar">
            <Link href="/">Start</Link>
            <Link href="/suche">Suche</Link>
            <Link href="/erklaerung">Erklärung und Hilfe</Link>
          </div>
          <div className="footer-legal-links" aria-label="Rechtliches">
            <Link href="/barrierefreiheit">Barrierefreiheit</Link>
            <Link href="/kontakt">Kontakt</Link>
            <Link href="/datenschutz">Datenschutz</Link>
            <Link href="/impressum">Impressum</Link>
          </div>

          <div className="footer-meta-runway">
            <p className="build-line">
              <strong>{`Build ${currentBuild.version}`}</strong>
              {` · ${currentBuild.releasedAt}`}
            </p>
            <p className="field-note">Private Beta. Reiz-Einschätzungen bleiben vorläufig.</p>
            <Link className="footer-changelog-link" href="/changelog">
              Release Notes / Changelog
            </Link>
          </div>
        </section>
      </div>
    </footer>
  );
}
