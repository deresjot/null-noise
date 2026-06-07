# Testing und Release für null-noise

Stand: 7. Juni 2026

Diese Datei beschreibt, wie `null-noise` Accessibility testet und wo die Grenzen der Automatisierung liegen.

## Ziel

Accessibility wird in `null-noise` nicht über eine einzelne Konformitätsaussage abgesichert, sondern über einen kleinen, wiederholbaren Prüfpfad:

1. automatisierte Browser-Prüfung
2. gezielte Interaktions-Checks
3. manuelle Prüfung vor Release

WCAG 2.2 Level AA ist der technische Zielstandard. Die Prüfung orientiert sich zusätzlich an den Prüfansätzen des BITV-Testverfahrens. Automatisierte Tests decken nur einen Teil der Anforderungen ab. Für reale Nutzbarkeit und eine belastbare Konformitätsbewertung bleiben manuelle Prüfungen verpflichtend.

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
- wiederholbare Keyboard-Smoke-Checks, zum Beispiel Skip-Link und erreichbare Suchvorschläge
- mobile Navigation mit Burger-Menü für primäre App-Ziele; Info-/Legal-Ziele bleiben im Footer erreichbar
- kleiner Reflow-Smoke-Test auf den Kernrouten bei `320 CSS-Pixeln`, damit offensichtliches horizontales Overflow früh auffällt
- gezielter Mobile-Viewport-Smoke bei `390 CSS-Pixeln` und `430 CSS-Pixeln`: Menü im Viewport, opake Menüfläche, gemeinsame Content-Breite von Header/Menü/Main, Touch-Ziel-Höhen und entdichtete Kartenaktionen
- verschärfter Mobile-Bounds-Smoke bei `320`, `390` und `430 CSS-Pixeln`: zentrale Cards, Formulare, WCAG-Matrix, Status-Badges, Footer-Releasebereiche und Navigation müssen mit ihrer Bounding-Box innerhalb des Viewports bleiben
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
- Discovery-Sprache: keine Formulierungen wie `Empfohlen für dich` oder `Heute passend`; `Stressig` und `Kann gerade zu dicht sein` bleiben situativ statt wertend
- Lokaler Merken-/Gesehen-Bereich: Text, Buttons und Toggle/Checkbox brechen mobil sauber um; Label und Checkbox bleiben sichtbar zusammengehörig
- Poster: fehlende Poster zeigen den bewussten Platzhalter `Kein Poster verfügbar`
- Labels: sichtbare Kategorien lauten konsistent `Eher ruhig`, `Eher wechselhaft`, `Eher intensiv`

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

- Routen: `/erklaerung`, `/bedienung`, `/barrierefreiheit`, `/kontakt`, `/datenschutz`, `/impressum`
- per Tastatur: Header, mobile Navigation, Inhaltslinks und Footer-Links bleiben erreichbar
- Reflow: lange Überschriften und Rechtstexte bleiben bei kleiner Breite lesbar
- Kontrast: Notizen, Definitionslisten und Meta-Texte dürfen nicht nur knapp über Animation/Opacity lesbar sein
- Mobile: Kartenabstände und Footer dürfen nicht an Außenkanten kleben
- Mobile-Menü: geöffnetes Menü bleibt links/rechts im Viewport, zeigt keine helle Randspalte und trennt aktive Route sichtbar vom Tastatur-Fokus

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
- Entry-Animationen dürfen Text nicht über Opacity abblenden, wenn dadurch Kontrastprüfungen oder reale Lesbarkeit leiden
- Ladebalken sind nur als dezente Überbrückung gedacht und dürfen keinen Inhalt ersetzen
- keine Hilfe, die nur flüchtig eingeblendet wird

### Verständlichkeit

- Erste Einschätzung in Alltagssprache
- Entscheidungsfrage "Passt das gerade?" in 1 bis 2 kurzen Sätzen
- Sekundärinfos bleiben sekundär
- Unsicherheit bleibt sichtbar und wird nicht in scheinpräzise Sicherheit umformuliert

## Release-Mindeststandard

Vor einem Beta-Release oder Deploy sollten mindestens diese Schritte laufen:

1. sichtbare Release Notes und Footer-Metadaten in `src/lib/release-info.ts` aktualisieren
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

Optional, wenn der Umfang es rechtfertigt:

- `npx playwright test`

## Letzter lokaler Stand vor Übergabe

Wochenend-Abschluss vom 7. Juni 2026, lokal geprüft und fuer Push/Production-Deploy vorbereitet.

- Kontaktformular: serverseitiger SMTP-Versand per Nodemailer; keine Adminroute, keine Datenbank, keine temporäre Datei und kein Blob-Speicher fuer Kontaktanfragen
- benoetigte Kontakt-Env: `SMTP_HOST=mail.hosting.de`, `SMTP_PORT=587`, `SMTP_SECURE=false`, `SMTP_USER=testing@sebastianjansen.com`, `SMTP_PASSWORD=<set-secret>`, `CONTACT_TO_EMAIL=<set-recipient-email>`, `CONTACT_FROM_EMAIL=testing@sebastianjansen.com`
- Datenschutz: Nachricht und optionale E-Mail werden zur Bearbeitung verarbeitet; keine IP-/User-Agent-Ablage fuer Kontaktanfragen
- Release Notes stehen lokal auf `0.8.4-contact-smtp.20260607`
- lokale Abschlusschecks: `npm ci`, `npm run lint`, `npm run test:unit`, `npm run build`, `npm run test:a11y`, `npm run test:axe-core`, `npm run test:wcag22-aa`, `npm run test:wcag22-aaa`, `npx playwright test`, `git diff --check`
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
