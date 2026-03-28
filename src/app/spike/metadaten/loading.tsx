export default function MetadataSpikeLoading() {
  return (
    <section className="panel section-stack" aria-live="polite" role="status">
      <p className="eyebrow">Technischer Spike</p>
      <h1>Externe Metadaten werden serverseitig geprüft</h1>
      <p>
        Die App wartet auf den Probezugriff. Reizprofile und Mock-Daten bleiben währenddessen
        unverändert.
      </p>
    </section>
  );
}
