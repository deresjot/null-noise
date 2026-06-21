# UX-Prinzipien für reduzierte kognitive Last

Stand: 21. Juni 2026

`null-noise` ist kein klassischer Streaming-Katalog, sondern ein ruhiges Bewertungsportal für die erste Reiz-Einordnung von Filmen und Serien. Die Oberfläche soll nicht fesseln, sondern entlasten. Diese Datei beschreibt die UX-Prinzipien dafür.

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
2. Erste Einschätzung
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

### Situative Discovery statt Empfehlung

Discovery soll nicht wie ein personalisierter Feed wirken. Die Leitfrage ist
nicht `Was empfiehlt das System?`, sondern `Passt das gerade?`.

Deshalb gelten für Browse, Suche und Alternativen:

- keine Formulierungen wie `Empfohlen für dich` oder `Heute passend`
- sichtbare Orientierungskategorien `Eher ruhig`, `Eher wechselhaft` und `Eher intensiv`
- `Nicht jetzt` ist eine entlastende Einordnung, keine negative Bewertung des Titels
- Alternativen werden als Gegengewichte formuliert: ruhiger, dichter oder leichter
- keine Rankings, Toplisten, Prozentwerte oder scheinpräzise Reizwerte
- keine Social-, Profil- oder Tracking-Logik

### Vorhersehbare Interaktion

Die Oberfläche soll sich ruhig verhalten.

- keine Hover-only-Hilfe
- keine versteckten Aktionen
- keine überraschenden Zustandswechsel
- kein UI, das erst beim Klicken erklärt, was es eigentlich tut
- Meta-Elemente dürfen nicht wie Eingabefelder wirken, wenn sie nicht editierbar sind
- Echte Steuerung soll als Steuerung lesbar sein: Umschalter, View-Toggles und Refresh-Aktionen brauchen sichtbare Affordance auch ohne Hover

### Joy of Use ohne UI-Lärm

Wertigkeit entsteht durch verständliche Reaktion, gute Haptik und ruhige Übergänge, nicht durch Spektakel.

- Mobile ist der primäre Nutzungskontext
- kleine Motion darf Interaktionen bestätigen und Orientierung stützen
- `prefers-reduced-motion` bleibt verbindlich und schaltet dekorative Bewegung ab
- Icons, Farben, Rahmen, Statusköpfe und Text arbeiten zusammen als Leitsystem
- Farbe oder Icon allein darf nie die einzige Information tragen
- Touch-Aktionen sollen sich wie ein natürlicher Fingertipp anfühlen, nicht wie Formularverwaltung

### Ruhige Ladezustände

Ladezustände sind nur fuer echte Wartezeiten gedacht. Sie dürfen vorhandene Orientierung nicht ersetzen und sollen keine zusätzliche Reizlast erzeugen.

- kein künstliches Delay, nur um einen Loader zu zeigen
- keine lauten Spinner, blinkenden Skeletons oder flächigen Platzhalter
- vorhandene Suchergebnisse bleiben während Soft-Navigation sichtbar
- sichtbarer Text benennt, was gerade lädt
- Bewegung ist rein dekorativ und wird bei `prefers-reduced-motion` abgeschaltet

### Robuste Darstellung

Die Standardoberfläche muss in heller Darstellung, bei systemweiter Dark-Präferenz ohne automatischen Themewechsel, in Windows High Contrast/Forced Colors, Reduced Motion, Zoom und kleinen Viewports dieselben Inhalte in derselben Reihenfolge behalten.

- keine zweite Accessibility- oder High-Contrast-Oberfläche und keine automatische Dark-Mode-Oberfläche ohne expliziten, getesteten Theme-Schalter
- wichtige Zustände zusätzlich über Text, Struktur, Rahmen oder Position
- aktive Navigation, Buttons und Filter zeigen Auswahl über das ganze Control, nicht über eine kleine Fläche nur hinter der Beschriftung
- Cluster sind echte Inhaltsbereiche mit Überschrift, sichtbarem Label, Beschreibung und Listenstruktur
- Schatten, Farbe und Bewegung dürfen nie die einzige Gruppierung oder Statusinformation sein

### Mobile Suchdichte

Die mobile Suche darf nicht nur overflow-frei sein, sondern muss die knappe Breite ruhig nutzen.

- leere Query-URLs bleiben ein Browse-/Discovery-Zustand, kein kaputter Zwischenzustand
- mobile Menüs sind vollflächige Navigationsebenen mit klarer Fokusführung, nicht lose über Inhalt schwebende Zusatzboxen
- mobile Brand-Lockups behalten zwischen geschlossenem Header und geöffnetem Menü dieselbe visuelle Größe, Grundlinie und Nähe zwischen Icon-Logo und Wortmarke
- Result-Cards nutzen den Content-Gutter aus, halten Poster, Titel, erste Einschätzung, lokalen Status und Aktionen klar getrennt und lassen Actions mit Text sichtbar
- Footer-Information bleibt sekundär, aber lesbar und bewusst gestaltet; die vollständige Release-Historie gehört auf `/changelog`, nicht dauerhaft in den Footer

### Rückmeldung als Wahrnehmung

Die lokale Einschätzung soll nicht wie ein Verwaltungsformular wirken. Nach dem Lesen der Einschätzung soll die Person mit einem Fingertipp sagen können: `Ja, so habe ich das erlebt` oder `Nein, für mich war das anders`.

- schnelle Rückmeldung sitzt im Lesefluss direkt nach der ersten Einschätzung und Begründung
- große Auswahlkarten ersetzen dort klassische kleine Radio-Controls
- Auswahl, Speichern, Fehler und spätere Änderung haben sichtbare Zustände
- das längere Vier-Fragen-Formular bleibt eine spätere Detailkorrektur, nicht der primäre Mobile-Einstieg
- Screenreader, Tastatur und Fokuszustände bleiben gleichwertig zur Touch-Bedienung

### Sekundärinfos bleiben sekundär

Nicht alles muss sofort sichtbar sein. Aber Vertiefung darf nicht unauffindbar oder flüchtig werden. Deshalb arbeitet `null-noise` mit sichtbarer Primärinformation und ruhiger Offenlegung über `details` und `summary`, etwa in der vollständigen Release-Historie auf `/changelog`.

### Erste Einschätzung auf Karten bleibt Vorschau

Auf Such- und Browse-Karten muss die erste Einschätzung schneller lesbar sein als auf Detailseiten. Deshalb gilt dort:

- die segmentierte 3er-Vorschau ist das Primärsignal
- Status bleibt kurz
- narrative Erklärsätze gehören nicht in die Karten-Vorschau

Die ausführlichere Begründung bleibt auf Detailseiten und in Disclosure-Inhalten.

### Weniger, aber stabil

Wenn ein Zusatzblock keinen klaren Entscheidungsnutzen bringt, ist weglassen besser als verdichten. Diese Produktlogik ist bewusst restriktiv.

### Ruhige Standardoberfläche statt Sonderpfad

Zugängliche, verständliche und vorhersehbare UX soll nicht in einen separaten Spezialmodus ausgelagert werden. Die normale Produktoberfläche selbst muss ruhig, verständlich und vorhersagbar bleiben.

Für `null-noise` heißt das:

- dieselbe Informationsreihenfolge für alle
- dieselben Funktionen für alle
- keine zweite Parallel-UI mit abweichender Logik
- Reduktion lieber im bestehenden Layout als in einem ausgelagerten Sondermodus

## Konkrete Folgen für die Detailseite

- Die erste Einschätzung ist die primäre Aussage.
- `Passt das gerade?` bleibt kurz und direkt.
- `Worauf basiert das?` bleibt vertiefend und ruhig.
- Evidence kann dort als `Spricht eher dafür`, `Kann dagegen sprechen` und `Datenlage` gruppiert werden.
- Unsicherheit wird sichtbar benannt.
- Folge- und Escape-Logik bleiben klein und erklärbar.

## Konkrete Folgen für Hero und Sucheinstieg

- Die Startseite beschreibt den Dienst kurz und direkt statt mit einer generischen Platzhalterformel.
- Der Hero-Hinweis benennt Suche, grobe Reiz-Einordnung und ruhigere Auswahl in Alltagssprache.
- Browse-Steuerung trennt sichtbare Meta-Texte klar von klickbaren Aktionen.
- Browse-Mixes bleiben Einstiegshilfen und werden nicht zu persönlichen Empfehlungen.

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
