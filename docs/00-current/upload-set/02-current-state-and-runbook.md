# Aktueller Stand und Runbook

## Stand

- Branch: `null-noise`
- Live-URL: https://null-noise.vercel.app
- lokale Änderungen vor Commit/Push/Deploy immer prüfen
- v0/grün im Archiv nicht anfassen
- `main` nicht als Arbeitsfläche nutzen

## Letzte Arbeitsbereiche

- mobile Scroll-Stabilisierung
- mobile Bedienlogik app-näher gemacht
- mobile Ansichten stärker als App-Screens organisiert
- sichtbarer Mobile-Nachzug: Header-Brand geometrisch viewport-zentriert, Home als App-Startscreen, `/suche` als flache App-Liste, Detail als Entscheidungs-Screen
- aktueller Mobile-Pattern-Pass: App-Bar, Home Control Panel, Suche Media List, Detail Decision Screen
- experimenteller radikaler Mobile-View: App-Bar, Home Command Screen, Suche Media List, Detail Decision Screen
- Mobile-App-Experiment lokal mit `?view=app` öffnen, zum Beispiel `http://localhost:3000/suche?q=Arrival&view=app`
- keine neue Navigation, keine neue Produktlogik, keine neue Datenquelle
- situative Passung statt allgemeiner Reizlast-Anmutung
- Evidence-Modell und TMDb-Kalibrierung
- Doku-Struktur und Upload-Set

## Kernrouten

- `/`
- `/suche`
- `/suche?q=Arrival`
- `/titel/mondfenster`
- `/barrierefreiheit`
- optional: `/spike/metadaten/...`

## Status prüfen

```sh
pwd
git rev-parse --show-toplevel
git branch --show-current
git status --short
git diff --name-only
git worktree list
```

## Dev-Server starten

```sh
lsof -i :3000 || true
rm -rf .next
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Nur wenn klar ist, dass der Prozess zum lokalen Dev-Server gehört:

```sh
lsof -tiTCP:3000 -sTCP:LISTEN | xargs -r kill -9
```

Prozesse nicht blind beenden.

## Tests

```sh
npm run lint
npm run build
npm run test:unit
npm run test:axe-core
npm run test:a11y
npx playwright test
```

## Manuelle Checks

- Home: Suche zuerst, Richtung sekundär, tertiäre Links ruhig
- Suche: kompakter Bedienkopf, wiederholbare App-Liste
- Detail: Lesart zuerst, Gründe/Grenzen danach
- Footer: erreichbar, aber nicht zweiter Hero
- localhost für manuellen Check offen lassen, wenn die Aufgabe es verlangt
- 320 CSS-Pixel ohne horizontalen Overflow
- sichtbarer Fokus
- keine Score-/Prozent-UI
- keine Console-Errors

## Release-/Deploy-Hinweis

Vor Commit/Deploy zusätzlich `07-release-checklist.md` lesen. Sichtbaren Versions-/Standbereich aktualisieren, wenn passend.
