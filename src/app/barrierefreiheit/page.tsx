import type { Metadata } from "next";

import { siteName } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Barrierefreiheit | ${siteName}`,
};

export default function BarrierefreiheitPage() {
  return (
    <section className="section-stack">
      <div className="section-header">
        <p className="eyebrow">Barrierefreiheit</p>
        <h1>Barrierefreiheit in null-noise</h1>
        <p>
          Diese Erklärung beschreibt den aktuellen Stand der Barrierefreiheit in der Web-Anwendung
          von null-noise. Sie dient der transparenten Einordnung des aktuellen Stands und ist keine
          formale Konformitätserklärung oder juristische Vollbehauptung.
        </p>
      </div>

      <div className="content-grid">
        <section className="panel" aria-labelledby="accessibility-scope-heading">
          <h2 id="accessibility-scope-heading">Wofür diese Erklärung gilt</h2>
          <p>
            Diese Erklärung gilt für die Web-Anwendung in ihrer aktuellen Ausprägung und die
            zentralen Nutzungsbereiche innerhalb von null-noise.
          </p>
          <p className="field-note">
            Inhalte und Oberflächen von Drittanbietern liegen außerhalb dieses Geltungsbereichs.
          </p>
        </section>

        <section className="panel" aria-labelledby="accessibility-status-heading">
          <h2 id="accessibility-status-heading">Aktueller Stand</h2>
          <ul className="plain-list">
            <li>
              Die Accessibility-Prüfung orientiert sich an WCAG 2.2 und den Prüfansätzen des
              BITV-Testverfahrens.
            </li>
            <li>HTML-first, sichtbarer Fokus und reduzierte Bewegung sind feste Projektprinzipien.</li>
            <li>
              Zentrale Nutzungsbereiche werden automatisiert geprüft und zusätzlich manuell
              gegengeprüft.
            </li>
            <li>Die Standardoberfläche bleibt der Primärpfad für die Nutzung.</li>
          </ul>
        </section>

        <section className="panel" aria-labelledby="accessibility-automated-heading">
          <h2 id="accessibility-automated-heading">Was automatisiert geprüft wird</h2>
          <ul className="plain-list">
            <li>Playwright mit <code>@axe-core/playwright</code> auf zentralen Nutzungsbereichen</li>
            <li>
              zusätzlicher direkter <code>axe-core</code>-Lauf mit injiziertem{" "}
              <code>axe.run()</code>
            </li>
            <li>Landmarken, Heading-Struktur, erkennbare Label- und ARIA-Probleme</li>
            <li>Kontrast-Fundstellen, die automatisiert belastbar erkennbar sind</li>
            <li>
              gezielte Smoke-Checks für Tastatur, Fokuspfade und Reflow bei{" "}
              <code>320 CSS-Pixeln</code>
            </li>
          </ul>
        </section>

        <section className="panel" aria-labelledby="accessibility-manual-heading">
          <h2 id="accessibility-manual-heading">Was manuell geprüft wird</h2>
          <ul className="plain-list">
            <li>reine Tastaturbedienung inklusive Fokusreihenfolge und sichtbarem Fokus</li>
            <li>Screenreader-Smoke-Test für Landmarken, Überschriften und Formularbeschriftungen</li>
            <li>
              Reflow bei <code>320 CSS-Pixeln</code> und Prüfung bei <code>400 %</code>{" "}
              Zoom
            </li>
            <li>
              <code>prefers-reduced-motion</code> und ruhiges Verhalten ohne überraschende
              Zustandswechsel
            </li>
            <li>Verständlichkeit: situative Lesart, Entscheidungsfrage und ehrliche Unsicherheit</li>
          </ul>
        </section>

        <section className="panel" aria-labelledby="accessibility-limits-heading">
          <h2 id="accessibility-limits-heading">Bekannte Grenzen und offene Punkte</h2>
          <ul className="plain-list">
            <li>
              Automatisierte Tests decken nur einen Teil der Anforderungen ab und ersetzen keine
              belastbare Screenreader- oder Zoom-Prüfung.
            </li>
            <li>
              Ob Texte unter Stress oder schneller Überforderung wirklich entlasten, bleibt ein
              manueller Qualitätscheck.
            </li>
            <li>
              Wenn sich Nutzungsbereiche wesentlich ändern, muss die Bewertung der Barrierefreiheit
              neu erfolgen.
            </li>
          </ul>
        </section>

        <section className="panel" aria-labelledby="accessibility-contact-heading">
          <h2 id="accessibility-contact-heading">Hinweise und Kontakt</h2>
          <p>
            Wenn dir eine Barriere auffällt oder ein Prüfpfad für dich nicht nachvollziehbar ist,
            ist ein Hinweis willkommen.
          </p>
          <p>
            Kontakt: <a href="mailto:mail@sebastianjansen.com">mail@sebastianjansen.com</a>
          </p>
          <p className="field-note">
            Stand dieser Erklärung: 11. April 2026. Letzte inhaltliche Prüfung: manueller
            Prüfpfad auf den zentralen Nutzungsbereichen plus automatisierte Läufe mit Playwright
            und <code>axe-core</code>.
          </p>
        </section>
      </div>
    </section>
  );
}
