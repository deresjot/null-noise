# Evidence-Modell

## Zweck

Das Evidence-Modell bereitet die vorsichtige Ersteinschätzung der Reizwirkung intern granularer auf. Sichtbar bleibt eine kurze sprachliche Tendenz:

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
- vorbereitet/optional: Does the Dog Die, Common Sense Media, User-Feedback, Manual, Local Seed

Optionale externe Quellen bleiben ohne Feature-Flag und API-Key Noop/Fallback. Sie dürfen Tests ohne Keys nicht brechen.

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
