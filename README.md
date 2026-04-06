# null-noise

Erste technische Umsetzungsbasis fuer eine barrierearme Web-App, die Filme und Serien nach ihrer sensorischen Belastung einordnet. Diese Basis verbindet Produktkonzept, Datenmodell und ein ruhiges Next.js-MVP mit Seed-Daten. Audio-Reizprofile werden zunaechst editorial geseedet und koennen lokal durch anonyme Einzelbewertungen serverseitig per Median verdichtet werden. Neue lokal angelegte Titel und anonyme Bewertungen landen inzwischen in einer kleinen persistenten SQLite-Datenbank ueber Prisma. Fuer eine erste öffentliche Beta bleibt die Vercel-Instanz derzeit dennoch bewusst lesend, bis auch der produktive Schreibpfad ausserhalb der lokalen Instanz belastbar bereitsteht.

Eine laufend gepflegte Projektzusammenfassung mit Entscheidungen, Iterationen und Gruenden steht in [docs/project-summary.md](./docs/project-summary.md).

## 1. Product Framing

`null-noise` hilft Menschen bei der Frage, ob ein Film oder eine Serie fuer ihre persoenliche sensorische Belastbarkeit passend ist. Das MVP verspricht keine objektive Messung, sondern strukturierte, nachvollziehbare Einschaetzungen entlang eines kleinen Audio-Modells mit drei Achsen: Grundlautstaerke, ploetzliche Spitzen und Belastungsdichte.

Die Produktthese ist doppelt:

- Der Inhalt selbst soll transparenter werden.
- Die App-Oberflaeche darf dabei keine zusaetzliche Belastung erzeugen.

Das Produkt positioniert sich bewusst zwischen klassischer Titelsuche und Accessibility-Tool: ruhig, erklaerend, nicht spekulativ und ohne Entertainment-Patterns.

## 2. Key User Needs

- Ist der Titel insgesamt ruhig, ausgeglichen oder intensiv?
- Gibt es ploetzliche laute Peaks, Geschrei oder Einschlaege?
- Wie sicher ist die Einschaetzung, und worauf basiert sie?
- Kann ich die App ohne Maus, ohne Konto und ohne Stress bedienen?
- Bekomme ich Erklaerungen ohne versteckte UI-Elemente oder Fachjargon?

## 3. Information Architecture

Primare Seitenstruktur im MVP:

- `/`: Einfuehrung, direkte Suche, Kurzerklaerung, Privacy- und Accessibility-Versprechen
- `/suche`: Ergebnisliste mit Filtern fuer ruhige oder intensivere Titel
- `/titel/[slug]`: Detailseite mit Reizprofil, Erlaeuterung, Confidence und Transparenzdaten
- `/erklaerung`: Bedeutung der Skalen, Grenzen des Modells, Umgang mit Unsicherheit
- `/bedienung`: Bedienhinweise fuer Tastatur, Screenreader, Mobilgeraete und reduzierte Bewegung
- `/api/titles`: serverseitige Such-API fuer den Katalog
- `/api/titles/[slug]`: serverseitige Detail-API fuer einzelne Titel
- `/spike/metadaten`: strikt getrennter Technikpfad fuer serverseitig abgefragte externe Metadaten
- `/api/spike/titles`: JSON-Endpunkt fuer den serverseitigen Metadaten-Spike

## 4. Domain Model

Das aktuelle Reizmodell bleibt bewusst klein und erklaerbar:

- `stimulus_profile.volume_level`
- `stimulus_profile.peak_intensity`
- `stimulus_profile.stimulus_density`
- `stimulus_profile.notes`
- `aggregation.level`
- `aggregation.rating_count`
- `aggregation.last_reviewed_at` optional

Ergaenzende Domainen:

- `external_title`: externe Metadatenquelle wie TMDB, strikt getrennt vom eigenen Profil
- `community_rating`: anonyme Einzelbewertung ohne Account-Zwang
- `stimulus_aggregate`: spaetere Verdichtung der Einzelbewertungen
- `content_flag`: textuelle Warnhinweise mit klarer Sprache
- `source_type`: Transparenzsignal fuer die Herkunft der aktuellen Einschaetzung

Spaetere Erweiterung:

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
- Ein gemeinsames 0-bis-4-Raster fuer alle drei Achsen
- Freitext nur ergaenzend, nie als alleinige Bewertung
- `source_type` ausweisen: `editorial_seed`, `metadata_inference`, `community_median`, `mixed`
- Confidence bewusst schlicht halten:
  `1` Einschaetzung = `niedrig`, `2` bis `4` = `mittel`, `5+` = `hoch`
- `rating_count` und `last_reviewed_at` sichtbar halten, wenn sie vorliegen

## 6. Privacy Approach

Privacy by Design ist Kernanforderung, nicht Randbedingung:

- Kein Login-Zwang
- Keine Profile
- Keine Third-Party-Tracker
- Keine Fingerprinting-Mechanismen
- Externe APIs nur serverseitig
- IP-Adressen nicht persistent speichern
- Funktionale Pseudonyme nur fuer Missbrauchsschutz und nur kurzzeitig

UX-Transparenz:

- Kurze Datenschutz-Zusammenfassung direkt im UI
- Kleine Datenschutz- und Impressumsseiten als Live-Basis, vor dem öffentlichen Launch aber noch mit realen Betreiberangaben zu vervollstaendigen
- Keine versteckten Datenfluesse oder intransparente Skripte

## 7. Accessibility Strategy

Zielstandard fuer die Umsetzung:

- WCAG 2.2 Level AA
- EN 301 549 als europaeische Referenz
- BFSG/EAA-Kontext technisch ueber dieselben Anforderungen mitgedacht

Konkrete Engineering-Regeln:

- Semantisches HTML zuerst, ARIA nur ergaenzend
- Vollstaendige Tastaturbedienbarkeit
- Sichtbarer Fokuszustand
- Keine reine Farbcodierung
- Labels, Hilfetexte und Fehlermeldungen in Klartext
- Keine Hover-only-Interaktionen
- `prefers-reduced-motion` respektieren
- Stabile Landmarken, logische Ueberschriftenstruktur und verlinkte Skip-Navigation

Qualitaetssicherung:

- ESLint mit Next Core Web Vitals
- Playwright-Smoke-Test mit `axe-core`
- Manuelle Tastatur- und Screenreader-Pruefung als fester Release-Schritt
- Komponenten-Entscheidungen nur mit dokumentierter Auswahl- und Validierungslogik

## 8. UX Principles

- Ruhige, reduzierte Oberflaeche
- Keine Autoplay-Elemente
- Keine aggressiven Animationen
- Keine gamifizierten Muster
- Erklaerungen sind sichtbar, aber ueberspringbar
- Skalen sind sprachlich klar beschrieben
- Die App beantwortet Fragen, statt Spannung aufzubauen
- Interaktive Bausteine sollen aus nativer Semantik entstehen und nicht wie eine zusammengeklickte Library wirken

## Zusatz: UI-Komponenten und Libraries

Die UI-Strategie fuer `null-noise` ist bewusst restriktiv: Im MVP wird keine schwergewichtige Komponentenbibliothek eingebunden, solange native HTML-Semantik und kleine lokale Komponenten ausreichen. Die Orientierung erfolgt ueber etablierte barrierearme Ressourcen, aber jede Komponente wird im Projektkontext eigenstaendig bewertet.

Konkret bedeutet das:

- bevorzugt native Elemente wie `button`, `a`, `input`, `select`, `fieldset`, `legend`, `details`
- keine `div`- oder `span`-Widgets mit nachtraeglich aufgesetzter ARIA-Semantik, wenn native Loesungen moeglich sind
- keine Hover-only-Hilfen, keine visuell-only-Zustaende und keine versteckten Fokusstile
- progressive enhancement statt JavaScript-Pflicht
- ARIA nur dort, wo native Semantik nicht ausreicht und dann mit dokumentiertem Grund
- Inclusive Components dient als Pattern-Referenz fuer Disclosure, Karten, Status und Hilfelogik, nicht als visuelle Vorlage

Die Auswahlstrategie, Inspirationsquellen und Validierungscheckliste stehen in [docs/ui-component-strategy.md](./docs/ui-component-strategy.md).

## 9. Tech Stack

- Next.js mit App Router
- TypeScript
- Server Components fuer lesende Views
- Route Handlers fuer serverseitige API-Endpunkte
- Prisma als relationale Datenzugriffsschicht
- SQLite als kleine persistente Basis fuer lokale Seeds, importierte Titel und anonyme Bewertungen
- Playwright + axe fuer Accessibility-Smoke-Tests
- Vitest fuer gezielte serverseitige Mapping- und Fehlerfalltests
- CSS mit Design Tokens statt schwerer UI-Library
- Lokale, semantische Komponenten statt externer UI-Abstraktionsschicht im MVP

## 10. MVP Scope

Diese Basis deckt fuer eine erste ehrliche Beta bereits ab:

- Suchoberflaeche fuer Film und Serie
- Ergebnisliste mit ruhigen Filtern
- Detailseite mit Audio-Reizprofil
- Erklaerungsseite
- Bedienhinweise
- Serverseitige API mit validierten Query-Parametern
- Prisma-Datenmodell fuer spaetere Persistenz

Vor einem weiter gehenden Produktbetrieb noch offen:

- die bestehende Missbrauchsabwehr weiter haerten, ohne Privacy oder Accessibility zu verwässern
- Admin- oder Editorial-Seed-Workflow
- spaetere Hosted-DB fuer oeffentliche Schreibpfade statt lokaler SQLite-Datei

## Zusatz: aktueller Bewertungsstand

Die Bewertungssektion auf der Detailseite funktioniert lokal serverseitig:

- vier diskrete Fragen ohne Slider
- anonyme Abgabe ohne Konto
- serverseitige Speicherung in einer kleinen SQLite-Datenbank
- getrennte Median-Aggregation fuer `volumeLevel`, `peakIntensity`, `stimulusDensity` und `soothingEffect`
- Confidence weiter schlicht ueber die Zahl der Einschatzungen
- einfache serverseitige Missbrauchsabwehr ueber Origin-Pruefung, Rate-Limit, Titel-Cooldown und eine kleine Zeitplausibilitaet

Wichtig bleibt:

- `soothingEffect` ersetzt kein Reizprofil
- externe Titeldaten bleiben weiterhin reiner Metadatenkontext
- die aktuelle Persistenz ist bewusst klein und lokal, nicht schon die spaetere produktive Hosted-Datenbankloesung
- fuer eine öffentliche Vercel-Beta bleiben neue Bewertungen deshalb standardmaessig deaktiviert
- es gibt weiterhin keine Konten, keine Profile und keine Community-Features

## Zusatz: externe Titel lokal anlegen

Externe TMDb-Titel koennen lokal oder in schreibfaehigen Instanzen kontrolliert in einen lokalen `null-noise`-Titel ueberfuehrt werden:

- TMDb liefert dabei nur Titel, Jahr, Synopsis und optional Posterpfad
- das Reizprofil kommt nicht aus TMDb
- lokal angelegte Titel starten mit einer vorlaeufigen, metadatenbasierten Startbasis und niedriger Confidence
- danach verhalten sie sich wie normale lokale Titel: Detailseite, anonyme Bewertung und getrennte Median-Aggregation funktionieren wie gehabt

Wichtig bleibt:

- die Uebernahme ist ein bewusster Schritt aus der Suchseite heraus
- ein bereits uebernommener TMDb-Titel wird nicht doppelt angelegt
- Reizprofil und beruhigende Wirkung bleiben weiterhin null-noise-intern
- die Startbasis ist kein fertiges Reizprofil, sondern nur eine vorsichtige Orientierung aus Synopsis, Genres und anderen bereits serverseitig verfuegbaren Metadaten
- auf der ersten öffentlichen Beta bleibt diese Uebernahme vorerst deaktiviert, solange nur die lokale Instanz belastbar schreibt

## Zusatz: serverseitiger Metadaten-Integrations-Spike

Diese Iteration erweitert die bestehende Architektur nicht produktiv, sondern nur validierend:

- Der eigentliche Mock-Katalog bleibt unveraendert.
- Der Spike nutzt standardmaessig TMDb serverseitig.
- IMDb bleibt nur als spaetere, offizielle Option ueber AWS Data Exchange vorbereitet.
- Es gibt keine Persistenz der Antworten.
- Es gibt keine direkte Client-Anbindung an die externe API.
- Reizprofile werden aus den externen Metadaten ausdruecklich nicht abgeleitet.

Der Spike mappt absichtlich nur ein minimiertes internes Modell:

- externe ID
- Titelname
- Medientyp
- Erscheinungsjahr
- Kurzbeschreibung optional
- Posterpfad optional

Poster werden derzeit nur testweise und sehr zurueckhaltend bei externen Haupttreffern gezeigt. Sie laufen ueber einen lokalen Serverpfad statt als direkter Browser-Request zu TMDb und werden im UI monochrom, entsaettigt und leicht abgeblendet dargestellt. Damit bleiben sie visuelle Orientierung und nicht die primaere Information. Wenn kein Poster vorhanden ist, faellt die Darstellung ohne leeren Platzhalter auf Text und Reizprofil-Hinweise zurueck.

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

Spaetere Option:

```bash
METADATA_SPIKE_SOURCE=imdb
IMDB_API_KEY=your_imdb_api_key
IMDB_DATA_SET_ID=your_imdb_data_set_id
IMDB_REVISION_ID=your_imdb_revision_id
IMDB_ASSET_ID=your_imdb_asset_id
IMDB_AWS_REGION=us-east-1
```

### Was der Spike zeigt

- ob serverseitige Suche gegen eine echte externe Titeldatenquelle grundsaetzlich funktioniert
- ob das Antwortformat stabil auf ein kleines internes Metadatenmodell gemappt werden kann
- wie Leer-, Fehler- und Konfigurationszustaende in der bestehenden UI sauber abgefedert werden
- ob ein spaeterer IMDb-Zugriff ohne direkte Client-Anbindung technisch tragfaehig waere

### Was der Spike ausdruecklich noch nicht zeigt

- keine produktive Umstellung der App auf externe Daten
- keine Persistenz
- keine Nutzerbewertung
- keine Reizprofil-Automatisierung
- keine Poster-Einbettung aus der externen Quelle im Browser
- keine Vermischung mit dem eigentlichen MVP-Katalog

## Zusatz: aktueller Suchstand

Die Suche auf `/suche` arbeitet jetzt in zwei klar getrennten Ebenen:

1. Zuerst wird immer der lokale Katalog mit Reizprofil durchsucht.
2. Wenn dort nichts passt, kann serverseitig ein getrennter TMDb-Fallback fuer reine Titeldaten folgen.

Aktuell kann die Suche damit tatsaechlich:

- lokale Titel bei korrekter Eingabe finden
- lokale Titel bei leichten Tippfehlern oder kuerzeren Abweichungen finden
- externe Titeldaten getrennt anzeigen, wenn lokal noch kein Reizprofil vorhanden ist
- bei fehlendem oder ungueltigem TMDb-Zugang verstaendlich auf den lokalen Katalog zurueckfallen

Wichtig bleibt:

- lokale Treffer zeigen Reizprofile
- externe Treffer zeigen nur Titeldaten, kein Reizprofil
- Ton-, Peak- und Geschrei-Filter gelten nur fuer den profilierten Katalog
- ein gueltiger `TMDB_READ_ACCESS_TOKEN` ist Voraussetzung fuer den serverseitigen Fallback
- externe Treffer werden weiterhin nicht automatisch zu Reizprofilen oder Bewertungen

### Entwicklungsdiagnose fuer TMDb

Im Development-Modus kann der serverseitige TMDb-Pfad zusaetzlich eine kleine Diagnose liefern:

- Pfad: `/api/spike/titles?q=Arrival&diagnostics=1`
- nur lokal und nur ausserhalb von Production
- keine Ausgabe des Tokens im Klartext
- nur nicht-sensitive Hinweise wie Token vorhanden, Token-Laenge, Request gestartet, Statuscode und Mapping-Erfolg

### Stand der lokalen Verifikation

Lokal verifiziert am 2026-03-28:

- der Server liest einen TMDb-Token aus `.env.local`
- der Request wird serverseitig mit `Bearer`-Schema vorbereitet
- der getrennte Fallback fuer `Arrival` und `Arival` laesst sich lokal erfolgreich pruefen, solange ein gueltiger Token vorhanden ist
- fehlende oder ungueltige Token fuehren weiter zu ruhigen Fallback-Zustaenden statt zu einem Crash
- dateibasierte Schreibpfade funktionieren lokal, bleiben fuer die erste öffentliche Beta aber bewusst deaktiviert

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
- Datenschutz und Abuse-Prevention muessen sauber gegeneinander austariert werden.

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

1. Echte produktive Persistenz fuer Bewertungen und lokal angelegte Titel aufsetzen.
2. Erst danach Bewertungsabgabe und lokale Titeluebernahme auch oeffentlich aktivieren.
3. Impressum und Datenschutz mit den tatsaechlichen Betreiberangaben vervollstaendigen.
4. Accessibility-Checkliste fuer Screenreader, Tastatur und Mobile in CI und manueller QA fest verankern.
5. UI-Komponenten nur ueber die dokumentierte Auswahlmatrix erweitern und komplexe Widgets einzeln pruefen.
6. Content-Design fuer Skalenbeschriftungen, Unsicherheitskommunikation und Datenschutzkurzfassung finalisieren.
7. Den Integrations-Spike spaeter entweder gezielt verwerfen oder in eine produktionsreife, weiterhin serverseitige Importstrecke ueberfuehren.
