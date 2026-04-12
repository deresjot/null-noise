# Referenzziele für null-noise

Stand: 11. April 2026

Diese Datei hält fest, warum `null-noise` als Referenzprojekt weitergebaut wird und woran sich Entscheidungen messen lassen.

## Zielbild

`null-noise` soll nicht nur funktionieren, sondern fachlich nachvollziehbar bleiben:

- Entscheidungen müssen erklärbar sein.
- Verhalten muss testbar sein.
- Die Standardoberfläche muss selbst der barrierearme Primärpfad sein.
- Die UX soll kognitive Last reduzieren statt neue Reize zu erzeugen.

## Was „Referenzprojekt“ hier bedeutet

Das Projekt ist keine Showcase-Sammlung und kein Design-Experiment mit Accessibility-Nachtrag. Es soll zeigen, wie sich ein kleines Webprodukt bewusst begrenzen lässt:

- HTML-first statt komplexer Eigenwidgets
- Orientierung an WCAG 2.2 und den Prüfansätzen des BITV-Testverfahrens
- sichtbare Unsicherheit statt Scheinpräzision
- manuelle und automatisierte Prüfung nebeneinander
- Produktlogik vor Feature-Druck

## Welche Entscheidungen deshalb bewusst sichtbar bleiben

- keine Scores oder Rankings
- keine Social-Logik
- keine algorithmische Personalisierung
- `details` und `summary` für ruhige Vertiefung
- reduzierte Karten-Erstlesart mit Achse als Vorschau statt kleiner Textanalyse
- klare Trennung von Metadatenquelle und null-noise-Einschätzung

Diese Punkte sind keine Stilfrage, sondern Teil der Referenzlogik: Das Produkt soll verständlich bleiben, auch wenn die Datenlage dünn ist.

## Warum kein separater HTML-Sondermodus

Ein zweiter "einfacher" Parallelmodus klingt erst einmal hilfreich, ist für `null-noise` derzeit aber nicht der bessere Referenzweg.

Gründe:

- Zwei Oberflächen laufen in Text, Fokus, Reihenfolge und Disclosure schneller auseinander.
- Accessibility würde vom normalen Produktpfad abgekoppelt statt dort gelöst.
- Der Pflegeaufwand steigt, ohne dass der Nutzwert aktuell klar höher wäre.

Deshalb gilt im Projekt:

- Die Standardoberfläche ist der Primärpfad.
- Wenn etwas zu laut, zu komplex oder schlecht fokussierbar ist, wird der bestehende Pfad vereinfacht.
- Rein präsentationale Reduktion wäre nur dann vertretbar, wenn Inhalte, Reihenfolge und Funktionen identisch bleiben.

## Woran Änderungen gemessen werden

Vor einer größeren Änderung müssen mindestens diese Fragen beantwortbar sein:

1. Macht sie den Kernnutzen klarer?
2. Bleibt sie mit automatischen und manuellen Prüfungen belastbar testbar?
3. Senkt sie die kognitive Last oder erhöht sie sie?
4. Bleibt der Primärpfad für Tastatur, Screenreader und Reflow stabil?
5. Lässt sich die Entscheidung später dokumentieren und begründen?

## Verweis auf die Projektbasis

- [a11y-principles.md](./a11y-principles.md)
- [a11y-testing.md](./a11y-testing.md)
- [ux-principles.md](./ux-principles.md)
- [product-principles.md](./product-principles.md)
