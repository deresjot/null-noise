# Evidence-Modell und Datenquellen

## Zweck

Das Evidence-Modell bereitet die vorsichtige erste Einschätzung der Reizwirkung intern granularer auf. Sichtbar bleibt eine kurze sprachliche Tendenz:

- eher ruhig
- eher wechselhaft/durchwachsen
- eher intensiv

Es gibt keine sichtbaren Scores, Prozentwerte oder Rankings.

Intern arbeitet die Evidence Engine v2 mit Quelle, Achse, Signalrichtung, Stärke,
Confidence, Begründung, Konflikten, Entlastungssignalen und dünner Datenlage.
Diese Werte bleiben Arbeitsdaten und werden nicht als scheinpräzise Messung
angezeigt.

## Achsen

- `audio_peaks`: Hinweise auf laute Spitzen, Schüsse, Explosionen oder sprunghafte akustische Last
- `stimulus_density`: Hinweise auf dichte, schnelle oder dauerhafte Reizfolge
- `visual_intensity`: Hinweise auf visuelle Dichte, Stroboskop, psychedelische oder chaotische Bildsprache
- `emotional_load`: Hinweise auf schwere Themen, Verlust, Gewalt, Trauma oder belastende Konflikte
- `predictability`: Hinweise auf Vorhersehbarkeit oder Unvorhersehbarkeit
- `relief`: positive Hinweise auf ruhige, entlastende oder klare Form

## Quellen

- aktiv: TMDb
- optional: Watchmode, Letterboxd
- vorbereitet/nicht aktiv: Does the Dog Die, Common Sense Media
- intern/lokal: User-Feedback, Manual, Local Seed

Optionale externe Quellen bleiben ohne Feature-Flag und API-Key Noop/Fallback. Sie dürfen Tests ohne Keys nicht brechen.

## Datenquellen im Detail

### TMDb

- Status: aktiv
- Zweck: Titel, Suche, Poster, Genres, Keywords, Overview und externe Detaildaten
- Rolle: Katalog- und Metadatenbasis
- Wichtig: TMDb-Daten sind nicht identisch mit der null-noise-Einschätzung

### Watchmode

- Status: optional, nur für Verfügbarkeit relevant
- Zweck: Provider, direkte Angebotslinks, Preise oder Formate
- Aktivierung nur mit `WATCHMODE_API_KEY`
- Ohne Key bleibt der bestehende Fallback aktiv

### Letterboxd

- Status: sekundär/optional, falls im Projekt weiter relevant
- Zweck: möglicher Zusatzblick, nicht Kernquelle der ersten Einschätzung
- Nicht Teil der aktiven Evidence-Basis für Reizwirkung

### Does the Dog Die

- Status: vorbereitet, nicht aktiv
- Feature Flag: `ENABLE_DTTD_EVIDENCE`
- Env: `DOES_THE_DOG_DIE_API_KEY`
- Zweck: Trigger-/Content-Warnings als mögliche Evidence für emotionale, auditive, visuelle oder Vorhersehbarkeits-Signale
- Ohne Flag/Key: Noop/Fallback
- Vor produktiver Aktivierung: Zugriff und Nutzungsbedingungen klären

### Common Sense Media

- Status: vorbereitet, nicht aktiv
- Feature Flag: `ENABLE_CSM_EVIDENCE`
- Env: `COMMON_SENSE_MEDIA_API_KEY`
- Zweck: kuratierte Inhalts-, Alters- und Themeninformationen als mögliche Evidence
- Ohne Flag/Key: Noop/Fallback
- Nicht on-demand produktiv aktivieren
- Vor produktiver Aktivierung: Kosten, API, Partnerschaft und lokale Speicherung klären

### User-Feedback

- Status: später als stille Evidenz möglich
- Kein Social Feature
- Keine öffentliche Bewertung
- Mehrere übereinstimmende Rückmeldungen können Confidence erhöhen
- Einzelne Rückmeldung bleibt schwach

### Manual und Local Seed

- Status: vorbereitete Quellen für interne oder lokale Evidenz
- `manual` darf nur genutzt werden, wenn wirklich manuell geprüfte Evidenz vorliegt
- `local_seed` kann für lokale Startdaten dienen, darf aber keine externe Belastbarkeit vortäuschen

## TMDb als aktive Basis

TMDb liefert Genres, Keywords, Overview und weitere Metadaten. Diese Daten werden defensiv in Evidence übersetzt:

- Genre allein bleibt schwache Evidenz.
- Mehrere passende Keywords können Confidence erhöhen.
- Overview/Synopsis wird nur vorsichtig ausgewertet.
- Relief wird als positive Evidenz gewertet, nicht nur als fehlende Warnung.
- Action, Horror oder Thriller sind keine automatische Intensiv-Garantie.
- Drama, Comedy, Romance, Family oder Documentary sind keine automatische Ruhig-Garantie.

## Aggregationsprinzipien

- Widerspruechliche Signale führen eher zu mixed/durchwachsen.
- Relief ist positive Evidenz, nicht nur fehlende Warnung.
- Sensorische, visuelle und emotionale Intensität bleiben unterscheidbar.
- Emotionale Last ohne sensorische Dichte kippt nicht automatisch auf `eher intensiv`.
- Konfliktregeln sind wichtiger als Mittelwert oder Median; es gibt keinen globalen Median über alle Achsen.
- Bei dünner Datenlage bleibt Confidence niedrig und der Status vorläufig.
- Ausgabe behauptet keine objektive Audio- oder Bildmessung.

## TMDb-Browse-Diversität

Browse-Vorschläge werden vor der Evidence-Bewertung diversifiziert:

1. TMDb Candidate Pool
2. Query Strategy Rotation
3. Diversity Filter
4. Evidence Evaluation
5. Tone Grouping
6. Seeded Shuffle innerhalb passender Gruppen
7. sichtbare Ausgabe

Die Query-Strategien rotieren kontrolliert über Genre-Bias, Popularitätsfenster,
Vote-Count-Fenster, ältere Titel und neuere Titel. Danach reduziert der
Diversity Filter Duplikate, sehr ähnliche Titelprofile und offensichtliche
Reihungswiederholungen. Die sichtbare Tendenz entsteht erst nach der Evidence
Evaluation; Randomisierung wird nicht nachträglich auf `Eher ruhig`,
`Eher wechselhaft` oder `Eher intensiv` geklebt.

Die Randomisierung ist seeded und deterministisch. Ein Seed aus Route, Mix,
Tone und Browse-Kontext sorgt dafür, dass Vorschläge stabil prüfbar bleiben,
aber nicht dauerhaft immer gleich wirken. Es gibt keine Social-, Profil- oder
Personalisierungslogik und keine dauerhafte Speicherung zuletzt gezeigter IDs.

## Sichtbare Ausgabe

Sichtbar werden nur:

- Tendenz
- kurzer Status
- 2 bis 3 kurze Gründe
- vorsichtige Unsicherheitsformulierung
- situative Discovery-Labels wie `Eher ruhig`, `Eher wechselhaft` oder `Kann gerade zu dicht sein`

Nicht sichtbar werden:

- interne Stärken
- numerische Scores
- Prozentwerte
- Rankings

## Discovery-Nutzung

Discovery nutzt die vorhandene Evidence-/TMDb-Auswertung als Entscheidungshilfe,
nicht als personalisierte Empfehlung. Browse-Mixes und Kartenstatus fragen
sprachlich nach der aktuellen Passung: passt das gerade, waere das zu viel,
oder eher vormerken?

Die Formulierungen bleiben bewusst nicht-personalisiert. Es gibt kein
`Empfohlen fuer dich`, kein `Heute passend`, keine Profile und keine dauerhafte
Historie. Browserlokale Merken-/Gesehen-Zustaende bleiben lokal und erzeugen
keine algorithmische Personalisierung.

Auf Detailseiten darf dieselbe Evidence strukturierter erklaert werden:

- `Spricht eher dafuer`: entlastende, klare oder vorhersehbare Hinweise
- `Kann dagegen sprechen`: einzelne Hinweise auf Dichte, Lautheit, visuelle oder emotionale Last
- `Datenlage`: knappe Einordnung, ob die Einschaetzung nur aus Metadaten kommt oder duenn bleibt

Diese Gruppen sind Textstruktur, keine Metrik. Technische Achsennamen,
Balken, Tabellen, Prozentwerte und Rankings bleiben aus der sichtbaren UI raus.

## Kalibrierung

Die Regeln werden über lokale Unit-Fixtures kalibriert. Beispielgruppen:

- ruhig/entlastend
- durchwachsen/wechselhaft
- Audio-/Action-intensiv
- emotional intensiv
- emotional schwer ohne sensorische Last
- visuell dicht/intensiv
- widersprüchliche Metadaten
- seeded Random bleibt deterministisch
- ähnliche TMDb-Queries werden diverser
- dünne Datenlage
- externe optionale Quellen ohne Keys

Die Tests nutzen reduzierte, selbst formulierte Mock-Metadaten und keine Live-API-Requests.

## Offene Risiken

- TMDb-Metadaten bleiben indirekte Signale, keine Messung.
- Does the Dog Die braucht vor Aktivierung Klärung zu Zugriff und Nutzungsbedingungen.
- Common Sense Media braucht vor Aktivierung Klärung zu Kosten, API, Partnerschaft und lokaler Speicherung.
- User-Feedback darf nur stille Evidenz bleiben, nicht Social-Feature oder öffentliche Bewertung.

## Sicherheitsregeln

- keine API-Keys hardcoden
- keine echten Keys in `.env.example`
- keine externen Quellen ohne Fallback aktivieren
- Tests müssen ohne externe Keys laufen
