import type { Metadata } from "next";

import { ContactForm } from "@/components/contact-form";
import { publicContactEmail, siteName } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Kontakt | ${siteName}`,
  description:
    "Datensparsame Kontaktseite von null-noise mit optionaler E-Mail-Adresse für Antworten.",
  alternates: {
    canonical: "/kontakt",
  },
  openGraph: {
    url: "/kontakt",
  },
};

export default function KontaktPage() {
  return (
    <section className="section-stack page-layout contact-page">
      <div className="section-header">
        <p className="eyebrow">Kontakt</p>
        <h1>Kontakt</h1>
        <p>
          Schreib eine kurze Nachricht, wenn dir etwas auffällt oder du eine Rückmeldung zu
          null-noise geben möchtest.
        </p>
        <p className="field-note">
          Sichtbare Kontaktadresse: <a href={`mailto:${publicContactEmail}`}>{publicContactEmail}</a>.
        </p>
      </div>

      <section
        className="panel section-stack content-surface"
        aria-labelledby="contact-privacy-heading"
      >
        <h2 id="contact-privacy-heading">Datensparsamkeit</h2>
        <p>
          Das Formular fragt nur nach deiner Nachricht und optional nach einer E-Mail-Adresse für
          die Antwort. Es gibt keine weiteren Felder.
        </p>
        <ul className="plain-list">
          <li>Die E-Mail-Adresse ist freiwillig und wird nur als Antwortadresse genutzt.</li>
          <li>Es gibt kein Tracking, keine Profile und keine Konto-Funktion.</li>
          <li>Die Nachricht wird serverseitig als E-Mail verschickt, nicht in einer Projektdatenbank gespeichert.</li>
          <li>Ohne E-Mail-Adresse ist die Nachricht trotzdem möglich, nur keine direkte Antwort.</li>
        </ul>
      </section>

      <section
        className="panel section-stack content-surface content-surface-emphasis"
        aria-labelledby="contact-form-heading"
      >
        <h2 id="contact-form-heading">Nachricht schreiben</h2>
        <p className="field-note">
          Deine Nachricht wird per E-Mail weitergeleitet. Ohne E-Mail-Adresse ist keine direkte Antwort
          möglich.
        </p>
        <ContactForm />
      </section>
    </section>
  );
}
