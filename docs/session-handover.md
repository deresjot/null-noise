# null-noise: Session-Handover

Stand: 12. April 2026

## Aktueller Git-Stand

- Branch: `master`
- Letzter Commit vor dieser lokalen Runde: `7802fc3` – `Refresh social preview image for launch`
- Aktuelle Runde: lokaler Arbeitsstand wurde weitergeführt, aber nicht gepusht
- Remote-Branch: vor dieser Runde nicht neu abgeglichen

## Projektstand für einen neuen Chat

Wenn ein neuer Chat ohne weiteren Kontext übernehmen soll, ist das hier der aktuelle Arbeitsstand in knapper, aber belastbarer Form:

- Neu in dieser Runde (12. April 2026, 16:39 CET):
  - Die Vermeidungsfilter auf `/suche` sind jetzt sichtbar wirksam statt nur leicht umsortierend.
  - `avoidPeaks` und `avoidDensity` greifen konsequenter und gelten auf lokale wie externe Treffer.
  - Aktive Filterzustände sind im Suchblock klarer sichtbar.
  - Bei aktiven Filtern erscheint eine knappe Ergebnisrückmeldung (`Gefiltert mit ...`), damit der Zustand ohne Zusatzdialoge nachvollziehbar bleibt.
  - Auch im Browse-Zustand ohne Suchbegriff ist die sichtbare Trefferauswahl bei aktiven Filtern klarer verändert.

- Neuester Konsolidierungsstand (12. April 2026):
  - Startseite ruhiger gewichtet, Suchdeck klarer primär, Footer stärker als Abschlusszone getrennt
  - `brand-mark` wieder präsenter, aber weiter kontrolliert und reduced-motion-kompatibel
  - Karten auf `/suche` entzerrt; Erstlesart eindeutig Anzeigecharakter ohne Control-Anmutung
  - lokale und Spike-Detailseiten in Breite und Hierarchie enger angeglichen
  - `/barrierefreiheit` neutral bereinigt; zugehörige A11y-Tests auf die neue Struktur nachgezogen

- `null-noise` ist derzeit ein produktiver Prototyp zum Finden und vorsichtigen Einordnen von Filmen und Serien nach vermuteter Reizwirkung.
- `TMDb` ist die reale Primärquelle für Titel, Suche, Poster, Browse und externe Detaildaten.
- `null-noise` ergänzt darüber eigene Erstlesart, Status und spätere Wachstumslogik.
- Es gibt weiter keine Scores, keine Prozentwerte und keine KPI-Optik.
- Lokale Titel existieren weiter, aber nicht mehr als primärer sichtbarer Einstieg im Hauptfluss.

## Neu in dieser Runde: Kleiner UI-/UX-Pass auf Suche, Karten und Fokus

- Der Such-/Filter-Block auf `/suche` wurde sprachlich gestrafft:
  - `Suche ändern`
  - `Suche und Filter`
  - `Finde etwas, das gerade passt.`
  - Filtergruppe jetzt als `Optional eingrenzen`
- Die Karten-Erstlesart wurde noch einmal umgebaut:
  - keine freie kleine Achse mehr
  - stattdessen drei feste Segmente `ruhiger`, `mittig`, `intensiver`
  - Status darunter bleibt kurz
- Fokuszustände wurden vereinheitlicht:
  - globaler doppelter Fokusstil mit heller und dunkler Linie
  - gilt konsistenter für Links, Buttons, Inputs, Selects und Summary
  - Skiplinks springen jetzt gezielt zu Top-Menü, Inhalt und Footer
- Das `brand-mark` wurde weiter beruhigt:
  - kleinere Drift
  - stabileres Gesicht
  - Mischwirkung näher an `brand-wordmark`
- Die externen Detailseiten `/spike/metadaten/...` wurden nur geprüft:
  - sie bleiben sichtbar als separater, vorläufigerer Spike-Pfad
  - für die dortige Erstlesart und Gesamthierarchie ist später ein eigener Pass sinnvoll

## Neu in dieser Runde: Manuelle Accessibility und Referenzklarheit

- Fokus dieser Runde war Konsolidierung statt Ausbau:
  - manuellen Prüfpfad explizit machen
  - eigene Seite `Barrierefreiheit` ergänzen
  - Kontrast und Reflow auf den Kernseiten gezielt nachziehen
  - Referenzcharakter der Produktentscheidungen klarer begründen
- Neue Seite im Produkt:
  - `/barrierefreiheit`
  - im Footer direkt verlinkt
  - beschreibt Geltungsbereich, aktuellen Stand, automatisierte und manuelle Prüfung, Grenzen und Kontakt
- Kleine direkte UI-Fixes dieser Runde:
  - kleine Home-Hero-Texte auf grünem Grund kontraststärker
  - horizontales Overflow bei `320 CSS-Pixeln` auf Kernseiten bereinigt
- Neue kleine Testergänzungen:
  - Footer-Link auf `Barrierefreiheit`
  - Reflow-Smoke-Test auf den Kernrouten bei `320 CSS-Pixeln`
- Entscheidung dieser Runde:
  - kein separater HTML- oder Sondermodus umgesetzt
  - stattdessen klar dokumentiert, warum die Standardoberfläche selbst der barrierearme Primärpfad bleiben soll

## Neu in dieser Runde: Accessibility- und Referenzstandard

- Fokus dieser Runde war nicht Feature-Ausbau, sondern Systematik:
  - Accessibility prüfbar machen
  - UX für schnelle Überforderung schärfen
  - Doku als Referenzstandard aufbauen
- Die Accessibility-Suite prüft jetzt die Kernrouten:
  - `/`
  - `/suche`
  - `/suche?q=Arrival`
  - `/titel/mondfenster`
- Die automatisierte A11y-Prüfung läuft jetzt über zwei Pfade:
  - `@axe-core/playwright`
  - direkter `axe-core`-Lauf mit injiziertem `axe.min.js` und `axe.run()`
- Die Axe-Ausgabe wird nach `critical`, `serious`, `moderate`, `minor` strukturiert erfasst.
- Der aktuelle Stand auf diesen Routen ist nach dem Fix-Pass ohne axe-Fundstellen.
- Behobene Punkte dieser Runde:
  - Landmark-Dopplungen in Suche und Kartenstruktur entfernt
  - Skip-Link in Landmarke gezogen
  - Heading-Reihenfolge auf der Detailseite bereinigt
  - Kontrast kleiner Meta- und Orientierungstexte verbessert
  - Suchfeld-ARIA vereinfacht, damit keine unnötige Combobox-Semantik behauptet wird
- UX-seitig wurde vor allem die Detailseite geschärft:
  - die primäre Aussage heißt jetzt sichtbarer `Erstlesart`
  - `Passt das gerade?` ist knapper und direkter formuliert
  - Unsicherheit wird sichtbarer über Formulierungen wie `Erste Einschätzung` und `Kaum Hinweise`

## Neue Referenzdokumente

- `docs/a11y-principles.md`
- `docs/a11y-testing.md`
- `docs/ux-principles.md`
- `docs/product-principles.md`
- `docs/reference-goals.md`

Bestehende Doku, die in dieser Runde ebenfalls nachgezogen wurde:

- `docs/project-summary.md`
- `docs/session-handover.md`
- `docs/ui-component-strategy.md`

### Relevante Seiten und Zustände

- `/`
  - Hero-Einstieg mit großer Suche
  - bunte Home-Art-Direction nur hier stärker sichtbar
- `/suche`
  - `q` leer: Browse-Zustand
  - `q` gesetzt: normale Suche
  - Browse und Suche werden nicht in einer Primarliste gemischt
- `/spike/metadaten/[mediaType]/[externalId]`
  - externer TMDb-Detailpfad
- `/titel/[slug]`
  - lokaler Detailpfad

### Browse-/Trefferdarstellung

- Das alte schmale Kartenmuster wurde bewusst verlassen.
- Treffer und Browse-Objekte arbeiten jetzt als breitere Tile-Artikel mit klaren Zonen:
  - Poster
  - Titel
  - Erstlesart
  - CTA
  - Sekundärinfos
- Der CTA wurde auf `Details` beruhigt und visuell nachgeordnet.

### Erstlesart-System

- Die Erstlesart ist die zweite Hauptaussage nach dem Poster.
- Sie arbeitet mit:
  - Kicker `Erstlesart`
  - auf Karten einer segmentierten 3er-Vorschau `ruhiger`, `mittig`, `intensiver`
  - auf Detailseiten weiter einer größeren passiven Skalenlesart
  - verdichtetem Statussatz
- Die Vorschau soll sichtbar sein, aber nicht wie ein Slider oder Range-Control wirken.
- Detailseiten nutzen dieselbe Logik in größerer, stärkerer Form.

### Browse-Logik auf /suche

- Bei leerem `q` erscheinen zwei sichtbare Bereiche:
  - `Eher leise`
  - `Eher laut`
- Die Vorschläge kommen primär aus externen TMDb-Discover-Pools.
- Die Auswahl wird über `mix` sichtbar durchmischt.
- `Andere zeigen` soll die Auswahl spürbar variieren, nicht nur gleiches Material neu sortieren.

### Datenquellen

- `TMDb`
  - Primär für Titel, Poster, Details, Browse, Keywords und Provider-Basisdaten
- `Letterboxd`
  - sekundärer Zusatzblick auf Detailseiten
  - bewusst nicht Teil der Kernsuche oder Primärlogik
- `Watchmode`
  - optionale Zusatzquelle nur für `Verfügbar bei`
  - soll direkte Angebotslinks, Preise und Formate liefern
  - greift nur mit `WATCHMODE_API_KEY`
  - sonst bleibt TMDb-/JustWatch-Fallback aktiv

### Aktuell sichtbare Provider-Logik

- Auf externen Detailseiten wurde `Basisdaten im Blick` entfernt.
- `Verfügbar bei` ist dort jetzt prominenter und näher an einer Watch-Detailseite organisiert.
- Wenn kein Watchmode-Key gesetzt ist, führen Anbieter aktuell weiter auf den gemeinsamen TMDb-Angebotsweg.

### Branding / Header

- sichtbares Maskottchen bleibt draußen
- Header arbeitet mit Wortmarke plus organischen Farbformen
- das Logo kontrastiert im Gesicht jetzt nicht mehr nur über weiße Outline
- die Farbformen dürfen sich im Header ruhig und organisch verformen
- `prefers-reduced-motion` bleibt respektiert

### Wichtige Env-Variablen

- `TMDB_READ_ACCESS_TOKEN`
- `LETTERBOXD_CLIENT_ID`
- `LETTERBOXD_CLIENT_SECRET`
- `WATCHMODE_API_KEY`

### Was bewusst offen bleibt

- Browse-Vorschläge bleiben eine vorsichtige, metadatenbasierte Erstlesart.
- Die externen Detailseiten laufen funktional gut, aber der `/spike/...`-Pfad ist als Produktsprache noch kein finaler Endzustand.
- Direkte Anbieterlinks sind nur mit Watchmode-Key sichtbar; ohne Key bleibt der gemeinsame TMDb-Weg aktiv.

## Neu in dieser Runde: Launch-Härtung statt Feature-Ausbau

- Fokus dieser Runde war nicht mehr Produktausbau, sondern Launch-Härtung.
- Sichtbar dazugekommen ist ein ruhiger Hinweis im Footer:
  - `Früher Prototyp. Einschätzungen sind vorläufig.`
- Für den Launch wurde fragilere Außenlogik zurückgenommen:
  - der Letterboxd-Block taucht im UI nur noch auf, wenn wirklich belastbare Daten geliefert werden
  - Detailfehler auf dem externen Pfad werden ruhiger und allgemeiner abgefangen
  - `Verfügbar bei` bleibt ehrlich bei `Direkt zum Angebot` vs. `Zur Angebotsseite`
- Rechtliches und Setup wurden für den Launch nachgezogen:
  - `Datenschutz` nennt jetzt ausdrücklich LocalStorage für `Merken` und `Schon gesehen`
  - es wird explizit festgehalten, dass keine Tracking-Tools aktiv sind
  - `.env.example` benennt klarer, dass aktuell ein TMDb Read Access Token erwartet wird
- Der Root-Scroll-Hinweis von Next ist technisch bereinigt:
  - `<html>` trägt jetzt `data-scroll-behavior="smooth"`
  - der Browser-Check bleibt damit auch auf `/suche` ohne diese Warnung sauber

## Neu in dieser Runde: Finales Hardening für den Deploy-Stand

- Fokus dieser Runde war nicht mehr Ausbau, sondern echte Deploy-Readiness.
- Der Kernpfad wurde als Launch-MVP noch einmal hart geprüft:
  - `/`
  - `/suche?q=`
  - `/suche?q=Arrival`
  - `/suche?q=Batman`
  - `/suche?q=Frozen`
  - `/suche?q=Star+Trek`
  - zwei externe Detailseiten
  - mobile Suche und mobile Detailseite
- Hydration wurde ohne Dauer-Workaround gehärtet:
  - `suppressHydrationWarning` ist nicht mehr auf `<html>` aktiv
  - stattdessen wird der Root vor der Hydration gezielt auf den erwarteten Zustand normalisiert
  - der bekannte Klassen-Mismatch am Root wurde damit auch gegen simulierte Fremd-Klassen auf `<html>` sauber geprüft
- Lokale Browserzustände springen im ersten Frame jetzt weniger:
  - `TitlePocketActions` und `SearchLocalShelf` synchronisieren ihren Browserstand früher
  - der SSR/CSR-Übergang bleibt dabei neutral und konsistent
- Der harte Production-Check lief gegen `npm run start`:
  - Browser-Konsole auf den Kernpfaden sauber
  - keine Hydration-Warnung
  - keine roten Console-Errors
- Teststand dieser Runde:
  - `npm run lint`
  - `npm run test:unit`
  - `npm run build`
  - `npm run start`
  - `npx playwright test`
- Für Deploy wichtig:
  - für den öffentlichen read-only MVP erforderlich: `TMDB_READ_ACCESS_TOKEN`
  - empfohlen: `NEXT_PUBLIC_SITE_URL`; ohne diese Variable greifen `VERCEL_PROJECT_PRODUCTION_URL` oder `VERCEL_URL`
  - optional: `DATABASE_URL` für lokalen Katalog, Seed-Daten und spätere Schreibpfade
  - optional: `WATCHMODE_API_KEY`, `LETTERBOXD_CLIENT_ID`, `LETTERBOXD_CLIENT_SECRET`
  - öffentliche Schreibpfade bleiben ohne bewusste ENV-Freigabe deaktiviert
  - der Produktions-Build und `npm run start` liefen zusätzlich auch ohne `DATABASE_URL`, solange der TMDb-Token vorhanden ist
  - im Repo liegt aktuell noch keine `.vercel`-Projektverknüpfung; vor dem echten Go-live also zuerst sauber linken und dann die ENV-Variablen in Vercel setzen

## Neu in dieser Runde: Vom Analyse- zum Entscheidungswerkzeug

- Detailseiten helfen jetzt nicht nur beim Lesen, sondern auch beim Entscheiden:
  - kleiner Block `Passt das gerade?` direkt an der Erstlesart
  - relative Orientierung über `Im Vergleich zu …`
  - kleine negative Hinweise `Könnte kippen, weil …`
- Die Entscheidungslogik bleibt bewusst leicht:
  - sie leitet sich aus Erstlesart, Status, Rückmeldungen und vorhandenen Metadatenhinweisen ab
  - keine Scores, keine Prozente, keine neue Blackbox
- Lokale und externe Detailseiten wurden dafür enger auf dieselbe Leselogik gezogen:
  - Erstlesart
  - Entscheidungshilfe
  - Erklärung / Feedback
  - Folge- oder Escape-Bereich
  - `Verfügbar bei`
- Suche und Browse sprechen in den angefassten Bereichen alltagssprachlicher:
  - `Erst grob lesen, dann entscheiden`
  - `Schon mit eigenem Stand`
  - `Hier ist es erst eine grobe Lesart`
- Der echte Local-Check lief zusätzlich noch einmal über Home, Browse, Suche, lokale und externe Detailseiten, mobil sowie mit Reduced Motion.

## Neu in dieser Runde: Statusmeldungen, Microfeedback und lokale Komfortfunktionen

- Fehler- und Leerezustände wurden in den angefassten Pfaden produktischer formuliert:
  - ruhigere Meldungen für Suggestion-Ausfälle, Followup-Lücken und fehlende Direktlinks
  - klarere leere Zustände im lokalen Shelf auf `/suche`
- Kleine Aktionen geben jetzt Inline-Microfeedback statt stumm zu bleiben:
  - `Für später gemerkt`
  - `Als schon gesehen markiert`
  - `Gesehene Titel werden hier ausgeblendet`
  - `Neue Auswahl, gleicher Rahmen.`
- Der lokale Shelf-Bereich auf `/suche` hat jetzt kleine Komfortfunktionen:
  - `Gemerkte Titel leeren`
  - `Gesehene zurücksetzen`
  - sichtbarer Hinweis, wenn gesehene Titel im Browse gerade ausgeblendet sind
- Die aktuelle Runde hat außerdem die direkt angefassten UI- und Doku-Texte auf sauberes UTF-8 mit echten Umlauten und ß nachgezogen.
- Der `renderedAt`-Wert für den Feedback-Kanal wird jetzt wie beim Bewertungsformular clientseitig gesetzt, damit der Renderpfad sauber bleibt.

## Neu in dieser Runde: Folgeempfehlungen, Entlastung, Merken und Schon gesehen

- Detailseiten führen jetzt sichtbar weiter:
  - `Dazu passt auch ...` zeigt kleine Folgevorschläge in ähnlicher Reizlage
  - bei eher lauten / intensiveren Titeln taucht zusätzlich `Wenn du etwas Ruhigeres suchst` auf
  - beide Bereiche bleiben klein, vorsichtig formuliert und nutzen dieselbe Tile-Sprache wie Suche und Browse
- `Merken` und `Schon gesehen` gibt es jetzt lokal im Browser:
  - ohne Konto
  - ohne Cloud
  - ohne sozialen Layer
  - Buttons stehen auf Tiles und auf Detailseiten
- `/suche` hat dafür einen kleinen lokalen Bereich `Für später und schon gesehen`
  - gemerkte Titel landen dort für später
  - gesehen markierte Titel können gesammelt und optional aus Browse/Treffern ausgeblendet werden
- Browse-/Treffer-Tiles erklären sich jetzt etwas besser:
  - kurze Begründungszeilen wie `wenig harte Spitzen` oder `eher ruhiger Einstieg`
  - alltagssprachlich und defensiv statt taxonomisch oder technisch
- Unsicherheit wurde noch einmal sprachlich nachgeschärft:
  - sehr dünner Stand klingt jetzt sichtbar vorsichtiger, z. B. `Kaum Hinweise`
  - daraus soll kein Score, sondern eine ehrlichere Lesbarkeit der Startbasis werden
- Der anonyme Feedbackblock auf Detailseiten bleibt klein, ist aber jetzt klarer als stiller Produkt-Rückkanal lesbar und nicht nur als loses Formular

## Neu in dieser Runde: Vertrauen, Rückkanal, Browse-Nutzwert

- Die sichtbaren Confidence-/Stand-Hinweise wurden sprachlich präziser:
  - `Bisher nur grob gelesen`
  - `Dafür gibt es erste Rückmeldungen`
  - `Das wirkt inzwischen stimmiger`
- Der Erstlesart-Block trägt jetzt eine kurze Basiszeile wie `Bisher spricht vor allem die Basis dafür`, damit die Aussage im UI weniger wie eine Behauptung wirkt.
- Auf lokalen und externen Detailseiten gibt es jetzt einen ruhigen Disclosure-Bereich `Worauf basiert das?`:
  - Genres
  - Keywords
  - Kurzbeschreibung
  - vorhandene Rückmeldungen, wenn schon da
- Direkt darunter sitzt jetzt ein minimaler, anonymer Feedback-Block:
  - `ruhiger als erwartet`
  - `ungefähr passend`
  - `intensiver als erwartet`
  - ohne Konto, ohne Community-Sichtbarkeit
  - nach Abgabe mit ruhigem Erfolgszustand im selben Bereich
- Browse auf `/suche` ist nützlicher geworden:
  - Tiles haben eine kurze Begründungszeile wie `wenig harte Spitzen`
  - der Browse-Mix bleibt pro Filtersatz stabil und wechselt erst mit `Andere zeigen`
  - nach `Andere zeigen` erscheint eine knappe Rückmeldung `Neue Auswahl, gleicher Rahmen.`
- Suchqualität wurde praktisch nachgezogen:
  - TMDb-Ranking berücksichtigt `originalTitle` stärker
  - kürzere Queries gehen dadurch etwas weniger in Varianten unter
- `Verfügbar bei` ist ehrlicher und stabiler:
  - Gruppenreihenfolge: `Im Abo`, `Kostenlos`, `Leihen`, `Kaufen`
  - Preis/Format nur bei vollständigen Watchmode-Daten
  - klare Trennung zwischen `Direkt zum Angebot` und `Zur Angebotsseite`

## Neu in dieser Runde: Neubau der Browse-/Trefferdarstellung

- Das alte Kachelmuster auf `/suche` wurde für Browse- und Trefferobjekte bewusst verlassen.
- Suchobjekte arbeiten jetzt als breitere Tile-Artikel statt als schmale, hohe App-Karten:
  - Poster links bzw. auf mobil zuerst
  - eigene Titelzone
  - eigener Erstlesart-Block als zweite Hauptaussage
  - CTA erst danach
  - Hinweise und Nebeninfos ganz am Schluss
- Die Erstlesart ist in diesen Tiles nicht mehr nur ein Teil des Body-Flusses:
  - kleine Kickerzeile
  - grosse Tendenzzeile
  - deutlich breitere `leise ↔ laut`-Achse
  - verdichteter Statussatz
- Das Suchraster wurde dafür auf eine ruhigere, editorialere Breite umgestellt:
- Das Suchraster wurde dafür auf eine ruhigere, editorialere Breite umgestellt:
  - weniger Karten pro Reihe
  - mehr horizontaler Raum
  - Sticky-Suche bleibt daneben, schnürt die Tiles aber weniger ein
- Mobil stapeln die Tiles weiterhin sauber:
  - Poster
  - Titel
  - Erstlesart
  - CTA
  - Sekundärhinweis
- Detailseiten wurden in dieser Runde nicht komplett neu gebaut, aber der stärkere Erstlesart-Block bleibt dort als Referenz und passt jetzt sichtbarer zur neuen Trefferhierarchie.
- Die Erstlesart-Achse wurde danach noch einmal als passive Pegelanzeige neu gebaut:
  - keine Slider-/Regleroptik mehr
  - sichtbares, segmentiertes `leise ↔ laut`-Band
  - passive Anzeige statt bedienbares Control
- Externe Treffer arbeiten jetzt mit ruhigerem `Details`-CTA statt einem heroischen `NUR ANSEHEN`.
- Auf der externen Detailseite wurde der Block `Basisdaten im Blick` entfernt; `Verfügbar bei` sitzt dort jetzt prominenter und nähert sich strukturell stärker einer Watch-Detailseite an.
- Das Header-Logo wurde noch einmal stabilisiert:
  - die Gesichtsform kontrastiert jetzt nicht mehr über eine feste weiße Outline, sondern über berechnete Kontrastwirkung auf den gemischten Farbformen
  - die drei Farbformen dürfen sich im Header jetzt in engem Rahmen organisch strecken und verformen

## Neu in dieser Runde: Erstlesart stärker, Browse-Zustand auf /suche, externe Vorschläge verfeinert

- Fokus dieser Runde war ein gestaffelter Produkt- und UI-Ausbau statt einer reinen Schnellkorrektur.
- Die Erstlesart auf Detailseiten wurde deutlich stärker gewichtet:
  - größere Tendenz
  - deutlich präsentere `leise ↔ laut`-Achse
  - kompakterer und geschlossenerer Leseblock
  - auf lokalen Detailseiten jetzt ebenfalls wieder mit großem Poster im Callout
- Die Detailposter laufen jetzt konsistenter über eine größere TMDb-Quelle:
  - lokale und externe Detailseiten nutzen die große Poster-Variante
  - Suchkacheln bleiben bewusst kleiner
- `/suche` hat jetzt bei leerem `q` einen echten Browse-Zustand im Hauptcontent:
  - zwei klar sichtbare Bereiche `Eher leise` und `Eher laut`
  - 4 bis 6 externe TMDb-Titel pro Bereich
  - `Andere zeigen` für eine neue Mischung
  - keine Vermischung mit normalen Suchtreffern
- Die Browse-Vorschläge greifen jetzt primär auf externe TMDb-Titel:
  - nicht nur auf den lokalen Bestand
  - Zielseiten führen auf den externen Detailpfad
  - die Auswahl wird über `mix` sichtbar variiert
  - ein echter Bug im Discover-Pfad wurde dabei behoben: `with_genres` nutzt jetzt OR-Logik statt versehentlich leerer AND-Abfragen
- Die vorläufige Erstlesart wurde im TMDb-Pfad leicht verfeinert:
  - Keywords werden in den externen Detaildaten jetzt mitgeladen
  - die Inferenz liest dadurch Genres, Synopsis und Keywords zusammen
  - Letterboxd bleibt als sekundärer Zusatzblick getrennt und wird bewusst noch nicht zur Primärlogik gemacht
- TMDb-Detail- und Anbieterrequests nutzen jetzt eine ruhigere Revalidate-/Cache-Strategie, damit Browse und Detail nicht unnötig zäh wirken.

## Vorherige Runde: Hero-/Ergebnis-/Detail-Umbau plus kontrollierter Style-Rebuild

- Fokus dieser Runde war ein gerichteter visueller Umbau, nicht noch ein weiteres Zwischenstyling.
- Die Oberfläche ist jetzt deutlicher in drei Ebenen getrennt:
  - Hero als Einstieg und Suche
  - Ergebnisse als eigene ruhige Listenansicht
  - Detailseite als eigentlicher Ort der Einordnung
- Home wurde zu einer großen Startfläche mit dominanter Suche umgebaut.
- Home wurde danach noch einmal in Farbe, Formlogik und Hero-Copy nachgeschärft, ohne die Struktur neu zu ändern.
- Danach wurde ein System-Fix auf die Styles gelegt:
  - globale Hintergründe und farbige Flächen wieder neutralisiert
  - Home-Art-Direction über eigene Scope-Klassen isoliert
  - Search und Detail bewusst als ruhige Funktions- bzw. Leseseiten abgesichert
- Search wurde danach noch einmal praktisch nachjustiert:
  - Suchtreffer wieder als Kacheln statt Listenreihen
  - Poster zurück auf die Suchseite
  - `NUR ANSEHEN` als hervorgehobener Primär-CTA für externe Treffer
  - lokales Anlegen aus der Trefferliste raus und auf die externe Detailansicht verschoben
  - ausklappbare Boxen und Suchvorschläge nicht mehr durch zu enge Container abgeschnitten
  - kompakte Tendenzbar direkt in den Suchkacheln
  - vollflächiger grüner Hintergrund über alle Seiten
  - Sticky-Header anschließend auf weiße 80%-Fläche korrigiert, damit die Bühnenformen nicht abgeschnitten durchscheinen
  - Suchvorschläge näher an das neue Bühnen-Deck gezogen
  - Form-Logo und App-Icons jetzt aus den bunten Produktformen abgeleitet, inklusive kleinem Gesicht
  - Headline-Schrift weicher und runder gesetzt
- Search wurde von Feature-Cards auf reduzierte Ergebnisreihen zurückgenommen.
- Die Detailseite trägt jetzt sichtbar die Haupt-Einordnung, inklusive ruhiger Tendenzachse.
- Branding bleibt vereinfacht:
  - Header als Wortmarke
  - kein sichtbares Maskottchen
  - keine Badge- oder Crop-Lösung
- Die komplette sichtbare Copy wurde noch einmal neu geschrieben und neu platziert.
- Die Löschfunktion bleibt erhalten und sitzt weiterhin ruhig nachgeordnet im Produktfluss.

## Neu in der letzten Fix-Runde: Search-Surface, Vorschlagslayer, Detailposter, Einordnungsblock

- Kein neuer Stilpass, sondern ein gezielter UI-/Component-Fix auf dem bestehenden Stand.
- Die Suchvorschläge waren noch an mehreren Stellen in Container mit `overflow: hidden` und zu schwachen Stacking-Contexts geraten.
- Home-Hero und Search-Stage nutzen jetzt ein gemeinsames `search-module-surface`, damit Form, Abstände, Input-Höhen und CTA-Verhalten erkennbar aus demselben System kommen.
- Die Vorschlagsliste selbst liegt jetzt sauber darüber:
  - relevanten Eltern wurde `overflow: visible` gegeben
  - das Feld hebt seinen Layer bei Fokus an
  - die Vorschlagsliste hat eine definierte Maximalhöhe plus `overflow-y: auto`
- Für TMDb-Poster gibt es jetzt getrennte Größenlogik:
  - Kacheln bleiben bei der kleineren Standardgröße
  - große Detailposter laufen über eine größere Proxy-Variante
  - der Proxy liest die Größe jetzt pfadbasiert statt per Querystring, damit `next/image` auf der lokalen Detailansicht kein Overlay mehr wirft
- Die Detail-Einordnung wurde auf lokaler und externer Detailseite in einen stärkeren, kompakteren Leseblock gezogen:
  - kleine Kickerzeile
  - größere Tendenz
  - Status deutlicher gesetzt
  - ruhigere Erklärung darunter
  - die Tendenzachse sitzt dichter und präsenter im selben Block
- Neu dazu kam jetzt eine nachgeordnete `Where to watch`-Ausgabe auf Detailseiten:
  - TMDb-basierte Spike-Detailseiten zeigen unter `Basisdaten im Blick` eine gruppierte Anbieteransicht für `DE`
  - lokale TMDb-Titel zeigen denselben Block im Kontextbereich
  - Gruppen: `Im Abo`, `Kostenlos`, `Leihen`, `Kaufen`
  - textbasiert statt Logo-Wand, mit JustWatch-via-TMDb-Hinweis und Link auf die TMDb-Angebotsseite
  - Anbieter sind jetzt pro Zeile klickbar; die offizielle Datenquelle liefert dabei derzeit nur die gemeinsame Watch-Seite, nicht stabile Provider-Deep-Links
  - für Filme mit TMDb-ID wurde zusätzlich ein Letterboxd-Zusatzblick vorbereitet:
    - immer mit Website-Link via `letterboxd.com/tmdb/{id}`
    - optional mit API-Werten, wenn `LETTERBOXD_CLIENT_ID` und `LETTERBOXD_CLIENT_SECRET` gesetzt sind
- Der Anbieterblock kann jetzt optional über Watchmode angereichert werden:
- Der Anbieterblock kann jetzt optional über Watchmode angereichert werden:
  - neues Env-Flag: `WATCHMODE_API_KEY`
  - TMDb bleibt für Titel, Poster und die gemeinsame Angebotsseite die Primärquelle
  - Watchmode liefert nachgeordnet direkte `web_url`-Angebotslinks sowie, wenn vorhanden, `format` und `price`
  - ohne Watchmode-Key bleibt der bisherige TMDb-/JustWatch-Fallback unveraendert
  - die UI bleibt textbasiert und ehrlich: `Direkt zum Angebot`, wenn ein echter Direktlink vorliegt, sonst weiter zur gemeinsamen TMDb-Angebotsseite

## Aktueller Vercel-Stand

- Production bleibt auf `master` und wurde in dieser Runde nicht verändert.
- Der aktuelle Arbeitsstand liegt auf dem Preview-Branch `beta-ui-polish`.
- Die Branch-Preview ist derzeit über Vercel Authentication geschützt.
- Relevante Preview-URL:
  - `https://null-noise-git-beta-ui-polish-deresjots-projects.vercel.app/`
- Relevante Production-URL:
  - `https://null-noise.vercel.app/`

## Was in dieser Runde konkret fertig wurde

### Oberfläche auf eine klare Dramaturgie umgebaut

- Die aktive Oberfläche erzählt nicht mehr mehrere Zwischenstände gleichzeitig.
- Home, Search und Detailseite haben jetzt sichtbar unterschiedliche Aufgaben.
- Das Ergebnis soll weniger nach allgemeiner App-Oberfläche und stärker nach bewusst geführtem Produktfluss aussehen.

### Branding und Maskottchen vereinfacht

- Das Maskottchen wurde aus der sichtbaren Produktführung herausgenommen.
- Header jetzt primär als Wortmarke, ohne Badge-Look und ohne Crop.
- Favicon und App-Icon bleiben aus einer einfachen organischen Form abgeleitet.
- Ziel dieser Runde war nicht eine neue Markenfigur, sondern ein Branding, das nicht stört.

### Home als Hero neu gebaut

- Home ist jetzt eine große Einstiegsebene mit deutlich größerer Typografie.
- Die Suche sitzt zentral auf einer ruhigen Bühne statt in einer normalen App-Card.
- Sekundäre Hinweise wurden radikal reduziert.
- Header und Footer bleiben zurückhaltend, damit zuerst die Suche trägt.
- Die bunte 2D-Flat-Bildsprache sitzt jetzt nur noch auf Home:
  - große grüne Bühne
  - zwei bis drei organische Flächen
  - Suchdeck als Teil der Bühne
  - keine globale Einfärbung anderer Seiten

### Search als ruhige Ergebnisansicht neu gesetzt

- Die obere Search-Zone ist jetzt eine Suchbühne und nicht mehr der Ort der Ergebnisse.
- Ergebnisse darunter wurden zu reduzierten Reihen statt zu schweren Karten umgebaut.
- Externe Treffer haben keine Featured-Posterbühne mehr.
- Leere Zustände und Hilfetexte wurden an die relevanten Stellen gezogen.
- Wichtig für die nächste Runde: Search nutzt bewusst keine Hero-Formen, keine Vollflächen und keine organische Deko im Content-Bereich.

### Skala und Status neu gefasst

- In der Ergebnisliste gibt es keine laute Skaleninszenierung mehr.
- Die Tendenzachse sitzt jetzt vor allem auf der Detailseite als ruhige horizontale Bar.
- Vorläufig, wachsend und belastbarer arbeiten stärker über Satz, Position und Gewichtung als über Badge-Optik.
- Detailachsen wurden visuell an dieselbe reduzierte Bar-Logik angenähert.
- Die farbige Tendenzachse nutzt jetzt solide Tonflächen statt globaler Gradienten.

### Copy komplett neu geschrieben

- Home, Search, Detailseite, Statushinweise, CTAs, Footer und kleine Meta-Texte wurden neu geschrieben.
- Die Sätze sind kürzer, trockener und näher an der jeweiligen Stelle im Interface.
- Doppelte Erklärungen und dekorative Resttexte wurden reduziert oder entfernt.

### Footer neu sortiert

- Der Footer ist ruhiger gruppiert und weniger wie ein klassischer Website-Footer gesetzt.
- Rechtliche Links bleiben sichtbar, wirken aber weniger dominant.
- Versions- und Changelog-Hinweise bleiben da, sind aber klarer eingefasst.

### Neue Löschfunktion für lokale Titel

- Lokal angelegte Titel lassen sich jetzt wieder aus `null-noise` entfernen.
- Der Löschpfad läuft als normale Produktaktion über einen bestätigten POST-Flow.
- Gelöscht wird nur der lokale Stand; der reale Titel kann später erneut angelegt werden.
- Für den Suchfluss gibt es dazu ruhige Erfolgs- und Fehlerzustände.

## Wichtige fachliche Leitplanken, die weiter gelten

- Keine Änderung an Bewertungslogik, Aggregation oder TMDb-Flow in dieser Runde.
- TMDb liefert weiter nur Metadaten, kein Reizprofil.
- `metadata_inference` bleibt eine vorläufige Startbasis und kein fertiges Profil.
- `soothingEffect` bleibt getrennt von der Reizintensität.
- Mock-Daten können intern weiter für Tests oder Seeds existieren, sollen aber nicht mehr die sichtbare Produktrealität tragen.
- Öffentliche Production auf Vercel bleibt sinnvollerweise weiter vorsichtig und ehrlich.
- Die aktuelle Runde ist lokal preview-ready, aber in dieser Session bewusst nicht neu committed oder gepusht.

## Zuletzt lokal erfolgreich geprüft

- `npm run test:unit`
- `npm run lint`
- `npm run build`
- `npx playwright test`

Zuletzt gemeldeter Stand:

- Vitest: `55 passed`
- Playwright: `19 passed, 2 skipped`
- Browser-Gegencheck zusätzlich auf frisch neu gestartetem lokalen Dev-Server unter `http://127.0.0.1:3000`
- Zusätzlich manuell gegengeprüft:
  - `/`
  - `/suche?q=`
  - `/suche?q=&tone=all&kind=all`
  - Suchvorschläge auf Home
  - Suchstart aus dem Hero
  - `/suche?q=Arrival`
  - `/suche?q=Forrest+Gump`
  - Browse-Zustand mit `Eher leise` / `Eher laut`
  - Suchvorschläge auf `/suche`
  - `/titel/mondfenster`
  - externe Detailseite mit großem Poster
  - externe Detailseite mit prominenterem `Verfuegbar bei`-Block
  - mobile Home
  - mobile Search
  - mobile Detailseite
  - Header und Footer
  - Header-Logo mit organisch deformierten Farbformen und adaptiver Gesichts-Kontrastwirkung
  - Fokuszustände
  - Reduced-Motion-Viewport
  - Delete-Flow mit lokalem Anlegen und Entfernen
  - isolierte Home-Farbfläche gegen neutrale Search-/Detailseiten

## Sinnvolle nächste Schritte

### Wenn weiter am Preview gearbeitet wird

1. Branch `beta-ui-polish` lokal weiterverwenden.
2. Änderungen lokal prüfen.
3. Auf denselben Branch committen und pushen, sobald der Stand bewusst in den Preview soll.
4. Branch-Preview in Vercel prüfen.
5. Erst danach bei Bedarf nach `master` mergen.

### Inhaltlich naheliegende nächste Themen

1. Vor einem nächsten Push noch einmal die Suchseite mit mehreren realen TMDb-Queries querprüfen.
2. Preview visuell auf mobilen Viewports noch einmal gezielt prüfen.
3. Entscheiden, ob die sehr große Hero-Typografie genau so bleiben soll oder leicht enger gezogen wird.
4. Offene UI-Feinheiten nur punktuell nachziehen, nicht neu gestalten.
5. Erst nach finalem Preview-Check entscheiden, ob `beta-ui-polish` in `master` gemergt werden soll.

## Relevante Dateien aus den letzten Runden

- `src/app/page.tsx`
- `src/app/not-found.tsx`
- `src/app/suche/page.tsx`
- `src/app/titel/[slug]/page.tsx`
- `src/app/api/local-titles/delete/route.ts`
- `src/app/globals.css`
- `src/components/site-header.tsx`
- `src/components/explanation-panel.tsx`
- `src/components/site-footer.tsx`
- `src/components/result-list.tsx`
- `src/components/external-result-list.tsx`
- `src/components/search-tone-scale.tsx`
- `src/components/search-form.tsx`
- `src/components/search-query-field.tsx`
- `src/components/profile-scale.tsx`
- `src/lib/constants.ts`
- `src/lib/format.ts`
- `src/lib/queries.ts`
- `src/lib/release-info.ts`
- `src/lib/runtime-config.ts`
- `src/lib/metadata-inference.ts`
- `src/lib/metadata-spike.ts`
- `src/app/icon.svg`
- `src/app/apple-icon.tsx`

## Praktischer Wiedereinstieg

Lokal starten:

```bash
cd /Users/deresjot/Library/CloudStorage/Dropbox/_PRIVAT/Code/git-test/webdev/null-noise
npm run dev
```

Typische Prüfpfade:

- `/`
- `/suche`
- lokale Detailseite eines Seed-Titels
- lokale Detailseite eines bewerteten Titels
- Branch-Preview auf Vercel

## Letzte UI-Nachschärfung

- `src/app/layout.tsx` führt jetzt einen gemeinsamen `site-frame` für Main plus Footer, damit der helle Overlay-Rahmen durchläuft und die bodyweiten Blob-Flächen am Contentrand nicht glitchig durchscheinen.
- `src/app/globals.css` verstärkt Funktions-CTAs farblich, hebt Hover-/Focus-Zustände deutlicher hervor und gibt Ergebnis-Kacheln, Poster und Suchvorschlägen mehr Bewegung über Transitions.
- `src/app/spike/metadaten/[mediaType]/[externalId]/page.tsx` nutzt jetzt `detail-page metadata-detail-page` plus `detail-callout-panel`, damit die externe Detailseite innen luftiger sitzt und nicht mehr so an den Rand drückt.
- Danach wurde der innere Frame wieder zurückgenommen: die Seite läuft wieder vollflächiger, die Body-Formen bleiben aber als Hintergrundbildsprache erhalten.
- Die Display-Typografie wurde mit mehr Laufweite gelockert, damit Hero und Headline-Font weniger gedrängt wirken.
- `src/app/layout.tsx` lädt jetzt zusätzlich das Adobe-Fonts-Webprojekt `https://use.typekit.net/nqa2jtt.css`, damit die `brand-wordmark` Omnes tatsächlich aus dem Webprojekt ziehen kann.
