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
          null-noise ist ein privates Hobby- und Referenzprojekt von Sebastian Jansen. Die Anwendung
          bleibt bewusst datensparsam: keine Nutzerkonten, keine Profile, kein Tracking und keine
          Analytics.
        </p>
      </div>

      <section className="panel section-stack" aria-labelledby="privacy-purpose-heading">
        <h2 id="privacy-purpose-heading">Zweck des Projekts</h2>
        <p>
          null-noise erprobt eine ruhige, verständliche und möglichst zugängliche Web-App sowie
          einen nachvollziehbaren Vibe-Coding-Workflow. Die App hilft, Filme und Serien grob nach
          vermuteter Reizwirkung einzuordnen.
        </p>
        <p className="field-note">
          Diese Seite beschreibt den aktuellen Projektstand und ist keine Rechtsberatung.
        </p>
      </section>

      <div className="content-grid">
        <section className="panel" aria-labelledby="privacy-data-heading">
          <h2 id="privacy-data-heading">Datensparsame Nutzung</h2>
          <ul className="plain-list">
            <li>Es gibt keine Nutzerkonten und keine Login-Funktion.</li>
            <li>Es werden keine Profile gebildet.</li>
            <li>Es gibt kein Tracking und keine Analytics.</li>
            <li>Es gibt keine Social Features wie Kommentare, Likes oder Follower-Logik.</li>
            <li>Suchanfragen werden nur für die angeforderte Antwort verarbeitet.</li>
          </ul>
        </section>

        <section className="panel" aria-labelledby="privacy-local-heading">
          <h2 id="privacy-local-heading">Lokale Merken- und Gesehen-Funktionen</h2>
          <p>
            Merken und Gesehen speichern den Stand nur im Browser. Diese Daten werden nicht
            serverseitig synchronisiert und erzeugen kein öffentliches Profil.
          </p>
          <p>
            Wenn du den Browser-Speicher löschst oder ein anderes Gerät nutzt, ist dieser lokale Stand
            dort nicht automatisch vorhanden.
          </p>
        </section>

        <section className="panel" aria-labelledby="privacy-sources-heading">
          <h2 id="privacy-sources-heading">Externe Titeldaten</h2>
          <p>
            TMDb wird im aktuellen Code als externe Quelle für öffentliche Filmdaten genutzt. Die
            Abfrage läuft serverseitig, wenn der jeweilige Pfad aktiv ist. Titel, Jahr, Synopsis oder
            Poster bleiben Metadaten und ersetzen keine null-noise-Einschätzung.
          </p>
          <p className="field-note">
            Externe Links sind normale Links. Daten werden erst beim aktiven Aufruf der externen
            Seite an diese Stelle übertragen.
          </p>
        </section>

        <section className="panel" aria-labelledby="privacy-feedback-heading">
          <h2 id="privacy-feedback-heading">Feedback- und Bewertungsfunktionen</h2>
          <p>
            {writesEnabled
              ? "Auf dieser Instanz können stille Einschätzungen abgegeben werden. Sie werden nicht als öffentliche Bewertung, Social Feature oder Nutzerprofil angezeigt."
              : "Auf dieser Instanz sind neue Einschätzungen und lokale Titelanlage derzeit deaktiviert. Dadurch entstehen in diesem Pfad keine neuen Bewertungsdaten."}
          </p>
          <p>
            {writesEnabled
              ? "Zur Begrenzung wiederholter Abgaben können funktionale Schutzmechanismen wie ein kurzer Cooldown und pseudonyme technische Begrenzung genutzt werden. IP-Adressen sollen dabei nicht roh als Profilmerkmal gespeichert werden."
              : "Rate-Limit- oder Cooldown-Mechanismen für öffentliche Schreibpfade sind deshalb auf dieser Instanz nicht der aktive Nutzungspfad."}
          </p>
        </section>

        <section className="panel" aria-labelledby="privacy-contact-heading">
          <h2 id="privacy-contact-heading">Kontakt</h2>
          <p>Betreiber: Sebastian Jansen</p>
          <p>Kontakt: mail@sebastianjansen.com</p>
        </section>
      </div>
    </section>
  );
}
