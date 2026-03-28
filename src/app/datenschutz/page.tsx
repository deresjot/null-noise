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
          <h2 id="privacy-data-heading">Was aktuell verarbeitet wird</h2>
          <ul className="plain-list">
            <li>Suchanfragen bleiben auf die gerade benoetigte Serverantwort beschraenkt.</li>
            <li>Externe Titeldaten werden nur serverseitig von TMDb geholt, wenn der Pfad aktiv ist.</li>
            <li>Es gibt keine Profile, keine Community-Funktion und kein Tracking ueber mehrere Sitzungen.</li>
          </ul>
        </section>

        <section className="panel" aria-labelledby="privacy-beta-heading">
          <h2 id="privacy-beta-heading">Stand der Beta</h2>
          <p>
            {writesEnabled
              ? "Auf dieser Instanz koennen anonyme Einschaetzungen lokal gespeichert werden. Dafuer wird nur ein kurzer funktionaler Cooldown-Cookie gesetzt, und IP-Adressen werden nicht roh gespeichert."
              : "Auf dieser Instanz bleiben neue Einschaetzungen und lokale Titelanlage vorerst deaktiviert. Dadurch entfallen auch die funktionalen Schreibpfad-Cookies der Bewertungsabgabe."}
          </p>
          <p className="field-note">
            Sobald ein produktionsfaehiger Schreibpfad bereitsteht, wird dieser Abschnitt mit dem
            dann tatsaechlichen Verhalten konkretisiert.
          </p>
        </section>
      </div>
    </section>
  );
}
