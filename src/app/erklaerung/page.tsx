import { ExplanationPanel } from "@/components/explanation-panel";

export default function ExplanationPage() {
  return (
    <section className="section-stack">
      <div className="section-header">
        <p className="eyebrow">Erklärungssystem</p>
        <h1>So liest du Reizprofil und Wirkung</h1>
        <p>
          Das MVP erklärt offen, was es kann und was nicht. Es misst keine Dezibel, verspricht
          keine absolute Wahrheit und trennt Reizprofil klar von subjektiver Wirkung.
        </p>
      </div>

      <ExplanationPanel />

      <section className="content-grid">
        <section className="panel" aria-labelledby="method-heading">
          <h2 id="method-heading">Methodik</h2>
          <p>
            Externe Titeldaten, Reizprofil, zusätzliche Wirkung und Confidence bleiben technisch
            getrennt. Sichtbar wird nicht nur das Ergebnis, sondern auch dessen Grundlage.
          </p>
          <p>
            Wo mehrere Einschätzungen vorliegen, verdichtet null-noise Reizachsen und beruhigende
            Wirkung jeweils über den Median. So bleibt das Modell klein, nachvollziehbar und ohne
            scheinbar exakte Feingranularität.
          </p>
          <p>
            Im MVP ist Confidence bewusst schlicht: eine Einschätzung ergibt niedrig, zwei bis vier
            ergeben mittel, ab fünf wird die Confidence hoch. So wirkt die Unsicherheit nicht
            präziser als sie ist.
          </p>
        </section>

        <section className="panel" aria-labelledby="limits-heading">
          <h2 id="limits-heading">Grenzen des Modells</h2>
          <p>
            Sensorische Belastung ist subjektiv. Zwei Personen können denselben Titel sehr
            unterschiedlich erleben. Deshalb erklärt null-noise Reizprofile als Orientierung, nicht
            als starre Wahrheit.
          </p>
          <p>
            Ein Titel kann dabei reizintensiv, düster oder laut sein und trotzdem subjektiv
            regulierend wirken. Genau deshalb bleibt die beruhigende Wirkung eine eigene, getrennte
            Einordnung.
          </p>
        </section>
      </section>

      <section className="panel section-stack" aria-labelledby="patterns-heading">
        <h2 id="patterns-heading">Pattern-Orientierung für null-noise</h2>
        <p>
          Primäre Erklärungen bleiben sichtbar. Vertiefende Hinweise nutzen nur dann ein
          Disclosure-Muster, wenn sie den Lesefluss sonst unnötig belasten würden.
        </p>

        <div className="disclosure-group">
          <details className="disclosure">
            <summary>Warum keine versteckten Tooltips?</summary>
            <p>
              Zusatzhilfe soll in null-noise nicht flüchtig oder nur per Hover erscheinen. Wenn
              später punktuelle Hilfe nötig ist, wird sie als explizit öffnbares Muster gedacht,
              nicht als klassischer Tooltip.
            </p>
          </details>

          <details className="disclosure">
            <summary>Warum bleiben Ergebnisse Listen mit klaren Links?</summary>
            <p>
              Treffer sind als Liste von Artikeln mit aussagekräftiger Überschrift aufgebaut. So
              bleibt die Struktur auch für Screenreader, Tastatur und Linklisten nachvollziehbar.
            </p>
          </details>

          <details className="disclosure">
            <summary>Warum verzichten wir auf Menüs und Tabs?</summary>
            <p>
              Solange Listen, Sections und native Offenlegungen ausreichen, vermeidet null-noise
              komplexere Widgets. Das reduziert Reibung, Fokuslogik und Erklärungsbedarf.
            </p>
          </details>
        </div>
      </section>
    </section>
  );
}
