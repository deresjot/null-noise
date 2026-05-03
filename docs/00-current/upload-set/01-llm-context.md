# null-noise: LLM-Kontext

## Zweck

`null-noise` hilft, Filme und Serien vorsichtig nach situativer Passung einzuordnen. Die App behauptet keine objektive Messung.

## Arbeitsstand

- Branch: `null-noise`
- Pfad: `/Users/deresjot/Library/CloudStorage/Dropbox/_PRIVAT/Code/git-webdev/null-noise`
- Live-URL: https://null-noise.vercel.app
- aktueller lokaler Stand kann uncommitted Änderungen enthalten
- v0/grüne UI liegt im Archiv-Worktree und wird nicht bearbeitet
- `main` nicht als Arbeitsfläche verwenden
- ohne explizite Freigabe nichts committen, pushen oder deployen

## Produktkern

- sichtbare Tendenzen: eher ruhig, eher wechselhaft/durchwachsen, eher intensiv
- Sprache: Metadaten-Lesart, situative Lesart, vorsichtige Hinweise
- keine Scores, Prozentwerte, Rankings oder Sicherheitsversprechen
- keine medizinische oder diagnostische Sprache
- Unsicherheit bleibt sichtbar

## Datenquellen

- aktiv: TMDb
- optional vorbereitet: Does the Dog Die, Common Sense Media, User-Feedback, Manual, Local Seed
- optionale Quellen bleiben ohne Keys und Feature-Flags Noop/Fallback
- keine API-Keys in Code, Doku-Beispielen oder Repo schreiben

## Evidence-Kurzstand

- interne Achsen: `audio_peaks`, `stimulus_density`, `visual_intensity`, `emotional_load`, `predictability`, `relief`
- fachliche Lesart: Peaks-Risiko, Hektik/Dichte, visuelles Risiko, emotionale Schwere, Überraschungsrisiko, Entlastungssignale
- TMDb wird defensiv ausgewertet
- Genre allein bleibt schwach
- mehrere passende Keywords können Confidence erhöhen
- fehlende Hinweise sind keine Entwarnung
- keine Szenenprüfung

## Mobile-Stand

- mobile Scroll-Stabilität verbessert
- mobile Header-Blur reduziert / desktop-begrenzt
- Card-/Panel-Schatten mobil reduziert
- leere Posterflächen mobil kompakt
- Home-Einstiege mobil priorisiert: Suche primär, Richtung/Situation sekundär
- mobile UI stärker als App-Screens organisiert
- mobile Brand im Header per Playwright-Messung geometrisch viewport-zentriert
- Mobile App Shell: Header mobil als ruhige Top-App-Bar mit nachgeordneter Navigation
- experimenteller radikaler Mobile-View: App-Bar ohne sichtbare Website-Navigation im Primärkopf
- separater Mobile-App-View lokal per `?view=app`, Standardansicht bleibt ohne Query erreichbar
- Home stärker als App-Startscreen: kurzer Zweck, Suche primär, Richtungswahl kompakt
- Home Control Panel: Frage, Such-Control, 3er-Segmentgruppe, tertiärer Mini-Einstieg
- Home Command Screen: kurzer Startscreen statt Hero-/Landingpage-Aufbau
- `/suche` stärker als App-Liste: kompakter Suchkopf, flache List Items, keine großen Ergebnis-Karten mobil
- Suche Media List: kompakte Poster links, kurze Lesart und kleine Aktionen
- Suche Media List dichter wiederholbar, posterlose Items ohne leeren Bildslot
- Detailseiten stärker als Entscheidungs-Screens: Titel, Lesart und Gründe zuerst
- Detail Decision Screen: Gründe und Datenlage im oberen Lesartblock
- keine neue Navigation, Produktlogik oder Datenquelle durch den Mobile-View
- Experiment ändert nur mobile Darstellung, nicht Datenquelle oder Produktlogik
- keine neue Produktlogik und keine neue Navigation als Feature
- Footer mobil nachgeordnet

## Standardprüfungen

```sh
npm run lint
npm run build
npm run test:unit
npm run test:axe-core
npm run test:a11y
npx playwright test
```

## Upload-Set

Für neue ChatGPT-/Codex-Runden bevorzugt `docs/00-current/upload-set/` verwenden. Es enthält maximal 10 echte Markdown-Dateien. Für viele Aufgaben reichen:

- `01-llm-context.md`
- `02-current-state-and-runbook.md`
- ggf. eine passende Detaildatei

Archive nur bei ausdrücklichem Bedarf laden.

`docs/00-current/copy-bundle/` ist nur ein KI-Relay-/Übergabeordner für KI-zu-KI-Übergaben, kein Standardkontext und keine zweite fachliche Quelle.

Lokaler Server bleibt nach UI-Prüfpässen für den manuellen Check auf `http://localhost:3000` offen, wenn die Aufgabe das verlangt.
