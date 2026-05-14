import type { Metadata } from "next";

import { siteName } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Erklärung zur Barrierefreiheit | ${siteName}`,
};

export default function BarrierefreiheitPage() {
  return (
    <section className="section-stack">
      <div className="section-header">
        <p className="eyebrow">Barrierefreiheit</p>
        <h1>Erklärung zur Barrierefreiheit</h1>
        <p>
          null-noise ist ein privates Hobby- und Referenzprojekt von Sebastian Jansen. Ziel ist
          digitale Barrierefreiheit nach nachvollziehbaren Standards. Diese Seite ist eine
          transparente Einordnung des aktuellen Projektstands und keine amtliche oder vollständige
          Konformitätsbehauptung.
        </p>
      </div>

      <section className="panel section-stack" aria-labelledby="status-heading">
        <h2 id="status-heading">Stand der Vereinbarkeit mit den Anforderungen</h2>
        <p>
          Die Umsetzung orientiert sich an WCAG 2.2 AA, EN 301 549 und den Prüfansätzen des
          BITV-Testverfahrens. Die Standardoberfläche bleibt der zugängliche Primärpfad. Es gibt
          keinen separaten Sondermodus mit abweichenden Inhalten oder Funktionen. Bekannte Barrieren
          werden dokumentiert und sollen schrittweise behoben werden.
        </p>
        <p>
          Eine vollständige manuelle BITV- oder WCAG-Prüfung wurde für dieses private Projekt nicht
          abgeschlossen. Deshalb wird hier bewusst nicht behauptet, dass null-noise vollständig
          geprüft oder formal konform ist.
        </p>
      </section>

      <div className="content-grid">
        <section className="panel" aria-labelledby="scope-heading">
          <h2 id="scope-heading">Prüfgrundlage und Prüfumfang</h2>
          <p>
            Der Prüfpfad umfasst die Kernrouten der Anwendung: Startseite, Suche ohne und mit
            Suchbegriff, eine Detailseite sowie die Informations- und Rechtsseiten.
          </p>
          <p className="field-note">
            Externe Websites, externe Dienste und Inhalte außerhalb der null-noise-Oberfläche sind
            nicht Teil dieser Erklärung.
          </p>
        </section>

        <section className="panel" aria-labelledby="automated-heading">
          <h2 id="automated-heading">Automatisierte Prüfungen</h2>
          <p>
            Im Projekt werden Playwright, <code>@axe-core/playwright</code> und ein direkter{" "}
            <code>axe-core</code>-Lauf verwendet. Zusätzlich gibt es Smoke-Checks für
            Überschriftenstruktur, Landmarken, Fokuspfade, Tastaturbedienung und Reflow bei{" "}
            <code>320 CSS-Pixeln</code>.
          </p>
          <p>
            In den zuletzt ausgeführten automatisierten Tests wurden auf den geprüften Kernrouten
            keine blockierenden Axe-Verstöße festgestellt. Automatisierte Tests unterstützen die
            Prüfung, ersetzen aber keine vollständige manuelle Bewertung.
          </p>
        </section>

        <section className="panel" aria-labelledby="manual-heading">
          <h2 id="manual-heading">Manuelle Prüfungen</h2>
          <p>
            Ergänzend sind manuelle Prüfungen vorgesehen und für eine belastbare Bewertung nötig.
            Sie orientieren sich an der Methodik des{" "}
            <a href="https://bitvtest.de/tests-und-beratung/bik-bitv-test-web">
              BIK BITV- / WCAG-Tests für Webangebote
            </a>{" "}
            und an der{" "}
            <a href="https://bitvtest.de/test-methodik/web/beschreibung-des-pruefverfahrens">
              Beschreibung des Prüfverfahrens für Web
            </a>
            . Für die WCAG-2.2-Einordnung wird zusätzlich das veröffentlichte{" "}
            <a href="https://bitvtest.de/pruefverfahren/wcag-22-web">
              Prüfschritt-Verzeichnis zum WCAG 2.2 Test für Web
            </a>{" "}
            als fachliche Orientierung herangezogen.
          </p>
          <ul className="plain-list">
            <li>reine Tastaturbedienung mit sichtbarem Fokus</li>
            <li>Screenreader-Smoke-Test für Landmarken, Überschriften und Formularbeschriftungen</li>
            <li>
              Reflow bei <code>320 CSS-Pixeln</code> und Prüfung bei <code>400 %</code> Zoom
            </li>
            <li>ruhiges Verhalten ohne überraschende Zustandswechsel</li>
            <li>Verständlichkeit der Texte, Unsicherheit und Entscheidungsfrage</li>
          </ul>
        </section>

        <section className="panel" aria-labelledby="limits-heading">
          <h2 id="limits-heading">Bekannte Grenzen und Auffälligkeiten</h2>
          <ul className="plain-list">
            <li>
              Kritisch: keine aktuell belegte kritische Auffälligkeit aus den automatisierten
              Projektprüfungen.
            </li>
            <li>
              Schwerwiegend: keine aktuell belegte schwerwiegende Auffälligkeit aus den
              automatisierten Projektprüfungen.
            </li>
            <li>
              Moderat: die tatsächliche Verständlichkeit unter Stress oder schneller Überforderung
              lässt sich nur manuell und mit Nutzungskontext bewerten.
            </li>
            <li>
              Gering: externe Metadaten, Poster und Titelinformationen können in Qualität und
              Vollständigkeit schwanken.
            </li>
          </ul>
        </section>

        <section className="panel" aria-labelledby="contact-heading">
          <h2 id="contact-heading">Kontakt und Feedback</h2>
          <p>
            Wenn dir eine Barriere auffällt oder ein Prüfpfad für dich nicht nachvollziehbar ist, ist
            ein Hinweis willkommen.
          </p>
          <p>Kontakt: mail@sebastianjansen.com</p>
        </section>

        <section className="panel" aria-labelledby="enforcement-heading">
          <h2 id="enforcement-heading">Durchsetzungsverfahren / Hinweis zur Einordnung</h2>
          <p>
            null-noise ist aktuell ein privates Hobby- und Referenzprojekt. Diese Erklärung ist
            deshalb als freiwillige Transparenzseite zu verstehen und nicht als behördliche
            Erklärung einer öffentlichen Stelle.
          </p>
          <p className="field-note">
            Diese Einordnung ist keine Rechtsberatung. Stand dieser Erklärung: 14. Mai 2026.
          </p>
        </section>
      </div>
    </section>
  );
}
