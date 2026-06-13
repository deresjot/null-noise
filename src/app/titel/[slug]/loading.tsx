import { LoadingState } from "@/components/loading-state";

export default function TitleDetailLoading() {
  return (
    <section className="panel section-stack">
      <p className="eyebrow">Titel</p>
      <h1>Detailansicht wird geladen</h1>
      <LoadingState label="Detailansicht wird geladen." live />
    </section>
  );
}
