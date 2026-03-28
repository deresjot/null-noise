interface ExplanationPanelProps {
  compact?: boolean;
}

export function ExplanationPanel({ compact = false }: ExplanationPanelProps) {
  return (
    <section className="panel" aria-labelledby="explanation-panel-heading">
      <h2 id="explanation-panel-heading">Was bedeuten die Bewertungen?</h2>
      <p>
        null-noise zeigt keine Messwerte. Das Reizprofil ist eine strukturierte Einschätzung
        entlang von drei klar benannten Audio-Achsen.
      </p>
      <ul className="plain-list">
        <li>Grundlautstärke beschreibt das normale Lautstärkeniveau eines Titels.</li>
        <li>Plötzliche Spitzen meint abrupte laute Momente.</li>
        <li>Belastungsdichte zeigt, wie dauerhaft die akustische Belastung spürbar bleibt.</li>
        <li>Beruhigende Wirkung bleibt davon getrennt und beschreibt eine zusätzliche subjektive Einordnung.</li>
        <li>Die Skala reicht von `0` für sehr ruhig bis `4` für sehr intensiv.</li>
        <li>Confidence zeigt, wie viele Einschätzungen diese Einordnung aktuell tragen.</li>
      </ul>
      {!compact ? (
        <p>
          Externe Titeldaten bleiben davon getrennt. Sie helfen nur beim Wiederfinden eines Titels
          und ersetzen kein Reizprofil.
        </p>
      ) : null}
    </section>
  );
}
