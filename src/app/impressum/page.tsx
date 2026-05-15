import type { Metadata } from "next";

import { siteName } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Impressum | ${siteName}`,
};

export default function ImpressumPage() {
  return (
    <section className="section-stack">
      <div className="section-header">
        <p className="eyebrow">Rechtliches</p>
        <h1>Impressum</h1>
        <p>
          null-noise ist ein privates Hobby- und Referenzprojekt von Sebastian Jansen. Das Projekt
          dient der Erprobung von Vibe-Coding, digitaler Barrierefreiheit, ruhiger Web-UX
          sowie nachvollziehbarer Reiz-Einordnung.
        </p>
      </div>

      <div className="content-grid">
        <section className="panel" aria-labelledby="impressum-owner-heading">
          <h2 id="impressum-owner-heading">Anbieter / Verantwortlich</h2>
          <dl className="detail-list">
            <div>
              <dt>Name</dt>
              <dd>Sebastian Jansen</dd>
            </div>
            <div>
              <dt>Projekt</dt>
              <dd>null-noise ist ein privates Hobby- und Referenzprojekt.</dd>
            </div>
            <div>
              <dt>Zweck</dt>
              <dd>
                Erprobung von Vibe-Coding, digitaler Barrierefreiheit, ruhiger Web-UX und
                nachvollziehbarer Reiz-Einordnung.
              </dd>
            </div>
            <div>
              <dt>Kontakt</dt>
              <dd>mail@sebastianjansen.com</dd>
            </div>
            <div>
              <dt>Web</dt>
              <dd>
                <a href="https://www.sebastianjansen.com">www.sebastianjansen.com</a>
              </dd>
            </div>
          </dl>
        </section>

        <section className="panel" aria-labelledby="impressum-content-heading">
          <h2 id="impressum-content-heading">Verantwortlich für den Inhalt</h2>
          <p>Sebastian Jansen</p>
          <p className="field-note">
            TODO vor produktivem rechtlichen Einsatz: ladungsfähige Anschrift aus belastbarer Quelle
            ergänzen oder rechtlich prüfen.
          </p>
        </section>

        <section className="panel" aria-labelledby="impressum-metadata-heading">
          <h2 id="impressum-metadata-heading">Metadatenquelle</h2>
          <p>
            Wenn externe Titeldaten aktiviert sind, kommen öffentliche Titeldaten wie Titel, Jahr,
            Synopsis und Posterpfad getrennt und serverseitig aus TMDb. Daraus entsteht kein
            automatisches Reizprofil.
          </p>
          <p className="field-note">
            null-noise wird dadurch nicht von TMDb unterstützt oder zertifiziert. Reizprofile und
            erste Einschätzungen bleiben null-noise-intern.
          </p>
        </section>
      </div>
    </section>
  );
}
