# null-noise: Projektzusammenfassung

Stand: Version `0.8.3` am 12. April 2026

## Aktueller Hinweis

Heute (12. April 2026, 17:26 CET) wurde der Such-/Filterbereich auf `/suche` in einer härteren V3-Fassung geschärft:

- die passive Checkbox-Anmutung wurde durch einen aktiven Filtermodus mit zwei klaren Umschaltern ersetzt:
  - `Harte Spitzen raus`
  - `Dichte Klangflächen raus`
- die Filter greifen jetzt als harte Ausschlüsse statt milder Umsortierung:
  - `peakIntensity` und `stimulusDensity` werden ab erhöhter Stufe konsequent entfernt
  - beide Regeln greifen kombiniert über lokale und externe Treffer
- im Ergebnisbereich erscheint bei aktiven Filtern eine knappe aktive Rückmeldung (`Aktiv: ...`).
- im Browse-Zustand ohne Suchbegriff wird bei aktiven Filtern sichtbar stärker ausgedünnt; leere Gruppen bleiben dabei bewusst ehrlich sichtbar.

Konsolidierungs- und Release-Pass (12. April 2026):

- Startseite und Sucheinstieg wurden visuell beruhigt und klarer gewichtet, der Eingabebereich wurde als Primäraktion lesbarer gemacht.
- Instabile Bewegungswirkung wurde reduziert: kein layoutverändernder Hero-Shift mehr bei Fokus, ruhigere Flächen ohne Scroll-Jitter.
- `brand-mark` wurde wieder präsenter gemacht, mit klarerer Gesichtslesbarkeit und kleiner Bewegungsreichweite.
- Erstlesart in Suchkarten bleibt jetzt eindeutig Anzeige statt scheinbares Control; Kartenabstände und Innenräume wurden entzerrt.
- Lokale und Spike-Detailseite wurden über Breite/Zonierung vereinheitlicht (kein `page-bleed` mehr im Detail-Hero).
- `/barrierefreiheit` wurde inhaltlich gestrafft und neutralisiert, Tests dafür wurden auf die bereinigte Struktur angepasst.

Die aktuelle Runde war ein kleiner UI-/UX-Pass auf dem vorhandenen Referenzstand:

- Such-/Filter-Block geschärft:
  - die Sidebar auf `/suche` spricht jetzt knapper und nutzungsorientierter
  - technisch klingende Erklärzeilen wurden entfernt
  - Filtertexte wurden auf `Optional eingrenzen`, `Möglichst ohne harte Spitzen` und `Dichte Klangflächen vermeiden` umgestellt
- Karten-Erstlesart sichtbar neu gefasst:
  - statt der schwachen Achse nutzen Karten jetzt eine ruhige segmentierte 3er-Logik
  - `ruhiger`, `mittig` und `intensiver` sind direkt auf der Vorschau lesbar
  - die Statuszeile bleibt kurz bei `Erste Einschätzung` oder `Noch ohne Rückmeldungen`
- Fokus und Skiplinks vereinheitlicht:
  - globaler doppelter Fokusstil aus heller und dunkler Linie
  - drei Skiplinks für Top-Menü, Inhalt und Footer
  - Fokuszustände greifen jetzt konsistenter über Links, Buttons, Felder und Summary-Elemente
- `brand-mark` weiter beruhigt:
  - die Shapes driften weniger weit
  - ein Shape bleibt stärker bei den Augen, eines beim Mund, nur eines bleibt freier
  - die Mischwirkung bleibt näher an der Wortmarke

Die aktuelle Runde war ein gezielter Konsolidierungs- und Referenzpass auf dem vorhandenen Stand:

- manuelle Accessibility jetzt expliziter:
  - der manuelle Prüfpfad für `/`, `/suche`, `/suche?q=Arrival` und `/titel/mondfenster` ist jetzt dokumentiert und fester Teil der Referenzdoku
  - die Trennung zwischen automatisiert belastbar und bewusst manuell zu prüfen ist klarer beschrieben
- eigene Seite `Barrierefreiheit` ergänzt:
  - erreichbar über den Footer unter `/barrierefreiheit`
  - beschreibt Geltungsbereich, aktuellen Stand, automatisierte und manuelle Prüfung, Grenzen und Kontaktweg
  - formuliert bewusst keine ungesicherte BFSG-Vollbehauptung
- Kontrast- und Reflow-Nachzug:
  - kleine Home-Hero-Texte auf grünem Grund wurden kontraststärker gemacht
  - horizontales Overflow auf Kernseiten bei `320 CSS-Pixeln` wurde bereinigt
  - ein kleiner Reflow-Smoke-Test deckt diese Regression jetzt zusätzlich automatisiert ab
- Referenzcharakter geschärft:
  - neue Datei `docs/reference-goals.md`
  - die Entscheidung gegen einen separaten HTML-Sondermodus ist jetzt ausdrücklich dokumentiert

Wichtige zusätzliche Referenzpunkte:

- [docs/reference-goals.md](./reference-goals.md)
- [src/app/barrierefreiheit/page.tsx](../src/app/barrierefreiheit/page.tsx)

Die jüngste Runde war kein Feature-Ausbau, sondern ein gezielter Accessibility- und UX-Härtungspass auf dem bestehenden Stand:

- Accessibility systematisiert:
  - `@axe-core/playwright` prüft jetzt die vier Kernrouten `/`, `/suche`, `/suche?q=Arrival` und `/titel/mondfenster`
  - zusätzlich läuft ein direkter `axe-core`-Pfad, der `axe.min.js` injiziert und `axe.run()` ohne Playwright-Wrapper gegen dieselben Routen ausführt
  - die Testausgabe wird strukturiert nach `critical`, `serious`, `moderate`, `minor` erfasst
  - zusätzlich gibt es einen kleinen Keyboard-Smoke-Test für erreichbare Suchvorschläge
- direkte A11y-Fixes aus dem Browser-Audit:
  - Landmark-Dopplungen in Suche und Kartenstruktur wurden entfernt
  - der Skip-Link liegt jetzt innerhalb des Header-Landmarks
  - die Heading-Reihenfolge auf der Detailseite wurde bereinigt
  - kleine Kontrastprobleme in Browse-, Followup- und Detail-Metatexten wurden nachgezogen
  - übergriffige ARIA am Suchfeld wurde vereinfacht, damit die Oberfläche kein komplexeres Combobox-Verhalten behauptet als sie tatsächlich bietet
- UX für schnelle Überforderung geschärft:
  - die Detailseite benennt die primäre Aussage jetzt konsequent als `Erstlesart`
  - `Passt das gerade?` wurde textlich auf kurze, direktere Entscheidungssätze reduziert
  - Unsicherheit wird deutlicher und alltagssprachlicher markiert, etwa über `Erste Einschätzung` und `Kaum Hinweise`
- Referenz-Doku ausgebaut:
  - neue Dateien:
    - `docs/a11y-principles.md`
    - `docs/a11y-testing.md`
    - `docs/ux-principles.md`
    - `docs/product-principles.md`
    - `docs/reference-goals.md`
  - bestehende Doku-Dateien wurden auf diesen Stand nachgezogen

Wichtige neue Referenzpunkte:

- [docs/a11y-principles.md](./a11y-principles.md)
- [docs/a11y-testing.md](./a11y-testing.md)
- [docs/ux-principles.md](./ux-principles.md)
- [docs/product-principles.md](./product-principles.md)
- [docs/reference-goals.md](./reference-goals.md)

Die vorherige größere Phase war ein mehrstufiger Produkt- und UI-Ausbau auf dem bestehenden Stand:

- Finaler Deploy-Readiness-Pass auf dem aktuellen Stand:
  - der Launch-Scope wurde noch einmal auf die belastbaren Kernpfade reduziert: Home, Suche, kurze Queries, Detailseite, Erstlesart, `Passt das gerade?` und ehrliche Fallbacks
  - instabilere Zusatzpfade bleiben defensiv:
    - Letterboxd erscheint nur bei erfolgreichem Abruf
    - Watchmode bleibt optional, sonst läuft `Verfügbar bei` ehrlich über die Angebotsseite
    - Vergleichs-, Kipp- und Followup-Blöcke werden bei dünner Datenlage weiter lieber klein gehalten oder weggelassen
  - der bekannte Root-Hydration-Fall wurde ohne `suppressHydrationWarning` bereinigt:
    - `<html>` wird vor der Hydration gezielt auf den erwarteten stabilen Zustand normalisiert
    - lokale Browserzustände wie `Merken`, `Schon gesehen` und das lokale Shelf übernehmen jetzt früher und ohne sichtbaren ersten Sprung
  - Build, Unit-Tests, Playwright und ein echter lokaler Production-Check über `npm run start` liefen auf den Kernpfaden sauber
  - die Runtime-Erwartung ist für Vercel jetzt klarer gezogen:
    - für den öffentlichen read-only MVP erforderlich: `TMDB_READ_ACCESS_TOKEN`
    - empfohlen: `NEXT_PUBLIC_SITE_URL` für eine feste kanonische URL; ohne diese Variable greift der Code auf `VERCEL_PROJECT_PRODUCTION_URL` oder `VERCEL_URL` zurück
    - optional: `DATABASE_URL` für lokalen Katalog, Seed-Daten und spätere Schreibpfade
    - optional: `WATCHMODE_API_KEY`, `LETTERBOXD_CLIENT_ID`, `LETTERBOXD_CLIENT_SECRET`
    - Schreibpfade bleiben ohne explizite Freigabe read-only
  - der Production-Check lief zusätzlich auch ohne `DATABASE_URL`, aber mit gesetztem TMDb-Token sauber durch; der öffentliche MVP kann also ohne lokale SQLite-Datei starten
  - für den echten Vercel-Deploy ist lokal noch kein Projekt-Link im Repo hinterlegt; der Stand ist build-ready, aber `vercel link` bzw. die Projektverknüpfung gehört erst in den eigentlichen Deploy-Schritt
- Launch-Pass auf dem aktuellen Stand:
  - Scope wurde auf stabile Kernpfade begrenzt: Suche, Detail, Erstlesart, Entscheidungshilfe und ehrliche Fallbacks
  - ein ruhiger Launch-Hinweis `Früher Prototyp. Einschätzungen sind vorläufig.` ist jetzt sichtbar im Footer
  - Rechtsseiten und `.env.example` wurden in den angefassten Bereichen auf sauberes UTF-8 gebracht
  - `Datenschutz` nennt jetzt ausdrücklich LocalStorage für `Merken` / `Schon gesehen` und den Verzicht auf Tracking-Tools
  - der optionale Letterboxd-Zusatzblick wird im UI nur noch gezeigt, wenn wirklich belastbare Daten da sind
  - der Root-`scroll-behavior` ist jetzt Next-konform markiert, damit der Produktionsbrowsercheck ohne diese Warnung durchläuft
- Entscheidungsreife-Pass auf dem aktuellen Stand:
  - Detailseiten lesen sich jetzt stärker als Entscheidungshilfe statt nur als Analysefläche
  - direkt bei der Erstlesart sitzt ein kleiner Block `Passt das gerade?`
  - dazu kommen relative Orientierung über `Im Vergleich zu …` und kleine negative Hinweise `Könnte kippen, weil …`
  - lokale und externe Detailseiten ziehen Folgeempfehlung, Entlastung, Feedback und `Verfügbar bei` jetzt sichtbarer in dieselbe innere Logik
  - Suche und Browse sprechen konsistenter in Alltagssprache statt in Systemlabels
  - direkt angefasste UI- und Doku-Texte wurden weiter auf sauberes UTF-8 mit echten Umlauten und ß nachgezogen
- Produktreife-Pass auf dem aktuellen Stand:
  - Fehler- und Statusmeldungen wurden in Suche, Detailseiten, Followups und `Verfügbar bei` klarer und ruhiger gefasst
  - lokale Aktionen wie `Merken`, `Schon gesehen`, Reset und `Andere zeigen` geben jetzt knappes Inline-Microfeedback statt still zu springen
  - der lokale Bereich auf `/suche` hat leere und aktive Zustände jetzt produktischer formuliert, inklusive klarer Reset-Aktionen
  - Browse-Texte und kleine Situationshinweise erklären auf `/suche` besser, warum der aktuelle Rahmen gerade hilft
  - sichtbare Texte in den neu angefassten UI- und Doku-Bereichen wurden auf sauberes UTF-8 mit echten Umlauten und ß nachgezogen
- Systemrobustheit nachgezogen:
  - der Feedback-Stempel läuft jetzt über einen kleinen Client-Guard statt über `Date.now()` im Renderpfad
  - Suggestion-Antworten werden sauber dedupliziert und bleiben auf TMDb-Titel beschränkt
  - lokale Browserzustände bleiben in den neuen Shelf-/Pocket-Pfaden stiller und robuster

- Nutzwert-Pass auf dem aktuellen Stand:
  - Detailseiten führen jetzt weiter:
    - kleiner Bereich `Dazu passt auch …` für Titel in ähnlicher Reizlage
    - bei intensiveren Titeln zusätzlich ein ruhiger Entlastungsblock `Wenn du etwas Ruhigeres suchst`
  - beide Bereiche bleiben klein, defensiv formuliert und arbeiten mit derselben Tile-Sprache wie Suche und Browse
- Lokales `Merken` und `Schon gesehen` ohne Konto:
  - Titel können jetzt auf Such-/Browse-Tiles und auf Detailseiten lokal im Browser gemerkt oder als gesehen markiert werden
  - auf `/suche` erscheint dafür ein kleiner Abschnitt `Für später und schon gesehen`
  - gesehen markierte Titel können dort optional ausgeblendet werden, ohne dass daraus eine Watchlist- oder Tracking-Logik wird
- Browse nützlicher gemacht:
  - Tiles tragen jetzt kurze Begründungszeilen wie `eher ruhiger Einstieg` oder `wenig harte Spitzen`
  - der leere Suchzustand führt dadurch nicht nur in Titel, sondern auch in eine kurze alltagssprachliche Einordnung
- Unsicherheit noch sichtbarer:
  - bei dünner Datenlage klingen Erstlesart und Status jetzt sichtbar vorsichtiger, z. B. `Kaum Hinweise`
  - die UI unterscheidet klarer zwischen erster Lesart und belastbarerem Rückhalt
- Feedback rückkanalfest gemacht:
  - der anonyme Detailseiten-Feedbackblock bleibt klein, kann den sichtbaren Stand eines Titels aber jetzt später mittragen
  - die Rückmeldung bleibt still, nicht sozial und ohne Bewertungsoptik
- Performance ruhig gehalten:
  - Merken/Gesehen arbeitet nur lokal im Browser
  - Browse-Folgeempfehlungen nutzen bestehende TMDb-/Inference-Pfade statt neuer schwerer Empfehlungslogik
  - der Browse-Mix bleibt pro Filtersatz stabil und springt nur bei bewusstem Wechsel

- Vertrauen/Confidence-System geschärft:
  - die sichtbaren Zustände rund um die Erstlesart wurden sprachlich ehrlicher und nützlicher gefasst
  - statt grober Restkategorien tauchen jetzt ruhigere Hinweise wie `Bisher nur grob gelesen`, `Dafür gibt es erste Rückmeldungen` oder `Das wirkt inzwischen stimmiger` auf
  - direkt am Erstlesart-Block steht jetzt zusätzlich eine knappe Basiszeile wie `Bisher spricht vor allem die Basis dafür`
- Erstlesart erklärbarer gemacht:
  - auf lokalen und externen Detailseiten gibt es jetzt einen nativen Disclosure-Bereich `Worauf basiert das?`
  - dort werden Genres, Keywords, Kurzbeschreibung und vorhandene Rückmeldungen knapp und nachvollziehbar aufgeführt
  - die Hauptaussage bleibt kurz, die Vertiefung wandert bewusst in `details/summary`
- Minimalen Feedback-Flow ergänzt:
  - Detailseiten haben jetzt einen kleinen anonymen Rückkanal `War das für dich eher …`
  - Optionen: `ruhiger als erwartet`, `ungefähr passend`, `intensiver als erwartet`
  - keine Konten, keine soziale Sichtbarkeit, kein Bewertungs-Spektakel
  - nach Abgabe erscheint ein ruhiger Erfolgszustand direkt im selben Bereich
- Browse auf `/suche` produktischer gemacht:
  - der leere Suchzustand bleibt bei `Eher leise` und `Eher laut`, erklärt die Auswahl jetzt aber nützlicher
  - Tiles tragen eine kurze Begründungszeile wie `wenig harte Spitzen` oder `eher ruhiger Einstieg`
  - `Andere zeigen` variiert den Pool sichtbar, während der Ausgangszustand pro Filtersatz ruhiger und session-stabil bleibt
- Provider-Nutzwert verbessert:
  - `Verfügbar bei` ordnet Gruppen jetzt stabil als `Im Abo`, `Kostenlos`, `Leihen`, `Kaufen`
  - Preis-/Formatdetails werden nur gezeigt, wenn Watchmode sie belastbar komplett liefert
  - Links bleiben klar getrennt zwischen `Direkt zum Angebot` und `Zur Angebotsseite`
- Suchqualität gezielt nachgezogen:
  - kürzere Queries profitieren jetzt etwas stärker von `originalTitle` und robusteren Exakt-/StartsWith-Treffern
  - dadurch gehen Titel wie `Arrival`, `Frozen` oder ähnliche Varianten weniger schnell in Seitentreffern unter
- Performance ruhig gehalten:
  - Browse-Mix bleibt ohne explizites `Andere zeigen` stabil
  - Feedback läuft über eine einfache Server-Route statt über schwere Client-Logik
  - Detailseiten laden Erklär- und Zusatzblöcke nachgeordnet, ohne die Kernseite in neue Widget-Komplexität zu kippen

- Neubau der Browse-/Trefferdarstellung: die Suchseite arbeitet nicht mehr primär mit schmalen, hohen Kacheln, sondern mit breiteren Tile-Artikeln; Poster und Erstlesart sind als erste und zweite Hauptaussage klar getrennt.
- Erstlesart als zweite Hauptaussage: Browse- und Trefferobjekte haben jetzt eine eigene Lesezone mit Kicker, großer Tendenzzeile, breiterer `leise ↔ laut`-Achse und verdichtetem Statussatz vor dem CTA.
- Abkehr vom alten Kartenmuster: CTA und Nebenhinweise sitzen jetzt in eigener Nachzone statt als dominanter Kartenfuß, das Suchraster ist breiter und editorialer angelegt.
- Suchseite und Detailseiten folgen jetzt sichtbarer demselben Hierarchieprinzip: Poster, Titel, Erstlesart, dann Aktion und Rest.
- Erstlesart gestärkt: lokale und externe Detailseiten gewichten Tendenz, Status und Achse jetzt deutlich stärker; die horizontale `leise ↔ laut`-Achse sitzt direkter unter der großen Tendenz und spielt visuell fast auf Poster-Niveau mit.
- Browse-Zustand auf `/suche` ausgebaut: bei leerem `q` erscheint jetzt direkt ein echter Browse-Zustand mit zwei klar getrennten Bereichen `Eher leise` und `Eher laut` statt einer leeren Suchfläche.
- Externe Vorschläge verfeinert: der Browse-Zustand zieht jetzt echte TMDb-Discover-Titel, mischt sie über `mix` sichtbar durch und trennt Browse sauber von normalen Suchtreffern.
- TMDb-/Inference-Pfad verfeinert: externe Detaildaten ziehen jetzt Keywords mit ein; die vorläufige Erstlesart kann damit Genres, Synopsis und TMDb-Keywords etwas belastbarer lesen, bleibt aber ausdrücklich eine vorsichtige Startbasis.
- Poster-/Provider-/Performance-Nachzug: große Detailposter laufen jetzt konsistenter über die große TMDb-Variante, TMDb-Detail- und Watch-Requests werden sinnvoller gepuffert, und `Verfügbar bei` bleibt textbasiert, gruppiert und ehrlich verlinkt.
- Letterboxd bleibt sekundär: als Zusatzblick auf Detailseiten, aber nicht als Primärquelle für Suche, Poster oder Stammdaten.
- Anbieterlinks können jetzt optional direkt werden: wenn `WATCHMODE_API_KEY` gesetzt ist, nutzt `Verfügbar bei` Watchmode als nachgeordnete Zusatzquelle für direkte Angebotslinks, Formate und Preise; ohne Key bleibt der bisherige TMDb-/JustWatch-Weg als Fallback aktiv.
- Das Header-Logo wurde zuletzt noch einmal stabilisiert: die Gesichtsform arbeitet jetzt nicht mehr mit einer festen weißen Outline, sondern mit einer berechneten Kontrastwirkung über die gemischten Farbflächen; die drei Blobs dürfen sich zusätzlich in engem Rahmen organisch verformen, ohne die Marke unruhig zu machen.

Die vorherige Runde war ein gerichteter Hero-/Ergebnis-/Detail-Umbau auf dem bestehenden Produkt:

- UI-/CSS-Cleanup: die Oberfläche wurde von paneligen Zwischenständen auf eine klarere, hero-getriebene Struktur umgebaut.
- Copy-Reset: Home, Search, Detailseite, Statuszeilen, CTA-Texte, Hilfe- und Footer-Texte wurden neu geschrieben.
- Branding-Vereinfachung: sichtbares Maskottchen bleibt raus, Wortmarke und reduzierte Form tragen die Oberfläche.
- Entfernen alter UI-Reste: Search-Feature-Cards, Posterbühnen, Badge-Logik und Box-in-Box-Reste wurden zurückgebaut.
- Neue Löschfunktion: lokal angelegte Titel können ruhig und bestätigt wieder entfernt werden.
- Tendenzachse neu gefasst: die Tendenz erscheint jetzt vor allem auf der Detailseite als ruhige horizontale Bar statt als laute Rasterinszenierung.
- Home danach noch einmal visuell nachgeschärft: farbigerer Hero, organischere Formen und trockenere Copy.
- Kontrollierter Style-Rebuild danach: globale Flächen wurden wieder neutralisiert, Home trägt die bunte 2D-Flat-Bildsprache jetzt über eigene Wrapper-Klassen, Search und Detail bleiben bewusst ruhig.
- Search danach noch einmal praktisch justiert: Suchtreffer wieder als Poster-Kacheln, `NUR ANSEHEN` als Primär-CTA, lokales Anlegen aus der Trefferliste auf die externe Detailansicht verlagert und ausklappbare Boxen nicht mehr durch zu enge Container abgeschnitten.
- Danach wurde die Suchoberfläche noch einmal sichtbarer an die Hero-Sprache gezogen: transparente Sticky-Navigation, vollflächiger grüner Hintergrund, Form-Logo aus den Produktfarben, kompakte Tendenzbar direkt in den Suchkacheln und überarbeitete Icons auf Basis derselben Formen.
- Danach folgte ein gezielter Component-Fix ohne neue Stilrunde:
  - Suchvorschläge auf Home und `/suche` wurden aus `overflow`- und `z-index`-Konflikten befreit und bleiben jetzt sauber scrollbar statt nach wenigen Einträgen abgeschnitten.
  - Home-Suche und Search-Stage teilen sich jetzt ein klareres gemeinsames Search-Surface-System mit gleicherer Input- und Buttonlogik.
  - Große Poster auf Detailseiten ziehen für TMDb-Titel jetzt eine größere Proxy-Variante statt der kleineren Kachelgröße.
  - Der Einordnungsblock auf Detailseiten wurde typografisch und räumlich verdichtet, damit Tendenz und Stand klarer als primäre Lesart erscheinen.
- Danach kam ein kleiner Detailausbau:
  - TMDb-basierte Detailseiten zeigen jetzt zusätzlich eine nachgeordnete `Verfügbar bei`-Ansicht.
  - Die Anbieter werden gruppiert nach `Im Abo`, `Kostenlos`, `Leihen` und `Kaufen` ausgegeben.
  - Die Anzeige bleibt textbasiert, regionsgebunden auf `DE` und ausdrücklich nachgeordnet hinter Tendenz und Einordnung.
  - Anbieterzeilen sind jetzt klickbar und führen über die offizielle TMDb-/Watch-Seite weiter zum Angebotsweg.
  - Für TMDb-basierte Filme hängt jetzt zusätzlich ein Letterboxd-Zusatzblick an der Detailseite:
    - immer mit Website-Link über TMDb-ID
    - optional mit API-Details wie Durchschnitt und Top-250-Position, wenn Letterboxd-Zugangsdaten gesetzt sind.

Die Produktlogik blieb dabei unverändert: TMDb liefert reale Titel und Basisdaten, `null-noise` ergänzt Reizprofil, Wirkung und Wachstumsstand.

## Projektstand für einen neuen Chat

Wenn ein neuer Chat den aktuellen Stand übernehmen soll, ist das hier der kürzeste belastbare Einstieg:

- `null-noise` ist aktuell eine Next.js-App zum Finden und vorsichtigen Einordnen von Filmen und Serien nach vermuteter Reizwirkung.
- Reale Titel und Basisdaten kommen primär aus `TMDb`.
- `null-noise` legt darüber eine eigene, ausdrücklich vorläufige Erstlesart:
  - `eher leise`
  - `eher laut`
  - dazu Status wie `Vorläufig`, `Wachsend`, `Belastbarer`
- Es gibt keine Scores, Prozentwerte oder KPI-Darstellung.
- Lokale Titel existieren weiter für Profil-/Produktlogik, aber nicht mehr als primäre sichtbare Quelle im Hauptfluss.

### Wichtige Produktpfade

- `/`
  - Hero-getriebene Startseite mit großer Suche
  - bunte, organische Art-Direction nur hier deutlich sichtbar
- `/suche`
  - `q` leer: echter Browse-Zustand mit zwei sichtbaren Bereichen:
    - `Eher leise`
    - `Eher laut`
  - `q` gesetzt: normale Suchtreffer
  - keine Mischliste aus Browse und Suche
- `/spike/metadaten/[mediaType]/[externalId]`
  - externe Detailseite für TMDb-Titel
  - dient aktuell als primärer externer Detailpfad
- `/titel/[slug]`
  - lokale Detailseite für angelegte/angereicherte Titel

### Datenquellen und Rollen

- `TMDb`
  - Primärquelle für Suche, Poster, Basisdaten, Discover/Browse und externe Detailseiten
- `Letterboxd`
  - sekundärer Zusatzblick auf Detailseiten
  - nicht primär für Suche, Poster, Stammdaten oder Provider
- `Watchmode`
  - optionale Zusatzquelle nur für `Verfügbar bei`
  - soll direkte Angebotslinks, Formate und Preise liefern
  - greift nur, wenn `WATCHMODE_API_KEY` gesetzt ist
  - ohne Key bleibt der TMDb-/JustWatch-Fallback aktiv

### Sichtbare UI-Prinzipien

- Browse-/Trefferdarstellung auf `/suche`
  - alte schmale Karten wurden bewusst verlassen
  - stattdessen breitere Tile-Artikel mit klaren Zonen:
    - Poster
    - Titel
    - Erstlesart
    - CTA
    - Sekundärinfos
- Die Erstlesart ist die zweite Hauptaussage nach dem Poster.
- Die `leise ↔ laut`-Anzeige ist keine Slider-Optik mehr, sondern eine passive Pegelanzeige.
- Detailseiten folgen demselben Hierarchieprinzip, nur größer und stärker.
- `Verfügbar bei` ist auf externen Detailseiten inzwischen wichtiger als rohe Metadaten-Listen wie `Basisdaten im Blick`.

### Branding und Header

- sichtbares Maskottchen bleibt aus der Produktführung raus
- Wortmarke plus organische Farbformen bleiben das aktuelle Interim-Branding
- das Header-Logo:
  - darf sich ruhig bewegen
  - respektiert `prefers-reduced-motion`
  - kontrastiert im Gesicht nicht mehr über eine feste Outline, sondern über berechnete Kontrastwirkung auf den gemischten Formen

### Was aktuell bewusst nicht gemacht wird

- keine Konten
- keine Social- oder Community-Mechaniken
- keine Audioanalyse an realen Inhalten
- keine objektive Lautheitsbehauptung
- keine Anbieter als primaere Produktlogik

### Wichtige Env-Flags

- `TMDB_READ_ACCESS_TOKEN`
- `LETTERBOXD_CLIENT_ID`
- `LETTERBOXD_CLIENT_SECRET`
- `WATCHMODE_API_KEY`

### Bekannte offene Punkte

- Browse-Vorschläge bleiben eine vorsichtige Metadaten-Erstlesart, keine belastbare Wirkungsmessung.
- Watchmode ist code-seitig vorbereitet, lokal aber nur dann sichtbar, wenn `WATCHMODE_API_KEY` wirklich gesetzt ist.
- Provider-/Watch-Daten bleiben regionsabhängig und können sich kurzfristig ändern.
- Einige externe Titelpfade laufen noch sichtbar über `/spike/...`; das ist funktional okay, aber produktsprachlich noch kein finaler Endzustand.

## 1. Ausgangspunkt und Produktidee

`null-noise` ist als barrierearme Web-App für Filme und Serien gestartet, die sensorische Belastung nicht als scheinbar objektiven Messwert darstellt, sondern als erklärtes Reizprofil. Der Kern ist bis heute gleich geblieben:

- Reizprofile statt Dezibel-Versprechen
- ruhige, verständliche Oberfläche statt Entertainment-UI
- Privacy by Design statt Tracking, Kontozwang oder Profilbildung
- Accessibility als Kernfunktion statt nachträgliches Compliance-Thema

Die Produktfrage lautet bewusst schlicht: Ist ein Titel für mich gerade ruhig genug oder potenziell belastend?

## 2. Frühe Produkt- und Architekturentscheidungen

Zu Beginn wurde ein belastbares MVP-Konzept mit klaren Grenzen angelegt:

- Fokus zunächst nur auf akustische Belastung
- visuelle Reizdimensionen erst als spätere Erweiterung
- kein Social Layer, keine Gamification, keine Personalisierung
- keine Nutzerkonten im MVP
- keine direkte Verbindung vom Browser zu externen APIs

Technisch wurde deshalb eine kleine, robuste Next.js-Basis gewählt:

- Next.js App Router
- TypeScript
- semantische UI-Komponenten ohne schwere UI-Library
- Route Handlers für serverseitige Endpunkte
- Prisma/PostgreSQL als Zielmodell für spätere Persistenz
- Playwright und axe für frühe Accessibility-Prüfung
- Vitest für fokussierte Logik- und Mapping-Tests

Diese Architektur wurde absichtlich nicht auf „schnell große Features“ optimiert, sondern auf nachvollziehbare Zustände, saubere Trennung und spätere Erweiterbarkeit.

## 3. Datenmodell und Trennung der Verantwortlichkeiten

Ein wesentlicher Grundsatz war früh die strikte Trennung verschiedener Datenarten:

1. externe Titeldaten
2. eigenes Reizprofil
3. spätere Einzelbewertungen
4. Aggregation
5. Confidence

Der Grund dafür war inhaltlich und UX-seitig wichtig:

- Externe Filmdatenbanken wissen nichts über sensorische Belastung.
- Reizprofile sollen nicht wie automatisch berechnete Wahrheiten wirken.
- Unsicherheit soll sichtbar und erklärt bleiben.

Deshalb wurden Modelle wie `stimulus_profile`, `content_flags`, `rating_count`, `source_type` und `last_reviewed_at` vorbereitet, ohne vorschnell eine produktive Bewertungslogik vorzutäuschen.

## 4. Accessibility- und Privacy-Rahmen

Von Anfang an wurde `null-noise` an WCAG 2.2 AA, EN 301 549 und den BFSG-/EAA-Kontext angelehnt. Inhaltlich hieß das:

- semantisches HTML zuerst
- ARIA nur ergänzend
- vollständige Tastaturbedienbarkeit
- sichtbare Fokuszustände
- keine Hover-only-Hilfen
- reduzierte Bewegung
- klare Fehlermeldungen und Zustände in Textform

Privacy-seitig wurden folgende Grenzen festgezogen:

- keine Tracker
- kein Fingerprinting
- keine Client-Direktaufrufe zu externen Quellen
- keine versteckten Kennungen
- kein Kontozwang
- nur minimale funktionale Speicherung

Das war nicht nur technischer Selbstschutz, sondern Teil der Produktidee: Eine App, die Menschen bei Reizreduktion hilft, sollte sie nicht parallel tracken.

## 5. UI- und Komponentenstrategie

Statt früh eine komplette Komponentenbibliothek zu übernehmen, wurde eine strenge HTML-first-Strategie eingeführt. Orientierung kam von barrierearmen Pattern-Quellen, aber jede Komponente wurde lokal bewertet. Besonders wichtig waren dabei:

- native Formularelemente
- `details` und `summary` für Disclosure
- klare Listen- und Kartenmuster
- keine künstlichen Menüs, Tabs oder Tooltips, wenn einfachere Muster reichen

Die dokumentierte Strategie dazu liegt in [docs/ui-component-strategy.md](./ui-component-strategy.md).

Später wurde die Orientierung an Inclusive Components explizit ergänzt. Die wichtigste Ableitung daraus war: Primäre Erklärung sichtbar halten und nur vertiefende Hilfe aufklappbar machen.

## 6. Erste technische Basis des MVP

Auf dieser Grundlage wurde eine lokale MVP-Basis aufgebaut:

- Startseite mit kurzer Einführung
- Suchseite
- Detailseite pro Titel
- Erklärungssystem
- Bedienhinweise
- lokaler Beispielkatalog mit Mock-Daten
- semantische Komponenten und frühe Accessibility-Smoke-Tests

Diese Phase diente nicht dazu, „fertig“ zu wirken, sondern das Grundgerüst belastbar zu machen. Der lokale Katalog wurde bewusst klein gehalten, damit Suchlogik, Reizprofil-Darstellung und Copy zunächst im kontrollierten Rahmen überprüft werden konnten.

## 7. Externe Metadaten als Integrations-Spike

Ein späterer Schritt war kein Produkt-Feature, sondern ein begrenzter Integrations-Spike: die serverseitige Anbindung an eine echte externe Titeldatenquelle.

Dabei wurden mehrere Wege geprüft:

- IMDb als theoretisch hochwertige, aber deutlich schwergewichtigere Option
- TMDb als realistischere erste Quelle für Metadaten

Die Entscheidung fiel für den Spike pragmatisch auf TMDb, weil:

- die API vergleichsweise einfach serverseitig nutzbar ist
- Suche und Basisdetails für Film und Serie direkt verfügbar sind
- das Projekt bereits einen klar getrennten Fallback-Pfad hatte

Wichtig war dabei immer:

- keine Persistenz der Antworten
- kein direkter Browserzugriff auf TMDb
- keine Vermischung mit dem eigentlichen Reizprofil
- externe API liefert nur Metadaten, keine sensorische Bewertung

So entstand der getrennte Pfad `/spike/metadaten` sowie eine minimale interne Mapping-Schicht für:

- externe ID
- Titelname
- Medientyp
- Erscheinungsjahr
- Kurzbeschreibung optional
- Posterpfad optional

## 8. Verifikation und Diagnose des TMDb-Pfads

Die TMDb-Strecke hat nicht sofort funktioniert. Es gab mehrere Iterationen, in denen klar getrennt wurde zwischen:

- fehlendem oder falschem Token
- serverseitiger Konfiguration
- funktionierendem Request-Aufbau
- Upstream-Fehlern wie `401`
- leerer Antwort
- erfolgreichem Mapping

Wichtig war hier die Entscheidung, Debugging nicht einfach sichtbar ins Produkt-UI zu kippen. Stattdessen wurde nur eine kontrollierte, nicht-sensitive Serverdiagnose ergänzt. Sie zeigte zum Beispiel:

- Token vorhanden: ja/nein
- Token-Länge
- Request gestartet: ja/nein
- Upstream-Statuscode
- Mapping erfolgreich: ja/nein

Nachdem ein korrekter `TMDB_READ_ACCESS_TOKEN` lokal hinterlegt wurde, konnte der serverseitige Live-Check schließlich erfolgreich verifiziert werden.

## 9. Entwicklung der Suche

Die Suchseite war zwischendurch visuell deutlich weiter als funktional. Deshalb wurde sie in mehreren Schritten stabilisiert.

### 9.1 Lokale Suche zuerst

Die Grundregel blieb:

1. lokaler Katalog mit Reizprofil zuerst
2. externe Titeldaten nur als klar getrennte zweite Ebene

Das war bewusst keine technische Kleinigkeit, sondern eine inhaltliche Schutzmaßnahme gegen irreführende Trefferlisten.

### 9.2 Fuzzy-Suche für den lokalen Katalog

Um die Suche alltagstauglicher zu machen, wurde eine fehlertolerante lokale Suche ergänzt. Ziel war nicht „smarte Magie“, sondern nachvollziehbare Toleranz bei leichten Tippfehlern.

Beispiel:

- `Hafn ohne Eile` findet weiterhin `Hafen ohne Eile`

### 9.3 TMDb-Fallback bei fehlendem lokalen Treffer

Wenn lokal nichts mit Reizprofil vorliegt, kann der Server getrennte Titeldaten nachladen. Dieser Pfad wurde so gestaltet, dass:

- Filter mit Reizprofilbezug den externen Fallback bewusst nicht benutzen
- leere Ergebnisse, Fehlkonfigurationen und API-Probleme klar unterschieden werden
- die UI niemals so tut, als seien externe Treffer bereits sensorisch bewertet

### 9.4 Fehlertoleranz bei externen Treffern

Bei Titeln wie `Arival` zeigte sich, dass die Rohreihenfolge von TMDb allein im UI zu unruhig wirkt. Deshalb wurden zwei Dinge ergänzt:

- ein vorsichtiger Retry für plausible Tippfehler
- eine Gewichtung, die kurze, naheliegende Vervollständigungen höher priorisiert

Dadurch landete `Arrival` bei entsprechenden Suchen deutlich plausibler an erster Stelle.

### 9.5 Vorschläge während der Eingabe

Später kamen serverseitige Vorschläge direkt im Suchfeld dazu. Sie bleiben bewusst klein und getrennt:

- keine direkte Client-Anbindung an TMDb
- keine große, komplexe Combobox-Inszenierung
- Vorschläge helfen beim Titeltext, ersetzen aber kein Reizprofil

### 9.6 Bootstrapping über vorläufige Einschätzungen

Mit wachsender TMDb-Integration wurde klar, dass `null-noise` nicht auf einen schon großen internen Katalog warten kann. Deshalb wurde die Such- und Produktlogik weiter verschoben:

- externe Titel bleiben klar als metadatenbasiert markiert
- sie wirken aber nicht mehr wie leere Fälle
- stattdessen zeigt die Suche jetzt schon eine vorsichtige erste Einordnung aus Metadaten
- lokale Anlage und spätere anonyme Rückmeldungen verdichten diesen Startpunkt weiter

Wichtig bleibt dabei:

- TMDb liefert weiter nur Metadaten
- die erste Einordnung bleibt eine null-noise-interne Heuristik
- der Zustand wird bewusst als vorläufig benannt
- belastbarere Profile entstehen erst aus Rückmeldungen

### 9.7 Lokale Titel auch wieder entfernbar

Mit der jüngsten Stabilisierung kam bewusst kein Admin- oder Listenmanagement dazu, aber eine normale Produktaktion:

- lokal angelegte Titel können wieder entfernt werden
- die Aktion ist absichtlich zweistufig
- sie hängt am Ergebnis- und Detailfluss statt an einer versteckten Verwaltung
- gelöscht wird nur der lokale `null-noise`-Stand, nicht der reale Titel selbst

### 9.8 Hero-Einstieg oben, Einordnung darunter

Mit der danach folgenden UI-Runde wurde die sichtbare Produktstruktur deutlicher getrennt:

- Home ist jetzt eine große Einstiegsebene mit Suchfokus
- Suchergebnisse leben als eigene ruhige Listenansicht unterhalb der Suche
- die eigentliche Einordnung sitzt auf der Detailseite
- die Ergebnisliste zeigt nur noch Titel, Tendenz, Status und knappe Meta
- die Tendenzachse wurde auf der Detailseite zu einer progress-bar-artigen, aber bewusst groben Lesart umgebaut

Das war kein Produktlogik-Wechsel, sondern eine gezielte Neugewichtung der Oberfläche.

Damit bleibt der Produktkern gleich: Titel finden, grob einschätzen, bei Bedarf lokal weiterführen und notfalls auch wieder zurücknehmen.

## 10. UI-Entwicklung und gestalterische Iterationen

Die Oberfläche hat mehrere sichtbare Iterationen durchlaufen. Das war kein Selbstzweck, sondern eine Suche nach einer Form, die zugleich ruhig, zugänglich, glaubwürdig und testbar ist.

### 10.1 Frühe Basis

Die erste Version setzte vor allem auf klare Boxen, starke Typo und sichtbare Struktur. Das half beim schnellen Aufbauen der Informationsarchitektur, wirkte aber teils noch zu grob oder technisch.

### 10.2 Pattern- und Library-Orientierung

Anschließend wurden DigitalA11Y, Inclusive Components, GOV.UK und ähnliche Quellen als Pattern-Referenz dokumentiert. Das schärfte die Komponentenauswahl, ohne die App optisch wie eine Library-Sammlung wirken zu lassen.

### 10.3 Monochrom und reizärmer

Später wurde die Oberfläche stärker auf geringe Reizdichte ausgerichtet:

- weniger Farbe
- weniger visuelle Effekte
- mehr Kontrast über Typografie und Ordnung statt über bunte Signale
- robustere Zustände bei Farbsehfehlschwäche und migränesensibler Nutzung

### 10.4 Editoriales Redesign

Im aktuellen Stand wurde das UI noch einmal neu ausgerichtet, diesmal stärker mit editorialer Ruhe und mehr Weißraum. Die Leitgedanken dabei:

- weniger Kachelwand
- klarere vertikale Rhythmik
- weniger technische Zwischentöne im sichtbaren Flow
- zurückhaltenderes Markenbild
- ruhigeres Verhältnis von Text, Navigation und Ergebnislisten

Dabei wurden Startseite, Suchseite, Header, Footer sowie Logo/Icon gemeinsam betrachtet, statt nur einzelne Farben zu tauschen.

### 10.5 Beta-Schärfung der Oberfläche

Für die erste öffentliche Beta wurde die Oberfläche danach noch einmal disziplinierter gezogen, ohne die Produktlogik neu zu bauen. Die wichtigsten sichtbaren Schritte waren:

- deutlich weniger pillige Formen
- straffere Karten, Buttons, Labels und Formularfelder
- etwas kräftigere, aber kontrollierte Farbflächen
- klarere Status- und Hinweisboxen
- schnellere visuelle Einordnung in Suchtreffern

Wichtig war dabei: Farbe unterstützt jetzt Orientierung stärker, ersetzt aber weiterhin nie die textliche Bedeutung. Lokale Titel, externe Titeldaten, Statusmeldungen und Formularfeedback bleiben auch ohne reine Farbinterpretation verständlich.

### 10.6 Sichtbare Wachstumslogik im Produkt

In einer weiteren Runde wurde die Oberfläche gezielt auf den frühen Produktzustand angepasst:

- Suchtreffer unterscheiden jetzt klar zwischen vorläufiger Startbasis, ersten Rückmeldungen und belastbarerem Stand
- externe Treffer zeigen eine erste Einordnung aus Metadaten statt bloßer leerer Titeldaten
- die Suchergebnisseite ist jetzt klarer als Results-first-Seite aufgebaut: Ergebnisse zuerst, Suche als kompakte Verfeinerung
- die Suchkarten priorisieren die erste Einordnung jetzt sichtbar vor Synopsis und Detailtiefe
- jede Karte trägt eine kurze Grundtendenz als diskrete Kurzmetrik statt nur verstreuter Einzelwerte
- Detailseiten priorisieren jetzt zuerst eine grobe Grundtendenz und erst danach die drei Einzelachsen
- `peakIntensity` führt visuell stärker
- `soothingEffect` bleibt als eigene subjektive Wirkung getrennt
- das Branding wurde auf eine einfache, ruhigere Form zurückgenommen und stört den Produktfluss weniger

Dadurch wirkt `null-noise` weniger wie eine App mit wenigen Sonderfällen und mehr wie ein Produkt, das sichtbar von externer Metadatenbasis zu interner, wachsender Einschätzung übergeht.

Gleichzeitig wurde die metadatenbasierte Startbasis noch robuster gemacht:

- TMDb-Suchtreffer können jetzt vorhandene Genre-IDs direkt in die vorsichtige Ersteinschätzung einfließen lassen
- die serverseitige Heuristik ist in nachvollziehbare Signalgruppen aufgeteilt: Genres, Konflikt-/Intensitätshinweise, Keywords, beruhigende Signale und Textur
- auch dünne externe Treffer bleiben defensiv, wirken aber nicht mehr ganz so generisch wie ein rein neutraler `2/2/2`-Eindruck

### 10.7 TMDb-First als sichtbares Produktmodell

Mit dem nächsten Reifeschritt wurde `null-noise` deutlicher als das gerahmt, was es in der Praxis bereits ist:

- TMDb ist die reale Primärquelle für Titel und Basisdaten
- `null-noise` legt darüber eine eigene zweite Ebene aus Reizprofil, `soothingEffect`, vorläufiger Einordnung und späteren Rückmeldungen
- die Suchseite ist nicht mehr nur ein Katalogfilter, sondern der eigentliche Haupteinstieg ins Produkt

Das hatte mehrere sichtbare Folgen:

- die Suchergebnisseite zeigt jetzt gleichzeitig bereits lokal angereicherte Titel und weitere reale TMDb-Titel
- externe Treffer erscheinen nicht mehr bloß als Notfall-Fallback, sondern als normaler Startpunkt für vorläufige Einschätzungen
- die Karten wurden luftiger, scanbarer und offener gebaut: mehr Weißraum, klarere Reihenfolge, größere Aktionszonen
- die Kurzmetrik und Grundtendenz sitzen früher und sichtbarer im Kartenaufbau
- erklärende Fließtexte wurden zurückgenommen zugunsten kurzer Kontextzeilen und klarerer Gruppenüberschriften
- Mock- oder Fantasie-Titel wurden nicht zerstörerisch aus der Datenhaltung entfernt, aber sichtbar aus der primären Produktbühne zurückgenommen

Dadurch wirkt `null-noise` weniger wie ein MVP mit internem Beispielkatalog und stärker wie ein System, das reale Titel über TMDb findet und innerhalb von `null-noise` schrittweise um eigene Reizprofile anreichert.

### 10.8 Suchfokus statt Mini-Katalog

Im nächsten Schritt wurde die Start- und Suchlogik noch konsequenter auf die reale Primärnutzung gezogen:

- die Startseite ist jetzt kein Showcase für bereits angereicherte Titel mehr, sondern ein ruhiger Einstieg direkt in die Suche
- der Block `Bereits in null-noise angereichert ...` wurde vollständig entfernt
- die Startseite erklärt das Produktmodell jetzt nur noch knapp: TMDb findet reale Titel, `null-noise` ergänzt die Reizebene darüber
- die Suchergebnisseite trägt dadurch noch klarer den eigentlichen Produktkern
- jede Suchkarte zeigt jetzt eine deutlich sichtbarere, farblich unterstützte Kurzmetrik mit textlicher Grundtendenz
- die Karten sind heller, luftiger und offener gebaut: mehr Weißraum, weniger enge Mikrozonen, klarere CTA-Flächen
- Zustands- und Herkunftshinweise sitzen jetzt früher und offener im Kartenaufbau statt als nachgeschobene Fußnote
- die Typografie wurde vorsichtig über eine geometrischere, lokal verfügbare Heading-Richtung geschärft, aber bewusst auf größere Überschriften begrenzt

Wichtig bleibt dabei: Auch die farblich stärkere Kurzmetrik bleibt bewusst diskret, nutzt keine Prozentwerte, keine KPI-Optik und keine Scheingenauigkeit.

### 10.9 Reset auf ein belastbares Oberflächensystem

In der jüngsten Runde wurde die Oberfläche nicht weiter zugespitzt, sondern bewusst zurückgesetzt und beruhigt:

- die frühere Varianten- und Blob-Erzählung wird in der aktiven UI nicht mehr weitergeführt
- Home, Search, Detailseite und Footer wurden auf eine einzige ruhigere Richtung zusammengezogen
- die Search-Oberkante arbeitet weniger als Bühne und mehr als funktionaler Produktfluss
- Karten und Statuslogik wurden vereinfacht: weniger Untercontainer, weniger gleich laute Module, weniger Schildcharakter
- die Kurzmetrik bleibt wichtig, wirkt aber ruhiger und weniger überinszeniert
- Texte wurden nicht nur neu geschrieben, sondern an mehreren Stellen neu platziert
- Branding wurde auf Wortmarke plus einfache Form zurückgenommen, damit es nicht mehr als Sonderfall mitläuft

Damit fühlt sich `null-noise` im aktuellen Stand eher nach einem belastbaren Beta-Produkt an als nach einem Design-Experiment mit wechselnder Leitidee.

## 11. Marke, Logo und Icon

Die sichtbare Markenführung wurde in der jüngsten Runde stark vereinfacht:

- Header primär als Wortmarke
- keine Badge-Anmutung
- keine sichtbare Blob-Figur mehr in der Produktoberfläche
- Favicon und App-Icon weiter aus einer kleinen organischen Form

Das Ziel war dabei nicht eine besonders laute Markenidee, sondern eine Marke, die die Oberfläche nicht mehr aus dem Tritt bringt.

## 12. Testing und Qualitätssicherung

Parallel zur UI- und Suchentwicklung wurde der Prüfpfad kontinuierlich mitgezogen:

- `npm run test:unit` für serverseitige Logik und Mapping
- `npm run lint` für statische Qualitätskontrolle
- `npm run build` als produktionsnaher Integritätscheck
- `npx playwright test` für Accessibility-Smoke-Tests, Navigation, Suchzustände und Regressionen

Wichtige Playwright-/Vitest-Schwerpunkte waren bisher:

- Skip-Link und Grundnavigation
- sichtbare Ergebnisstruktur
- Tippfehler in der lokalen Suche
- klare leere Zustände
- TMDb-Vorschläge beim Tippen
- Trennung von Hauptproduktfluss und technischem Metadatenpfad
- Feedback direkt an der Bewertungssektion statt verdeckt unter dem Sticky Header
- schnelle Einordnung in Suchtreffern
- minimale Live-Basis mit Impressum, Datenschutz und getrennter TMDb-Einordnung
- sichtbare vorläufige Einschätzungen aus Metadaten auf Suche und Detailseite
- explizite Detail-CTAs statt rein impliziter Titel-Links
- Suchergebnisse zuerst, Verfeinerung danach statt gleichgewichtiger Einstiegs-/Ergebnislogik
- starke Kurzmetrik und Grundtendenz direkt in den Suchkarten statt erst nach längerer Lektüre
- durchgehender heller Content-Rahmen gegen visuelle Background-Glitches hinter Main und Footer
- luftigerer Spike-Detailkopf mit mehr Innenraum statt zu engem Textblock
- farbigere, klarere Funktions-CTAs mit Hover-Lift und stärkeren Übergängen
- danach wieder vollflächiger Seitenlauf ohne inneren Rahmen, bei gleichzeitiger Beibehaltung der Körperformen im Hintergrund
- offenere Laufweite in den Display-Headlines statt zu enger Wortmarken- und Hero-Typografie
- Adobe-Fonts-Webprojekt für die Wortmarke eingebunden, damit `Omnes` auf der Brand-Wordmark lokal und in Browsern mit Netz verfügbar ist

## 13. Warum viele Dinge bewusst noch offen sind

Mehrere Themen wurden absichtlich nicht „halb fertig“ eingebaut:

- keine belastbare produktive Persistenz für öffentliche Schreibpfade
- keine Accounts
- keine Community- oder Social-Funktionen
- keine automatische Gleichsetzung von TMDb-Metadaten mit fertigen Reizprofilen
- keine Suggestion- oder Ranking-Magie über das Nötige hinaus
- kein Hosting-Umbau auf klassisches FTP-Setup

Der Grund ist jeweils derselbe: Solange Basissuche, Reizprofil-Logik, Accessibility, ehrliche Beta-Grenzen und belastbare Speicherung nicht sauber genug sind, wäre zusätzliche Produktlogik eher Scheinfortschritt als echter Fortschritt.

## 14. Aktueller Stand in einem Satz

`null-noise` ist heute ein barrierearm gedachtes Next.js-MVP mit suchfokussierter Startseite, TMDb als sichtbarer realer Primärquelle, einer results-first Suchseite als Haupteinstieg, sichtbar farblich unterstützter Kurzmetrik pro Suchtreffer, vorläufigen Einschätzungen aus Metadaten, wachsendem Profilstatus zwischen Startbasis und Rückmeldungen, getrenntem Reizprofil und `soothingEffect` sowie einer für die erste öffentliche Beta bewusst vorsichtigen, klar lesenden Produktkonfiguration.

## 15. Nächste sinnvolle Fragen für die weitere Entwicklung

Von hier aus sind die nächsten sinnvollen Entscheidungen nicht „noch ein Feature“, sondern eher diese:

- Wie groß soll der lokale, wirklich profilierte Katalog als nächste Testbasis werden?
- Ab wann lohnt sich persistente anonyme Bewertung tatsächlich?
- Welche redaktionellen Prozesse braucht ein verlässliches Initialprofil?
- Welche Teile der externen TMDb-Daten sollen langfristig importiert werden und welche nicht?
- Wie soll das Markenbild weiterentwickelt werden, ohne die ruhige Nutzung zu stören?

Das ist bewusst der Punkt, an dem `null-noise` jetzt steht: nicht mehr nur eine lose Idee, aber auch noch keine künstlich „fertige“ Produktinszenierung.
