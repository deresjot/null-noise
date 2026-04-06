interface ExplanationPanelProps {
  compact?: boolean;
}

export function ExplanationPanel({ compact = false }: ExplanationPanelProps) {
  return (
    <section className="panel" aria-labelledby="explanation-panel-heading">
      <h2 id="explanation-panel-heading">Wie diese Lesart gemeint ist</h2>
      <p>Keine Messwerte, keine Scores, keine falsche Sicherheit. Nur eine grobe Richtung.</p>
      <ul className="plain-list">
        <li>Grundlautstärke meint das normale Lautstärkeniveau eines Titels.</li>
        <li>Plötzliche Spitzen meint abrupte laute Momente oder harte Reizwechsel.</li>
        <li>Belastungsdichte fragt, wie dauerhaft die akustische Last spürbar bleibt.</li>
        <li>Beruhigende Wirkung bleibt davon getrennt und ist eine eigene subjektive Achse.</li>
        <li>Vorläufig, wachsend und belastbarer beschreiben den Stand hinter der Tendenz.</li>
      </ul>
      {!compact ? (
        <p>Ein Titel kann anstrengend sein und trotzdem beruhigend wirken. Genau deshalb bleibt diese zweite Achse separat.</p>
      ) : null}
    </section>
  );
}
