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
          null-noise bleibt auch im Rechtlichen bewusst knapp. Die Angaben hier orientieren sich am
          öffentlich verlinkten Impressum von Sebastian Jansen und setzen die erste Beta nicht
          größer in Szene, als sie ist.
        </p>
      </div>

      <div className="content-grid">
        <section className="panel" aria-labelledby="impressum-owner-heading">
          <h2 id="impressum-owner-heading">Angaben gemäß § 5 TMG</h2>
          <dl className="detail-list">
            <div>
              <dt>Name</dt>
              <dd>Sebastian Jansen</dd>
            </div>
            <div>
              <dt>Tätigkeit</dt>
              <dd>UX-Professional, Accessibility Consultant, Digital Designer</dd>
            </div>
            <div>
              <dt>Kontakt</dt>
              <dd>
                <a href="mailto:mail@sebastianjansen.com">mail [at] sebastianjansen [dot] com</a>
              </dd>
            </div>
            <div>
              <dt>Web</dt>
              <dd>
                <a href="https://www.sebastianjansen.com">www.sebastianjansen.com</a>
              </dd>
            </div>
          </dl>

          <h3>Verantwortlich für den Inhalt</h3>
          <p>Sebastian Jansen</p>
          <p className="field-note">
            Anschrift auf Anfrage per Mail erhältlich.
          </p>
        </section>

        <section className="panel" aria-labelledby="impressum-metadata-heading">
          <h2 id="impressum-metadata-heading">Metadatenquelle</h2>
          <p>
            Wenn externe Titeldaten aktiviert sind, kommen Titel, Jahr, Synopsis und Posterpfad
            getrennt und serverseitig aus TMDb. Daraus entsteht aber kein automatisches Reizprofil.
          </p>
          <p className="field-note">
            null-noise wird dadurch nicht von TMDb unterstützt oder zertifiziert. Reizprofile,
            Wirkung und Confidence bleiben null-noise-intern.
          </p>
        </section>
      </div>
    </section>
  );
}
