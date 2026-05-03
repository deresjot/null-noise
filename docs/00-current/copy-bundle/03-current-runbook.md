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

## Release-/Deploy-Check

Vor Commit/Deploy zusätzlich prüfen:

- sichtbaren Versions-/Standbereich aktualisieren, wenn passend
- keine Recovery-/Screenshot-/ZIP-Dateien committen
- keine API-Keys oder lokalen Env-Dateien committen
- `docs/20-testing/release-checklist.md` nur bei Release-/Deploy-Aufgaben zusätzlich lesen

## Kurze Sichtprüfung

- Erstlesart sichtbar
- Gründe kurz
- keine Score-/Prozent-UI
- Header/Branding unverändert
- keine Console-Errors
- bei 320 CSS-Pixeln kein horizontaler Overflow
- Mobile-Scrollgefühl nach Deploy auf echtem iPhone prüfen
