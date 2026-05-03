# Release-Checkliste

Vor Commit, Push oder Deploy nur mit expliziter Freigabe arbeiten.

## Vor Commit

- `git status --short`
- `git diff --name-only`
- keine `.codex-recovery/`
- keine `.codex-screenshots/`
- keine ZIPs oder temporären Dateien
- keine `.env.local` oder API-Keys
- sichtbaren Versions-/Standbereich aktualisieren, wenn passend

## Tests

```sh
npm run lint
npm run build
npm run test:unit
npm run test:axe-core
npm run test:a11y
npx playwright test
```

## Lokale Sichtprüfung

- `/`
- `/suche`
- `/suche?q=Arrival`
- `/titel/mondfenster`
- `/barrierefreiheit`

Prüfen: keine Console-Errors, kein horizontaler Overflow, Logo sichtbar, keine Score-/Prozent-UI.

## Nach Deploy

- Live-URL prüfen: https://null-noise.vercel.app
- echtes iPhone: Home, Suche, Arrival-Suche, Detail, Header, Karten, Footer
