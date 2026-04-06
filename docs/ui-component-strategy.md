# UI-Komponentenstrategie für null-noise

Diese Datei ergänzt das MVP-Konzept um eine belastbare Auswahl- und Validierungslogik für barrierearme UI-Bausteine. Grundsatz für `null-noise`: Wir übernehmen keine Bibliothek als Ganzes, sondern orientieren uns an guten, dokumentierten Mustern und setzen im MVP bevorzugt native HTML-Semantik mit dünnen lokalen Komponenten um.

## Zielbild

Die UI soll ruhig, verständlich und funktional sein. Sie darf nicht wie ein aus Einzelteilen zusammengesetztes Framework wirken und keine versteckten Interaktionsmuster mitbringen. Komponenten müssen für die konkrete Nutzung in `null-noise` geeignet sein, nicht nur auf Demo-Seiten gut aussehen.

## Orientierungsquellen

Die folgende Übersicht diente als Startpunkt für die Recherche:

- DigitalA11Y: Accessible UI Component Libraries Roundup

Daraus leiten wir keine direkte Übernahme ab. Für `null-noise` sind vor allem diese Quellen als Inspiration sinnvoll:

- GOV.UK Design System
- Inclusive Components
- Scott O'Hara Accessible Components

Warum gerade diese drei:

- Sie arbeiten sichtbar komponenten- und musterorientiert statt rein optisch.
- Sie beschreiben Grenzen und Testbedarf, statt Accessibility pauschal zu versprechen.
- Sie lassen sich mit einer nativen HTML-first-Strategie verbinden.

## Inclusive-Components-Ableitung für null-noise

Inclusive Components ist für `null-noise` vor allem eine Pattern-Referenz. Die wichtigsten Ableitungen für das Produkt sind:

- Disclosure: primäre Erklärungen bleiben sichtbar, sekundäre Vertiefungen dürfen über native `details` und `summary` offengelegt werden
- Karten und Trefferlisten: Ergebnisse bleiben semantische Listen mit Überschrift und aussagekräftigem Link statt rein visuell klickbarer Container
- Hinweise und Status: Status wird in Klartext kommuniziert; Live-Regionen kommen nur bei echten dynamischen Statuswechseln zum Einsatz
- Menüs: Seitennavigation bleibt eine Liste von Links und wird nicht als ARIA-Menu nachgebaut
- Hilfen: Wenn Zusatzhilfe später punktuell gebraucht wird, ist ein explizites Toggletip-Muster denkbar; klassische Tooltip-Muster auf Hover-Basis sind für `null-noise` ausgeschlossen

Diese Ableitungen helfen uns, "moderne" UI-Abkürzungen zu vermeiden, wenn sie Orientierung, Semantik oder Tastaturbedienung verschlechtern würden.

## Ableitung für das MVP

Entscheidung für Phase 1 und 2:

- keine externe UI-Komponentenbibliothek als Laufzeitabhängigkeit
- lokale Komponenten nur als dünne Hülle um native HTML-Elemente
- CSS über Design Tokens und wenige robuste Layoutmuster
- Server-rendered Interaktion, damit Kernfunktionen auch ohne clientseitiges JavaScript sinnvoll bleiben

Das ist kein Dogma. Es ist eine Produktentscheidung für ein ruhiges, erklärbares MVP mit möglichst wenig versteckter Komplexität.

## Komponenten-Policy

Bevorzugte Bausteine:

- Navigation: `nav`, Listen, Links, sichtbarer Skip-Link
- Suche und Filter: `form`, `label`, `input`, `select`, `fieldset`, `legend`, Checkboxen
- Ergebnisse: semantische Listen und Artikel
- Detailansichten: `section`, `article`, `dl`, `ul`, klare Überschriftenstruktur
- Erklärbare Offenlegung: bevorzugt `details` und `summary` oder klar beschriftete Buttons, wenn eine Offenlegung später wirklich nötig ist
- Kontextuelle Hilfe: sichtbarer Hilfetext zuerst, Toggletip nur für echte Zusatzinformation und niemals als Hover-only-Tooltip

Nur mit klarer Begruendung zulassen:

- Dialoge
- Tabs
- Comboboxen / Autosuggest
- Toasts oder Notification-Regionen
- Custom Toggle oder Switch-Komponenten

Im MVP bewusst vermeiden:

- Tooltip-only-Inhalte
- Menü-Buttons für simple Seitennavigation
- Carousels oder Sliders
- Icon-only-Steuerung ohne sichtbaren Text
- `div` oder `span` mit `role="button"` statt echtem `button`
- Fokus-Reset oder visuell versteckte Fokusindikatoren
- Tabs oder App-Menüs für Inhalte, die als Liste, Section oder Disclosure einfacher funktionieren

## Auswahlmatrix für neue Komponenten

Jede neue Komponente muss vor Aufnahme diese Fragen bestehen:

1. Reicht native HTML-Semantik aus?
2. Funktioniert die Komponente ohne JavaScript noch sinnvoll oder fällt sie auf eine klare Grundfunktion zurück?
3. Ist sie vollständig per Tastatur bedienbar?
4. Sind Name, Rolle, Zustand und Ergebnis für Screenreader schlüssig?
5. Gibt es sichtbare Fokuszustände ohne Design-Workarounds?
6. Gibt es textliche Entsprechungen für visuelle Zustände?
7. Vermeidet die Komponente Hover-only-Muster, unnötige Bewegung und visuelle Spitzen?
8. Ist der Nutzen hoch genug, um die semantische und technische Komplexität zu rechtfertigen?

Wenn eine der Fragen nicht sauber mit `ja` beantwortet werden kann, wird die Komponente nicht übernommen oder zuerst vereinfacht.

## Validierung im Projektkontext

Jede übernommene oder inspirierte Komponente wird nicht nur optisch, sondern funktional bewertet:

- Tastaturtest: Fokusreihenfolge, Aktivierung, Rückkehr aus Interaktionen
- Fokusprüfung: sichtbar, kontrastreich, nicht überschrieben
- Screenreader-Sinnhaftigkeit: Landmarken, Beschriftungen, Statuswechsel
- Reflow/Zoom: 320 CSS Pixel, 400 Prozent Zoom
- Motion: Verhalten mit `prefers-reduced-motion`
- No-JS-Pfad: ergibt die Grundfunktion weiterhin Sinn?
- Touch/Mobil: ausreichend große Zielgrößen und stabile Reihenfolge

Automatisierung in dieser Basis:

- `axe-core` via Playwright für schnelle Accessibility-Smoke-Checks
- Build- und Lint-Prüfung für strukturelle Regressionen

Manuell verpflichtend vor Ausbau komplexerer Widgets:

- VoiceOver oder NVDA Smoke-Test
- reine Tastatur-Session ohne Maus
- mobile Interaktion auf kleinem Viewport

## Aktuelle Umsetzung in null-noise

Die erste Basis folgt dieser Strategie bereits:

- `SiteHeader`: Landmarken, Listen-Navigation, Skip-Link
- `SearchForm`: native Formularfelder mit `fieldset` und `legend`
- `SearchPage` im leeren Zustand: zwei semantisch getrennte Browse-Bereiche mit echten Listen statt Carousel- oder Mischlogik
- `ResultList`: semantische Trefferliste mit breiteren Tile-Artikeln statt schmalen App-Karten; Poster, Titelzone, Erstlesart und Aktionen sind als getrennte Leseblöcke aufgebaut
- `ExternalResultList`: dieselbe Tile-Sprache für externe TMDb-Titel, klar getrennt vom lokalen Stand und ohne Mischliste aus Browse und Suche
- `SearchToneScale`: gemeinsame, textlich beschriftete `leise ↔ laut`-Achse für Karten und Detailseiten als passive Pegelanzeige statt gauge-, KPI- oder sliderartiger Spezialwidgets
- `ProfileScale`: textlich beschriebene Skalen plus visuelle Hilfsanzeige
- `ExplanationPanel`: direkt sichtbare Erklärung statt versteckter Tooltip-Mechanik
- `ReadingEvidenceDetails`: nativer `details`-/`summary`-Block für die Frage `Worauf basiert das?`, damit Vertiefung im Produkt erklärbar bleibt, ohne neue Custom-Accordion-Logik aufzubauen
- `ReadingDecisionSupport`: kleiner Entscheidungsblock mit `Passt das gerade?`, `Im Vergleich zu …` und `Könnte kippen, weil …`; bleibt ein normaler Informationsblock statt eines neuen Widgets oder KPI-Moduls
- `ReadingFeedbackForm`: kleiner, anonymer Rückkanal mit echten `button`-Elementen und einfacher Server-Action-Logik statt sozialer Bewertungs-UI oder Client-Widget
- `DetailFollowupSection`: kleiner Folgeempfehlungsbereich auf Detailseiten mit normaler Überschrift und derselben Tile-Sprache wie in Suche/Browse statt neuer Empfehlungs-Widgetlogik
- `TitlePocketActions`: lokales `Merken` und `Schon gesehen` über echte Buttons mit sichtbarem Text statt Icon-only-Merken oder impliziter Watchlist-Mimik
- `SearchLocalShelf`: kleiner lokaler Abschnitt auf `/suche` für gemerkte und gesehene Titel; bleibt semantische Listen- und Formularstruktur statt Client-seitiger Board- oder Drawer-Mechanik
- `Inline-Status statt Toast`: kleine Rückmeldungen wie `Für später gemerkt.` oder `Neue Auswahl, gleicher Rahmen.` bleiben direkt am betroffenen Bereich und werden nicht als globale Notification-Mechanik aufgebaut
- `Erklärungsseite`: native Disclosure-Muster für vertiefende Informationen statt Custom-Accordion

## Wann wir spaeter doch eine externe Bibliothek pruefen

Erst wenn ein Muster semantisch komplex wird und die Eigenumsetzung nachweislich mehr Risiko als Nutzen erzeugt. Typische Kandidaten wären:

- robuster Dialog mit Fokus-Management
- zugangliche Combobox mit serverseitiger Suche
- komplexere Disclosure- oder Tab-Muster für verdichtete Informationsräume

Dann wird nicht "eine Library" übernommen, sondern ein einzelnes Muster gegen die Auswahlmatrix geprüft. Entscheidungsrelevant sind:

- semantische Korrektheit
- dokumentierte Tastaturbedienung
- Verzicht auf versteckte Interaktionen
- geringe Bundle- und Wartungslast
- nachvollziehbare Accessibility-Dokumentation

## Praktische Konsequenz für null-noise

Für das MVP bleibt die Komponentenbasis klein, ruhig und lokal. Das ist absichtlich weniger spektakulär, aber belastbarer für Accessibility, Privacy, Performance und Wartbarkeit.
