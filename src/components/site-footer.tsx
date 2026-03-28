import Link from "next/link";

import { MascotMark } from "@/components/mascot-mark";
import { currentBuild, releaseNotes } from "@/lib/release-info";
import { getBetaNoteText } from "@/lib/runtime-config";

export function SiteFooter() {
  const betaNote = getBetaNoteText();

  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <section aria-labelledby="privacy-summary-heading">
          <h2 id="privacy-summary-heading">Datenschutz</h2>
          <div className="footer-mascot-row">
            <MascotMark className="footer-mascot" decorative variant="compact" />
            <p className="field-note">Ohne Konto, ohne Tracker, ohne versteckte Kennungen.</p>
          </div>
          <p>
            Externe Titeldaten bleiben serverseitig. Im Browser wird nur gezeigt, was für die
            Suche gerade nötig ist.
          </p>
          <p className="field-note">
            TMDb-Metadaten werden, wenn aktiviert, nur getrennt und serverseitig ergänzt.
          </p>
        </section>
        <section aria-labelledby="footer-links-heading">
          <h2 id="footer-links-heading">Direkt erreichbar</h2>
          <ul className="plain-list">
            <li>
              <Link href="/erklaerung">Skalen und Confidence erklärt</Link>
            </li>
            <li>
              <Link href="/bedienung">Hinweise für Tastatur und Screenreader</Link>
            </li>
            <li>
              <Link href="/datenschutz">Datenschutz</Link>
            </li>
            <li>
              <Link href="/impressum">Impressum</Link>
            </li>
          </ul>
        </section>

        <section aria-labelledby="release-heading">
          <h2 id="release-heading">Stand</h2>
          <p className="build-line">
            <strong>{`Version ${currentBuild.version}`}</strong>
            {` - ${currentBuild.label} - Stand ${currentBuild.releasedAt}`}
          </p>
          <p className="field-note">{betaNote}</p>
          <p className="field-note">Die Versionsinfo bleibt für Usertests und Rückmeldungen sichtbar.</p>

          <details className="disclosure footer-changelog">
            <summary>{`Changelog zu Version ${currentBuild.version} anzeigen`}</summary>
            <div className="release-notes">
              {releaseNotes.map((release) => (
                <section key={release.version} aria-labelledby={`release-${release.version}`}>
                  <h3 id={`release-${release.version}`}>
                    {`Version ${release.version} - ${release.label}`}
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
        </section>
      </div>
    </footer>
  );
}
