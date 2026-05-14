import Link from "next/link";

import { currentBuild, releaseNotes } from "@/lib/release-info";

export function SiteFooter() {
  return (
    <footer className="site-footer" id="site-footer">
      <details className="mobile-experiment-footer">
        <summary>{`Build ${currentBuild.version} · Release Notes`}</summary>
        <div className="mobile-experiment-footer-body">
          <p className="mobile-experiment-build-line">
            <strong>{`Build ${currentBuild.version}`}</strong>
            {` · ${currentBuild.label} · Released ${currentBuild.releasedAt}`}
          </p>
          <p className="field-note">Private Beta. Reiz-Einschätzungen bleiben vorläufig.</p>
          <nav className="mobile-experiment-footer-links" aria-label="Info und Rechtliches">
            <Link href="/barrierefreiheit">Barrierefreiheit</Link>
            <Link href="/datenschutz">Datenschutz</Link>
            <Link href="/impressum">Impressum</Link>
          </nav>
        </div>
      </details>
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
            <Link href="/suche">Suche</Link>
            <Link href="/erklaerung">Erklärung und Hilfe</Link>
            <Link href="/barrierefreiheit">Barrierefreiheit</Link>
            <Link href="/datenschutz">Datenschutz</Link>
            <Link href="/impressum">Impressum</Link>
          </div>

          <div className="footer-meta-runway">
            <p className="build-line">
              <strong>{`Build ${currentBuild.version}`}</strong>
              {` · ${currentBuild.label} · Released ${currentBuild.releasedAt}`}
            </p>
            <p className="field-note">Private Beta. Reiz-Einschätzungen bleiben vorläufig.</p>

            <details className="disclosure footer-changelog">
              <summary>Release Notes / Changelog</summary>
              <div className="release-notes">
                {releaseNotes.map((release) => (
                  <section key={release.version} aria-labelledby={`release-${release.version}`}>
                    <h3 id={`release-${release.version}`}>
                      {`v${release.version} · ${release.label}`}
                    </h3>
                    <p className="field-note">{`Released ${release.releasedAt}`}</p>
                    <ul className="plain-list">
                      {release.entries.map((entry) => (
                        <li key={entry}>{entry}</li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </details>
          </div>
        </section>
      </div>
    </footer>
  );
}
