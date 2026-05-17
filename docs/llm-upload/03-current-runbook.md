# null-noise: aktuelles Runbook

## Lokaler Kontext

- Pfad: `/Users/deresjot/Library/CloudStorage/Dropbox/_PRIVAT/Code/git-webdev/null-noise`
- Branch: `null-noise`
- Archiv-Worktree: `/Users/deresjot/Library/CloudStorage/Dropbox/_PRIVAT/Code/git-webdev/_archive/null-noise-v0-green-ui`
- Ohne explizite Freigabe: nichts committen, nichts pushen, nichts deployen.
- v0/grün im Archiv-Worktree nicht anfassen.
- `main` nicht als Arbeitsfläche verwenden.

## Status prüfen

```sh
pwd
git rev-parse --show-toplevel
git branch --show-current
git status --short
git worktree list
```

## Dev-Server starten

```sh
lsof -i :3000 || true
rm -rf .next
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Bei belegtem Port 3000 den konkreten lokalen Prozess nur nach Prüfung beenden.

Sichere Kurzvariante, wenn klar ist, dass der Prozess zum lokalen Dev-Server gehört:

```sh
lsof -tiTCP:3000 -sTCP:LISTEN | xargs -r kill -9
```

Nur verwenden, wenn der Prozess eindeutig zum lokalen Dev-Server gehört. Prozesse nicht blind beenden.

## Kernrouten lokal prüfen

- `http://localhost:3000`
- `http://localhost:3000/suche`
- `http://localhost:3000/suche?q=Arrival`
- `http://localhost:3000/titel/mondfenster`
- `http://localhost:3000/erklaerung`
- `http://localhost:3000/bedienung`
- `http://localhost:3000/barrierefreiheit`
- `http://localhost:3000/datenschutz`
- `http://localhost:3000/impressum`

## Testbefehle

```sh
npm run lint
npm run build
npm run test:unit
npm run test:axe-core
npm run test:a11y
npx playwright test
```

Für den Mobile-UX-Pass vom 17. Mai 2026 liefen zuletzt grün:

```sh
npm run lint
npm run build
npm run test:a11y
```

Vor einem Push/Deploy sollten `npm run test:unit`, `npm run test:axe-core` als Einzelbefehl und bei ausreichender Zeit `npx playwright test` erneut laufen, weil sie in diesem letzten Mobile-Pass nicht separat abgeschlossen wurden.

## Security-/Privacy-Checks

Vor Commit/Deploy:

- `git status --short` und `git diff --name-only` prüfen
- keine `.env*`, API-Keys, Tokens, lokalen Datenbankdateien, Screenshots, ZIPs oder Recovery-Dateien committen
- Secret-Werte nie in Doku, Logs, Testausgaben oder PR-Beschreibungen schreiben
- Vercel-ENV manuell prüfen: Secrets nur serverseitig, keine unnötigen `NEXT_PUBLIC_` Variablen
- `NULL_NOISE_RATE_LIMIT_SALT` in Production setzen, bevor öffentliche Writes/Feedback aktiv sind
- `TMDB_READ_ACCESS_TOKEN` serverseitig halten; keine externen API-Keys im Client-Bundle
- `NEXT_PUBLIC_SITE_URL` ist als öffentliche kanonische URL vertretbar; keine Secrets mit `NEXT_PUBLIC_` prefixen
- Supabase ist aktuell nicht im Projekt; falls später eingeführt, RLS, Policies, Security Advisor und Service-Role-Grenzen vor Deploy prüfen
- Build-/Bundle-Check nach `npm run build`: `.next/static` darf keine sensiblen Secret-Namen oder Secret-Werte enthalten
- schreibende Routen lokal prüfen: Feedback/Rating, lokaler Import, lokales Delete
- lokale Security-Härtung ist erst nach Push/Deploy live; Doku darf Production nicht als geprüft behaupten, solange nur lokal geprüft wurde

Nach Deploy:

- echte Production-Header/CSP prüfen
- API-Cache-Header für JSON-Routen prüfen
- schreibende Live-Routen nur mit erwarteten Origin-/Rate-Limit-/Cookie-Regeln testen
- Vercel Preview und Production getrennt prüfen
- keine personenbezogenen Testdaten erzeugen

## Release-/Deploy-Check

Vor Commit/Deploy zusätzlich prüfen:

- sichtbare Release Notes und Footer-Metadaten in `src/lib/release-info.ts` aktualisieren, bevor ein Push oder Vercel-Deploy vorbereitet wird
- Doku-Übergabe synchron halten: `docs/00-current/*`, `docs/20-testing/testing-and-release.md` und die jeweiligen Dateien in `docs/llm-upload/`
- relevante Footer-/Changelog-Tests anpassen, falls sichtbare Texte geändert wurden
- keine Recovery-/Screenshot-/ZIP-Dateien committen
- keine API-Keys oder lokalen Env-Dateien committen
- Security-/Privacy-Checks aus diesem Runbook durchführen
- `docs/20-testing/testing-and-release.md` nur bei Release-/Deploy-Aufgaben zusätzlich lesen
- erst danach die passenden Tests ausführen und nur mit expliziter Freigabe pushen oder deployen

## Übergabe an anderen Chat vor Push/Deploy

Empfohlenes Briefing:

```text
Bitte arbeite im Projekt null-noise auf dem Branch null-noise.
Lies zuerst docs/llm-upload/00-docs-readme.md, 01-llm-context.md,
02-current-state.md, 03-current-runbook.md und 07-testing-and-release.md.
Ziel: Vor Git-Push und Vercel-Deploy den aktuellen lokalen Mobile-UX-Pass prüfen.
Bitte nichts committen, pushen oder deployen ohne explizite Freigabe.
Prüfe git status/diff, Release Notes, Doku-Sync, Secrets/Artefakte,
Tests, mobile Viewports 390px/430px und danach die Vercel-Deploy-Bereitschaft.
```

## Kurze Sichtprüfung

- Erste Einschätzung sichtbar
- Gründe kurz
- keine Score-/Prozent-UI
- Header/Branding zeigt Icon-Logo plus Wortmarke auf Mobile und Desktop
- Logo/Wortmarke führt von Unterseiten zurück zur Startseite
- Mobile Header-App-Shell hat symmetrische Innenabstände und schrumpft smooth beim Scrollen
- Burger-Menü öffnet und schließt per Button, Link-Klick und Escape; Fokus bleibt sichtbar
- Burger-Menü liegt sichtbar über Seiteninhalt, Ergebnisgruppen und Detailkarten
- Startseite enthält kurze Erklärung unter `Was passt gerade?`
- Suche bleibt primärer Einstieg; Richtungskacheln bleiben sekundär
- `Ohne Titel stöbern` / `Auswahl zeigen` wirkt als Button-CTA mit Icon, nicht wie ein schwacher Textlink
- `Richtung starten` hat ausreichend Innenabstand; die drei Richtungen sind grün, gold und rot markiert
- sichtbare Richtungskacheln/Labels: `Eher ruhig`, `Eher wechselhaft`, `Eher intensiv`
- Merken-/Gesehen-Bereich und Toggle umbrechen mobil sauber
- Detailseite zeigt mobil Poster und Synopsis, sofern Daten vorhanden sind
- fehlende Poster wirken als bewusste kompakte Platzhalter, nicht wie kaputte Bilder
- `Zurück zur Suche` wirkt wie ein Button mit Pfeil und bleibt tastaturbedienbar
- keine Console-Errors
- bei 320 CSS-Pixeln kein horizontaler Overflow
- bei 390px und 430px kein horizontaler Overflow; Touch-Ziele wirken fingerfreundlich
- `prefers-reduced-motion` bleibt respektiert
- Mobile-Scrollgefühl nach Deploy auf echtem iPhone prüfen
