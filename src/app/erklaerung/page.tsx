import Link from "next/link";
import type { Metadata } from "next";

import { siteName } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Erklärung und Hilfe | ${siteName}`,
};

export default function ExplanationPage() {
  return (
    <section className="section-stack">
      <div className="section-header">
        <p className="eyebrow">Erklärung und Hilfe</p>
        <h1>null-noise verstehen und benutzen</h1>
        <p>
          null-noise ist ein privates Hobby- und Referenzprojekt von Sebastian Jansen. Die App hilft,
          Filme und Serien grob nach ihrer vermuteten Reizwirkung einzuordnen.
        </p>
      </div>

      <section className="panel section-stack" aria-labelledby="what-heading">
        <h2 id="what-heading">Was ist null-noise?</h2>
        <p>
          null-noise gibt eine ruhige erste Orientierung, wenn du vor dem Schauen wissen willst, ob
          ein Titel gerade eher passen könnte. Die Einschätzung ist keine objektive Messung und keine
          medizinische, pädagogische oder therapeutische Empfehlung.
        </p>
        <p>
          Sichtbar werden nur drei grobe Richtungen: <strong>Eher ruhig</strong>,{" "}
          <strong>Eher wechselhaft</strong> und <strong>Eher intensiv</strong>. Es gibt keine Scores,
          keine Prozentwerte und keine Rankings.
        </p>
      </section>

      <section className="panel section-stack" aria-labelledby="tutorial-heading">
        <h2 id="tutorial-heading">So nutzt du die App</h2>
        <ol>
          <li>
            Öffne die <Link href="/suche">Suche</Link> und gib einen Film- oder Serientitel ein.
          </li>
          <li>
            Lies in der Trefferliste zuerst die kurze Tendenz. Sie zeigt nur eine vorsichtige
            Erstlesart.
          </li>
          <li>
            Öffne die Detailseite, wenn du mehr Kontext brauchst.
          </li>
          <li>
            Prüfe dort die Hauptaussage, die Frage <strong>Passt das gerade?</strong> und den Bereich{" "}
            <strong>Worauf basiert das?</strong>.
          </li>
          <li>
            Nutze <strong>Merken</strong> oder <strong>Gesehen</strong>, wenn du lokal im Browser
            einen eigenen kleinen Stand behalten willst.
          </li>
        </ol>
      </section>

      <div className="content-grid">
        <section className="panel" aria-labelledby="reading-heading">
          <h2 id="reading-heading">Was bedeutet Erstlesart?</h2>
          <p>
            Eine Erstlesart ist eine vorsichtige Einordnung aus vorhandenen Hinweisen. Sie sagt nicht:
            So ist der Titel wirklich. Sie sagt eher: So wirkt der Titel nach aktuellem Stand
            vermutlich.
          </p>
          <p>
            Wenn wenig Rückhalt vorhanden ist oder Hinweise widersprüchlich sind, bleibt diese
            Unsicherheit sichtbar.
          </p>
        </section>

        <section className="panel" aria-labelledby="levels-heading">
          <h2 id="levels-heading">Was bedeuten die drei Richtungen?</h2>
          <dl className="detail-list">
            <div>
              <dt>Eher ruhig</dt>
              <dd>Der Titel wirkt nach aktuellem Stand eher gleichmäßig oder entlastend.</dd>
            </div>
            <div>
              <dt>Eher wechselhaft</dt>
              <dd>Der Titel kann ruhige und belastendere Phasen mischen.</dd>
            </div>
            <div>
              <dt>Eher intensiv</dt>
              <dd>Der Titel kann dichter, lauter, unruhiger oder emotional schwerer wirken.</dd>
            </div>
          </dl>
        </section>

        <section className="panel" aria-labelledby="detail-heading">
          <h2 id="detail-heading">Wie lese ich eine Detailseite?</h2>
          <p>
            Oben steht die wichtigste Einordnung. Danach folgt die kurze Entscheidungsfrage. Weitere
            Hinweise stehen darunter, damit die Seite nicht wie ein Analysedashboard wirkt.
          </p>
          <p>
            Der Bereich <strong>Worauf basiert das?</strong> erklärt, welche Hinweise die Erstlesart
            gerade tragen. Er trennt Metadaten, Reizhinweise, Rückhalt und Unsicherheit.
          </p>
        </section>

        <section className="panel" aria-labelledby="local-heading">
          <h2 id="local-heading">Was leisten Merken und Gesehen?</h2>
          <p>
            Diese Funktionen helfen nur dir in diesem Browser. Sie erzeugen kein Konto, kein Profil
            und keine öffentliche Liste.
          </p>
          <p>
            Die Einträge werden lokal gespeichert und nicht serverseitig synchronisiert. Auf einem
            anderen Gerät sind sie deshalb nicht automatisch vorhanden.
          </p>
        </section>
      </div>

      <section className="panel section-stack" aria-labelledby="deeper-heading">
        <h2 id="deeper-heading">Häufige Fragen</h2>

        <div className="disclosure-group">
          <details className="disclosure">
            <summary>Was bedeutet die Unsicherheit der Einschätzung?</summary>
            <p>
              Unsicherheit bedeutet, dass die Hinweise noch dünn, gemischt oder nur indirekt sind.
              null-noise macht daraus keine glatte Sicherheit, weil das irreführend wäre.
            </p>
          </details>

          <details className="disclosure">
            <summary>Was bedeutet „Worauf basiert das?“</summary>
            <p>
              Der Bereich zeigt die Grundlage der Erstlesart. Dazu können Metadaten, vorhandene
              Rückmeldungen, interne Reizachsen und beruhigende Hinweise gehören. Nicht jeder Titel
              hat gleich viel Rückhalt.
            </p>
          </details>

          <details className="disclosure">
            <summary>Warum keine versteckten Tooltips?</summary>
            <p>
              Zusatzhilfe soll hier nicht flüchtig oder nur per Hover auftauchen. Wichtige Erklärung
              steht direkt auf der Seite oder in nativen aufklappbaren Bereichen.
            </p>
          </details>

          <details className="disclosure">
            <summary>Was leistet null-noise bewusst nicht?</summary>
            <p>
              null-noise bewertet keine Qualität, ersetzt keine Inhaltswarnungen und trifft keine
              sichere Aussage für alle Menschen. Die App zeigt keine Bestenlisten, keine sozialen
              Bewertungen und keine personalisierten Empfehlungen.
            </p>
          </details>
        </div>
      </section>

      <section className="panel section-stack" aria-labelledby="tech-heading">
        <h2 id="tech-heading">Wie ist null-noise entstanden?</h2>
        <p>
          null-noise ist nicht in einem klassischen Agentur- oder Produktteam entstanden, sondern in
          einem bewusst geführten Vibe-Coding-Prozess: Sebastian Jansen als Human in the Loop,
          ChatGPT 5.5 Thinking als konzeptioneller Sparringspartner und Codex als Coding-Agent direkt
          im Projektordner.
        </p>
        <p>
          Die menschliche Arbeit lag dabei nicht darin, jede Zeile Code von Hand zu tippen. Sie lag
          vor allem in Richtung, Kritik und Entscheidung: Was soll die App tun? Welche Begriffe sind
          ehrlich? Welche Aussagen wären zu stark? Welche Tests müssen grün sein, bevor etwas als
          tragfähig gilt?
        </p>

        <div className="content-grid">
          <section aria-labelledby="workflow-heading">
            <h3 id="workflow-heading">Arbeitsweise</h3>
            <p>
              ChatGPT 5.5 Thinking wurde für Produktlogik, Textschärfung, Barrierefreiheitsfragen und
              Architekturentscheidungen genutzt. Codex setzt diese Entscheidungen im Repository um:
              Dateien lesen, Komponenten ändern, Tests anpassen, Builds ausführen, Fehler einordnen
              und kleine Iterationen wiederholen.
            </p>
            <p>
              Der Mensch bleibt die Kontrollinstanz. Er gibt Ziele, Ton, Grenzen und Quellen vor,
              bewertet Zwischenergebnisse und entscheidet, wann eine Änderung gut genug oder noch zu
              ungenau ist.
            </p>
          </section>

          <section aria-labelledby="stack-heading">
            <h3 id="stack-heading">Programmiersprachen und Werkzeuge</h3>
            <p>
              Die Oberfläche ist eine Next.js-App mit React und TypeScript. TypeScript ist die
              wichtigste Programmiersprache im Projekt: Komponenten, Serverlogik, Datenmodelle,
              Tests und Hilfsfunktionen werden damit geschrieben. CSS beschreibt Layout, Typografie,
              Responsive-Verhalten und die ruhige visuelle Oberfläche.
            </p>
            <p>
              Dazu kommen Next.js als Web-Framework, React für die UI-Komponenten, Node.js für die
              lokale Ausführung, Vitest für Unit-Tests, Playwright für Browser-Tests, axe-core für
              automatisierte Barrierefreiheitsprüfungen und Prisma/SQLite für lokale
              Datenbankpfade.
            </p>
          </section>

          <section aria-labelledby="robustness-heading">
            <h3 id="robustness-heading">Robustheit</h3>
            <p>
              Robustheit entsteht hier weniger durch einen einzelnen großen Mechanismus als durch
              viele kleine Schutzschichten: TypeScript-Typen, validierte Eingaben, serverseitige
              API-Pfade, defensive Fallbacks, ruhige Fehlermeldungen und klare Trennung zwischen
              Metadaten und null-noise-Einschätzung.
            </p>
            <p>
              Automatisierte Prüfungen laufen mit ESLint, Next.js-Build, Vitest, Playwright und
              axe-core. Sie prüfen unter anderem Rendering, Datenlogik, Tastaturpfade, Landmarken,
              Reflow und erkennbare Barrierefreiheitsprobleme.
            </p>
          </section>

          <section aria-labelledby="implementation-heading">
            <h3 id="implementation-heading">Wie wird daran programmiert?</h3>
            <p>
              Änderungen beginnen meist als fachliche Absicht in normaler Sprache. Daraus werden
              konkrete Codeänderungen: eine Route im App Router, eine React-Komponente, eine
              Hilfsfunktion in <code>src/lib</code>, ein Test oder ein Textbaustein. Codex liest den
              bestehenden Code, hält sich an vorhandene Muster und schreibt Diffs, die danach geprüft
              werden.
            </p>
            <p>
              Ein typischer Zyklus ist: Ziel formulieren, bestehende Dateien lesen, klein ändern,
              Lint ausführen, Build ausführen, Unit- oder Playwright-Test laufen lassen, Ergebnis
              lesen, nachschärfen. Das ist normale Softwareentwicklung, nur mit einem Agenten als
              sehr schneller Pair-Programmierpartner.
            </p>
          </section>

          <section aria-labelledby="human-work-heading">
            <h3 id="human-work-heading">Was hätte ein Mensch daran gearbeitet?</h3>
            <p>
              Ohne Coding-Agent müsste ein Mensch große Teile der Umsetzung manuell recherchieren,
              schreiben und prüfen: Routen anlegen, Komponenten strukturieren, Texte konsistent
              halten, Datenformen modellieren, API-Pfade absichern, Tests schreiben, Fehlerlogs lesen
              und die Oberfläche über viele Viewports nachziehen.
            </p>
            <p>
              Die KI nimmt diese Arbeit nicht magisch ab. Sie verschiebt sie: weniger Tipparbeit,
              mehr Steuerung, Review, fachliche Einordnung und Qualitätskontrolle.
            </p>
          </section>
        </div>

        <div className="disclosure-group">
          <details className="disclosure">
            <summary>Was bedeutet Human in the Loop hier konkret?</summary>
            <p>
              Der Mensch entscheidet über Zweck, Ton, Grenzen und Freigabe. KI-Vorschläge werden
              nicht automatisch als Wahrheit behandelt, sondern gegen Projektziel, Quellen,
              Barrierefreiheit, Datenschutz und Tests geprüft.
            </p>
          </details>

          <details className="disclosure">
            <summary>Warum ist der Prozess trotzdem Programmierung?</summary>
            <p>
              Weil am Ende echte Programmierarbeit im Repository passiert: TypeScript, React, CSS,
              API-Routen, Tests, Builds, Deployments und Debugging. Nur die Eingabeform ist stärker
              dialogisch und review-getrieben.
            </p>
          </details>

          <details className="disclosure">
            <summary>Welche Grenzen hat diese Arbeitsweise?</summary>
            <p>
              Ein Agent kann falsche Annahmen treffen, Kontext übersehen oder zu selbstsicher
              formulieren. Deshalb bleiben kleine Schritte, sichtbare Diffs, Tests, Quellenprüfung
              und menschliche Entscheidung wichtige Teile des Prozesses.
            </p>
          </details>
        </div>
      </section>
    </section>
  );
}
