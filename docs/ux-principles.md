# UX-Prinzipien für reduzierte kognitive Last

Stand: 11. April 2026

`null-noise` ist kein klassisches Entertainment-Produkt. Die Oberfläche soll nicht fesseln, sondern entlasten. Diese Datei beschreibt die UX-Prinzipien dafür.

## Ziel

Die App soll Menschen unterstützen, die sich schnell überfordert fühlen. Das schließt viele Nutzungssituationen ein, darunter auch neurodivergente und stressbelastete Nutzung. Im Produkt selbst arbeiten wir dabei nicht mit Buzzwords, sondern mit konkreten Designfolgen.

## Kernprinzipien

### Eine Hauptfrage pro Ansicht

Jede zentrale Ansicht braucht eine klare Leitfrage.

- Startseite: Wonach willst du schauen?
- Suche: Was passt grob in den aktuellen Rahmen?
- Detailseite: Passt das gerade?

Wenn eine Ansicht mehrere gleich laute Fragen stellt, steigt die kognitive Last.

### Klare Hierarchie

Die wichtigste Aussage steht zuerst und sichtbar.

Auf der Detailseite bedeutet das:

1. Titel
2. Erstlesart
3. direkte Entscheidungsfrage
4. erst danach Kontext, Herkunft und Zusatzblöcke

### Kurze Sätze

Texte werden auf Verständlichkeit statt Vollständigkeit optimiert. Für `null-noise` gilt:

- lieber zwei kurze Sätze als ein komplexer
- keine Fachbegriffe ohne unmittelbaren Nutzen
- keine abstrakten Produktformulierungen, wenn Alltagssprache reicht

### Ehrliche Unsicherheit

Ungewissheit wird nicht kaschiert. Formulierungen wie `Erste Einschätzung`, `Kaum Hinweise` oder `Kann schnell zu viel werden` sind absichtlich direkt.

Das Produkt soll nicht klüger klingen als seine Datenbasis.

### Vorhersehbare Interaktion

Die Oberfläche soll sich ruhig verhalten.

- keine Hover-only-Hilfe
- keine versteckten Aktionen
- keine überraschenden Zustandswechsel
- kein UI, das erst beim Klicken erklärt, was es eigentlich tut

### Sekundärinfos bleiben sekundär

Nicht alles muss sofort sichtbar sein. Aber Vertiefung darf nicht unauffindbar oder flüchtig werden. Deshalb arbeitet `null-noise` mit sichtbarer Primärinformation und ruhiger Offenlegung über `details` und `summary`.

### Erstlesart auf Karten bleibt Vorschau

Auf Such- und Browse-Karten muss die Erstlesart schneller lesbar sein als auf Detailseiten. Deshalb gilt dort:

- die segmentierte 3er-Vorschau ist das Primärsignal
- Status bleibt kurz
- narrative Erklärsätze gehören nicht in die Karten-Vorschau

Die ausführlichere Begründung bleibt auf Detailseiten und in Disclosure-Inhalten.

### Weniger, aber stabil

Wenn ein Zusatzblock keinen klaren Entscheidungsnutzen bringt, ist weglassen besser als verdichten. Diese Produktlogik ist bewusst restriktiv.

### Ruhige Standardoberfläche statt Sonderpfad

Die barrierearme UX soll nicht in einen separaten Spezialmodus ausgelagert werden. Die normale Produktoberfläche selbst muss ruhig, verständlich und vorhersagbar bleiben.

Für `null-noise` heißt das:

- dieselbe Informationsreihenfolge für alle
- dieselben Funktionen für alle
- keine zweite Parallel-UI mit abweichender Logik
- Reduktion lieber im bestehenden Layout als in einem ausgelagerten Sondermodus

## Konkrete Folgen für die Detailseite

- Die Erstlesart ist die primäre Aussage.
- `Passt das gerade?` bleibt kurz und direkt.
- `Worauf basiert das?` bleibt vertiefend und ruhig.
- Unsicherheit wird sichtbar benannt.
- Folge- und Escape-Logik bleiben klein und erklärbar.

## Bezug zu W3C COGA

Die Produktlogik orientiert sich besonders an diesen Zielen aus der W3C-COGA-Leitlinie:

- wichtigen Inhalt schnell auffindbar machen
- klare und verständliche Struktur bieten
- zu viel Inhalt vermeiden
- Nutzerinnen und Nutzer beim Fokus halten unterstützen
- unerwartete Bewegungen und Zustandswechsel vermeiden

Diese Ziele gehen teilweise über WCAG-Konformität hinaus und sind für `null-noise` bewusst Teil der UX-Qualität.

## Referenzen

- W3C COGA, Making Content Usable for People with Cognitive and Learning Disabilities: https://www.w3.org/TR/coga-usable/
- W3C Understanding Content on Hover or Focus: https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html
