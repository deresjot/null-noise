import Link from "next/link";

export default function NotFound() {
  return (
    <section className="panel section-stack">
      <p className="eyebrow">Nicht gefunden</p>
      <h1>Dieser Titel oder diese Seite ist hier gerade nicht zu finden.</h1>
      <p>Geh zurück zur Suche oder starte noch einmal auf der Startseite. Oft reicht schon ein kürzerer Titel.</p>
      <p>
        <Link href="/suche">Zur Suche</Link>
      </p>
    </section>
  );
}
