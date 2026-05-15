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
- `http://localhost:3000/barrierefreiheit`

## Testbefehle

```sh
npm run lint
npm run build
npm run test:unit
npm run test:axe-core
npm run test:a11y
npx playwright test
```

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

- sichtbaren Versions-/Standbereich aktualisieren, wenn passend
- keine Recovery-/Screenshot-/ZIP-Dateien committen
- keine API-Keys oder lokalen Env-Dateien committen
- Security-/Privacy-Checks aus diesem Runbook durchführen
- `docs/20-testing/testing-and-release.md` nur bei Release-/Deploy-Aufgaben zusätzlich lesen

## Kurze Sichtprüfung

- Erste Einschätzung sichtbar
- Gründe kurz
- keine Score-/Prozent-UI
- Header/Branding zeigt Icon-Logo plus Wortmarke auf Mobile und Desktop
- Startseite enthält kurze Erklärung unter `Was passt gerade?`
- Suche bleibt primärer Einstieg; Richtungskacheln bleiben sekundär
- sichtbare Richtungskacheln/Labels: `Eher ruhig`, `Eher wechselhaft`, `Eher intensiv`
- Merken-/Gesehen-Bereich und Toggle brechen mobil sauber um
- fehlende Poster wirken als bewusste Platzhalter, nicht wie kaputte Bilder
- keine Console-Errors
- bei 320 CSS-Pixeln kein horizontaler Overflow
- Mobile-Scrollgefühl nach Deploy auf echtem iPhone prüfen
