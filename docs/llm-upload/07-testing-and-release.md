# Testing und Release für null-noise

Stand: 10. Juli 2026

Diese Datei beschreibt, wie `null-noise` Accessibility testet und wo die Grenzen der Automatisierung liegen.

## Accessibility-/Poster-Performance-Pass 10. Juli 2026

- Suchvorschläge prüfen genau eine knappe `role="status"`-Meldung ohne verschachtelte äußere Live-Region. Der Kontakt-Zeichenzähler bleibt über `aria-describedby` verfügbar, kündigt aber nicht mehr jeden Tastendruck live an.
- Die Posterdiagnose auf `/suche?q=Arrival` ergab bei 430 und 1440 CSS-Pixeln jeweils ausschließlich sechs eindeutige `w342`-Requests. Externe Details fordern genau eine `w780`-Quelle an; responsive Next-Image-Varianten entstehen wegen der bestehenden `unoptimized`-Kosten-Notbremse nicht.
- Der Posterproxy akzeptiert nur `w185`, `w342`, `w500` und `w780`; `original` und verschachtelte Pfade werden vor einem Upstream-Request abgewiesen. Poster-Binärdaten werden weiterhin weder in Datenbank, Local Storage noch Repository gespeichert. Der Service Worker cached Poster weiterhin nicht.
- Die externe Detailseite rendert genau eine priorisierte `w780`-Posterinstanz; CSS hält sie mobil direkt nach der `h1` und desktop in der rechten Spalte. Alt-Text, feste Seitenverhältnisse, Fallbacks und Layoutstabilität bleiben erhalten.
- Bestanden: `npm run lint`, `npm run build`, gezielt `npx vitest run src/lib/metadata-spike.test.ts src/app/api/poster/tmdb/[...path]/route.test.ts --maxWorkers=1` (2 Dateien / 21 Tests), gezielte Playwright-Regressionen, `npm run test:axe-core` (6 Tests), `npm run test:a11y` (67 Tests), `npm run test:wcag22-aa` (5 bestanden / 1 explorativer AAA-Test übersprungen) und `git diff --check`.
- Blockiert: `npm run test:unit` stoppt ohne `NULL_NOISE_TEST_DATABASE_URL` vor Migration und Vitest. Keine ENV- oder Datenbankänderung wurde vorgenommen.

## Visueller Regression-Fix 5. Juli 2026

- Card-Regression prüft Grid und Liste bei 320/390/430/1440 CSS-Pixeln auf Kartenbegrenzung, Überlagerung, lange Inhalte, Touch-Ziele und eine praktisch nutzbare Statusbreite von mindestens 120 CSS-Pixeln.
- Desktop-Regression prüft die zweispaltige Übersicht/Filter-Zeile, vollbreite Ergebnisgruppen darunter und mindestens drei responsive Kartenspalten bei 1440 CSS-Pixeln.
- Hero-Regression prüft bei 1440 CSS-Pixeln drei bis vier Claim-Zeilen und höchstens 64 CSS-Pixel Abstand zwischen Hero und Footer. Direct Starts enthalten keinen separaten Pfeil mehr.
- 15 Full-Page-Screenshots wurden außerhalb des Repositories für `/`, `/suche`, `/suche?q=Arrival` bei 320/390/430/1440/1920 CSS-Pixeln erzeugt und visuell geprüft. Das sichtbare schwarze `N` ist der Next.js-Dev-Tools-Launcher und nicht Teil der Production-UI.
- Bestanden: Lint, Build, Unit (18 Dateien / 99 Tests), Axe-Core (6 Tests), A11y (66 Tests), WCAG 2.2 AA (5 bestanden / 1 erwartungsgemäß übersprungen) und `git diff --check`.

## Manueller UI-Befund-Pass 5. Juli 2026

- Ergebnis-Card-Regression prüft CTA, Poster, Einschätzung, Footer und lokale Aktionen mit langen Inhalten in Karten- und Listenansicht bei 320, 390 und 430 CSS-Pixeln einschließlich Touch-Zielhöhe und Clipping.
- Direct-Start-Regression prüft drei getrennte Zustandsattribute, sichtbare Zeichen und unterschiedliche Rahmenmuster; Forced Colors behält Struktur und aktiven Zustand.
- Der externe Detailpfad prüft `Lokal anlegen` als nativen POST-Formularbereich mit eindeutigem Button und genau einer kurzen TMDb-Erklärung, ohne im Test zu submitten.
- Die Startseite prüft den Claim genau einmal als `h1`; 320 CSS-Pixel, 200 Prozent Text, Text-Spacing, Reduced Motion, Forced Colors und Dark-Präferenz ohne Themewechsel blieben stabil.
- Bestanden: `npm run lint`, `npm run build`, `npm run test:unit` (18 Dateien / 99 Tests), `npm run test:axe-core` (6 Tests), `npm run test:a11y` (64 Tests), `npm run test:wcag22-aa` (5 bestanden / 1 erwartungsgemäß übersprungen) und `git diff --check`.

## Lokaler Deploy-Sicherheits-Pass 5. Juli 2026

- `src/app/mobile-system.css` und sein Import in `src/app/layout.tsx` gehören zum vorgesehenen Diff-Scope.
- Der Read-only-Titelimport wird vor Salt-/Hash-, Rate-Limit- und Datenbankzugriff beendet; aktivierte Writes ohne Salt liefern einen kontrollierten Fehler ohne DB-Mutation.
- Die Service-Worker-Aktivierung behält den aktuellen Cache, entfernt nur ältere eigene `null-noise-*`-Caches und lässt fremde Cache-Namen bestehen. Das lokale Unregister-Verhalten bleibt erhalten.
- Das Impressum bleibt für die geschlossene Beta unverändert und ist für diesen technischen Pass kein Blocker.
- Gezielte Unit-Regressionen decken die drei Import-Konfigurationsfälle sowie Production- und Localhost-Cache-Aktivierung ab.

## Live-Abschluss 14. Juni 2026

- Production ist live auf `https://null-noise-3evwpfel5-deresjots-projects.vercel.app`, aliased auf `https://www.null-noise.de`; Apex `https://null-noise.de/` redirectet per `308` auf die www-Domain.
- Finaler gepushter Stand: `cc5ee52 fix: generate prisma client during build`.
- Hotfix-Ursache: Vercel verwendete aus dem Build-Cache einen alten Prisma Client mit SQLite-Provider. Das Build-Script läuft jetzt als `prisma generate && next build`.
- Katalog-Bootstrap ist cold-start-schonender: vorhandene Seed-Titel mit Aggregaten werden erkannt, bevor die Seed-Transaktion gestartet wird.
- Live-Smoke bestanden: Kernseiten, `/api/titles`, `/api/titles/mondfenster`, `/api/search/suggestions?q=Arrival` und `/api/search/page-state?q=Arrival`.
- Schreib-Smoke bestanden: langsamer Rating-Submit auf `/titel/mondfenster` ergab `rating=success`; direkter Folgesubmit ergab `rating=too-fast`, nicht `rating=error`.
- Kontakt-Smoke: `/kontakt` und Formular sichtbar; keine echte Mail gesendet.
- Keine ENV-Änderung, keine Migration, kein weiterer Seed-Lauf im Abschluss.
- Offen: Full Accessibility-Suite nach den finalen Hotfixes erneut laufen lassen.

## Mobile-iOS-Fokus-/Safe-Area-Pass 14. Juni 2026

- Routewechsel setzen Fokus auf den neuen Hauptinhalt und starten oben; Hash-Ziele für Feedback-/Statusbereiche bleiben gezielt erreichbar.
- Sticky-Header-Offsets schützen `main`, Überschriften, Statusbereiche und Detail-Zurücklinks vor Überdeckung.
- Kontakt-Fehler- und Erfolgsmeldungen erhalten sichtbar Fokus; Submit-Button und Seitenende haben zusätzliche iOS-Safe-Area-Abstände.
- Mobile-Menü fokussiert beim Öffnen den ersten Navigationslink und gibt Fokus per Escape an den Menübutton zurück.
- `npm run test:a11y` enthält einen iPhone-Pro-Max-Smoke mit `430 x 932` CSS-Pixeln, Touch, Mobile-Safari-User-Agent, Header-Überdeckung, Kontakt-Bottom-Actions, Detail-Reihenfolge und Overflow-Checks.

## Ziel

Accessibility wird in `null-noise` nicht über eine einzelne Konformitätsaussage abgesichert, sondern über einen kleinen, wiederholbaren Prüfpfad:

1. automatisierte Browser-Prüfung
2. gezielte Interaktions-Checks
3. manuelle Prüfung vor Release

WCAG 2.2 Level AA ist der technische Zielstandard. Die Prüfung orientiert sich zusätzlich an den Prüfansätzen des BITV-Testverfahrens. Automatisierte Tests decken nur einen Teil der Anforderungen ab. Für reale Nutzbarkeit und eine belastbare Konformitätsbewertung bleiben manuelle Prüfungen verpflichtend.

## Darstellungsmodi 19. Juni 2026

- Reduced Motion wurde repariert: Ursache war eine zu frühe globale Absicherung, die durch spätere CSS-Blöcke für Mobile-Menü, Preview-Gate, Search-Transitions, Loader und Navigationsfortschritt wieder überschrieben wurde.
- Automatisierte Playwright-Checks emulieren `reducedMotion: "reduce"` und prüfen berechnete Styles statt nur das Vorhandensein der Media Query.
- Stand 20. Juni 2026: `prefers-color-scheme: dark` darf die Produktoberfläche nicht mehr automatisch dunkel färben; Playwright prüft, dass die normale Light-Darstellung trotz Dark-Präferenz stabil bleibt.
- Forced Colors wird, soweit Playwright/Chromium das zuverlässig emulieren kann, strukturell geprüft: vorhandene `forced-colors`-Regeln, Systemfarben, sichtbare Rahmen/Fokuszustände und keine unnötige Verwendung von `forced-color-adjust: none`.
- Fuer die Forced-Colors-Korrektur vom 19. Juni 2026 wurde Microsoft Edge unter macOS mit `forcedColors: active` auf `/suche?view=grid&tone=calm&avoidPeaks=true` visuell geprüft: bestehendes Brand-Logo plus Wortmarke sichtbar, aktive Navigation/Buttons/Filter ohne labelgroße Zusatzfläche, `.result-card-footer-zone` innerhalb der Karte.
- Eine echte manuelle Windows-High-Contrast-Prüfung in Microsoft Edge unter Windows bleibt separat nachzuholen; automatische Emulation und Edge/macOS-Smoke ersetzen diese Prüfung nicht.

## Automatisierte Tests

### Aktueller Stack

- Playwright
- `@axe-core/playwright`
- direkter `axe-core`-Lauf über injiziertes `axe.min.js`

### Aktuell abgedeckte Kernrouten

- `/`
- `/suche`
- `/suche?q=Arrival`
- `/titel/mondfenster`
- `/erklaerung`
- `/bedienung`
- `/barrierefreiheit`
- `/kontakt`
- `/datenschutz`
- `/impressum`

### Was die automatisierten Tests derzeit prüfen

- Axe-Checks auf den Kernrouten über zwei Pfade:
  - `@axe-core/playwright` für den integrierten Browser-Check
  - direkter `axe-core`-Lauf, der `axe.min.js` explizit in die Seite injiziert und `axe.run()` ausführt
- Severity-Ausgabe nach `critical`, `serious`, `moderate`, `minor`
- technische WCAG-2.2-A/AA-Matrix über `npm run test:wcag22-aa`, die alle A/AA-Erfolgskriterien erfasst und pro Kriterium wiederholbare automatisierte Checks oder Feature-N/A-Evidence dokumentiert; `npm run test:wcag22-aaa` erweitert denselben technischen Lauf explorativ um AAA, ohne reine AAA-Findings zur AA-Release-Gate zu machen
- Landmarken- und Heading-Struktur
- Kontrast-Fundstellen, die axe erkennen kann
- erkennbare Form-/Label-Probleme
- Kontaktformular-Smokes für sichtbare Labels, `aria-describedby`, optionale Antwort-E-Mail, Pflichtnachricht, Fehlerzusammenfassung, Feldfehler, Statusmeldung, Tastaturfluss, Reflow, Text-Spacing und Target Size
- Loader-Smokes fuer echte Pending-Zustände: Kontakt-Submit, Such-Soft-Navigation, knappe Live-Statusmeldung und deaktivierte dekorative Bewegung unter `prefers-reduced-motion`
- Preview-Gate-Smoke: Teaser-Landingpage ohne App-Header, zentriertes Logo, falsches Passwort mit Fehlermeldung und Unlock mit `preview`
- globaler Navigationsloader-Smoke: `Seite lädt ...` bleibt sichtbar, solange Route-Daten ausstehen, und ist unter `prefers-reduced-motion` statisch
- Darstellungsmodus-Smokes: Reduced Motion ohne dekorative Animationen/Transitions, Dark-Präferenz ohne automatischen Themewechsel und strukturelle Forced-Colors-Checks
- Cluster-Smoke: `Eher ruhig`, `Eher wechselhaft`, `Eher intensiv` sind sichtbare, semantisch getrennte Bereiche mit Überschrift, Label, Beschreibung und Ergebnislisten; bei `320 CSS-Pixeln` entsteht kein horizontales Overflow
- Mobile-Suche-Smokes fuer `/suche?q=&tone=all&kind=all`: Browse-Zustand statt kaputtem Mischzustand, vollflächige Mobile-Navigation mit Fokusführung, volle Card-Breite, sekundärer Footer und keine linken Loader-Artefakte
- Mobile-Detail-Smoke: lokale und externe Detailseiten zeigen genau ein sichtbares Detailposter direkt unter der `h1` und vor dem ersten Einschätzungsblock
- Mobile-Card-Smoke: Result-Card-Aktionen und Merken/Gesehen-Zonen liegen in der Textspalte und überlagern Poster nicht
- Local-Shelf-Smoke: Nur befüllte `Für später`-/`Schon gesehen`-Gruppen werden gerendert; eine einzelne Gruppe nutzt die volle Shelf-Breite
- Image-Usage-Smoke: TMDb-Poster sollen keine unnötig breiten Varianten anfordern; Kartenposter nutzen Thumbnail-`sizes`, Detailposter begrenzte Quellgrößen, Poster-Fallbacks und Alt-Texte bleiben erhalten
- wiederholbare Keyboard-Smoke-Checks, zum Beispiel Skip-Link und erreichbare Suchvorschläge
- mobile Navigation mit Burger-Menü für primäre App-Ziele; Logo und Wortmarke bleiben im geschlossenen und geöffneten mobilen Header gleich hoch, stabil ausgerichtet und mit engerem Abstand sichtbar
- Mobile-Menü-Transition-Smoke: Öffnen und Schließen nutzt `data-state="open"`/`"closing"` mit kurzer visueller Transition; unter `prefers-reduced-motion: reduce` ist keine dekorative Animation aktiv.
- Footer-/Changelog-Smoke: Footer zeigt nur aktuelle Buildnummer plus Datum und verlinkt auf `/changelog`; die Changelog-Seite rendert die vollständige vorhandene Release-Historie mit nativen `details`-/`summary`-Einträgen.
- Detail-Feedback-Smoke: Bewertungsfeedback wird inline gesendet, Erfolg oder Fehler erhält Fokus, Status ist als `status`/`alert` wahrnehmbar und der No-JS-Redirect-Fallback bleibt erhalten.
- kleiner Reflow-Smoke-Test auf den Kernrouten bei `320 CSS-Pixeln`, damit offensichtliches horizontales Overflow früh auffällt
- gezielter Mobile-Viewport-Smoke bei `390 CSS-Pixeln` und `430 CSS-Pixeln`: Menü im Viewport, opake Menüfläche, gemeinsame Content-Breite von Header/Menü/Main, Touch-Ziel-Höhen und entdichtete Kartenaktionen
- verschärfter Mobile-Bounds-Smoke bei `320`, `390` und `430 CSS-Pixeln`: zentrale Cards, Formulare, WCAG-Matrix, Status-Badges, Footer-Releasebereiche und Navigation müssen mit ihrer Bounding-Box innerhalb des Viewports bleiben
- iPhone-Pro-Max-Smoke bei `430 x 932` CSS-Pixeln mit Touch und Mobile-Safari-User-Agent: Header darf Fokusziele nicht überdecken, Routewechsel starten oben, Kontakt-Submit bleibt mit Safe-Area-Abstand erreichbar, Mobile-Menü setzt Fokus sauber und Detailseiten behalten Poster/Einschätzung in der erwarteten Reihenfolge
- Unit-Kalibrierung für Evidence Engine v2: dünne Datenlage, widersprüchliche Metadaten, Relief, Genre-only, emotionale Last ohne sensorische Dichte und deterministische TMDb-Browse-Diversität
- Unit-Checks für situative Discovery-Copy: Browse-Mix-Namen, Nicht-jetzt-Sprache, keine sichtbaren Scores/Prozentwerte/Rankings und keine personalisierte Empfehlungssprache

Diese automatisierten Prüfungen helfen besonders bei wiederholbaren Prüffeldern aus dem BITV-/WCAG-Kontext, etwa Struktur, Kontrast, Tastaturzugänglichkeit und Robustheit. Sie stärken die Regression-Absicherung, ersetzen aber keine vollständige manuelle Bewertung und keine abschließende WCAG-Konformitätsaussage.

### Warum Severity-Buckets im Projekt wichtig sind

Die Aufteilung nach Schweregrad hilft, Diskussion und Behebung zu trennen:

- `critical`: blockierende, gravierende Probleme
- `serious`: deutliche Nutzungsbarrieren mit hohem Risiko
- `moderate`: relevante Struktur- oder Robustheitsprobleme
- `minor`: kleinere, aber dennoch echte Mängel

Für `null-noise` gilt: Die Buckets sind Diagnosehilfe, nicht Freibrief. Auch `moderate`-Probleme können im Produktfluss störend sein.

## Was automatisiert nicht zuverlässig erfasst wird

Automatisierte Tests sind nötig, aber nicht ausreichend. Sie erfassen zum Beispiel nicht zuverlässig:

- ob die erste Einschätzung wirklich verständlich und entlastend formuliert ist
- ob Unsicherheit sprachlich ehrlich wirkt
- ob ein Screenreader-Fluss insgesamt ruhig und sinnvoll wirkt
- ob Interaktionen unter Stress, Müdigkeit oder kognitiver Last nachvollziehbar bleiben
- ob Fokus visuell wirklich gut auffällt und nicht nur technisch vorhanden ist
- ob eine Erklärung hilfreich ist oder nur formal existiert
- ob ein Bild-`alt` inhaltlich passend und nicht nur technisch vorhanden ist

## Manuelle Tests, die weiterhin Pflicht bleiben

## Manueller Prüfpfad für die Kernrouten

Die folgenden Schritte sind der feste manuelle Prüfpfad für `null-noise`. Er ergänzt die automatisierten Tests und wird nicht durch sie ersetzt.

### Route `/`

- per Tastatur: Skip-Link, Brand-Link, Hauptnavigation, Suchfeld, Submit-Button, Footer-Links
- Fokus: gut sichtbarer Einstieg auf Skip-Link und Hauptnavigation
- Screenreader-Smoke: Hauptüberschrift, Suchformular und Footer-Navigation bleiben klar benannt
- Reflow: Hero, Sucheinstieg und Footer bleiben bei `320 CSS-Pixeln` ohne Seitwärts-Orientierung nutzbar
- Zoom: bei `400 %` bleibt die Suche erreichbar und der Footer auffindbar
- Verständlichkeit: `Was passt gerade?`, kurze Startseiten-Erklärung, Claim, Sucheinstieg und Beta-Hinweis bleiben kurz und ruhig
- Branding: Icon-Logo und Wortmarke sind auf Mobile und Desktop gemeinsam sichtbar

### Route `/suche`

- per Tastatur: Suchfeld, zwei Selects, zwei Checkboxen, Browse-Refresh, Kartenlinks und Footer
- Fokus: keine verlorenen Fokuszustände zwischen Sidebar, Browse-Bereich und Karten
- Screenreader-Smoke: `Noch kein Titel im Kopf?`, Bereichsüberschriften und Karten-CTAs bleiben verständlich
- Reflow: Filter und Karten stapeln sauber statt horizontal auszuweichen
- Zoom: Browse-Einstieg und Filter bleiben in sinnvoller Reihenfolge
- Verständlichkeit: Browse-Texte bleiben Orientierungshilfe und werden nicht zur zweiten Erklärungsebene
- Discovery-Sprache: keine Formulierungen wie `Empfohlen für dich` oder `Heute passend`; `Kann gerade zu dicht sein` bleibt situativ statt wertend
- Lokaler Merken-/Gesehen-Bereich: Text, Buttons und Toggle/Checkbox brechen mobil sauber um; Label und Checkbox bleiben sichtbar zusammengehörig
- Poster: fehlende Poster zeigen den bewussten Platzhalter `Kein Poster verfügbar`
- Labels: sichtbare Kategorien lauten konsistent `Eher ruhig`, `Eher wechselhaft`, `Eher intensiv`
- Leere Query-URLs wie `/suche?q=&tone=all&kind=all` verhalten sich wie Browse/Discovery und lösen keine leere Titelsuche aus

### Route `/suche?q=Arrival`

- per Tastatur: Suchänderung, Filter, lokale und externe Treffer, Karten-CTAs
- Fokus: keine Sprünge zwischen `Eigener Stand`, `Weitere Titel` und Suchmodul
- Screenreader-Smoke: Trefferüberschrift, Gruppenkontext und CTA-Beschriftungen bleiben unterscheidbar
- Reflow: Treffergruppen bleiben lesbar, auch wenn Poster und Text untereinander stehen
- Zoom: Ergebnisgruppen bleiben als getrennte Bereiche erkennbar
- Verständlichkeit: Suchhinweis, Gruppenlogik und erste Einschätzung bleiben knapp und nicht überladen
- Kartenstatus: situative Labels bleiben Vorschau und führen keine Rankings, Scores oder Prozentwerte ein

### Route `/titel/mondfenster`

- per Tastatur: Erste Einschätzung, `Passt das gerade?`, `Worauf basiert das?`, Feedbackblock, Folgeblöcke, Footer
- Fokus: Disclosure, Bewertungsbuttons und Footer-Links bleiben klar markiert
- Screenreader-Smoke: Überschriftenhierarchie, Disclosure-Zustand und Formularbeschriftungen bleiben schlüssig
- Reflow: Hero, Profilschalen, Kontextblöcke und Feedbackbereich stapeln ohne Seitwärts-Scrollen
- Zoom: Erste Einschätzung und Entscheidungsfrage bleiben als erste Orientierung sichtbar
- Verständlichkeit: Die Seite liest sich als ruhige Entscheidungshilfe und nicht als Analysedashboard
- Evidence-Disclosure: `Spricht eher dafür`, `Kann dagegen sprechen` und `Datenlage` bleiben kurz, tastaturbedienbar und ohne technische Metriktabelle
- Mobile: Poster und Synopsis bleiben sichtbar, sofern Daten vorhanden sind; Poster skaliert groß, Fallbacks bleiben kompakt

### Info- und Legal-Routen

- Routen: `/erklaerung`, `/bedienung`, `/barrierefreiheit`, `/kontakt`, `/datenschutz`, `/impressum`, `/changelog`
- per Tastatur: Header, mobile Navigation, Inhaltslinks und Footer-Links bleiben erreichbar
- Reflow: lange Überschriften und Rechtstexte bleiben bei kleiner Breite lesbar
- Kontrast: Notizen, Definitionslisten und Meta-Texte dürfen nicht nur knapp über Animation/Opacity lesbar sein
- Mobile: Kartenabstände und Footer dürfen nicht an Außenkanten kleben
- Mobile-Menü: geöffnetes Menü ist vollflächig, scroll-lockt die Seite, hält Fokus in der Navigation, zeigt keine helle Randspalte, trennt aktive Route sichtbar vom Tastatur-Fokus und animiert nur, wenn Reduced Motion nicht aktiv ist
- Changelog: vollständige Release-Historie bleibt per Tastatur und Screenreader über native `details`-/`summary`-Elemente erreichbar

### Route `/kontakt`

- per Tastatur: Skip-Link, Footer-Link, optionales E-Mail-Feld, Nachrichtenfeld, Submit-Button, Fehlerzusammenfassung und Erfolgsmeldung
- Fokus: Fehlerzusammenfassung und Erfolgsmeldung erhalten nach Submit sichtbar Fokus
- Screenreader-Smoke: Labels, Hilfetexte, Feldfehler, Fehlerzusammenfassung und Statusmeldung bleiben verständlich erfassbar
- Reflow: Formularfelder, Hinweise und Statusboxen bleiben bei `320 CSS-Pixeln` ohne Seitwärts-Scrollen nutzbar
- Zoom: bei `400 %` bleiben Pflicht-/Optional-Hinweise, Fehler und Submit-Button in sinnvoller Reihenfolge
- Datenschutz: Nachricht ist Pflichtfeld, E-Mail ist optional; keine Captcha-, Tracking-, Profil-, Account- oder projektinterne Nachrichtenspeicherung
- Grenze: Kontakt wird serverseitig per SMTP verschickt; Production ohne SMTP-Env muss einen sichtbaren generischen Versandfehler statt falscher Erfolgsmeldung zeigen

### Tastatur

- kompletter Flow ohne Maus
- sinnvolle Tab-Reihenfolge
- sichtbarer Fokus auf allen interaktiven Elementen
- kein Dead-End in Disclosure, Formular oder Suchvorschlägen

### Screenreader

- VoiceOver oder NVDA als Smoke-Test
- Überschriftenstruktur
- Landmarken
- Formularbeschriftungen
- Statusmeldungen und Rückmeldungen

### Reflow und Zoom

- 320 CSS-Pixel Breite
- 400 Prozent Zoom
- keine abgeschnittenen Inhalte
- keine verdeckten Aktionen

### Bewegung und Zustandswechsel

- `prefers-reduced-motion`
- sanfte Zustandswechsel sind erlaubt, solange sie kurz bleiben und keine Information verdecken
- unter `prefers-reduced-motion: reduce`: kein animiertes Scrollen, keine Transform-, Opacity- oder Größenanimation, keine laufenden View-Transition-/Loader-Animationen
- Entry-Animationen dürfen Text nicht über Opacity abblenden, wenn dadurch Kontrastprüfungen oder reale Lesbarkeit leiden
- Ladezustände sind nur als dezente Überbrückung echter Wartezeiten gedacht und dürfen keinen Inhalt ersetzen
- Loader brauchen sichtbaren Text, knappe Screenreader-Rückmeldung und dürfen keine künstliche Wartezeit erzeugen
- Loader müssen visuell wahrnehmbar sein, zum Beispiel als klare Statusbox mit Text und Indikator; unter `prefers-reduced-motion` bleibt der Indikator statisch
- keine Hilfe, die nur flüchtig eingeblendet wird

### Lokale Testmatrix Darstellungsmodi

Auf localhost prüfen:

- Light Mode
- Dark-Präferenz ohne automatischen Themewechsel
- Reduced Motion
- Dark-Präferenz plus Reduced Motion
- Forced Colors/Windows High Contrast in Microsoft Edge unter Windows
- Forced Colors plus Reduced Motion
- Edge/macOS-Forced-Colors-Smoke auf `/suche?view=grid&tone=calm&avoidPeaks=true` bei `430 x 932 CSS-Pixel`
- Mobile `320 CSS-Pixel`
- Mobile `390 CSS-Pixel`
- Mobile `430 x 932 CSS-Pixel`
- Browserzoom `200 %`
- Browserzoom `400 %`

Dabei prüfen: Hintergrund, Text, Links/besuchte Links, Fokus/Skip-Link, aktive Route, Hover, ausgewählte Filter, Checkboxen, Selects, Inputs, Buttons, deaktivierte Buttons, Lade-/Fehler-/Erfolgsmeldungen, Mobile-Menü, Kategorie-Cluster, Poster/Fallbacks, `details`/`summary`, Header, Footer, Preview-Gate, Kontaktformular, Suchseite und Detailseite.

### Verständlichkeit

- Erste Einschätzung in Alltagssprache
- Entscheidungsfrage "Passt das gerade?" in 1 bis 2 kurzen Sätzen
- Sekundärinfos bleiben sekundär
- Unsicherheit bleibt sichtbar und wird nicht in scheinpräzise Sicherheit umformuliert

## Release-Mindeststandard

Vor einem Beta-Release oder Deploy sollten mindestens diese Schritte laufen:

1. sichtbare Release Notes, `/changelog` und Footer-Metadaten in `src/lib/release-info.ts` aktualisieren
2. Doku-Übergabe synchronisieren: `docs/00-current/*`, diese Datei und die passenden `docs/llm-upload/*`
3. relevante Footer-/Changelog-Tests anpassen, wenn sichtbare Texte geändert wurden
4. `git status --short` und `git diff --name-only` prüfen
5. `npm run lint`
6. `npm run build`
7. `npm run test:unit`
8. `npm run test:axe-core`
9. `npm run test:a11y`
10. eine reine Tastatur-Session
11. ein Screenreader-Smoke-Test
12. Reflow-/Zoom-Check auf kleiner Breite
13. Mobile-Viewport-Check bei ca. `390px` und `430px`
14. keine Console-Errors
15. keine Score-/Prozent-UI
16. Mobile-Scrollgefühl nach Deploy auf echtem iPhone prüfen
17. Header-Branding, mobile Burger-Navigation, Startseiten-Erklärung, mobile Ergebniskarten, Merken-/Gesehen-Toggle, Detailposter/Synopsis und Poster-Fallbacks auf kleinem Viewport prüfen
18. Vercel Image Optimization Usage prüfen: Image Cache Writes beobachten, keine unnötigen neuen TMDb-Postervarianten erzeugen, `sizes`/TTL/Poster-Quellgrößen vor Deploy gegen den tatsächlichen UI-Bedarf prüfen

Optional, wenn der Umfang es rechtfertigt:

- `npx playwright test`

## Letzter lokaler Stand vor Übergabe

Beta-UI-Hardening vom 5. Juli 2026: Release-Kandidat `0.8.5-beta-ui-hardening.20260705`; Lint, Production-Build, 99 Unit-Tests mit separater Testdatenbank, 6 direkte axe-core-Tests, 66 A11y-Tests, WCAG-2.2-AA-Matrix und `git diff --check` bestanden.

Postgres-Vorbereitung vom 14. Juni 2026: lokal vorbereitet, nicht committed, nicht gepusht, nicht deployed.

- Release Notes stehen lokal auf `0.8.4-postgres-prep.20260614`
- Prisma Postgres ist in Vercel verbunden; `DATABASE_URL`, `PRISMA_DATABASE_URL` und `POSTGRES_URL` existieren fuer Production, Preview und Development, ohne dass Werte dokumentiert werden
- `.env.development.local` wurde lokal per Vercel-ENV-Pull erzeugt, bleibt gitignored und darf nicht in den Diff
- `.env.test.local` stellt lokal eine separate Test-DB bereit, bleibt gitignored und darf nicht in den Diff; Werte nie ausgeben
- `prisma/schema.prisma` steht lokal auf PostgreSQL
- Migration `20260614092921_init_postgres` wurde erzeugt und nur gegen die Vercel-Development-DB angewendet; keine Production-Migration
- Migration `20260614092921_init_postgres` wurde zusaetzlich gegen die separate Test-DB angewendet; keine Seed-Daten
- Normale DB-Scripts nutzen lokal Prisma-Migrate-/Postgres-Kommandos statt SQLite-Bootstrap als Standardpfad
- `npm run test:unit` verlangt jetzt `NULL_NOISE_TEST_DATABASE_URL` fuer eine separate, wegwerfbare Prisma-Postgres-Testdatenbank; mit der lokalen Test-DB bestanden 16 Dateien / 94 Tests
- Der globale Navigationsloader bleibt im inaktiven Zustand `visibility: hidden`, damit Axe keinen transparenten Ladehinweis als Kontrastfehler bewertet
- Lokale Checks bestanden: `npm run test:unit`, `npm run lint`, `npm run build`, `npm run test:axe-core`, `npm run test:a11y`, `npm run test:wcag22-aa`, `git diff --check`
- `NULL_NOISE_ENABLE_WRITES` wurde nicht aktiviert oder geändert; Production-Writes bleiben inaktiv

Image-Cache-Kostenpass vom 13. Juni 2026: lokal umgesetzt, nicht committed, nicht gepusht, nicht deployed.

- Release Notes stehen lokal auf `0.8.4-image-cache-costs.20260613`
- Vercel Image Optimization Cache Writes wurden lokal als Kostenrisiko dokumentiert
- `next.config.ts` setzt lokal eine 31-Tage-`minimumCacheTTL` und enger begrenzte Image-Size-Listen
- TMDb-Posterproxy cached Poster lokal mit 31 Tagen statt 24 Stunden
- Such-/Browse-Karten nutzen thumbnail-realistische `sizes`; Detailposter nutzen `w780` statt `original`
- Harte `unoptimized`-Umstellung ist nicht umgesetzt und bleibt nur eine spätere Notbremse, falls Usage weiter steigt
- DB-/Postgres-Umstellung ist nun lokal vorbereitet; keine Production-Migration, keine aktivierten Production-Writes, Unit-Tests erst mit separater `NULL_NOISE_TEST_DATABASE_URL` gruen laufen lassen

Preview-Gate-/Mobile-Polish-Abschluss vom 13. Juni 2026: für Commit, Push und Vercel-Deploy freigegeben.

- Release Notes stehen auf `0.8.4-preview-gate-mobile-polish.20260613`
- Clientseitiger Preview-Gate vor der App: Teaser-Landingpage mit Logo, Projektbeschreibung, Passwortfeld und Phrase `preview`; keine Security-Grenze
- Playwright setzt standardmäßig `null-noise-preview-unlocked=true`, damit App-Smokes die eigentlichen Routen prüfen; der Preview-Gate selbst hat einen separaten Test ohne Storage-State
- Globale Navigation zeigt bei ausstehenden Route-Data-Fetches einen sichtbaren `Seite lädt ...`-Indikator und respektiert `prefers-reduced-motion`
- Mobile Detailseiten setzen das Poster direkt unter die `h1`; externe Metadaten-Detailseiten haben dafür eine mobile Poster-Instanz und blenden das Callout-Poster mobil aus
- Mobile Result-Card-Aktionen überlagern Poster nicht mehr
- `search-local-shelf` rendert nur befüllte Gruppen; ein alleiniger `Schon gesehen`-Bereich nutzt die volle Breite

Mobile-Suche-/Loader-Reparatur vom 13. Juni 2026: im selben Abschluss enthalten.

- damalige Release Notes: `0.8.4-mobile-search-repair.20260613`; aktueller Abschluss ist `0.8.4-preview-gate-mobile-polish.20260613`
- `/suche?q=&tone=all&kind=all` bleibt Browse-/Discovery-Zustand und erzeugt keine leere TMDb-Suche
- Mobile-Menü ist kompakt und innerhalb der Contentbreite; Menübutton-Fokus bleibt sichtbar, aber proportional
- mobile Result-Cards nutzen die verfügbare Breite, reduzieren Poster-Dominanz und behalten Actions mit Text
- Footer-/Release-Info bleibt sichtbar, aber mobil sekundärer
- Loader haben eine deutlichere Statusbox mit Text/Indikator; Reduced Motion bleibt statisch
- linke Viewport-Artefakte durch isolierte Loader-Dots sind über Layout-/Loader-Checks abgesichert

Loader-/Impressums-Wartung vom 13. Juni 2026: im Preview-Gate-/Mobile-Polish-Abschluss enthalten.

- damalige Release Notes: `0.8.4-quiet-loading.20260613`; aktueller Abschluss ist `0.8.4-preview-gate-mobile-polish.20260613`
- `LoadingState` bündelt ruhige Ladezustände fuer Suche, Kontaktformular und App-Route-Loading
- Such-Soft-Navigation meldet Pending über eine knappe Live-Statusmeldung und einen sichtbaren Inline-Status, ohne den Ergebnisbereich als breite Live-Region zu verwenden
- Kontakt-Submit zeigt einen ruhigen Sendestatus, bleibt gegen Doppel-Submit geschützt und erzeugt keine künstliche Wartezeit
- Route-Loading fuer App-Shell, Titel-Detail und Metadaten-Spike ist vorhanden
- Impressum zeigt die kanonische Domain `www.null-noise.de` und die sichtbare Kontaktadresse `hallo@null-noise.de`; die ladungsfähige Anschrift bleibt rechtlich zu prüfen
- lokale Abschlusschecks fuer diesen Stand werden nach Doku-Sync ausgeführt und in der Übergabe dokumentiert

Produktionsdomain-Umstellung vom 13. Juni 2026: lokal umgesetzt, gepusht und nach Vercel Production deployt.

- Domain-Stand: `https://www.null-noise.de` ist kanonisch; `https://null-noise.de` leitet in Vercel per `308 Permanent Redirect` auf `https://www.null-noise.de`; `https://null-noise.vercel.app` bleibt nur technische, nicht-kanonische Vercel-Projektadresse
- DNS bei hosting.de: `null-noise.de A 216.198.79.1`; `www.null-noise.de CNAME 8bb5d957d3dbq7.vercel-dns-017.com`
- Production-Env: `NEXT_PUBLIC_SITE_URL=https://www.null-noise.de`, `CONTACT_TO_EMAIL=hallo@null-noise.de`, `CONTACT_FROM_EMAIL=mail@sebastianjansen.com`, `SMTP_HOST=mail.hosting.de`, `SMTP_PORT=587`, `SMTP_SECURE=false`, `SMTP_USER=mail@sebastianjansen.com`, `SMTP_PASSWORD=<set-secret>`, `NULL_NOISE_RATE_LIMIT_SALT=<set-secret>`, `TMDB_READ_ACCESS_TOKEN=<set-secret>`
- Vercel Environment Variables gelten nicht rückwirkend für alte Deployments; nach ENV-Anpassungen oder Codeänderungen ist ein neuer Production-Deploy nötig
- Kontaktformular: serverseitiger SMTP-Versand per Nodemailer; keine Adminroute, keine Datenbank, keine temporäre Datei und kein Blob-Speicher fuer Kontaktanfragen
- Datenschutz: Nachricht und optionale E-Mail werden zur Bearbeitung verarbeitet; keine IP-/User-Agent-Ablage fuer Kontaktanfragen
- damaliger Release-Notes-Stand: `0.8.4-production-domain.20260613`
- lokale Abschlusschecks: `npm ci`, `npm run lint`, `npm run test:unit`, `npm run build`, `npm run test:a11y`, `npm run test:axe-core`, `npm run test:wcag22-aa`, `npm run test:wcag22-aaa`, `npx playwright test`, `git diff --check`
- Live-Smoke: `/`, `/kontakt`, `/datenschutz`, `/impressum` erreichbar; Kontaktformular zeigte Erfolgsmeldung; mobile Breiten 320/390/430 ohne horizontalen Overflow
- bekannte Warnungen in Browserläufen: bestehende Hydration-/LCP-Hinweise aus Route-Smokes; keine Kontakt-SMTP-Regression

WCAG-/Mobile-Lighthouse-Prüfung vom 5. Juni 2026, lokal geprüft, committed, gepusht und als Production bereitgestellt.

- `npm run lint`: bestanden
- `npm run build`: bestanden
- `npm run test:unit`: bestanden
- `npm run test:axe-core`: 6 Tests bestanden
- `npm run test:a11y`: 44 Tests bestanden
- `npm run test:wcag22-aa`: 5 Tests bestanden; 55 WCAG-2.2-A/AA-Erfolgskriterien sind in der technischen Matrix erfasst und mit automatisierbaren Checks oder Feature-N/A-Evidence dokumentiert
- `npx playwright test`: 49 Tests bestanden, 2 TMDb-Live-Fallback-Tests skipped
- lokale Mobile-Lighthouse-Messung blieb stabil; großer CSS-Chunk ca. 192 KB vor dem Pass und ca. 188 KB nach dem Entfernen verwaister Brand-CSS-Regeln
- WCAG-2.2-A/AA-Techniklauf auf Kernrouten: keine axe-Verstöße, keine positiven `tabindex`-Werte, kein horizontaler Overflow bei 320/390/430 CSS-Pixeln, kein Text-Spacing-Overflow; keine vollständige manuelle WCAG-Konformitätsbewertung
- sichtbare Card-Action-Labels bleiben im zugänglichen Namen; Card-Kontrast ist stabil und Card-List-Animationen blenden Text nicht mehr per Opacity ein
- Skip-Link-Fokus ist sofort sichtbar; aktive Route, opakes Mobile-Menü, Escape-Fokus-Rückgabe und Reduced-Motion-Verhalten bleiben erhalten
- `src/lib/release-info.ts` steht lokal auf `0.8.4-wcag-lighthouse.20260605`

Header-Performance-/A11y-Pass vom 5. Juni 2026, als `377b94d refactor: isolate header navigation client boundary` gepusht und als Vercel Preview bereitgestellt.

- `npm run lint`: bestanden
- `npm run build`: bestanden
- `npm run test:unit`: 15 Dateien / 85 Tests bestanden
- `npm run test:axe-core`: 6 Tests bestanden
- `npm run test:a11y`: 44 Tests bestanden
- `npx playwright test`: 44 Tests bestanden, 2 TMDb-Live-Fallback-Tests skipped
- geprüfte Header-A11y: Skip-Link vor Navigation, Startseiten-Brand-Link, nav/list/link-Struktur, Mobile-Menü-Button mit Name/Zustand, Escape-Fokus zurück zum Button
- geprüfte Header-CSS-Zustände: sichtbarer Fokus, aktive Route, opakes Mobile-Menü im Viewport, kein horizontaler Overflow
- `next-env.d.ts` wurde nicht übernommen, weil der Build nur eine automatische `.next/dev`-Generatorreferenz erzeugt hatte
- Vercel Preview wurde per CLI aus einem sauberen Worktree des jeweiligen Commits erzeugt; konkrete URL siehe Übergabe/Inspect

PWA-/Offline-Basis vom 30. Mai 2026, lokal umgesetzt und nicht gepusht/deployt.

- `npm run lint`: bestanden
- `npm run build`: bestanden
- `npm run test:unit`: 15 Dateien / 85 Tests bestanden
- `npm run test:axe-core`: 6 Tests bestanden
- `npm run test:a11y`: 38 Tests bestanden
- `npx playwright test`: 38 Tests bestanden, 2 TMDb-Live-Fallback-Tests skipped
- lokaler Playwright-Smoke bei 390px und 430px auf `/`, `/suche`, `/suche?q=Arrival`, `/titel/mondfenster`, `/erklaerung`, `/bedienung`: kein horizontales Overflow, Mobile-Menü im Viewport
- `git diff --check`: sauber

Mobile-UX-Abschluss vom 23. Mai 2026, lokal als Abschlusscommit `fix: finalize mobile ux and brand polish` vorbereitet.

Direkt vor der finalen lokalen Doku-/Commit-Aktualisierung erneut gelaufen:

- `npm run lint`: bestanden
- `npm run build`: bestanden
- `npm run test:a11y`: 35 Tests bestanden
- `npm run test:axe-core`: 5 Tests bestanden
- `npm run test:unit`: 15 Dateien / 79 Tests bestanden
- `npx playwright test`: 35 Tests bestanden, 2 TMDb-Live-Fallback-Tests skipped

Vorherige gezielte mobile Sichtprüfung:

- zusätzlicher Playwright-Smoke bei 390px und 430px:
  - Header-Brand und Menübutton an Contentbreite ausgerichtet
  - Header-Shrink smooth beim Scrollen
  - Logo/Wortmarke klickt/tappt von Unterseiten zurück zur Startseite
  - Burger-Menü-Touchziele ca. 51px hoch
  - Burger-Menü auf Start, Suche und Erklärung/Hilfe reduziert; Legal-/Accessibility-Links im Footer
  - Browse-Link wirkt als Button-CTA mit Icon und ausreichender Touchfläche
  - Result-Card-Aktionen `Details`, `Merken` und `Gesehen?` stehen mobil nebeneinander, auch im 320px-Reflow-Smoke
  - `Richtung starten` hat ausreichend Innenabstand und farbige Kategorieflächen
  - Burger-Menü liegt über Seiteninhalt statt von Karten/Content überdeckt zu werden
  - Detailposter sichtbar und groß skaliert
  - keine horizontale Scrollbar

Offen bleibt ein echter iPhone-Check nach einem späteren Preview-/Production-Deploy mit Vercel-Login, weil Deployment Protection/SSO die externe mobile Prüfung begrenzt.

## Security-/Privacy-Release-Checks

Vor Commit/Deploy:

- keine `.env*`, API-Keys, Tokens, lokalen Datenbankdateien, Screenshots, ZIPs oder Recovery-Dateien committen
- Secret-Werte nie in Doku, Logs, Testausgaben oder PR-Beschreibungen schreiben
- Vercel-ENV manuell prüfen: Secrets nur serverseitig, keine unnötigen `NEXT_PUBLIC_` Variablen
- `NULL_NOISE_RATE_LIMIT_SALT` in Production setzen, bevor öffentliche Writes/Feedback aktiv sind
- `TMDB_READ_ACCESS_TOKEN` serverseitig halten; keine externen API-Keys im Client-Bundle
- Build-/Bundle-Check nach `npm run build`: `.next/static` darf keine sensiblen Secret-Namen oder Secret-Werte enthalten
- lokale Security-Härtung ist erst nach Push/Deploy live; Doku darf Production nicht als geprüft behaupten, solange nur lokal geprüft wurde

Nach Deploy:

- echte Production-Header/CSP prüfen
- API-Cache-Header für JSON-Routen prüfen
- schreibende Live-Routen nur mit erwarteten Origin-/Rate-Limit-/Cookie-Regeln testen
- Vercel Preview und Production getrennt prüfen
- keine personenbezogenen Testdaten erzeugen

## Referenzen

- W3C Evaluating Web Accessibility Overview: https://www.w3.org/WAI/test-evaluate/
- W3C Evaluation Tools Overview: https://www.w3.org/WAI/test-evaluate/tools/
- WCAG-EM Overview: https://www.w3.org/WAI/test-evaluate/conformance/wcag-em/
- W3C Developing an Accessibility Statement: https://www.w3.org/WAI/planning/statements/
- W3C Understanding Reflow: https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
- W3C Understanding Animation from Interactions: https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html
- BIK BITV-Test + WCAG 2.2 (Web), Prüfschritte: https://bitvtest.de/pruefverfahren/bitv-20-plus-web
- BIK BITV-Test, Beschreibung des Prüfverfahrens (Web): https://bitvtest.de/bitv_test/das_testverfahren_im_detail/verfahren.html
