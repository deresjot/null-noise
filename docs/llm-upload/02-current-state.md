# null-noise: aktueller Stand

Diese Datei ist der kurze Arbeitsstand. Die gesamte Doku ist auf 10 Markdown-Dateien begrenzt; `docs/llm-upload/` ist eine kompakte Übergabe-Kopie für andere LLMs.

## Status

- lokaler Branch: `null-noise`
- lokaler Projektpfad: `/Users/deresjot/Library/CloudStorage/Dropbox/_PRIVAT/Code/git-webdev/null-noise`
- Stand: Mobile-UX-Pass vom 17. Mai 2026 liegt lokal als uncommitted Working-Tree auf dem Branch `null-noise`
- vorheriger UI-Fix `196db83 fix: stabilize home and mobile search UI` ist lokal committed und als Vercel Preview bereitgestellt; der aktuelle Mobile-UX-Pass ist noch nicht gepusht und nicht deployt
- Live-URL: https://null-noise.vercel.app
- Preview-URL für den UI-Fix: https://null-noise-ezndxaczf-deresjots-projects.vercel.app
- Hinweis: Preview ist `READY`, aber Vercel Deployment Protection/SSO ist aktiv; ohne Login kommt `401`
- v0/grüne UI liegt im Archiv-Worktree und wird nicht bearbeitet
- `main` ist keine Arbeitsfläche
- ohne explizite Freigabe: nichts committen, nichts pushen, nichts deployen

## Letzte lokale Arbeitsblöcke

- Mobile-UX-Pass 17. Mai 2026:
  - Ziel: iOS-Chrome/Safari-ähnliche mobile Nutzung lesbarer, bedienbarer und ruhiger machen, ohne Produktlogik umzubauen
  - Mobile Header ist jetzt eine fixe App-Shell mit Burger-Menü, aktiven Zuständen, Escape-Schließen, sichtbarem Fokus und Hauptzielen: Start, Suche, Erklärung/Hilfe, Barrierefreiheit, Datenschutz, Impressum
  - Mobile Navigation wurde gegen Z-Layer-/Stacking-Context-Probleme gehärtet; das Overlay liegt über Seiteninhalt und Karten
  - Logo/Wortmarke im Header führen mobil und desktop zuverlässig zur Startseite; versteckte Skip-Links blockieren keine Taps mehr
  - Header-Abstände der Mobile-App-Shell wurden symmetrisch gesetzt; beim Scrollen schrumpft der Header smooth, der Glass-Backdrop bleibt aktiv
  - mobile Schriftgrößen, Zeilenhöhen, Touch-Ziele, Card-Abstände, Footer-Rhythmus und lange Legal-Texte wurden luftiger bzw. robuster gesetzt
  - `search-browse-link` wirkt jetzt wie ein Button-CTA mit Lupe, bleibt aber semantisch ein Link
  - `search-direct-starts` hat mobil mehr Innenabstand; die drei Richtungen sind als grüne, goldene und rote Button-Flächen unterscheidbar
  - Detailseite zeigt mobil die zentralen Inhalte weiterhin: Poster, Titel, Typ/Jahr, Synopsis, Erste Einschätzung, Stand/Status, Verfügbarkeit und Empfehlungen
  - Detailposter skalieren auf schmalen Viewports groß von links nach rechts; Fallbacks für fehlende Poster bleiben kompakt
  - `Zurück zur Suche` im Metadaten-Detailpfad ist nun ein gestalteter Button mit Zurück-Pfeil
  - Favicon, Open-Graph-/Twitter-Metadaten und generiertes Social-Image wurden mit logo-nahen Farben und aktueller Copy aktualisiert
  - Release Notes in `src/lib/release-info.ts` stehen auf `0.8.4-mobile.20260517`
  - sanfte CSS-Transitions und optionale Ladebalken-Hooks ergänzt; `prefers-reduced-motion` wird respektiert
  - während des A11y-Fixes wurde Opacity aus Entry-Animationen entfernt, damit Kontrast-Scans nicht während halbtransparenter Texte anschlagen
  - lokal geprüft: `npm run lint`, `npm run build`, `npm run test:a11y`; manueller Playwright-Smoke bei 390px und 430px
  - zusätzlicher Layer-Smoke: mobile Navigation auf `/`, `/suche?q=Arrival`, `/titel/mondfenster` liegt bei 390px über dem Content
- Startseiten-/Mobile-UI-Fix:
  - Commit: `196db83 fix: stabilize home and mobile search UI`
  - Header zeigt auf Mobile und Desktop Icon-Logo plus Wortmarke
  - Startseite erklärt unter `Was passt gerade?` kurz Zweck und Nutzung von Null Noise
  - sichtbare Wirkungskategorien sind vereinheitlicht: `Eher ruhig`, `Eher wechselhaft`, `Eher intensiv`
  - Hero, Suchformular, Richtungskacheln, Ergebnislisten und Footer skalieren auf breiten Viewports ruhiger
  - mobile Ergebnislisten, Merken-/Gesehen-Bereich und Toggle umbrechen sauber ohne horizontalen Overflow
  - fehlende Poster zeigen einen bewussten Platzhalter `Kein Poster verfügbar`
  - lokale Sichtprüfung auf 320px, 390px und Desktop war ohne horizontalen Overflow
  - vollständige lokale Checks liefen zuletzt grün: Lint, Build, Unit, Axe-Core, A11y, Playwright
  - Footer-Stand/Release Notes sind auf `Startseite und mobile Suche stabilisiert` aktualisiert
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

- `src/app/globals.css`: Mobile-App-Shell, Burger-Navigation, mobile Typografie/Spacing, Detailposter-Skalierung, Footer-/Legal-Abstände, Motion- und Reduced-Motion-Regeln
- `src/components/site-header.tsx`: clientseitige mobile Navigation, Scroll-State, Escape-Schließen, aktive Zustände
- `src/app/titel/[slug]/page.tsx`: mobile Detail-Hierarchie mit Synopsis im Titelkopf
- `src/app/spike/metadaten/[mediaType]/[externalId]/page.tsx`: gestalteter Zurück-zur-Suche-Button
- `src/app/layout.tsx`, `src/app/opengraph-image.tsx`, `public/brand/favicon.svg`: Favicon und Social-Sharing-Aktualisierung
- `src/lib/release-info.ts`: technisches Release `0.8.4-mobile.20260517`
- `tests/accessibility.spec.ts`: mobile Navigationstest auf Burger-Menü und vollständige Zielnavigation angepasst
- `next.config.ts`: lokale Security Header/CSP und API-Cache-Header
- `src/lib/prisma.ts`, `src/lib/catalog-db.ts`, `src/lib/metadata-spike.ts`, `src/lib/letterboxd.ts`, `src/lib/local-titles.ts`, `src/lib/ratings.ts`: lokale `server-only`-Grenzen
- `src/app/api/local-titles/delete/route.ts`: lokale Origin-Prüfung für schreibende Delete-Route
- `src/app/api/title-feedback/route.ts`, `src/app/titel/[slug]/actions.ts`: lokale Cookie-Härtung
- `src/lib/ratings.ts`: lokale Salt-Pflicht in Production für IP-Hashing
- `src/lib/ratings.test.ts`, `vitest.config.ts`, `tests/server-only-mock.ts`: Tests für Security-Hardening
- `src/app/globals.css`: mobile Performance- und Dichtekorrekturen aus vorherigen lokalen Pässen
- `src/app/page.tsx`, `src/components/site-header.tsx`, `src/components/search-form.tsx`, `src/components/result-list.tsx`, `src/components/external-result-list.tsx`, `src/components/result-poster.tsx`, `src/components/search-tone-scale.tsx`: UI-Fix für Startseite, Header, mobile Suche, Labels und Poster-Fallbacks
- `src/lib/format.ts`, `src/lib/metadata-spike.ts`: nur sichtbare Label-/Darstellungswerte für die drei Wirkungskategorien im UI-Fix
- `src/lib/release-info.ts`: sichtbarer Footer-Stand und aktuelle Release Notes
- `src/lib/stimulus-evidence.ts`: internes Evidence-Modell, Mapping, Aggregation, optionale Adaptergrenzen
- `src/lib/stimulus-evidence.test.ts`: Unit-Tests und Kalibrier-Fixtures
- `src/lib/metadata-inference.ts`: sichtbare Erste Einschätzung wird aus Evidence-Aggregation gespeist
- `docs/`: auf 10 kanonische Markdown-Dateien reduziert

## Relevante Prüfpfade

- `/`
- `/suche`
- `/suche?q=Arrival`
- `/titel/mondfenster`
- `/titel/bonanza`, falls lokal vorhanden
- `/erklaerung`
- `/bedienung`
- `/barrierefreiheit`
- `/datenschutz`
- `/impressum`
- optional: `/spike/metadaten/...`

## Aktueller Teststandard

- `npm run lint`
- `npm run build`
- `npm run test:unit`
- `npm run test:axe-core`
- `npm run test:a11y`
- `npx playwright test`, wenn sinnvoll

## Offene echte Prüfungen

- vor Push/Deploy durch anderen Chat prüfen: Working Tree, Diff-Scope, keine Secrets/Recovery-/Screenshot-Artefakte, Testmatrix vollständig
- für diesen Mobile-UX-Pass noch nicht erneut gelaufen: `npm run test:unit`, `npm run test:axe-core` als Einzelbefehl und vollständiges `npx playwright test`; `npm run test:a11y` enthält aber die direkten axe-core-Spezifikationen
- Vercel-ENV vor Deploy prüfen: serverseitige Secrets, `NULL_NOISE_RATE_LIMIT_SALT`, `NEXT_PUBLIC_SITE_URL`, Preview/Production-Unterschiede
- nach Deploy echte Production-Header/CSP und API-Cache-Header prüfen
- nach Deploy schreibende Live-Routen prüfen: Feedback/Rating, lokaler Import, lokales Delete
- Live-Client-Bundle nach Deploy weiter auf sensible Secret-Bezüge prüfen
- Dependency-Advisories beobachten; aktueller Audit-Fix darf nicht blind per Breaking-Force-Fix laufen
- Retention der Rate-Limit-Attempts/IP-Hashes prüfen, falls öffentliche Writes aktiviert werden
- echtes iPhone-Scrollgefühl nach Deploy prüfen
- Does the Dog Die Zugriff/Nutzungsbedingungen klären, bevor aktiv genutzt
- Common Sense Media Kosten/API/Partnerschaft/lokale Speicherung klären, bevor aktiv genutzt

## Letzte verifizierte UI-Checks

- `npm run lint`: bestanden
- `npm run build`: bestanden
- `npm run test:a11y`: 35 Tests bestanden
- gezielter Playwright-Smoke bei 390px und 430px:
  - Header links/rechts symmetrisch
  - Header schrumpft smooth beim Scrollen
  - Burger-Menü öffnet mit ca. 51px hohen Link-Touchflächen
  - Detailposter sichtbar und groß skaliert
  - keine horizontale Scrollbar
