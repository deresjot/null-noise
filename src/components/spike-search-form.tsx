interface SpikeSearchFormProps {
  query: string;
}

export function SpikeSearchForm({ query }: SpikeSearchFormProps) {
  return (
    <form action="/spike/metadaten" aria-label="Externe Metadaten prüfen" className="search-form">
      <div className="field-group field-group-wide">
        <label htmlFor="spike-query">Titel für serverseitigen Probezugriff</label>
        <input
          id="spike-query"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="z. B. Arrival oder Dark"
        />
      </div>
      <p className="field-note">
        Die Anfrage wird nur auf dem Server ausgeführt. Im Browser wird keine direkte Verbindung
        zur externen Quelle aufgebaut.
      </p>
      <button className="primary-button" type="submit">
        Metadaten serverseitig prüfen
      </button>
    </form>
  );
}
