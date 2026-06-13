import { LoadingState } from "@/components/loading-state";

export default function Loading() {
  return (
    <section className="section-stack app-loading-shell" aria-labelledby="app-loading-heading">
      <p className="eyebrow">null-noise</p>
      <h1 id="app-loading-heading">Inhalte werden geladen</h1>
      <LoadingState label="Inhalte werden geladen." live variant="page" />
    </section>
  );
}
