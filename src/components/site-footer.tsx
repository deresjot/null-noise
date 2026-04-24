import Link from "next/link";

import { currentBuild, releaseNotes } from "@/lib/release-info";

export function SiteFooter() {
  return (
    <footer className="site-footer" id="site-footer">
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
            <Link href="/erklaerung">Einordnung</Link>
            <Link href="/bedienung">Hilfe</Link>
            <Link href="/barrierefreiheit">Barrierefreiheit</Link>
            <Link href="/datenschutz">Datenschutz</Link>
            <Link href="/impressum">Impressum</Link>
          </div>

          <div className="footer-meta-runway">
            <p className="build-line">
              <strong>{`Version ${currentBuild.version}`}</strong>
              {` · ${currentBuild.label} · Stand ${currentBuild.releasedAt}`}
            </p>
            <p className="field-note">Früher Prototyp. Einschätzungen sind vorläufig.</p>

            <details className="disclosure footer-changelog">
              <summary>Was zuletzt geändert wurde</summary>
              <div className="release-notes">
                {releaseNotes.map((release) => (
                  <section key={release.version} aria-labelledby={`release-${release.version}`}>
                    <h3 id={`release-${release.version}`}>
                      {`Version ${release.version} · ${release.label}`}
                    </h3>
                    <p className="field-note">{`Stand ${release.releasedAt}`}</p>
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
