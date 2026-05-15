# Evidence-Modell und Datenquellen

## Zweck

Das Evidence-Modell bereitet die vorsichtige erste Einschätzung der Reizwirkung intern granularer auf. Sichtbar bleibt eine kurze sprachliche Tendenz:

- eher ruhig
- eher wechselhaft/durchwachsen
- eher intensiv

Es gibt keine sichtbaren Scores, Prozentwerte oder Rankings.

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
- Action, Horror oder Thriller sind keine automatische Intensiv-Garantie.
- Drama, Comedy, Romance, Family oder Documentary sind keine automatische Ruhig-Garantie.

## Aggregationsprinzipien

- Widerspruechliche Signale führen eher zu mixed/durchwachsen.
- Relief ist positive Evidenz, nicht nur fehlende Warnung.
- Sensorische, visuelle und emotionale Intensität bleiben unterscheidbar.
- Bei dünner Datenlage bleibt Confidence niedrig und der Status vorläufig.
- Ausgabe behauptet keine objektive Audio- oder Bildmessung.

## Sichtbare Ausgabe

Sichtbar werden nur:

- Tendenz
- kurzer Status
- 2 bis 3 kurze Gründe
- vorsichtige Unsicherheitsformulierung

Nicht sichtbar werden:

- interne Stärken
- numerische Scores
- Prozentwerte
- Rankings

## Kalibrierung

Die Regeln werden über lokale Unit-Fixtures kalibriert. Beispielgruppen:

- ruhig/entlastend
- durchwachsen/wechselhaft
- Audio-/Action-intensiv
- emotional intensiv
- visuell dicht/intensiv
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
