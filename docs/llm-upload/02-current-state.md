# null-noise: aktueller Stand

Diese Datei ist der kurze Arbeitsstand. Die gesamte Doku ist auf 10 Markdown-Dateien begrenzt; `docs/llm-upload/` ist eine kompakte Übergabe-Kopie für andere LLMs.

## Status

- lokaler Branch: `null-noise`
- lokaler Projektpfad: `/Users/deresjot/Library/CloudStorage/Dropbox/_PRIVAT/Code/git-webdev/null-noise`
- Stand: UI-Fix `196db83 fix: stabilize home and mobile search UI` ist lokal committed und als Vercel Preview bereitgestellt; Production wurde nicht angerührt
- Live-URL: https://null-noise.vercel.app
- Preview-URL für den UI-Fix: https://null-noise-ezndxaczf-deresjots-projects.vercel.app
- Hinweis: Preview ist `READY`, aber Vercel Deployment Protection/SSO ist aktiv; ohne Login kommt `401`
- v0/grüne UI liegt im Archiv-Worktree und wird nicht bearbeitet
- `main` ist keine Arbeitsfläche

## Letzte lokale Arbeitsblöcke

- Startseiten-/Mobile-UI-Fix:
  - Commit: `196db83 fix: stabilize home and mobile search UI`
  - Header zeigt auf Mobile und Desktop Icon-Logo plus Wortmarke
  - Startseite erklärt unter `Was passt gerade?` kurz Zweck und Nutzung von Null Noise
  - sichtbare Wirkungskategorien sind vereinheitlicht: `Eher ruhig`, `Eher wechselhaft`, `Eher intensiv`
  - große Viewports sind ruhiger skaliert; Mobile bleibt bedienbar
  - mobile Ergebnislisten, Merken-/Gesehen-Bereich und Toggle brechen ohne horizontalen Overflow um
  - fehlende Poster zeigen einen bewussten Platzhalter `Kein Poster verfügbar`
  - lokale visuelle Prüfung lief auf `/`, `/suche`, `/suche?q=Arrival`, `/titel/mondfenster`, `/barrierefreiheit` bei 320/390/Desktop
  - lokale Checks liefen grün: lint, build, unit, axe-core, a11y, Playwright
  - sichtbarer Footer-/Versionsbereich wurde mit Release-Notes zum UI-Fix aktualisiert
- Security-/Privacy-Hardening lokal:
  - lokale Änderungen sind noch nicht gepusht oder deployt; Live-Production muss nach Deploy separat geprüft werden
  - Security Header/CSP lokal in `next.config.ts` ergänzt
  - serverseitige DB-/API-/Rate-Limit-Module lokal mit `server-only` markiert
  - Feedback-/Rating-Cookies lokal in Production `secure`
  - Delete-Route lokal zusätzlich mit Origin-/Referer-/Fetch-Site-Prüfung geschützt
  - Production benötigt lokal gehärtet `NULL_NOISE_RATE_LIMIT_SALT`, bevor IP-Hashes geschrieben werden
  - Vitest nutzt einen lokalen `server-only`-Mock, damit Logiktests weiter laufen
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
  - Doku auf 10 kanonische Markdown-Dateien reduziert
  - `docs/llm-upload/` bleibt die kompakte Übergabe-Kopie und soll mit den fachlichen Quellen synchron bleiben
- Mobile App-Bedienlogik:
  - Suche bleibt primärer Einstieg
  - Richtungs-/Situationsstart bleibt sekundär und kompakter
  - mobile Ansichten stärker als App-Screens organisiert
  - keine neue Produktlogik und keine neue Navigation als Feature
  - lokaler Playwright-/Test-Check gehört zum Abschluss dieses Passes

## Geänderte Kernbereiche

- `next.config.ts`: lokale Security Header/CSP und API-Cache-Header
- `src/lib/prisma.ts`, `src/lib/catalog-db.ts`, `src/lib/metadata-spike.ts`, `src/lib/letterboxd.ts`, `src/lib/local-titles.ts`, `src/lib/ratings.ts`: lokale `server-only`-Grenzen
- `src/app/api/local-titles/delete/route.ts`: lokale Origin-Prüfung für schreibende Delete-Route
- `src/app/api/title-feedback/route.ts`, `src/app/titel/[slug]/actions.ts`: lokale Cookie-Härtung
- `src/lib/ratings.ts`: lokale Salt-Pflicht in Production für IP-Hashing
- `src/lib/ratings.test.ts`, `vitest.config.ts`, `tests/server-only-mock.ts`: Tests für Security-Hardening
- `src/app/globals.css`: mobile Performance- und Dichtekorrekturen aus vorherigen lokalen Pässen
- `src/app/page.tsx`, `src/components/site-header.tsx`, `src/components/search-form.tsx`, `src/components/result-list.tsx`, `src/components/external-result-list.tsx`, `src/components/result-poster.tsx`, `src/components/search-tone-scale.tsx`: UI-Fix für Startseite, Header, mobile Suche, Labels und Poster-Fallbacks
- `src/lib/format.ts`, `src/lib/metadata-spike.ts`, `src/app/titel/[slug]/page.tsx`, `src/app/spike/metadaten/[mediaType]/[externalId]/page.tsx`: sichtbare Label-/Darstellungslogik ohne Produktlogik-Umbau
- `src/lib/release-info.ts`: sichtbare Footer-/Info-Release-Notes aktualisiert
- `src/lib/stimulus-evidence.ts`: internes Evidence-Modell, Mapping, Aggregation, optionale Adaptergrenzen
- `src/lib/stimulus-evidence.test.ts`: Unit-Tests und Kalibrier-Fixtures
- `src/lib/metadata-inference.ts`: sichtbare Erstlesart wird aus Evidence-Aggregation gespeist
- `docs/`: auf 10 kanonische Markdown-Dateien reduziert

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

## Letzte verifizierte UI-Checks

- `npm run lint`: bestanden
- `npm run build`: bestanden
- `npm run test:unit`: 14 Files, 78 Tests bestanden
- `npm run test:axe-core`: 4 Tests bestanden
- `npm run test:a11y`: 29 Tests bestanden
- `npx playwright test`: 29 Tests bestanden, 2 übersprungen
- lokaler Dev-Server-Smoke: `/`, `/suche`, `/suche?q=Arrival`, `/titel/mondfenster`, `/barrierefreiheit`

## Offene echte Prüfungen

- Vercel-ENV vor Deploy prüfen: serverseitige Secrets, `NULL_NOISE_RATE_LIMIT_SALT`, `NEXT_PUBLIC_SITE_URL`, Preview/Production-Unterschiede
- nach Deploy echte Production-Header/CSP und API-Cache-Header prüfen
- nach Deploy schreibende Live-Routen prüfen: Feedback/Rating, lokaler Import, lokales Delete
- Live-Client-Bundle nach Deploy weiter auf sensible Secret-Bezüge prüfen
- Dependency-Advisories beobachten; aktueller Audit-Fix darf nicht blind per Breaking-Force-Fix laufen
- Retention der Rate-Limit-Attempts/IP-Hashes prüfen, falls öffentliche Writes aktiviert werden
- echtes iPhone-Scrollgefühl nach Deploy prüfen
- Does the Dog Die Zugriff/Nutzungsbedingungen klären, bevor aktiv genutzt
- Common Sense Media Kosten/API/Partnerschaft/lokale Speicherung klären, bevor aktiv genutzt
