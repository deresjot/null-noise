# UI-Komponentenstrategie

## Grundsatz

Keine externe UI-Komponentenbibliothek als Laufzeitabhängigkeit im MVP. Lokale Komponenten bleiben dünne Hüllen um native HTML-Semantik.

## Bevorzugte Bausteine

- Navigation: `nav`, Listen, Links, Skip-Link
- Suche und Filter: `form`, `label`, `input`, `select`, `fieldset`, `legend`
- Ergebnisse: semantische Listen und Artikel
- Detailansichten: `section`, `article`, `dl`, `ul`
- Vertiefung: `details` und `summary`
- Status: sichtbarer Klartext statt Toast-Zwang

## Bewusst vermeiden

- Tooltip-only-Inhalte
- Tabs oder App-Menüs für einfache Inhalte
- Dialoge/Drawers/Bottom Sheets ohne zwingenden Nutzen
- Icon-only-Steuerung ohne sichtbaren Text
- `div`/`span` mit `role="button"` statt echtem `button`
- Fokusfallen oder versteckte Fokusindikatoren

## Aktuelle Muster

- `SiteHeader`: Landmarken, Listen-Navigation, Skip-Link
- `SearchForm`: native Formularstruktur
- `ResultList`/`ExternalResultList`: semantische Ergebnislisten
- `SearchToneScale`: reduzierte Vorschau auf Karten, ausführlicher auf Detailseiten
- `ReadingEvidenceDetails`: nativer Disclosure-Block
- `TitlePocketActions`: echte Buttons mit sichtbarem Text

## Prüffragen für neue Komponenten

1. Reicht native HTML-Semantik?
2. Funktioniert die Grundfunktion ohne komplexes JavaScript?
3. Ist Tastaturbedienung vollständig?
4. Sind Name, Rolle und Zustand verständlich?
5. Bleibt Fokus sichtbar?
6. Gibt es Text für visuelle Zustände?
7. Vermeidet das Muster Hover-only und unnötige Bewegung?
