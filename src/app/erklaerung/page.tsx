import { ExplanationPanel } from "@/components/explanation-panel";

export default function ExplanationPage() {
  return (
    <section className="section-stack">
      <div className="section-header">
        <p className="eyebrow">Lesart</p>
        <h1>So ist die Einordnung hier gemeint</h1>
        <p>Die Einordnung bleibt bewusst grob. Sie soll vor dem Schauen helfen, nicht das Schauen ersetzen.</p>
      </div>

      <ExplanationPanel />

      <section className="content-grid">
        <section className="panel" aria-labelledby="method-heading">
          <h2 id="method-heading">Woraus der Stand entsteht</h2>
          <p>
            Titel, Reizprofil, zusätzliche Wirkung und Stand bleiben getrennt. Sichtbar wird also
            nicht nur das Ergebnis, sondern auch, worauf es gerade ruht.
          </p>
          <p>
            Wenn mehrere Rückmeldungen vorliegen, verdichtet null-noise Reizachsen und beruhigende
            Wirkung jeweils über den Median. Das hält die Sache klein und ohne Scheingenauigkeit.
          </p>
          <p>
            Vorläufig, wachsend und belastbarer sind absichtlich schlichte Zustände. Mehr Präzision
            würde hier nur so tun, als wäre sie wirklich da.
          </p>
        </section>

        <section className="panel" aria-labelledby="limits-heading">
          <h2 id="limits-heading">Was das nicht lösen kann</h2>
          <p>
            Sensorische Belastung ist subjektiv. Zwei Personen können denselben Titel sehr
            unterschiedlich erleben. Deshalb bleibt das hier eine Orientierung und keine Wahrheit.
          </p>
          <p>
            Ein Titel kann reizintensiv, düster oder laut sein und trotzdem beruhigend wirken.
            Genau deshalb bleibt diese zweite Achse getrennt.
          </p>
        </section>
      </section>

      <section className="panel section-stack" aria-labelledby="patterns-heading">
        <h2 id="patterns-heading">Warum die Oberfläche so knapp bleibt</h2>
        <p>Erklärungen sollen direkt lesbar sein. Aufklappbare Bereiche gibt es nur da, wo sie den Lesefluss sonst eher stören würden.</p>

        <div className="disclosure-group">
          <details className="disclosure">
            <summary>Warum keine versteckten Tooltips?</summary>
            <p>
              Zusatzhilfe soll hier nicht flüchtig oder nur per Hover auftauchen. Wenn später mehr
              Hilfe nötig ist, dann offen und bewusst.
            </p>
          </details>

          <details className="disclosure">
            <summary>Warum bleiben Ergebnisse Listen mit klaren Links?</summary>
            <p>
              Treffer bleiben Listen mit klaren Überschriften und echten Links. Das ist für
              Screenreader, Tastatur und schnelles Scannen einfach robuster.
            </p>
          </details>

          <details className="disclosure">
            <summary>Warum verzichten wir auf Menüs und Tabs?</summary>
            <p>
              Solange Listen, Sections und native Offenlegungen reichen, sparen wir uns komplexere
              Widgets. Weniger Mechanik, weniger Reibung.
            </p>
          </details>
        </div>
      </section>
    </section>
  );
}
