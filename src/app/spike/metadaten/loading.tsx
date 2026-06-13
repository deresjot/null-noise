import { LoadingState } from "@/components/loading-state";

export default function MetadataSpikeLoading() {
  return (
    <section className="panel section-stack">
      <p className="eyebrow">Technischer Spike</p>
      <h1>Detailansicht wird geladen</h1>
      <LoadingState label="Daten wurden serverseitig geprüft. Die Detailansicht wird geladen." live />
      <p>
        Die App wartet auf den Probezugriff. Reizprofile und Mock-Daten bleiben währenddessen unverändert.
      </p>
    </section>
  );
}
