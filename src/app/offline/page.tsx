import Link from "next/link";
import type { Metadata } from "next";

import { OfflinePocketSummary } from "@/components/offline-pocket-summary";

export const metadata: Metadata = {
  title: "Offline",
  description:
    "null-noise ist gerade offline. Merkliste und Gesehen-Stand bleiben lokal sichtbar, soweit der Browser sie lesen kann.",
};

export default function OfflinePage() {
  return (
    <article className="section-stack offline-page">
      <header className="section-header offline-hero">
        <p className="eyebrow">Offline</p>
        <h1>Gerade keine Verbindung.</h1>
        <p className="lead">
          null-noise kann ohne Verbindung keine neuen TMDb-Daten laden. Bereits lokal gemerkte
          oder als gesehen markierte Titel bleiben in diesem Browser sichtbar, soweit dein Browser
          sie bereitstellt.
        </p>
      </header>

      <section className="panel offline-panel" aria-labelledby="offline-search-heading">
        <h2 id="offline-search-heading">Suche braucht Verbindung</h2>
        <p>
          Neue Suche, Browse-Vorschläge und externe Titeldaten sind verbindungsabhängig. Es wird
          offline keine scheinbare Verfügbarkeit angezeigt.
        </p>
        <div className="offline-actions">
          <Link className="secondary-button-link back-button-link" href="/">
            Zur Startseite
          </Link>
          <Link className="secondary-button-link back-button-link" href="/suche">
            Suche erneut öffnen
          </Link>
        </div>
      </section>

      <OfflinePocketSummary />
    </article>
  );
}
