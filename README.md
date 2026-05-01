# null-noise

Erste technische Umsetzungsbasis für eine barrierearme Web-App, die Filme und Serien nach ihrer sensorischen Belastung einordnet. Diese Basis verbindet Produktkonzept, Datenmodell und ein ruhiges Next.js-MVP mit Seed-Daten. Audio-Reizprofile werden zunächst editorial geseedet und können lokal durch anonyme Einzelbewertungen serverseitig per Median verdichtet werden. Neue lokal angelegte Titel und anonyme Bewertungen landen inzwischen in einer kleinen persistenten SQLite-Datenbank über Prisma. Für eine erste öffentliche Beta bleibt die Vercel-Instanz derzeit dennoch bewusst lesend, bis auch der produktive Schreibpfad außerhalb der lokalen Instanz belastbar bereitsteht.

Der kurze Einstieg für aktuelle Arbeit steht in [docs/00-current/llm-context.md](./docs/00-current/llm-context.md). Die bisherige Projektzusammenfassung bleibt über [docs/project-summary.md](./docs/project-summary.md) erreichbar und verweist auf aktuelle Kurzfassung und Archiv.

## 1. Product Framing

`null-noise` hilft Menschen bei der Frage, ob ein Film oder eine Serie für ihre persönliche sensorische Belastbarkeit passend ist. Das MVP verspricht keine objektive Messung, sondern strukturierte, nachvollziehbare Einschätzungen entlang eines kleinen Audio-Modells mit drei Achsen: Grundlautstärke, plötzliche Spitzen und Belastungsdichte.

Die Produktthese ist doppelt:

- Der Inhalt selbst soll transparenter werden.
- Die App-Oberfläche darf dabei keine zusätzliche Belastung erzeugen.

Das Produkt positioniert sich bewusst zwischen klassischer Titelsuche und Accessibility-Tool: ruhig, erklärend, nicht spekulativ und ohne Entertainment-Patterns.

## 2. Key User Needs

- Ist der Titel insgesamt ruhig, ausgeglichen oder intensiv?
- Gibt es plötzliche laute Peaks, Geschrei oder Einschläge?
- Wie sicher ist die Einschätzung, und worauf basiert sie?
- Kann ich die App ohne Maus, ohne Konto und ohne Stress bedienen?
- Bekomme ich Erklärungen ohne versteckte UI-Elemente oder Fachjargon?

## 3. Information Architecture

Primare Seitenstruktur im MVP:

- `/`: Einführung, direkte Suche, Kurzerklärung, Privacy- und Accessibility-Versprechen
- `/suche`: Ergebnisliste mit Filtern für ruhige oder intensivere Titel
- `/titel/[slug]`: Detailseite mit Reizprofil, Erläuterung, Confidence und Transparenzdaten
- `/erklaerung`: Bedeutung der Skalen, Grenzen des Modells, Umgang mit Unsicherheit
- `/bedienung`: Bedienhinweise für Tastatur, Screenreader, Mobilgeräte und reduzierte Bewegung
- `/api/titles`: serverseitige Such-API für den Katalog
- `/api/titles/[slug]`: serverseitige Detail-API für einzelne Titel
- `/spike/metadaten`: strikt getrennter Technikpfad für serverseitig abgefragte externe Metadaten
- `/api/spike/titles`: JSON-Endpunkt für den serverseitigen Metadaten-Spike

## 4. Domain Model

Das aktuelle Reizmodell bleibt bewusst klein und erklärbar:

- `stimulus_profile.volume_level`
- `stimulus_profile.peak_intensity`
- `stimulus_profile.stimulus_density`
- `stimulus_profile.notes`
- `aggregation.level`
- `aggregation.rating_count`
- `aggregation.last_reviewed_at` optional

Ergänzende Domainen:

- `external_title`: externe Metadatenquelle wie TMDB, strikt getrennt vom eigenen Profil
- `community_rating`: anonyme Einzelbewertung ohne Account-Zwang
- `stimulus_aggregate`: spätere Verdichtung der Einzelbewertungen
- `content_flag`: textuelle Warnhinweise mit klarer Sprache
- `source_type`: Transparenzsignal für die Herkunft der aktuellen Einschätzung

Spätere Erweiterung:

- `visual_intensity`
- `flashing_or_strobing`
- `rapid_cuts`
- `camera_motion`

## 5. Data Strategy

Strikte Daten-Trennung:

1. Externe Titeldaten dienen nur als Katalogbasis.
2. Eigene Reizprofile leben in einem separaten Modell.
3. Einzelbewertungen werden roh und anonym gespeichert.
4. Aggregation erfolgt getrennt und transparent.
5. Confidence wird sichtbar ausgewiesen, statt Unsicherheit zu verstecken.

MVP-Regeln:

- Keine objektiven Messwerte behaupten
- Ein gemeinsames 0-bis-4-Raster für alle drei Achsen
- Freitext nur ergänzend, nie als alleinige Bewertung
- `source_type` ausweisen: `editorial_seed`, `metadata_inference`, `community_median`, `mixed`
- Confidence bewusst schlicht halten:
  `1` Einschätzung = `niedrig`, `2` bis `4` = `mittel`, `5+` = `hoch`
- `rating_count` und `last_reviewed_at` sichtbar halten, wenn sie vorliegen

## 6. Privacy Approach

Privacy by Design ist Kernanforderung, nicht Randbedingung:

- Kein Login-Zwang
- Keine Profile
- Keine Third-Party-Tracker
- Keine Fingerprinting-Mechanismen
- Externe APIs nur serverseitig
- IP-Adressen nicht persistent speichern
- Funktionale Pseudonyme nur für Missbrauchsschutz und nur kurzzeitig

UX-Transparenz:

- Kurze Datenschutz-Zusammenfassung direkt im UI
- Kleine Datenschutz- und Impressumsseiten als Live-Basis, vor dem öffentlichen Launch aber noch mit realen Betreiberangaben zu vervollständigen
- Keine versteckten Datenflüsse oder intransparente Skripte

## 7. Accessibility Strategy

Zielstandard für die Umsetzung:

- WCAG 2.2 Level AA
- EN 301 549 als europäische Referenz
- BFSG/EAA-Kontext technisch über dieselben Anforderungen mitgedacht

Konkrete Engineering-Regeln:

- Semantisches HTML zuerst, ARIA nur ergänzend
- Vollständige Tastaturbedienbarkeit
- Sichtbarer Fokuszustand
- Keine reine Farbcodierung
- Labels, Hilfetexte und Fehlermeldungen in Klartext
- Keine Hover-only-Interaktionen
- `prefers-reduced-motion` respektieren
- Stabile Landmarken, logische Ueberschriftenstruktur und verlinkte Skip-Navigation

Qualitätssicherung:

- ESLint mit Next Core Web Vitals
- Playwright-Smoke-Test mit `axe-core`
- Manuelle Tastatur- und Screenreader-Prüfung als fester Release-Schritt
- Komponenten-Entscheidungen nur mit dokumentierter Auswahl- und Validierungslogik

## 8. UX Principles

- Ruhige, reduzierte Oberfläche
- Keine Autoplay-Elemente
- Keine aggressiven Animationen
- Keine gamifizierten Muster
- Erklärungen sind sichtbar, aber überspringbar
- Skalen sind sprachlich klar beschrieben
- Die App beantwortet Fragen, statt Spannung aufzubauen
- Interaktive Bausteine sollen aus nativer Semantik entstehen und nicht wie eine zusammengeklickte Library wirken

## Zusatz: UI-Komponenten und Libraries

Die UI-Strategie für `null-noise` ist bewusst restriktiv: Im MVP wird keine schwergewichtige Komponentenbibliothek eingebunden, solange native HTML-Semantik und kleine lokale Komponenten ausreichen. Die Orientierung erfolgt über etablierte barrierearme Ressourcen, aber jede Komponente wird im Projektkontext eigenständig bewertet.

Konkret bedeutet das:

- bevorzugt native Elemente wie `button`, `a`, `input`, `select`, `fieldset`, `legend`, `details`
- keine `div`- oder `span`-Widgets mit nachträglich aufgesetzter ARIA-Semantik, wenn native Lösungen möglich sind
- keine Hover-only-Hilfen, keine visuell-only-Zustände und keine versteckten Fokusstile
- progressive enhancement statt JavaScript-Pflicht
- ARIA nur dort, wo native Semantik nicht ausreicht und dann mit dokumentiertem Grund
- Inclusive Components dient als Pattern-Referenz für Disclosure, Karten, Status und Hilfelogik, nicht als visuelle Vorlage

Die Auswahlstrategie, Inspirationsquellen und Validierungscheckliste stehen in [docs/30-architecture/ui-component-strategy.md](./docs/30-architecture/ui-component-strategy.md).

## 9. Tech Stack

- Next.js mit App Router
- TypeScript
- Server Components für lesende Views
- Route Handlers für serverseitige API-Endpunkte
- Prisma als relationale Datenzugriffsschicht
- SQLite als kleine persistente Basis für lokale Seeds, importierte Titel und anonyme Bewertungen
- Playwright + axe für Accessibility-Smoke-Tests
- Vitest für gezielte serverseitige Mapping- und Fehlerfalltests
- CSS mit Design Tokens statt schwerer UI-Library
- Lokale, semantische Komponenten statt externer UI-Abstraktionsschicht im MVP

## 10. MVP Scope

Diese Basis deckt für eine erste ehrliche Beta bereits ab:

- Suchoberfläche für Film und Serie
- Ergebnisliste mit ruhigen Filtern
- Detailseite mit Audio-Reizprofil
- Erklaerungsseite
- Bedienhinweise
- Serverseitige API mit validierten Query-Parametern
- Prisma-Datenmodell für spätere Persistenz

Vor einem weiter gehenden Produktbetrieb noch offen:

- die bestehende Missbrauchsabwehr weiter härten, ohne Privacy oder Accessibility zu verwässern
- Admin- oder Editorial-Seed-Workflow
- spätere Hosted-DB für öffentliche Schreibpfade statt lokaler SQLite-Datei

## Zusatz: aktueller Bewertungsstand

Die Bewertungssektion auf der Detailseite funktioniert lokal serverseitig:

- vier diskrete Fragen ohne Slider
- anonyme Abgabe ohne Konto
- serverseitige Speicherung in einer kleinen SQLite-Datenbank
- getrennte Median-Aggregation für `volumeLevel`, `peakIntensity`, `stimulusDensity` und `soothingEffect`
- Confidence weiter schlicht über die Zahl der Einschatzungen
- einfache serverseitige Missbrauchsabwehr über Origin-Prüfung, Rate-Limit, Titel-Cooldown und eine kleine Zeitplausibilität

Wichtig bleibt:

- `soothingEffect` ersetzt kein Reizprofil
- externe Titeldaten bleiben weiterhin reiner Metadatenkontext
- die aktuelle Persistenz ist bewusst klein und lokal, nicht schon die spätere produktive Hosted-Datenbanklösung
- für eine öffentliche Vercel-Beta bleiben neue Bewertungen deshalb standardmäßig deaktiviert
- es gibt weiterhin keine Konten, keine Profile und keine Community-Features

## Zusatz: externe Titel lokal anlegen

Externe TMDb-Titel können lokal oder in schreibfähigen Instanzen kontrolliert in einen lokalen `null-noise`-Titel überführt werden:

- TMDb liefert dabei nur Titel, Jahr, Synopsis und optional Posterpfad
- das Reizprofil kommt nicht aus TMDb
- lokal angelegte Titel starten mit einer vorläufigen, metadatenbasierten Startbasis und niedriger Confidence
- danach verhalten sie sich wie normale lokale Titel: Detailseite, anonyme Bewertung und getrennte Median-Aggregation funktionieren wie gehabt

Wichtig bleibt:

- die Uebernahme ist ein bewusster Schritt aus der Suchseite heraus
- ein bereits übernommener TMDb-Titel wird nicht doppelt angelegt
- Reizprofil und beruhigende Wirkung bleiben weiterhin null-noise-intern
- die Startbasis ist kein fertiges Reizprofil, sondern nur eine vorsichtige Orientierung aus Synopsis, Genres und anderen bereits serverseitig verfügbaren Metadaten
- auf der ersten öffentlichen Beta bleibt diese Uebernahme vorerst deaktiviert, solange nur die lokale Instanz belastbar schreibt

## Zusatz: serverseitiger Metadaten-Integrations-Spike

Diese Iteration erweitert die bestehende Architektur nicht produktiv, sondern nur validierend:

- Der eigentliche Mock-Katalog bleibt unverändert.
- Der Spike nutzt standardmäßig TMDb serverseitig.
- IMDb bleibt nur als spätere, offizielle Option über AWS Data Exchange vorbereitet.
- Es gibt keine Persistenz der Antworten.
- Es gibt keine direkte Client-Anbindung an die externe API.
- Reizprofile werden aus den externen Metadaten ausdrücklich nicht abgeleitet.

Der Spike mappt absichtlich nur ein minimiertes internes Modell:

- externe ID
- Titelname
- Medientyp
- Erscheinungsjahr
- Kurzbeschreibung optional
- Posterpfad optional

Poster werden derzeit nur testweise und sehr zurückhaltend bei externen Haupttreffern gezeigt. Sie laufen über einen lokalen Serverpfad statt als direkter Browser-Request zu TMDb und werden im UI monochrom, entsättigt und leicht abgeblendet dargestellt. Damit bleiben sie visuelle Orientierung und nicht die primäre Information. Wenn kein Poster vorhanden ist, fällt die Darstellung ohne leeren Platzhalter auf Text und Reizprofil-Hinweise zurück.

### Lokal aktivieren

1. `.env.local` im Projektordner anlegen.
2. `TMDB_READ_ACCESS_TOKEN` hinterlegen.
3. Optional `NEXT_PUBLIC_SITE_URL=http://localhost:3000` setzen.
4. Wenn lokaler Katalog, Seed-Daten oder Schreibpfade gebraucht werden:
   `DATABASE_URL=file:./prisma/null-noise.db`
5. TMDb als Quelle setzen:
   `METADATA_SPIKE_SOURCE=tmdb`
6. Nur mit `DATABASE_URL`: einmal `npm run db:bootstrap` ausführen.
7. Für lokale Schreibtests bei Bedarf `NULL_NOISE_ENABLE_WRITES=true` setzen.
8. Dev-Server starten.
9. Den Pfad `/spike/metadaten` aufrufen.

Beispiel für `.env.local`:

```bash
DATABASE_URL=file:./prisma/null-noise.db
METADATA_SPIKE_SOURCE=tmdb
TMDB_READ_ACCESS_TOKEN=your_tmdb_read_access_token
NULL_NOISE_ENABLE_WRITES=true
```

Alternativ liegt ein Startpunkt in [.env.example](./.env.example).

### Vercel / erste Beta

Für einen ersten ehrlichen Vercel-Deploy gilt bewusst:

- Root Directory in Vercel: `null-noise`
- Build Command: Standard-Next.js (`npm run build`)
- Start Command: Standard-Next.js (`npm run start`)
- erforderlich für den öffentlichen MVP: `TMDB_READ_ACCESS_TOKEN`
- empfohlen: `NEXT_PUBLIC_SITE_URL`, damit Metadata und Open Graph auf eine feste URL zeigen; ohne diese Variable fällt der Code auf die von Vercel gesetzten Host-Variablen zurück
- optional: `DATABASE_URL`, wenn lokaler Katalog, Seed-Daten oder spätere Schreibpfade wirklich gebraucht werden
- ohne `DATABASE_URL` bleibt die Instanz bewusst read-only und stützt sich für Suche und Detail auf den externen TMDb-Pfad
- `NULL_NOISE_ENABLE_WRITES` sollte für die erste öffentliche Beta nicht gesetzt oder explizit `false` sein

Damit bleiben Startseite, Suche, Erklärung, Bedienhinweise und getrennte externe Titeldaten live lesbar, während lokale Titelseiten, Bewertungen und Titelübernahme erst mit echter Persistenz öffentlich aktiviert werden.

Spätere Option:

```bash
METADATA_SPIKE_SOURCE=imdb
IMDB_API_KEY=your_imdb_api_key
IMDB_DATA_SET_ID=your_imdb_data_set_id
IMDB_REVISION_ID=your_imdb_revision_id
IMDB_ASSET_ID=your_imdb_asset_id
IMDB_AWS_REGION=us-east-1
```

### Was der Spike zeigt

- ob serverseitige Suche gegen eine echte externe Titeldatenquelle grundsätzlich funktioniert
- ob das Antwortformat stabil auf ein kleines internes Metadatenmodell gemappt werden kann
- wie Leer-, Fehler- und Konfigurationszustaende in der bestehenden UI sauber abgefedert werden
- ob ein späterer IMDb-Zugriff ohne direkte Client-Anbindung technisch tragfähig wäre

### Was der Spike ausdrücklich noch nicht zeigt

- keine produktive Umstellung der App auf externe Daten
- keine Persistenz
- keine Nutzerbewertung
- keine Reizprofil-Automatisierung
- keine Poster-Einbettung aus der externen Quelle im Browser
- keine Vermischung mit dem eigentlichen MVP-Katalog

## Zusatz: aktueller Suchstand

Die Suche auf `/suche` arbeitet jetzt in zwei klar getrennten Ebenen:

1. Zuerst wird immer der lokale Katalog mit Reizprofil durchsucht.
2. Wenn dort nichts passt, kann serverseitig ein getrennter TMDb-Fallback für reine Titeldaten folgen.

Aktuell kann die Suche damit tatsächlich:

- lokale Titel bei korrekter Eingabe finden
- lokale Titel bei leichten Tippfehlern oder kürzeren Abweichungen finden
- externe Titeldaten getrennt anzeigen, wenn lokal noch kein Reizprofil vorhanden ist
- bei fehlendem oder ungültigem TMDb-Zugang verständlich auf den lokalen Katalog zurückfallen

Wichtig bleibt:

- lokale Treffer zeigen Reizprofile
- externe Treffer zeigen nur Titeldaten, kein Reizprofil
- Ton-, Peak- und Geschrei-Filter gelten nur für den profilierten Katalog
- ein gültiger `TMDB_READ_ACCESS_TOKEN` ist Voraussetzung für den serverseitigen Fallback
- externe Treffer werden weiterhin nicht automatisch zu Reizprofilen oder Bewertungen

### Entwicklungsdiagnose für TMDb

Im Development-Modus kann der serverseitige TMDb-Pfad zusätzlich eine kleine Diagnose liefern:

- Pfad: `/api/spike/titles?q=Arrival&diagnostics=1`
- nur lokal und nur außerhalb von Production
- keine Ausgabe des Tokens im Klartext
- nur nicht-sensitive Hinweise wie Token vorhanden, Token-Länge, Request gestartet, Statuscode und Mapping-Erfolg

### Stand der lokalen Verifikation

Lokal verifiziert am 2026-03-28:

- der Server liest einen TMDb-Token aus `.env.local`
- der Request wird serverseitig mit `Bearer`-Schema vorbereitet
- der getrennte Fallback für `Arrival` und `Arival` lässt sich lokal erfolgreich prüfen, solange ein gültiger Token vorhanden ist
- fehlende oder ungültige Token führen weiter zu ruhigen Fallback-Zuständen statt zu einem Crash
- dateibasierte Schreibpfade funktionieren lokal, bleiben für die erste öffentliche Beta aber bewusst deaktiviert

## 11. Non-Goals

- Social Features
- Profilbildung
- Personalisierung
- Tracking
- Gamification
- visuell laute Dashboards
- suggerierte Exaktheit durch Pseudometriken

## 12. Risks

- Kein Account senkt Reibung, erschwert aber Missbrauchsschutz.
- Subjektive Bewertungen brauchen gute Erklaerung, sonst wirken sie beliebig.
- Hohe Accessibility-Qualitaet kostet Zeit in Design, QA und Content.
- Datenschutz und Abuse-Prevention müssen sauber gegeneinander austariert werden.

## 13. Roadmap

### Phase 1

Konzept, Skalenmodell, Datenarchitektur, Privacy- und Accessibility-Strategie

### Phase 2

Basis-App mit ruhiger Informationsarchitektur, Suche und Detailseite

### Phase 3

Persistente Datenhaltung, Editorial Seeds und serverseitiger Import externer Titel

### Phase 4

Anonyme Community-Bewertung mit Median-Aggregation und Confidence-Update

### Phase 5

Accessibility Hardening, manuelle Screenreader-Tests, Content-Feinschliff

### Phase 6

Privacy Hardening, Abuse-Prevention, transparente Rechtstexte und Betriebsmonitoring ohne Tracking

## 14. Next Steps

1. Echte produktive Persistenz für Bewertungen und lokal angelegte Titel aufsetzen.
2. Erst danach Bewertungsabgabe und lokale Titelübernahme auch öffentlich aktivieren.
3. Impressum und Datenschutz mit den tatsächlichen Betreiberangaben vervollständigen.
4. Accessibility-Checkliste für Screenreader, Tastatur und Mobile in CI und manueller QA fest verankern.
5. UI-Komponenten nur über die dokumentierte Auswahlmatrix erweitern und komplexe Widgets einzeln prüfen.
6. Content-Design für Skalenbeschriftungen, Unsicherheitskommunikation und Datenschutzkurzfassung finalisieren.
7. Den Integrations-Spike später entweder gezielt verwerfen oder in eine produktionsreife, weiterhin serverseitige Importstrecke überführen.
