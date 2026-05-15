# Testing und Release für null-noise

Stand: 10. Mai 2026

Diese Datei beschreibt, wie `null-noise` Accessibility testet und wo die Grenzen der Automatisierung liegen.

## Ziel

Accessibility wird in `null-noise` nicht über eine einzelne Aussage abgesichert, sondern über einen kleinen, wiederholbaren Prüfpfad:

1. automatisierte Browser-Prüfung
2. gezielte Interaktions-Checks
3. manuelle Prüfung vor Release

Die Prüfung orientiert sich an WCAG 2.2 und den Prüfansätzen des BITV-Testverfahrens. Automatisierte Tests decken nur einen Teil der Anforderungen ab. Für reale Nutzbarkeit bleiben manuelle Prüfungen verpflichtend.

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

### Was die automatisierten Tests derzeit prüfen

- Axe-Checks auf den Kernrouten über zwei Pfade:
  - `@axe-core/playwright` für den integrierten Browser-Check
  - direkter `axe-core`-Lauf, der `axe.min.js` explizit in die Seite injiziert und `axe.run()` ausführt
- Severity-Ausgabe nach `critical`, `serious`, `moderate`, `minor`
- Landmarken- und Heading-Struktur
- Kontrast-Fundstellen, die axe erkennen kann
- erkennbare Form-/Label-Probleme
- wiederholbare Keyboard-Smoke-Checks, zum Beispiel Skip-Link und erreichbare Suchvorschläge
- kleiner Reflow-Smoke-Test auf den Kernrouten bei `320 CSS-Pixeln`, damit offensichtliches horizontales Overflow früh auffällt

Diese automatisierten Prüfungen helfen besonders bei wiederholbaren Prüffeldern aus dem BITV-/WCAG-Kontext, etwa Struktur, Kontrast, Tastaturzugänglichkeit und Robustheit. Sie ersetzen aber keine vollständige manuelle Bewertung.

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

### Route `/titel/mondfenster`

- per Tastatur: Erste Einschätzung, `Passt das gerade?`, `Worauf basiert das?`, Feedbackblock, Folgeblöcke, Footer
- Fokus: Disclosure, Bewertungsbuttons und Footer-Links bleiben klar markiert
- Screenreader-Smoke: Überschriftenhierarchie, Disclosure-Zustand und Formularbeschriftungen bleiben schlüssig
- Reflow: Hero, Profilschalen, Kontextblöcke und Feedbackbereich stapeln ohne Seitwärts-Scrollen
- Zoom: Erste Einschätzung und Entscheidungsfrage bleiben als erste Orientierung sichtbar
- Verständlichkeit: Die Seite liest sich als ruhige Entscheidungshilfe und nicht als Analysedashboard

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
- keine überraschenden Wechsel
- keine Hilfe, die nur flüchtig eingeblendet wird

### Verständlichkeit

- Erste Einschätzung in Alltagssprache
- Entscheidungsfrage "Passt das gerade?" in 1 bis 2 kurzen Sätzen
- Sekundärinfos bleiben sekundär
- Unsicherheit bleibt sichtbar und wird nicht in scheinpräzise Sicherheit umformuliert

## Release-Mindeststandard

Vor einem Beta-Release oder Deploy sollten mindestens diese Schritte laufen:

1. `npm run lint`
2. `npm run build`
3. `npm run test:unit`
4. `npm run test:axe-core`
5. `npm run test:a11y`
6. eine reine Tastatur-Session
7. ein Screenreader-Smoke-Test
8. Reflow-/Zoom-Check auf kleiner Breite
9. keine Console-Errors
10. keine Score-/Prozent-UI
11. Mobile-Scrollgefühl nach Deploy auf echtem iPhone prüfen
12. Header-Branding, Startseiten-Erklärung, mobile Ergebniskarten, Merken-/Gesehen-Toggle und Poster-Fallbacks auf kleinem Viewport prüfen

Optional, wenn der Umfang es rechtfertigt:

- `npx playwright test`

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
