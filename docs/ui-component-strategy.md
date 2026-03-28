# UI-Komponentenstrategie fuer null-noise

Diese Datei ergaenzt das MVP-Konzept um eine belastbare Auswahl- und Validierungslogik fuer barrierearme UI-Bausteine. Grundsatz fuer `null-noise`: Wir uebernehmen keine Bibliothek als Ganzes, sondern orientieren uns an guten, dokumentierten Mustern und setzen im MVP bevorzugt native HTML-Semantik mit duennen lokalen Komponenten um.

## Zielbild

Die UI soll ruhig, verstaendlich und funktional sein. Sie darf nicht wie ein aus Einzelteilen zusammengesetztes Framework wirken und keine versteckten Interaktionsmuster mitbringen. Komponenten muessen fuer die konkrete Nutzung in `null-noise` geeignet sein, nicht nur auf Demo-Seiten gut aussehen.

## Orientierungsquellen

Die folgende Uebersicht diente als Startpunkt fuer die Recherche:

- DigitalA11Y: Accessible UI Component Libraries Roundup

Daraus leiten wir keine direkte Uebernahme ab. Fuer `null-noise` sind vor allem diese Quellen als Inspiration sinnvoll:

- GOV.UK Design System
- Inclusive Components
- Scott O'Hara Accessible Components

Warum gerade diese drei:

- Sie arbeiten sichtbar komponenten- und musterorientiert statt rein optisch.
- Sie beschreiben Grenzen und Testbedarf, statt Accessibility pauschal zu versprechen.
- Sie lassen sich mit einer nativen HTML-first-Strategie verbinden.

## Inclusive-Components-Ableitung fuer null-noise

Inclusive Components ist fuer `null-noise` vor allem eine Pattern-Referenz. Die wichtigsten Ableitungen fuer das Produkt sind:

- Disclosure: primaere Erklaerungen bleiben sichtbar, sekundaere Vertiefungen duerfen ueber native `details` und `summary` offengelegt werden
- Karten und Trefferlisten: Ergebnisse bleiben semantische Listen mit Ueberschrift und aussagekraeftigem Link statt rein visuell klickbarer Container
- Hinweise und Status: Status wird in Klartext kommuniziert; Live-Regionen kommen nur bei echten dynamischen Statuswechseln zum Einsatz
- Menues: Seitennavigation bleibt eine Liste von Links und wird nicht als ARIA-Menu nachgebaut
- Hilfen: Wenn Zusatzhilfe spaeter punktuell gebraucht wird, ist ein explizites Toggletip-Muster denkbar; klassische Tooltip-Muster auf Hover-Basis sind fuer `null-noise` ausgeschlossen

Diese Ableitungen helfen uns, "moderne" UI-Abkuerzungen zu vermeiden, wenn sie Orientierung, Semantik oder Tastaturbedienung verschlechtern wuerden.

## Ableitung fuer das MVP

Entscheidung fuer Phase 1 und 2:

- keine externe UI-Komponentenbibliothek als Laufzeitabhaengigkeit
- lokale Komponenten nur als duenne Huelle um native HTML-Elemente
- CSS ueber Design Tokens und wenige robuste Layoutmuster
- Server-rendered Interaktion, damit Kernfunktionen auch ohne clientseitiges JavaScript sinnvoll bleiben

Das ist kein Dogma. Es ist eine Produktentscheidung fuer ein ruhiges, erklaerbares MVP mit moeglichst wenig versteckter Komplexitaet.

## Komponenten-Policy

Bevorzugte Bausteine:

- Navigation: `nav`, Listen, Links, sichtbarer Skip-Link
- Suche und Filter: `form`, `label`, `input`, `select`, `fieldset`, `legend`, Checkboxen
- Ergebnisse: semantische Listen und Artikel
- Detailansichten: `section`, `article`, `dl`, `ul`, klare Ueberschriftenstruktur
- Erklaerbare Offenlegung: bevorzugt `details` und `summary` oder klar beschriftete Buttons, wenn eine Offenlegung spaeter wirklich noetig ist
- Kontextuelle Hilfe: sichtbarer Hilfetext zuerst, Toggletip nur fuer echte Zusatzinformation und niemals als Hover-only-Tooltip

Nur mit klarer Begruendung zulassen:

- Dialoge
- Tabs
- Comboboxen / Autosuggest
- Toasts oder Notification-Regionen
- Custom Toggle oder Switch-Komponenten

Im MVP bewusst vermeiden:

- Tooltip-only-Inhalte
- Menue-Buttons fuer simple Seitennavigation
- Carousels oder Sliders
- Icon-only-Steuerung ohne sichtbaren Text
- `div` oder `span` mit `role="button"` statt echtem `button`
- Fokus-Reset oder visuell versteckte Fokusindikatoren
- Tabs oder App-Menues fuer Inhalte, die als Liste, Section oder Disclosure einfacher funktionieren

## Auswahlmatrix fuer neue Komponenten

Jede neue Komponente muss vor Aufnahme diese Fragen bestehen:

1. Reicht native HTML-Semantik aus?
2. Funktioniert die Komponente ohne JavaScript noch sinnvoll oder faellt sie auf eine klare Grundfunktion zurueck?
3. Ist sie vollstaendig per Tastatur bedienbar?
4. Sind Name, Rolle, Zustand und Ergebnis fuer Screenreader schluessig?
5. Gibt es sichtbare Fokuszustaende ohne Design-Workarounds?
6. Gibt es textliche Entsprechungen fuer visuelle Zustaende?
7. Vermeidet die Komponente Hover-only-Muster, unnoetige Bewegung und visuelle Spitzen?
8. Ist der Nutzen hoch genug, um die semantische und technische Komplexitaet zu rechtfertigen?

Wenn eine der Fragen nicht sauber mit `ja` beantwortet werden kann, wird die Komponente nicht uebernommen oder zuerst vereinfacht.

## Validierung im Projektkontext

Jede uebernommene oder inspirierte Komponente wird nicht nur optisch, sondern funktional bewertet:

- Tastaturtest: Fokusreihenfolge, Aktivierung, Rueckkehr aus Interaktionen
- Fokuspruefung: sichtbar, kontrastreich, nicht ueberschrieben
- Screenreader-Sinnhaftigkeit: Landmarken, Beschriftungen, Statuswechsel
- Reflow/Zoom: 320 CSS Pixel, 400 Prozent Zoom
- Motion: Verhalten mit `prefers-reduced-motion`
- No-JS-Pfad: ergibt die Grundfunktion weiterhin Sinn?
- Touch/Mobil: ausreichend grosse Zielgroessen und stabile Reihenfolge

Automatisierung in dieser Basis:

- `axe-core` via Playwright fuer schnelle Accessibility-Smoke-Checks
- Build- und Lint-Pruefung fuer strukturelle Regressionen

Manuell verpflichtend vor Ausbau komplexerer Widgets:

- VoiceOver oder NVDA Smoke-Test
- reine Tastatur-Session ohne Maus
- mobile Interaktion auf kleinem Viewport

## Aktuelle Umsetzung in null-noise

Die erste Basis folgt dieser Strategie bereits:

- `SiteHeader`: Landmarken, Listen-Navigation, Skip-Link
- `SearchForm`: native Formularfelder mit `fieldset` und `legend`
- `ResultList`: semantische Trefferliste mit aussagekraeftigem Link im Titel statt klickbarer Div-Karten
- `ProfileScale`: textlich beschriebene Skalen plus visuelle Hilfsanzeige
- `ExplanationPanel`: direkt sichtbare Erklaerung statt versteckter Tooltip-Mechanik
- `Erklaerungsseite`: native Disclosure-Muster fuer vertiefende Informationen statt Custom-Accordion

## Wann wir spaeter doch eine externe Bibliothek pruefen

Erst wenn ein Muster semantisch komplex wird und die Eigenumsetzung nachweislich mehr Risiko als Nutzen erzeugt. Typische Kandidaten waeren:

- robuster Dialog mit Fokus-Management
- zugangliche Combobox mit serverseitiger Suche
- komplexere Disclosure- oder Tab-Muster fuer verdichtete Informationsraeume

Dann wird nicht "eine Library" uebernommen, sondern ein einzelnes Muster gegen die Auswahlmatrix geprueft. Entscheidungsrelevant sind:

- semantische Korrektheit
- dokumentierte Tastaturbedienung
- Verzicht auf versteckte Interaktionen
- geringe Bundle- und Wartungslast
- nachvollziehbare Accessibility-Dokumentation

## Praktische Konsequenz fuer null-noise

Fuer das MVP bleibt die Komponentenbasis klein, ruhig und lokal. Das ist absichtlich weniger spektakulaer, aber belastbarer fuer Accessibility, Privacy, Performance und Wartbarkeit.
