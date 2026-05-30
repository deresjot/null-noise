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
        <section className="subsection" aria-labelledby="automated-tests-heading">
          <h3 id="automated-tests-heading">Automatisierte Tests im Projekt</h3>
          <ul className="plain-list">
            <li>
              <code>npm run lint</code>: ESLint mit Next-Regeln prüft unter anderem HTML-nahe
              React-Struktur, Link-/Bildmuster und auffällige Codefehler.
            </li>
            <li>
              <code>npm run build</code>: Der Next.js-Produktionsbuild prüft Typen, Routing,
              Server-/Client-Grenzen, statische Seiten und die Manifest-/Offline-Routen.
            </li>
            <li>
              <code>npm run test:unit</code>: Vitest prüft Datenlogik, Suchlogik, Evidence-Modell,
              lokale Titel, Merken/Gesehen-Helfer, Laufzeitkonfiguration und sichere
              Formulierungen.
            </li>
            <li>
              <code>npm run test:axe-core</code>: Ein direkter axe-core-Lauf scannt Kernrouten wie
              Start, Suche, Suche mit Query, Detailseite, Offline-Seite sowie Info- und
              Rechtstexte.
            </li>
            <li>
              <code>npm run test:a11y</code>: Playwright öffnet die App im Browser und kombiniert
              axe-Scans mit Bedienprüfungen für Tastatur, Fokus, Skiplinks, native Disclosure,
              mobile Navigation, Manifest und Reflow.
            </li>
            <li>
              <code>npx playwright test</code>: Der vollständige Browserlauf umfasst die
              A11y-Checks plus weitere End-to-End-Prüfungen; externe TMDb-Live-Fallbacks laufen
              nur, wenn die nötige Umgebung verfügbar ist.
            </li>
          </ul>
        </section>

        <section className="subsection" aria-labelledby="background-tests-heading">
          <h3 id="background-tests-heading">Was dabei im Hintergrund passiert</h3>
          <p>
            Playwright startet über die Projektkonfiguration lokal <code>npm run dev</code> auf
            {" "}
            <code>127.0.0.1:3000</code>, sofern dort kein Server wiederverwendet wird. Danach
            steuert der Testbrowser echte Seiten an, wartet auf sichtbare Inhalte und führt
            Erwartungen gegen die gerenderte Oberfläche aus.
          </p>
          <p>
            Die axe-Prüfungen laufen in zwei Varianten: einmal über <code>@axe-core/playwright</code>
            {" "}
            und zusätzlich als direkt in die Seite injiziertes <code>axe-core</code>. Die Ergebnisse
            werden im Testlauf als JSON-Anhang aufbereitet, damit Funde nicht nur als kurze
            Konsolenmeldung stehen bleiben.
          </p>
          <p>
            Für Browserzustände werden echte Interaktionen genutzt: Eingaben in Suchfelder,
            Tastatur-Tab-Reihenfolge, Enter auf Skiplinks, Fokus nach Reload, Öffnen von
            {" "}
            <code>summary</code>-Elementen, mobile Menübedienung und kleine Viewports bis 320
            CSS-Pixel.
          </p>
        </section>

        <section className="subsection" aria-labelledby="test-derivation-heading">
          <h3 id="test-derivation-heading">Wie die Tests hergeleitet wurden</h3>
          <p>
            Die Tests sind aus den Produkt- und A11y-Leitplanken abgeleitet: HTML-first,
            Standardoberfläche als Primärpfad, keine rein farbliche Information, keine
            flüchtigen Tooltip-Pflichtwege, sichtbarer Fokus, Tastaturbedienung, kleine
            Viewports und verständliche Zustände.
          </p>
          <p>
            Daraus wurden konkrete Prüfpfade gemacht: Startseite, Suche ohne Query, Suche mit
            Query, Detailseite, Offline-Seite, Erklärung, Barrierefreiheit, Datenschutz und
            Impressum. Jede Route prüft zuerst, ob die erwarteten Inhalte sichtbar sind; danach
            laufen Axe- oder Interaktionschecks auf der tatsächlich gerenderten Seite.
          </p>
          <p>
            Zusätzlich prüfen Unit-Tests die fachliche Grundlage hinter der Oberfläche, damit
            sichtbare Texte nicht versehentlich zu Scores, Rankings, Scheinpräzision oder
            reduzierender Sprache kippen.
          </p>
        </section>
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
