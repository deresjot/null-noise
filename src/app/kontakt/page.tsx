import type { Metadata } from "next";

import { ContactForm } from "@/components/contact-form";
import { siteName } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Kontakt | ${siteName}`,
  description:
    "Datensparsame Kontaktseite von null-noise mit optionaler E-Mail-Adresse für Antworten.",
};

export default function KontaktPage() {
  return (
    <section className="section-stack">
      <div className="section-header">
        <p className="eyebrow">Kontakt</p>
        <h1>Kontakt</h1>
        <p>
          Schreib eine kurze Nachricht, wenn dir etwas auffällt oder du eine Rückmeldung zu
          null-noise geben möchtest.
        </p>
      </div>

      <section className="panel section-stack" aria-labelledby="contact-privacy-heading">
        <h2 id="contact-privacy-heading">Datensparsamkeit</h2>
        <p>
          Das Formular fragt nur nach deiner Nachricht und optional nach einer E-Mail-Adresse für
          die Antwort. Es gibt keine weiteren Felder.
        </p>
        <ul className="plain-list">
          <li>Die E-Mail-Adresse ist freiwillig und wird nur als Antwortadresse genutzt.</li>
          <li>Es gibt kein Tracking, keine Profile und keine Konto-Funktion.</li>
          <li>Die Nachricht wird serverseitig per E-Mail weitergeleitet und nicht dauerhaft gespeichert.</li>
        </ul>
      </section>

      <section className="panel section-stack" aria-labelledby="contact-form-heading">
        <h2 id="contact-form-heading">Nachricht schreiben</h2>
        <p className="field-note">
          Deine Nachricht wird direkt gesendet. Ohne E-Mail-Adresse ist keine direkte Antwort
          möglich.
        </p>
        <ContactForm />
      </section>
    </section>
  );
}
