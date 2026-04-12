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

## Trennung von Quellen

TMDb liefert Katalog- und Metadaten. `null-noise` ergänzt darüber eine eigene, vorsichtige Lesart.

Diese Trennung bleibt sichtbar, damit das Produkt nicht suggeriert, externe Metadaten seien schon ein Reizprofil.

## UI darf selbst keine Zusatzbelastung erzeugen

Die App bewertet Reizlast. Deshalb darf die Oberfläche nicht gleichzeitig mit lauter, unruhiger oder überraschender UI arbeiten.

Folgen daraus:

- klare Hierarchie
- wenig gleichzeitige Signale
- kurze Texte
- keine gamifizierte UI
- keine aggressive Bewegung
- auf Karten darf die Erstlesart eher als ruhige Vorschau funktionieren als als zweite Erklärungsebene

## Referenzprojekt statt Feature-Sammlung

`null-noise` soll ein belastbares Beispiel für barrierearme, nachvollziehbare und testbare Web-UX sein. Neue Features werden deshalb nicht an Neuheit gemessen, sondern an diesen Fragen:

1. Wird das Produkt dadurch verständlicher?
2. Bleibt das Verhalten testbar?
3. Erhöht die Änderung die kognitive Last?
4. Ist der Nutzen größer als die neue Komplexität?
