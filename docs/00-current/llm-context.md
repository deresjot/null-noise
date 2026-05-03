# null-noise: LLM-Kontext

## Aktueller Arbeitsstand

- aktiver lokaler Arbeitsbranch: `null-noise`
- aktueller Stand: Branch `null-noise` wurde zuletzt nach Vercel deployed; aktuelle lokale Änderungen sind noch nicht gepusht oder deployt
- Live-URL: https://null-noise.vercel.app
- v0/grüne UI liegt im Archiv-Worktree
- `main` nicht als Arbeitsfläche verwenden
- ohne explizite Freigabe nichts committen, pushen oder deployen

## Produktkern

- `null-noise` hilft, Filme und Serien grob nach vermuteter Reizwirkung einzuordnen.
- Sichtbare Tendenzen: eher ruhig, eher wechselhaft/durchwachsen, eher intensiv.
- Die Ausgabe ist eine vorsichtige Erstlesart, keine objektive Messung.
- Es gibt keine Scores, Prozentwerte oder Rankings.
- Unsicherheit bleibt sichtbar und wird nicht sprachlich glattgezogen.

## Harte Nicht-Ziele

- keine Social Features
- keine Profile oder Konten
- kein Tracking
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
- Standard-UI ist der barrierearme Primärpfad
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

- mobile Scroll-Stabilität wurde lokal verbessert
- mobile Header-Blur reduziert / desktop-begrenzt
- Card-/Panel-Schatten mobil reduziert
- leere Posterflächen mobil kompakt
- Home-Einstiege mobil priorisiert: Suche primär, Richtungsstart sekundär
- Mobile Bedienlogik wurde app-näher gemacht: Suche bleibt primär, Richtungs-/Situationsstart bleibt sekundär, ohne neue Produktlogik oder neue Navigation als Feature
- Footer mobil beruhigt
- echter iPhone-Check erst nach Deploy möglich

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

## Welche Doku bei welcher Aufgabe lesen?

- UI/UX/Mobile: `docs/10-principles/ux-principles.md`, `docs/10-principles/product-principles.md`, `docs/30-architecture/ui-component-strategy.md`
- Accessibility/Tests: `docs/10-principles/a11y-principles.md`, `docs/20-testing/a11y-testing.md`
- Evidence/Ersteinschätzung: `docs/10-principles/product-principles.md`, `docs/30-architecture/evidence-model.md`, `docs/30-architecture/data-sources.md`
- Übergabe/neuer Chat: `docs/00-current/llm-context.md`, `docs/00-current/current-state.md`
- Historie nur bei Bedarf: `docs/90-archive/`

## Kontextregel für LLM-Arbeit

Standardmäßig nur diese Datei lesen:

- `docs/00-current/llm-context.md`

Für uploadbare neue ChatGPT-/Codex-Runden bevorzugt `docs/00-current/upload-set/` verwenden. Das Upload-Set enthält maximal 10 echte Markdown-Dateien.

`docs/00-current/copy-bundle/` bleibt nur ein KI-Relay-/Übergabeordner mit echten Markdown-Kopien für stabile App-Uploads. Es ist kein fachlicher Master und keine zweite Pflegequelle; Inhalte werden aus den aktuellen Doku-Quellen neu abgeleitet.

Für die meisten Aufgaben reichen:

- `docs/00-current/upload-set/01-llm-context.md`
- `docs/00-current/upload-set/02-current-state-and-runbook.md`
- ggf. eine passende Detaildatei aus `docs/00-current/upload-set/`

Zusätzliche Dateien nur bei Bedarf:

- UI/UX/Mobile: `docs/10-principles/ux-principles.md`, `docs/10-principles/product-principles.md`, `docs/30-architecture/ui-component-strategy.md`
- Accessibility/Test: `docs/10-principles/a11y-principles.md`, `docs/20-testing/a11y-testing.md`
- Evidence/Data: `docs/30-architecture/evidence-model.md`, `docs/30-architecture/data-sources.md`
- Release/Deploy: `docs/20-testing/release-checklist.md` zusätzlich lesen; sie ist nicht Teil des Standardbundles
- Historie: `docs/90-archive/` nur wenn ausdrücklich noetig

## Offene Entscheidungen

- Does the Dog Die Zugriff/Nutzungsbedingungen
- Common Sense Media Kosten/API/Partnerschaft/lokale Speicherung
- echte iPhone-Prüfung nach Vercel-Deploy
- spätere stille Feedback-Evidenz ohne Social Feature
