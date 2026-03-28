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
          Diese Seite ist als ruhige Live-Basis vorbereitet. Vor einer echten öffentlichen Beta
          muessen Betreibername, ladungsfaehige Anschrift und direkter Kontakt konkret ergaenzt
          werden.
        </p>
      </div>

      <div className="content-grid">
        <section className="panel" aria-labelledby="impressum-owner-heading">
          <h2 id="impressum-owner-heading">Betreiberangaben</h2>
          <dl className="detail-list">
            <div>
              <dt>Name</dt>
              <dd>Noch vor der oeffentlichen Beta ergaenzen</dd>
            </div>
            <div>
              <dt>Anschrift</dt>
              <dd>Noch vor der oeffentlichen Beta ergaenzen</dd>
            </div>
            <div>
              <dt>Kontakt</dt>
              <dd>Noch vor der oeffentlichen Beta ergaenzen</dd>
            </div>
          </dl>
          <p className="field-note">
            Die technische Seite ist vorbereitet, ersetzt aber noch keinen fertigen Rechtstext.
          </p>
        </section>

        <section className="panel" aria-labelledby="impressum-metadata-heading">
          <h2 id="impressum-metadata-heading">Metadatenquelle</h2>
          <p>
            Wenn externe Titeldaten aktiviert sind, kommen Titel, Jahr, Synopsis und Posterpfad
            getrennt und serverseitig aus TMDb. Daraus entsteht aber kein automatisches Reizprofil.
          </p>
          <p className="field-note">
            null-noise wird dadurch nicht von TMDb unterstuetzt oder zertifiziert. Reizprofile,
            Wirkung und Confidence bleiben null-noise-intern.
          </p>
        </section>
      </div>
    </section>
  );
}
