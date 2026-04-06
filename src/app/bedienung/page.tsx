export default function BedienungPage() {
  return (
    <section className="section-stack">
      <div className="section-header">
        <p className="eyebrow">Hilfe</p>
        <h1>Ruhig benutzbar auf Tastatur, Screenreader und Mobilgerät</h1>
        <p>Die Oberfläche bleibt absichtlich knapp: klare Labels, sichtbarer Fokus und keine Hover-Fallen.</p>
      </div>

      <div className="content-grid">
        <section className="panel" aria-labelledby="keyboard-heading">
          <h2 id="keyboard-heading">Tastatur</h2>
          <ul className="plain-list">
            <li>Ein Skip-Link führt direkt zum Hauptinhalt.</li>
            <li>Navigation, Suche, Filter und Links sind per Tab erreichbar.</li>
            <li>Es gibt keine Fokusfallen und keine hover-abhängigen Informationen.</li>
          </ul>
        </section>

        <section className="panel" aria-labelledby="screenreader-heading">
          <h2 id="screenreader-heading">Screenreader</h2>
          <ul className="plain-list">
            <li>Landmarken und logische Überschriften strukturieren jede Seite.</li>
            <li>Skalen werden textlich beschrieben und nicht nur farblich dargestellt.</li>
            <li>Filter und Suchfelder haben explizite Labels.</li>
          </ul>
        </section>

        <section className="panel" aria-labelledby="motion-heading">
          <h2 id="motion-heading">Bewegung und Reizreduktion</h2>
          <ul className="plain-list">
            <li>Keine blinkenden Elemente, kein Autoplay und keine hektischen Übergänge.</li>
            <li>`prefers-reduced-motion` wird berücksichtigt.</li>
            <li>Der Kontrast bleibt auch auf mobilen Geräten robust lesbar.</li>
          </ul>
        </section>
      </div>
    </section>
  );
}
