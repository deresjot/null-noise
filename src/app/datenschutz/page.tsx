import type { Metadata } from "next";

import { siteName } from "@/lib/constants";
import { arePublicWritesEnabled } from "@/lib/runtime-config";

export const metadata: Metadata = {
  title: `Datenschutz | ${siteName}`,
};

export default function DatenschutzPage() {
  const writesEnabled = arePublicWritesEnabled();

  return (
    <section className="section-stack">
      <div className="section-header">
        <p className="eyebrow">Rechtliches</p>
        <h1>Datenschutz</h1>
        <p>
          null-noise bleibt bewusst sparsam: keine Konten, keine Tracker, keine versteckten
          Kennungen und keine direkten Browser-Anfragen an externe Titeldatenquellen.
        </p>
      </div>

      <div className="content-grid">
        <section className="panel" aria-labelledby="privacy-data-heading">
          <h2 id="privacy-data-heading">Datensparsame Nutzung</h2>
          <ul className="plain-list">
            <li>Diese Website verwendet keine Cookies für Tracking oder Profilbildung.</li>
            <li>Es gibt keine Konten, keine Community-Funktion und keine versteckten Kennungen.</li>
            <li>Suchanfragen bleiben auf die jeweils benötigte Serverantwort beschränkt.</li>
            <li>Externe Titeldaten werden nur serverseitig von TMDb geholt, wenn dieser Pfad aktiv ist.</li>
            <li>Lokale Merkliste und „Schon gesehen“ werden nur im LocalStorage dieses Browsers gehalten.</li>
          </ul>
        </section>

        <section className="panel" aria-labelledby="privacy-tech-heading">
          <h2 id="privacy-tech-heading">Technische Einbindung</h2>
          <ul className="plain-list">
            <li>Es werden keine Tracking- oder Analyse-Skripte eingebunden.</li>
            <li>Für die Wortmarke kann zusätzlich ein externes Schrift-Stylesheet geladen werden; die Nutzung bleibt auch ohne diese Schrift möglich.</li>
            <li>Externe Verweise sind normale Links; Daten werden erst beim aktiven Klick übertragen.</li>
            <li>Poster und Titeldaten von TMDb bleiben reiner Metadatenkontext und ersetzen kein Reizprofil.</li>
            <li>Es kommen keine Tracking-Tools, Analyse-Skripte oder Werbe-Cookies zum Einsatz.</li>
          </ul>
        </section>

        <section className="panel" aria-labelledby="privacy-beta-heading">
          <h2 id="privacy-beta-heading">Stand der Beta</h2>
          <p>
            {writesEnabled
              ? "Auf dieser Instanz können anonyme Einschätzungen lokal gespeichert werden. Dafür wird nur ein kurzer funktionaler Cooldown-Cookie gesetzt, und IP-Adressen werden nicht roh gespeichert."
              : "Auf dieser Instanz bleiben neue Einschätzungen und lokale Titelanlage vorerst deaktiviert. Dadurch entfallen auch die funktionalen Schreibpfad-Cookies der Bewertungsabgabe."}
          </p>
          <p className="field-note">
            Diese Beta bleibt damit bewusst lesbar und datensparsam, auch wenn noch nicht alle
            späteren Funktionen öffentlich aktiv sind.
          </p>
        </section>
      </div>
    </section>
  );
}
