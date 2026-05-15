# null-noise: LLM-Kontext

## Aktueller Arbeitsstand

- aktiver lokaler Arbeitsbranch: `null-noise`
- aktueller Stand: Startseiten-/Mobile-UI-Fix ist lokal committed (`196db83 fix: stabilize home and mobile search UI`) und als Vercel Preview bereitgestellt; Production wurde nicht angerührt
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
- kein separater HTML-Sondermodus als Primärweg
- keine scheinpräzisen Reizwerte
- keine harte Abhängigkeit von externen APIs ohne Fallback

## Aktuelle Kernrouten

- `/`
- `/suche`
- `/suche?q=Arrival`
- `/titel/mondfenster`
- `/barrierefreiheit`
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
- Genre allein bleibt schwach.
- Mehrere passende Keywords können Confidence erhöhen.
- Relief ist positive Evidenz, nicht nur Abwesenheit von Warnsignalen.
- Widerspruechliche Signale führen eher zu mixed/durchwachsen.
- Sensorische, visuelle und emotionale Intensität bleiben intern unterscheidbar.
- Sichtbar werden nur kurze Gründe, Status und vorsichtige Confidence-/Unsicherheitsformulierungen.

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

- Startseite erklärt jetzt direkt unter `Was passt gerade?`, wofür Null Noise gedacht ist
- Header-Branding zeigt auf Mobile und Desktop Icon-Logo plus Wortmarke
- Suche bleibt primärer Einstieg; Richtungskacheln bleiben sekundär
- Richtungskacheln, Ergebnisgruppen, Filter und Karten nutzen konsistent `Eher ruhig`, `Eher wechselhaft`, `Eher intensiv`
- mobile Ergebnislisten, Merken-/Gesehen-Bereich und Toggle wurden gegen abgeschnittene Texte und horizontale Überläufe stabilisiert
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

## Manuelle Kernprüfung

- Tastaturfluss
- sichtbarer Fokus
- Screenreader-Smoke
- Reflow bei 320 CSS-Pixeln
- Zoom bei 400 %
- keine Console-Errors
- keine Score-/Prozent-UI
- Mobile Scrollgefühl nach Deploy auf echtem iPhone
- nach Security-Deploy: Header/CSP, API-Cache-Header und schreibende Routen live prüfen
- nach Security-Deploy: `.next/static`/Client-Bundle weiter ohne sensible Secret-Bezüge halten

## Letzte grüne UI-Prüfung

- `npm run lint`
- `npm run build`
- `npm run test:unit` (78 Tests)
- `npm run test:axe-core` (4 Tests)
- `npm run test:a11y` (29 Tests)
- `npx playwright test` (29 bestanden, 2 TMDb-Live-Tests übersprungen)
- lokale Playwright-Sichtprüfung auf 320px, 390px und Desktop ohne horizontalen Overflow

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
