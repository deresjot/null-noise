# null-noise: LLM-Kontext

## Aktueller Arbeitsstand

- aktiver lokaler Arbeitsbranch: `null-noise`
- aktueller Stand: Mobile Detailseiten-Reihenfolge vom 25. Mai 2026 ist lokal auf `null-noise` umgesetzt; Result-Card-Klarheit, situative Discovery-UX, Evidence-/TMDb-Logik und Mobile-Viewport-Reparatur bleiben lokal enthalten
- vorheriger Stand: Startseiten-/Mobile-UI-Fix ist lokal committed (`196db83 fix: stabilize home and mobile search UI`) und als Vercel Preview bereitgestellt; Production wurde nicht angerührt
- nicht pushen/deployen ohne explizite Freigabe; aktueller Auftrag bleibt lokal
- Live-URL: https://null-noise.vercel.app
- Preview-URL: https://null-noise-ezndxaczf-deresjots-projects.vercel.app
- Preview-Hinweis: Deployment Protection/SSO ist aktiv; ohne Vercel-Login kommt `401`
- v0/grüne UI liegt im Archiv-Worktree
- `main` nicht als Arbeitsfläche verwenden
- ohne explizite Freigabe nichts committen, pushen oder deployen

## Produktkern

- `null-noise` hilft, Filme und Serien grob nach vermuteter Reizwirkung einzuordnen.
- Sichtbare Tendenzen: `Eher ruhig`, `Eher wechselhaft`, `Eher intensiv`.
- Die Ausgabe ist eine vorsichtige erste Einschätzung, keine objektive Messung.
- Es gibt keine Scores, Prozentwerte oder Rankings.
- Unsicherheit bleibt sichtbar und wird nicht sprachlich glattgezogen.

## Harte Nicht-Ziele

- keine Social Features
- keine Profile oder Konten
- kein Tracking
- keine offene Cloud-Datenbank
- keine Supabase-Nutzung im aktuellen Stand
- keine algorithmische Personalisierung
- keine Sprache wie `Empfohlen für dich` oder `Heute passend`, weil sie Profiling suggeriert
- kein separater HTML-Sondermodus als Primärweg
- keine scheinpräzisen Reizwerte
- keine harte Abhängigkeit von externen APIs ohne Fallback

## Aktuelle Kernrouten

- `/`
- `/suche`
- `/suche?q=Arrival`
- `/titel/mondfenster`
- `/erklaerung`
- `/bedienung`
- `/barrierefreiheit`
- `/datenschutz`
- `/impressum`
- ggf. `/spike/metadaten/...` als externer Detailpfad

## Aktuelle Datenquellen

- aktiv: TMDb
- optional vorbereitet: Does the Dog Die, Common Sense Media, User-Feedback, Manual, Local Seed
- externe optionale Quellen bleiben ohne Keys und Feature-Flags Noop/Fallback
- Common Sense Media nicht produktiv aktivieren, bevor Kosten, API, Partnerschaft und lokale Speicherung geklaert sind
- Does the Dog Die nicht produktiv aktivieren, bevor Zugriff und Nutzungsbedingungen geklaert sind
- keine API-Keys in Code, Doku-Beispielen oder Repo schreiben

## Security-/Privacy-Stand

- aktueller Security-Hardening-Stand ist lokal geprüft, aber noch nicht gepusht oder deployt
- Live-Production kann daher noch ohne die lokalen Header-/CSP-, `server-only`-, Cookie- und Delete-Origin-Härtungen laufen
- keine Accounts, keine Profile, keine Social Features, kein Tracking und keine Analytics
- keine Supabase-Integration im aktuellen Code; keine RLS-/Service-Role-Themen im Live-Stand, solange Supabase nicht eingeführt wird
- Datenhaltung bleibt datenarm: öffentliche Titelmetadaten, stille Feedback-/Rating-Evidenz und Rate-Limit-Attempts
- Feedback/Ratings dürfen kein Social Feature werden und erzeugen keine Nutzerprofile
- IP-Adressen werden nicht roh gespeichert; Rate-Limit-Attempts speichern pseudonyme IP-Hashes
- lokal gehärtet: Production benötigt `NULL_NOISE_RATE_LIMIT_SALT`, bevor neue IP-Hashes geschrieben werden
- lokaler Fallback-Salt ist nur für Entwicklung/Test gedacht
- funktionaler Cooldown-Cookie ist HttpOnly/SameSite; lokal gehärtet ist er in Production `secure`
- LocalStorage bleibt browserlokal für Merkliste/Schon-gesehen-Status und wird nicht serverseitig synchronisiert
- serverseitige DB-/API-/Rate-Limit-Module sind lokal mit `server-only` markiert
- Vercel-ENV muss vor Deploy manuell geprüft werden; Secret-Werte nie in Doku, Logs oder Client-Bundles ausgeben
- nach Deploy echte Production-Header/CSP und Live-API-Routen prüfen; lokale Tests sind keine Production-Garantie

## Evidence-Modell

- Achsen:
  - `audio_peaks`
  - `stimulus_density`
  - `visual_intensity`
  - `emotional_load`
  - `predictability`
  - `relief`
- TMDb wird defensiv in Evidence übersetzt.
- Evidence Engine v2 bewertet intern pro Achse, Konflikt, Relief-Signal und dünner Datenlage statt über ein globales Gesamturteil.
- Genre allein bleibt schwach.
- Mehrere passende Keywords können Confidence erhöhen.
- Overview/Synopsis bleibt defensive Evidenz.
- Relief ist positive Evidenz, nicht nur Abwesenheit von Warnsignalen.
- Widerspruechliche Signale führen eher zu mixed/durchwachsen.
- Sensorische, visuelle und emotionale Intensität bleiben intern unterscheidbar.
- Emotionale Last ohne sensorische Dichte wird nicht automatisch `Eher intensiv`.
- TMDb-Browse diversifiziert Candidate Pools vor der Evidence-Bewertung über Query-Strategien, Popularitäts-/Vote-Count-Fenster, ältere/neue Titel und seeded Shuffle.
- Optionale Quellen wie Does the Dog Die und Common Sense Media bleiben ohne Keys inaktiv.
- Sichtbar werden nur kurze Gründe, Status und vorsichtige Confidence-/Unsicherheitsformulierungen.

## Discovery-Stand

- Discovery fragt situativ: passt das gerade, wäre das zu viel, oder lieber vormerken?
- Browse-Mixes nutzen ruhige, nicht-personalisierte Einstiege wie `Ruhiger Einstieg`, `Wenig Sprünge`, `Dicht, aber vorhersehbar` und `Eher vormerken`.
- `Nicht jetzt` ist ein positives Produktmuster: `Kann gerade zu dicht sein` oder `Eher später prüfen` meint Kapazität, nicht Titelqualität.
- Such- und Browse-Karten bleiben Vorschau; ausführlichere Gründe gehören auf Detailseiten oder in vorhandene Disclosure-Muster.
- TMDb-Karten zeigen in der Topline Format, erstes verfügbares Genre und Jahr; lokale Karten erfinden kein Genre, wenn keines vorhanden ist.
- Kartenfooter-Aktionen bleiben fingerfreundlich und unterscheidbar: Details liest, Merken legt browserlokal ab, Gesehen markiert browserlokal.
- Detailseiten können Evidence als `Spricht eher dafür`, `Kann dagegen sprechen` und `Datenlage` erklären, ohne technische Achsen dominant sichtbar zu machen.
- Alternativen sind situative Gegengewichte, nicht klassische Empfehlungen: ruhiger, dichter oder leichter je nach Ausgangstitel.
- Keine Social-, Profil-, Rating-, Ranking- oder Tracking-Logik wurde ergänzt.

## UI-/UX-Prinzipien

- eine Hauptfrage pro Ansicht
- klare Hierarchie
- kurze Sätze
- sichtbare Unsicherheit
- vorhersehbare Interaktion
- keine Hover-only-Hilfe
- Standard-UI ist der zugängliche Primärpfad
- Sekundäre Infos bleiben sekundär und werden ruhig vertieft

## Accessibility-Prinzipien

- HTML-first
- ARIA nur ergänzend
- sichtbarer Fokus
- keine rein visuelle Codierung
- reduzierte Bewegung respektieren
- `details`/`summary` für ruhige Vertiefung
- keine Tooltip-only-Inhalte
- automatisierte Tests ersetzen keine manuelle Prüfung

## Mobile-Stand

- Mobile-Viewport-Reparatur vom 24. Mai 2026 ist lokal umgesetzt, aber nicht gepusht/deployt
- Mobile Header ist eine fixe App-Shell mit Burger-Menü, aktiver Route, Escape-Schließen und sichtbarem Fokus
- Header, Mobile-App-Shell, Menü und `main-content` nutzen mobil denselben Content-Gutter
- Geöffnetes Mobile-Menü bleibt im Viewport, ist deckend und vermeidet den hellen rechten Seitenstreifen
- Der Menübutton zeigt geöffnet ein X statt drei Hamburger-Linien; aktive Route und Tastatur-Fokus sind getrennte visuelle Zustände
- Hauptziele im mobilen Menü: Start, Suche, Erklärung/Hilfe
- Barrierefreiheit, Datenschutz und Impressum bleiben mobil im Footer erreichbar
- Mobile Navigation ist als opake, kontrastreiche Overlay-Navigation gegen Stacking-Context-Probleme gehärtet und liegt über Seiteninhalt/Karten
- Logo/Wortmarke im Header führen mobil und desktop zur Startseite; versteckte Skip-Links dürfen diese Tap-Fläche nicht blockieren
- Header-Innenabstände wurden bei 320px, 390px und 430px geprüft; Brand und Menübutton richten sich an der Contentbreite aus, nicht am äußersten Viewport-Rand
- mobile Typografie, Labels, Buttons, Card-Metadaten, Footer-Links, Legal-Texte und Detailseiten-Text wurden luftiger gesetzt
- `search-browse-link` wird als Button-CTA mit Lupe dargestellt, bleibt aber ein nativer Link
- `search-direct-starts` hat mobil mehr Innenabstand und farbige Richtungsflächen: grün, gold, rot
- Lokale Titel-Detailseiten zeigen mobil die Reihenfolge Titel/H1, Poster, Erste Einschätzung, Kurzbeschreibung, danach restliche Detailabschnitte.
- Detailposter skalieren auf Mobile groß von links nach rechts; Fallbacks für fehlende Poster bleiben kompakt
- `Zurück zur Suche` im Metadaten-Detailpfad ist ein gestalteter Button mit Zurück-Pfeil
- Favicon, Open-Graph-/Twitter-Metadaten und Social-Image wurden auf vereinfachtes TV-Favicon und cache-gebustetes OG-Bild aktualisiert
- Die freie Suche wurde gegen unklare Ausblendung durch den lokalen Schon-gesehen-Filter stabilisiert: getippte Suchergebnisse bleiben sichtbar, Browse kann weiterhin gesehene Titel ausblenden
- Erfolgreiche TMDb-Suchen werden kurz serverseitig wiederverwendet, falls dieselbe Anfrage bei schnellen lokalen Checks anschließend upstream stolpert
- `/barrierefreiheit` wurde auf WCAG 2.2 AA als technisches Ziel, aktuellen Status, konkrete Maßnahmen, Prüfweise, bekannte Grenzen und Kontakt fokussiert
- sanfte CSS-Transitions und optionale Ladebalken-Hooks sind ergänzt; `prefers-reduced-motion` wird respektiert
- Opacity-Fades wurden aus Entry-Animationen entfernt, damit A11y-Kontrast-Scans nicht während halbtransparenter Texte fehlschlagen
- Startseite erklärt jetzt direkt unter `Was passt gerade?`, wofür Null Noise gedacht ist
- Header-Branding zeigt auf Mobile und Desktop Icon-Logo plus Wortmarke; die Brand sitzt links innerhalb der Contentbreite und nicht end-to-end am Viewport
- Suche bleibt primärer Einstieg; Richtungskacheln bleiben sekundär
- Richtungskacheln, Ergebnisgruppen, Filter und Karten nutzen konsistent `Eher ruhig`, `Eher wechselhaft`, `Eher intensiv`
- mobile Ergebnislisten, Merken-/Gesehen-Bereich und Toggle wurden gegen abgeschnittene Texte und horizontale Überläufe stabilisiert
- Ergebnis-Karten zeigen `Details` mobil als eigene volle CTA-Zeile; `Merken` und `Gesehen?` bleiben darunter als ruhige Touch-Ziele mit mehr Abstand
- fehlende Poster zeigen einen bewussten Platzhalter `Kein Poster verfügbar`
- mobile Scroll-Stabilität wurde lokal verbessert
- mobile Header-Blur reduziert / desktop-begrenzt
- Card-/Panel-Schatten mobil reduziert
- leere Posterflächen mobil kompakt
- Home-Einstiege mobil priorisiert: Suche primär, Richtungsstart sekundär
- Mobile Bedienlogik wurde app-näher gemacht: Suche bleibt primär, Richtungs-/Situationsstart bleibt sekundär, ohne neue Produktlogik oder neue Navigation als Feature
- Footer mobil beruhigt
- Preview ist bereit, echter iPhone-Check bleibt wegen Vercel-SSO/Deployment-Protection manuell mit Login nötig

## Testbefehle

- `npm run lint`
- `npm run build`
- `npm run test:unit`
- `npm run test:axe-core`
- `npm run test:a11y`
- `npx playwright test`

## Letzte finale Prüfung dieses Mobile-UX-Abschlusses

- Situative Discovery-UX am 24. Mai 2026:
  - `npm run lint`: bestanden
  - `npm run build`: bestanden
  - `npm run test:unit`: 15 Dateien / 85 Tests bestanden
  - gezielt: `npx vitest run src/lib/metadata-spike.test.ts src/components/external-result-list.test.ts src/lib/detail-followups.test.ts --maxWorkers=1`: 27 Tests bestanden
  - `npm run test:a11y`: 35 Tests bestanden
  - `npm run test:axe-core`: 5 Tests bestanden
  - `npx playwright test`: 35 Tests bestanden, 2 TMDb-Live-Fallback-Tests skipped
  - lokaler Playwright-Smoke bei 390px und 430px auf `/`, `/suche`, `/suche?q=Arrival`, `/titel/mondfenster`, `/erklaerung`, `/bedienung`: kein horizontales Overflow, Mobile-Menü im Viewport
  - `git diff --check`: sauber
- Evidence-/TMDb-Logik am 24. Mai 2026:
  - `npm run lint`: bestanden
  - `npm run build`: bestanden
  - `npm run test:unit`: 15 Dateien / 84 Tests bestanden
  - gezielt: `npx vitest run src/lib/stimulus-evidence.test.ts src/lib/metadata-inference.test.ts src/lib/metadata-spike.test.ts --maxWorkers=1`: 38 Tests bestanden
  - `npm run test:a11y`: 35 Tests bestanden
  - `npm run test:axe-core`: 5 Tests bestanden
  - `npx playwright test`: 35 Tests bestanden, 2 TMDb-Live-Fallback-Tests skipped
  - `git diff --check`: sauber
- Mobile-Viewport-Reparatur am 24. Mai 2026:
  - `npm run lint`: bestanden
  - `npm run build`: bestanden
  - `npm run test:a11y`: 35 Tests bestanden
  - `npm run test:axe-core`: 5 Tests bestanden
  - `npm run test:e2e`: 35 Tests bestanden, 2 TMDb-Live-Fallback-Tests skipped
  - lokaler Playwright-Smoke bei 390px und 430px auf `/`, `/suche`, `/suche?q=Arrival`, `/titel/mondfenster`, `/erklaerung`, `/bedienung`: kein horizontales Overflow, Menü im Viewport, opake Menüfläche, Header/Menü/Main innerhalb derselben Content-Breite, Touch-Ziele >= 44px, Kartenaktionen entdichtet
- direkt vor der Doku-/Commit-Aktualisierung am 23. Mai 2026 erneut gelaufen:
  - `npm run lint`: bestanden
  - `npm run build`: bestanden
  - `npm run test:a11y`: 35 Tests bestanden
  - `npm run test:axe-core`: 5 Tests bestanden
  - `npm run test:unit`: 15 Dateien / 79 Tests bestanden
  - `npx playwright test`: 35 Tests bestanden, 2 TMDb-Live-Fallback-Tests skipped
- `git diff --check`: sauber

- vorherige gezielte mobile Sichtprüfung in diesem Pass:
  - lokaler Playwright-Smoke bei 390px und 430px:
    - Header-Brand und Menübutton an Contentbreite ausgerichtet
    - Result-Card-CTA-Zeile mit `Details`, `Merken`, `Gesehen?` nebeneinander
    - Header-Shrink smooth
    - Burger-Menü-Touchziele ca. 51px hoch
    - Detailposter sichtbar und groß skaliert
    - keine horizontale Scrollbar
  - Layer-Smoke bei 390px: mobile Navigation liegt auf `/`, `/suche?q=Arrival`, `/titel/mondfenster` über dem Content
- älterer manueller Playwright-Smoke bleibt als Sichtprüfungs-Evidenz dokumentiert; echter iPhone-Check nach Deploy bleibt offen

## Manuelle Kernprüfung

- Tastaturfluss
- sichtbarer Fokus
- Screenreader-Smoke
- Reflow bei 320 CSS-Pixeln
- Zoom bei 400 %
- keine Console-Errors
- keine Score-/Prozent-UI
- Mobile-Navigation bei 390px und 430px inklusive Escape, Fokus, Link-Klick und aktivem Zustand prüfen
- Detailseite mobil auf Poster und Synopsis prüfen
- Legal-/Footer-Abstände mobil prüfen
- `prefers-reduced-motion` prüfen
- Mobile Scrollgefühl nach Deploy auf echtem iPhone
- nach Security-Deploy: Header/CSP, API-Cache-Header und schreibende Routen live prüfen
- nach Security-Deploy: `.next/static`/Client-Bundle weiter ohne sensible Secret-Bezüge halten

## Vorherige grüne UI-Prüfung

- `npm run lint`
- `npm run build`
- `npm run test:a11y` (35 Tests)
- lokale Playwright-Sichtprüfung auf 390px und 430px ohne horizontalen Overflow
- ältere vollständige Prüfung vor diesem Mobile-UX-Pass: Unit, axe-core und Playwright waren grün; vor Push/Deploy erneut prüfen

## Welche Doku bei welcher Aufgabe lesen?

- Doku-Index: `docs/README.md`
- Standardkontext: `docs/00-current/llm-context.md`
- aktueller Stand: `docs/00-current/current-state.md`
- lokale Kommandos und Deploy-Checks: `docs/00-current/current-runbook.md`
- UI/UX/Mobile: `docs/10-principles/ux-principles.md`, `docs/10-principles/product-principles.md`, `docs/30-architecture/ui-component-strategy.md`
- Accessibility/Tests/Release: `docs/10-principles/a11y-principles.md`, `docs/20-testing/testing-and-release.md`
- Evidence/Data: `docs/30-architecture/evidence-and-data-sources.md`

Die 10 fachlichen Dateien sind die Quellen. `docs/llm-upload/` enthält eine kompakte Übergabe-Kopie für andere LLMs und soll nach relevanten Änderungen synchronisiert werden.

## Offene Entscheidungen

- Does the Dog Die Zugriff/Nutzungsbedingungen
- Common Sense Media Kosten/API/Partnerschaft/lokale Speicherung
- echte iPhone-Prüfung nach Vercel-Deploy
- spätere stille Feedback-Evidenz ohne Social Feature
