# null-noise: aktueller Stand

Diese Datei ist der kurze Arbeitsstand. Die lange Chronik liegt in `docs/90-archive/`.

## Status

- lokaler Branch: `null-noise`
- lokaler Projektpfad: `/Users/deresjot/Library/CloudStorage/Dropbox/_PRIVAT/Code/git-webdev/null-noise`
- Stand: Branch `null-noise` wurde zuletzt nach Vercel deployed; aktuelle lokale Änderungen sind noch nicht gepusht oder deployt
- Live-URL: https://null-noise.vercel.app
- v0/grüne UI liegt im Archiv-Worktree und wird nicht bearbeitet
- `main` ist keine Arbeitsfläche

## Letzte lokale Arbeitsblöcke

- Mobile Scroll-Stabilisierung:
  - mobile Header-Backdrop-Kosten reduziert bzw. auf Desktop begrenzt
  - Card-/Panel-Schatten mobil reduziert
  - leere Poster-Fallbackflächen mobil kompakter gehalten
- Mobile Dichte/Einstieg:
  - Home-Suche bleibt primärer Einstieg
  - Richtungsstart bleibt vorhanden, aber visuell nachgeordnet
  - Suchkarten und Footer mobil verdichtet und beruhigt
- Evidence-Modell:
  - interne Achsen für Reiz-Evidence eingeführt
  - TMDb bleibt aktive Quelle
  - Does the Dog Die, Common Sense Media, User-Feedback, Manual und Local Seed sind vorbereitet bzw. optional
  - sichtbare Ausgabe bleibt ohne Score, Prozentwert oder Ranking
- Evidence-Kalibrierung:
  - TMDb-/Evidence-Mapping mit lokalen Beispielprofilen getestet
  - sensorische, visuelle und emotionale Intensität intern klarer getrennt
  - Relief als positive Evidenz gestärkt
  - widersprüchliche Signale führen eher zu mixed/durchwachsen
- Doku-Struktur:
  - kurzer LLM-Einstieg in `docs/00-current/llm-context.md`
  - stabile Prinzipien, Testing, Architektur und Historie getrennt
  - bevorzugtes Upload-Set in `docs/00-current/upload-set/` mit maximal 10 echten Markdown-Dateien
  - `docs/00-current/copy-bundle/` bleibt nur KI-Relay-/Übergabeordner mit echten Markdown-Kopien
- Mobile App-Bedienlogik:
  - Suche bleibt primärer Einstieg
  - Richtungs-/Situationsstart bleibt sekundär und kompakter
  - mobile Ansichten stärker als App-Screens organisiert
  - keine neue Produktlogik und keine neue Navigation als Feature
  - lokaler Playwright-/Test-Check gehört zum Abschluss dieses Passes

## Geänderte Kernbereiche

- `src/app/globals.css`: mobile Performance- und Dichtekorrekturen aus vorherigen lokalen Pässen
- `src/lib/stimulus-evidence.ts`: internes Evidence-Modell, Mapping, Aggregation, optionale Adaptergrenzen
- `src/lib/stimulus-evidence.test.ts`: Unit-Tests und Kalibrier-Fixtures
- `src/lib/metadata-inference.ts`: sichtbare Erstlesart wird aus Evidence-Aggregation gespeist
- `docs/`: neue Struktur für kürzeren LLM-Kontext

## Relevante Prüfpfade

- `/`
- `/suche`
- `/suche?q=Arrival`
- `/titel/mondfenster`
- `/barrierefreiheit`
- optional: `/spike/metadaten/...`

## Aktueller Teststandard

- `npm run lint`
- `npm run build`
- `npm run test:unit`
- `npm run test:axe-core`
- `npm run test:a11y`
- `npx playwright test`, wenn sinnvoll

## Offene echte Prüfungen

- echtes iPhone-Scrollgefühl nach Deploy prüfen
- Does the Dog Die Zugriff/Nutzungsbedingungen klären, bevor aktiv genutzt
- Common Sense Media Kosten/API/Partnerschaft/lokale Speicherung klären, bevor aktiv genutzt
