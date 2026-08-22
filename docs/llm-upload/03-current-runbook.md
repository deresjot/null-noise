# null-noise: aktuelles Runbook

## Lokaler Kontext

- Vorgesehener aktueller Diff-Scope umfasst `src/app/mobile-system.css` und dessen Import in `src/app/layout.tsx`.
- Der Read-only-Importpfad muss vor Salt-/Hash-, Rate-Limit- und Datenbankzugriff mit `import=inactive` enden; der Service Worker darf bei Aktivierung nur veraltete eigene `null-noise-*`-Caches löschen.
- Das Impressum bleibt für die geschlossene Beta unverändert und ist in diesem Arbeitsstand kein technischer Deploy-Blocker.
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
npm run dev -- --hostname 0.0.0.0 --port 3000
```

Bei belegtem Port 3000 den konkreten lokalen Prozess nur nach Prüfung beenden.

Lokal im Browser `http://localhost:3000` verwenden, nicht `https://localhost:3000`. Safari kann sonst je nach Cache/HSTS/HTTPS-Erwartung so wirken, als sei localhost nicht erreichbar, obwohl der Next-Dev-Server läuft.

Sichere Kurzvariante, wenn klar ist, dass der Prozess zum lokalen Dev-Server gehört:

```sh
lsof -tiTCP:3000 -sTCP:LISTEN | xargs -r kill -9
```

Nur verwenden, wenn der Prozess eindeutig zum lokalen Dev-Server gehört. Prozesse nicht blind beenden.

## Kernrouten lokal prüfen

- `http://localhost:3000`
- `http://localhost:3000/suche`
- `http://localhost:3000/suche?q=Arrival`
- `http://localhost:3000/suche?q=Predator`
- `http://localhost:3000/suche?q=Gladiator`
- `http://localhost:3000/suche?q=Cars`
- `http://localhost:3000/suche?q=Past%20Lives`
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
npm run test:wcag22-aa
npm run test:wcag22-aaa
npx playwright test
PLAYWRIGHT_BROWSER=webkit npx playwright test <relevante Tests>
git diff --check
```

Für den Mobile-UX-Abschluss vom 23. Mai 2026 liefen direkt vor der finalen lokalen Doku-/Commit-Aktualisierung grün:

```sh
npm run lint
npm run build
npm run test:unit
npm run test:axe-core
npm run test:a11y
npx playwright test
```

Der vollständige Playwright-Lauf bestand mit 35 bestandenen Tests und 2 skipped TMDb-Live-Fallback-Tests. Vor einem späteren Push/Deploy trotzdem Status, Diff-Scope, Secrets/Artefakte und ggf. Live-/Preview-Bedingungen erneut prüfen.

## Allgemeiner Accessibility-Check

- Landmarken, Überschriften, Formularlabels, Listen, echte Links/Buttons und kontextbezogene Seitentitel prüfen.
- Alle Interaktionen ohne Maus in logischer Reihenfolge bedienen; Sprunglinks, Escape-Verhalten, Fokusfallen und Rückkehrfokus einschließen.
- Fokus darf nicht verdeckt sein, Nachbarinhalte überlagern oder Controls bewegen. Reload-Fokus wird nur einmal wiederhergestellt; eine anschließende Fokusaktion muss bestehen bleiben.
- Dynamische Zustände, Fehler und Erfolge knapp und ohne konkurrierende Live-Regionen ankündigen.
- Informationsbilder benötigen passende Alternativtexte; redundante Bilder in vollständig beschrifteten Links bleiben dekorativ.
- Reflow bei 320 CSS-Pixeln als automatisiertes 400-Prozent-Zoom-Äquivalent prüfen; echten Browserzoom bis 400 Prozent zusätzlich manuell testen.
- Safari mit VoiceOver, Edge unter Windows High Contrast und mindestens einen Touch-Screenreader manuell testen und Ergebnis als bestanden, fehlgeschlagen, nicht geprüft oder nicht vorhanden festhalten.
- Kernfunktionen mit deaktiviertem JavaScript als Progressive-Enhancement-Prüfung untersuchen. Das clientseitige Preview-Gate ist dabei eine bekannte Vorschaugrenze und keine Sicherheitsgrenze.

## Security-/Privacy-Checks

Vor Commit/Deploy:

- `git status --short` und `git diff --name-only` prüfen
- keine `.env*`, API-Keys, Tokens, lokalen Datenbankdateien, Screenshots, ZIPs oder Recovery-Dateien committen
- Secret-Werte nie in Doku, Logs, Testausgaben oder PR-Beschreibungen schreiben
- Vercel-ENV manuell prüfen: Secrets nur serverseitig, keine unnötigen `NEXT_PUBLIC_` Variablen
- Domain-Konfiguration vor Deploy prüfen: `null-noise.vercel.app` ist die kanonische Production-Adresse; es besteht keine Abhängigkeit von einer separaten Custom-Domain
- `NULL_NOISE_RATE_LIMIT_SALT` in Production setzen, bevor öffentliche Writes/Feedback aktiv sind
- Vercel-Env in Production prüfen: `NEXT_PUBLIC_SITE_URL=https://null-noise.vercel.app`, `CONTACT_TO_EMAIL=mail@sebastianjansen.com`, `CONTACT_FROM_EMAIL=mail@sebastianjansen.com`, `SMTP_HOST=mail.hosting.de`, `SMTP_PORT=587`, `SMTP_SECURE=false`, `SMTP_USER=mail@sebastianjansen.com`, `SMTP_PASSWORD=<set-secret>`, `NULL_NOISE_RATE_LIMIT_SALT=<set-secret>`, `TMDB_READ_ACCESS_TOKEN=<set-secret>`
- Vercel Environment Variables gelten nicht rückwirkend für alte Deployments; nach ENV-Anpassungen oder Codeänderungen ist ein neuer Production-Deploy nötig
- Kontaktanfragen werden per SMTP verschickt; keine Adminroute, keine Datenbank, keine temporäre Datei und kein Blob-Speicher fuer Kontaktanfragen verwenden
- `TMDB_READ_ACCESS_TOKEN` serverseitig halten; keine externen API-Keys im Client-Bundle
- `NEXT_PUBLIC_SITE_URL` ist als öffentliche kanonische URL vertretbar; keine Secrets mit `NEXT_PUBLIC_` prefixen
- Supabase ist aktuell nicht im Projekt; falls später eingeführt, RLS, Policies, Security Advisor und Service-Role-Grenzen vor Deploy prüfen
- Build-/Bundle-Check nach `npm run build`: `.next/static` darf keine sensiblen Secret-Namen oder Secret-Werte enthalten
- schreibende Routen lokal prüfen: Feedback/Rating, lokaler Import, lokales Delete
- lokale Security-Härtung ist erst nach Push/Deploy live; Doku darf Production nicht als geprüft behaupten, solange nur lokal geprüft wurde

Nach Deploy:

- echte Production-Header/CSP prüfen
- `https://null-noise.vercel.app` aufrufen und Metadata/OpenGraph über die neue kanonische URL prüfen
- Canonical- und OpenGraph-URLs müssen direkt auf `https://null-noise.vercel.app` zeigen
- API-Cache-Header für JSON-Routen prüfen
- schreibende Live-Routen nur mit erwarteten Origin-/Rate-Limit-/Cookie-Regeln testen
- Vercel Preview und Production getrennt prüfen
- keine personenbezogenen Testdaten erzeugen

## Release-/Deploy-Check

Vor Commit/Deploy zusätzlich prüfen:

- sichtbare Release Notes, `/changelog` und Footer-Metadaten in `src/lib/release-info.ts` aktualisieren, bevor ein Push oder Vercel-Deploy vorbereitet wird
- Doku-Übergabe synchron halten: `docs/00-current/*`, `docs/20-testing/testing-and-release.md` und die jeweiligen Dateien in `docs/llm-upload/`
- relevante Footer-/Changelog-Tests anpassen, falls sichtbare Texte oder Release-Historie geändert wurden
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
Ziel: Vor Git-Push und Vercel-Deploy den aktuellen SMTP-Kontakt-/Release-Abschluss prüfen.
Bitte nichts pushen oder deployen ohne explizite Freigabe.
Prüfe git status/diff, Release Notes, Doku-Sync, Secrets/Artefakte,
Tests, mobile Viewports 390px/430px und danach die Vercel-Deploy-Bereitschaft.
```

## Kurze Sichtprüfung

- Erste Einschätzung sichtbar
- Gründe kurz
- keine Score-/Prozent-UI
- Header/Branding zeigt Icon-Logo plus Wortmarke auf Mobile und Desktop
- Header-Brand und Menübutton sind unabhängig vom Breakpoint an der Contentbreite ausgerichtet, nicht end-to-end am Viewport-Rand
- Logo/Wortmarke führt von Unterseiten zurück zur Startseite
- Mobile Header-App-Shell hat symmetrische Innenabstände; Logo und Wortmarke haben mobil im geschlossenen und geöffneten Header dieselbe Frame-Höhe und stabile Abstände
- Unter Reduced Motion darf keine dekorative Header- oder Menübewegung übrig bleiben
- Burger-Menü öffnet und schließt per Button, Link-Klick und Escape; Fokus bleibt sichtbar
- Burger-Menü enthält mobil nur Start, Suche und Erklärung/Hilfe; Barrierefreiheit, Datenschutz und Impressum stehen im Footer
- Burger-Menü liegt sichtbar über Seiteninhalt, Ergebnisgruppen und Detailkarten
- Startseite führt mit `Drei Richtungen. Schau, was neugierig macht.`
- genau drei gleichwertige Fundstücke erscheinen vor der direkten Suche
- Fundstücke zeigen Richtung und Text zusätzlich zu Farbe, Poster und Zeichen
- bei fehlenden TMDb-Daten bleiben drei sichtbare Richtungslinks erhalten
- Suche bleibt direkt erreichbar und folgt auf der Startseite dem Streifzug
- Safari/VoiceOver und der normale Tastaturpfad erreichen Sprunglinks, Brand, Menü, drei Fundstücke, Suche, Vertiefungslinks und Footer in derselben Dokumentreihenfolge
- der Fokusindikator bleibt kompakt und kontrastreich, liegt bei großen Link-Karten innen und bewegt das fokussierte Control nicht
- nach einmaliger Reload-Fokuswiederherstellung bleibt ein anschließend aktiv fokussiertes Control fokussiert
- Startseite, Suche mit und ohne Query sowie lokale und externe Detailseiten haben unterscheidbare, kontextbezogene Seitentitel
- das Preview-Gate startet bei Überschrift und Erklärung, statt per Autofokus direkt in das Passwortfeld zu springen
- Poster in vollständig beschrifteten Startseitenlinks werden vom Screenreader nicht doppelt angesagt
- `Ohne Titel stöbern` / `Auswahl zeigen` wirkt als Button-CTA mit Icon, nicht wie ein schwacher Textlink
- `Richtung starten` hat ausreichend Innenabstand; die drei Richtungen sind nicht nur über Farbe unterscheidbar
- sichtbare Richtungskacheln/Labels: `Eher ruhig`, `Eher wechselhaft`, `Eher intensiv`
- Browse-Cluster auf `/suche` haben jeweils Überschrift, sichtbares Textlabel, Beschreibung, echte Begrenzung und Listenstruktur
- Merken-/Gesehen-Bereich und Toggle umbrechen mobil sauber
- Result-Card-Aktionen `Details`, `Merken` und `Gesehen?` stehen mobil nebeneinander und bleiben fingerfreundlich
- getippte Suche zeigt weiterhin mehrere Treffer, auch wenn `Schon gesehene Titel hier ausblenden` lokal aktiv ist
- `/suche?q=&tone=all&kind=all` bleibt mobil im Browse-/Discovery-Zustand, ohne leere externe Suche, ohne schmale Cards und ohne linke Loader-Artefakte
- geöffnetes Mobile-Menü ist eine vollflächige Navigationsebene mit sichtbarem Schließen, Scroll-Lock, Fokusfalle, Fokus-Rückkehr zum Menübutton und kurzer Open-/Close-Transition
- Footer zeigt nur Buildnummer und Datum; die vollständige Release-Historie ist über `/changelog` erreichbar
- Detailseite zeigt mobil Poster und Synopsis, sofern Daten vorhanden sind
- fehlende Poster wirken als bewusste kompakte Platzhalter, nicht wie kaputte Bilder
- `Zurück zur Suche` wirkt wie ein Button mit Pfeil und bleibt tastaturbedienbar
- keine Console-Errors
- bei 320 CSS-Pixeln kein horizontaler Overflow
- bei 390px und 430px kein horizontaler Overflow; Touch-Ziele wirken fingerfreundlich
- `prefers-reduced-motion` bleibt respektiert
- Light, Dark-Präferenz ohne Themewechsel, Reduced Motion, Reduced Motion plus Dark-Präferenz, Forced Colors, Forced Colors plus Reduced Motion, 320/390/430x932 CSS-Pixel sowie 200/400 Prozent Zoom lokal prüfen
- Fuer Forced Colors zusaetzlich die Suchroute `/suche?view=grid&tone=calm&avoidPeaks=true` in Microsoft Edge unter macOS bei `430 x 932` CSS-Pixeln prüfen: bestehendes Header-Logo plus Wortmarke sichtbar, aktive Navigation/Buttons/Filter ohne labelgroße Zusatzfläche, `.result-card-footer-zone` innerhalb der Karte
- Windows High Contrast in Microsoft Edge unter Windows ist eine eigene manuelle Prüfung; Chromium-/Edge-macOS-Emulation nur als strukturellen und visuellen Smoke werten
- Ladezustände nur fuer echte Wartezeiten verwenden: Such-Soft-Navigation, Kontakt-Submit und Route-Loading; kein künstliches Delay, keine lauten Spinner, keine Skeleton-Flächen
- Screenreader-Status zu Ladezuständen knapp halten und nicht parallel mehrere große Live-Regionen ansagen lassen
- Mobile-Scrollgefühl nach Deploy auf echtem iPhone prüfen
