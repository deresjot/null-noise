# Produktprinzipien für null-noise

Stand: 11. April 2026

Diese Datei beschreibt die Produktgrenzen und Produktentscheidungen, die `null-noise` als Referenzprojekt zusammenhalten.

## Entscheidungshilfe statt Analyse

`null-noise` beantwortet nicht die Frage, wie ein Titel objektiv ist. Die App hilft bei einer vorsichtigen, alltagstauglichen Entscheidung:

- eher ruhig
- eher wechselhaft
- eher intensiv

## Keine Scores und Rankings

Es gibt bewusst:

- keine Gesamtpunktzahl
- keine Prozentwerte
- keine Top-Listen
- keine scheinpräzisen Vergleiche

Das Produkt soll lesbar bleiben, nicht numerisch dominant.

## Keine Social Features

`null-noise` bleibt absichtlich ohne:

- öffentliche Bewertungen
- Kommentare
- Likes
- Follower-Logik
- Community-Druck

Rückmeldungen dürfen das Produkt verbessern, aber sie werden nicht als soziale Bühne inszeniert.

## Keine Personalisierung

Es gibt bewusst:

- keine Profile
- keine Konten
- kein Tracking
- keine algorithmische Personalisierung

Die App soll Orientierung geben, ohne Verhalten auszuwerten.

## Kein separater HTML-Sondermodus als Primärweg

`null-noise` baut aktuell keine zweite abgespeckte Paralleloberfläche mit abweichender Darstellung oder Reihenfolge. Die Standard-UI selbst muss der ruhige und zugängliche Primärpfad sein.

Dafür gibt es zwei Gründe:

- Ein zweiter Modus verdoppelt leicht Pflege, Tests und Inkonsistenzen.
- Das Produkt würde sonst riskieren, Accessibility aus der eigentlichen Oberfläche auszulagern, statt sie im Standardpfad zu lösen.

Wenn später einmal eine rein präsentationale Reduktion sinnvoll wird, darf sie nur dieselben Inhalte, dieselbe Reihenfolge und dieselben Funktionen behalten.

## Ehrlicher Umgang mit Unsicherheit

Unsicherheit ist Teil des Produkts, nicht ein Makel, der versteckt werden muss.

Darum zeigt `null-noise`:

- ob etwas nur eine erste Einschätzung ist
- worauf diese Einschätzung beruht
- wie viel Rückhalt es bisher gibt

## FSK nur als schwaches Kontextsignal (später)

Altersfreigaben wie FSK können höchstens ein schwaches Zusatzsignal sein. Sie sind keine Reizklassifikation.

Darum gilt für `null-noise`:

- keine direkte Ableitung `FSK = ruhig/intensiv`
- keine harte Filter- oder Score-Logik aus FSK
- wenn später genutzt, dann nur defensiv als Kontextsignal neben den bestehenden Signalen der ersten Einschätzung

## Trennung von Quellen

TMDb liefert Katalog- und Metadaten. `null-noise` ergänzt darüber eine eigene, vorsichtige erste Einschätzung.

Diese Trennung bleibt sichtbar, damit das Produkt nicht suggeriert, externe Metadaten seien schon ein Reizprofil.

## UI darf selbst keine Zusatzbelastung erzeugen

Die App bewertet Reizlast. Deshalb darf die Oberfläche nicht gleichzeitig mit lauter, unruhiger oder überraschender UI arbeiten.

Folgen daraus:

- klare Hierarchie
- wenig gleichzeitige Signale
- kurze Texte
- keine gamifizierte UI
- keine aggressive Bewegung
- auf Karten darf die erste Einschätzung eher als ruhige Vorschau funktionieren als als zweite Erklärungsebene

## Referenzprojekt statt Feature-Sammlung

`null-noise` soll ein belastbares Referenzprojekt für digitale Barrierefreiheit, nachvollziehbare Entscheidungen und testbare Web-UX sein. Neue Features werden deshalb nicht an Neuheit gemessen, sondern an diesen Fragen:

1. Wird das Produkt dadurch verständlicher?
2. Bleibt das Verhalten testbar?
3. Erhöht die Änderung die kognitive Last?
4. Ist der Nutzen größer als die neue Komplexität?

## Referenzziele

Das Projekt ist keine Showcase-Sammlung und kein Design-Experiment mit Accessibility-Nachtrag. Es soll zeigen, wie sich ein kleines Webprodukt bewusst begrenzen lässt:

- HTML-first statt komplexer Eigenwidgets
- Orientierung an WCAG 2.2 und den Prüfansätzen des BITV-Testverfahrens
- sichtbare Unsicherheit statt Scheinpräzision
- manuelle und automatisierte Prüfung nebeneinander
- Produktlogik vor Feature-Druck

Diese Entscheidungen bleiben sichtbar, weil sie das Produkt zusammenhalten:

- keine Scores oder Rankings
- keine Social-Logik
- keine algorithmische Personalisierung
- `details` und `summary` für ruhige Vertiefung
- klare Trennung von Metadatenquelle und null-noise-Einschätzung

Vor größeren Änderungen müssen diese Fragen beantwortbar sein:

1. Macht die Änderung den Kernnutzen klarer?
2. Bleibt sie mit automatischen und manuellen Prüfungen testbar?
3. Senkt sie die kognitive Last oder erhöht sie sie?
4. Bleibt der Primärpfad für Tastatur, Screenreader und Reflow stabil?
5. Lässt sich die Entscheidung später dokumentieren und begründen?
