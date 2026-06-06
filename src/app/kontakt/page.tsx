import type { Metadata } from "next";

import { ContactForm } from "@/components/contact-form";
import { siteName } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Kontakt | ${siteName}`,
  description:
    "Datensparsame Kontaktseite von null-noise mit E-Mail-Adresse für Antworten und lokal geprüfter Nachricht.",
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
          Das Formular fragt nur nach deiner Nachricht und einer E-Mail-Adresse für die Antwort.
          Es gibt keine weiteren Pflichtfelder.
        </p>
        <ul className="plain-list">
          <li>Die E-Mail-Adresse wird nur für die Antwort im Mailprogramm übernommen.</li>
          <li>Es gibt kein Tracking, keine Profile und keine Konto-Funktion.</li>
          <li>Die Eingaben werden hier nur lokal geprüft und nicht automatisch gespeichert.</li>
        </ul>
      </section>

      <section className="panel section-stack" aria-labelledby="contact-form-heading">
        <h2 id="contact-form-heading">Nachricht schreiben</h2>
        <p className="field-note">
          Es ist noch kein serverseitiger Versand eingerichtet. Nach der lokalen Prüfung kannst du
          die Nachricht bewusst im Mailprogramm öffnen.
        </p>
        <ContactForm />
      </section>
    </section>
  );
}
