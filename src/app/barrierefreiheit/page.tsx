import type { Metadata } from "next";

import { siteName } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Barrierefreiheit | ${siteName}`,
  description:
    "Aktueller Stand zur Barrierefreiheit von null-noise: WCAG 2.2 AA als technisches Ziel, laufende Prüfung und bekannte Grenzen.",
};

export default function BarrierefreiheitPage() {
  return (
    <section className="section-stack">
      <div className="section-header">
        <p className="eyebrow">Barrierefreiheit</p>
        <h1>Barrierefreiheit</h1>
        <p>
          null-noise strebt WCAG 2.2 AA als technischen Zielstandard an. Die
          Standardoberfläche bleibt dabei der zugängliche Primärpfad.
        </p>
      </div>

      <section className="panel section-stack" aria-labelledby="status-heading">
        <h2 id="status-heading">Aktueller Status</h2>
        <p>
          null-noise ist eine private Referenz-App. Es gibt noch keine abgeschlossene formale
          Konformitätsprüfung und keine Behauptung vollständiger Konformität.
        </p>
        <p>
          Prüfung und Umsetzung laufen iterativ. Gefundene Barrieren sollen in der normalen
          Oberfläche behoben werden, nicht in einem separaten Sondermodus.
        </p>
      </section>

      <section className="panel section-stack" aria-labelledby="considered-heading">
        <h2 id="considered-heading">Was bereits berücksichtigt wird</h2>
        <ul className="plain-list">
          <li>HTML-first mit nativen Links, Buttons, Formularfeldern und Disclosure-Elementen.</li>
          <li>Tastaturbedienung und sichtbarer Fokus auf interaktiven Elementen.</li>
          <li>Textliche Einordnung statt rein farblicher Codierung.</li>
          <li>Reduzierte Bewegung über <code>prefers-reduced-motion</code>.</li>
          <li>Ruhige Offenlegung von Zusatzinformationen statt flüchtiger Tooltips.</li>
          <li>Reflow und mobile Nutzung als wiederkehrender Prüfpunkt.</li>
          <li>
            Reduzierte kognitive Last durch kurze Texte, klare Gruppen und vorsichtige
            Formulierungen.
          </li>
        </ul>
      </section>

      <section className="panel section-stack" aria-labelledby="testing-heading">
        <h2 id="testing-heading">Wie geprüft wird</h2>
        <p>
          Das Projekt nutzt automatisierte Tests, manuelle Smoke-Tests und mobile Sichtprüfungen.
          Automatisierte Tests ersetzen keine manuelle Prüfung.
        </p>
        <ul className="plain-list">
          <li>Playwright-Checks auf Kernrouten.</li>
          <li>Axe-Prüfungen über <code>@axe-core/playwright</code> und einen direkten Axe-Lauf.</li>
          <li>Manuelle Tastatur- und Fokus-Smokes.</li>
          <li>Mobile Prüfungen bei kleinen Viewports, unter anderem Reflow bei 320 CSS-Pixeln.</li>
        </ul>
      </section>

      <section className="panel section-stack" aria-labelledby="limits-heading">
        <h2 id="limits-heading">Bekannte Grenzen</h2>
        <ul className="plain-list">
          <li>Datenbasis und erste Einschätzungen bleiben unsicher.</li>
          <li>Die manuelle Prüfung ist noch nicht vollständig abgeschlossen.</li>
          <li>Screenreader- und Mobile-Prüfung werden weiter geschärft.</li>
          <li>Externe Dienste und externe Websites sind nicht Teil dieser Seite.</li>
        </ul>
      </section>

      <section className="panel section-stack" aria-labelledby="contact-heading">
        <h2 id="contact-heading">Kontakt</h2>
        <p>
          Hinweise auf Barrieren oder unklare Bedienwege sind willkommen:
          {" "}
          <a href="mailto:mail@sebastianjansen.com">mail@sebastianjansen.com</a>
        </p>
      </section>
    </section>
  );
}
