import Link from "next/link";

export default function NotFound() {
  return (
    <section className="panel section-stack">
      <p className="eyebrow">Nicht gefunden</p>
      <h1>Dieser Titel oder diese Seite existiert in der aktuellen Basis nicht.</h1>
      <p>
        Kehre zur Suche zurück oder starte auf der Startseite neu. Die aktuelle technische Basis
        arbeitet bewusst mit einem kleinen Beispielkatalog.
      </p>
      <p>
        <Link href="/suche">Zur Suche</Link>
      </p>
    </section>
  );
}
