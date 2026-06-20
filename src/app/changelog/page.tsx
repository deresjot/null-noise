import type { Metadata } from "next";

import { currentBuild, releaseNotes } from "@/lib/release-info";
import { siteName } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Release Notes / Changelog | ${siteName}`,
  description:
    "Fortlaufende Release Notes und Changelog-Dokumentation für null-noise.",
  alternates: {
    canonical: "/changelog",
  },
  openGraph: {
    url: "/changelog",
  },
};

export default function ChangelogPage() {
  return (
    <section className="section-stack changelog-page">
      <div className="section-header">
        <p className="eyebrow">Release Notes</p>
        <h1>Release Notes / Changelog</h1>
        <p>
          Fortlaufende technische und produktbezogene Dokumentation der lokalen null-noise-Staende.
        </p>
        <p className="field-note">
          Aktueller Build: <strong>{currentBuild.version}</strong> · {currentBuild.releasedAt}
        </p>
      </div>

      <section className="panel section-stack" aria-labelledby="current-build-heading">
        <h2 id="current-build-heading">Aktueller Stand</h2>
        <p>
          <strong>{currentBuild.version}</strong>
          {` · ${currentBuild.label} · Released ${currentBuild.releasedAt}`}
        </p>
      </section>

      <section className="panel section-stack" aria-labelledby="release-history-heading">
        <h2 id="release-history-heading">Vollständige Historie</h2>
        <div className="release-notes changelog-release-list">
          {releaseNotes.map((release, index) => (
            <details className="release-note changelog-release" key={release.version} open={index === 0}>
              <summary className="changelog-release-summary">
                <span>
                  <span className="release-note-version">{`v${release.version}`}</span>
                  <span className="release-note-label">{release.label}</span>
                </span>
                <span className="release-note-toggle-state" aria-hidden="true">
                  {release.releasedAt}
                </span>
              </summary>
              <div className="release-note-panel">
                <p className="field-note">{`Released ${release.releasedAt}`}</p>
                <ul className="plain-list">
                  {release.entries.map((entry) => (
                    <li key={entry}>{entry}</li>
                  ))}
                </ul>
              </div>
            </details>
          ))}
        </div>
      </section>
    </section>
  );
}
