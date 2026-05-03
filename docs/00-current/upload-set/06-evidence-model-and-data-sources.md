# Evidence-Modell und Datenquellen

## Zweck

Das Evidence-Modell macht interne Hinweise nachvollziehbarer, ohne nach außen Scores oder Scheinpräzision zu zeigen.

## Interne Achsen

- `audio_peaks`: Peaks-Risiko
- `stimulus_density`: Hektik/Dichte
- `visual_intensity`: visuelles Risiko
- `emotional_load`: emotionale Schwere
- `predictability`: Überraschungsrisiko
- `relief`: Entlastungssignale

## Aktive Quelle

- TMDb für Katalog- und Metadaten
- ausgewertet werden defensiv: Genres, Keywords, Kurzbeschreibung
- Genre allein bleibt schwach
- mehrere passende Keywords können Confidence erhöhen
- fehlende Hinweise sind keine Entwarnung
- keine Szenenprüfung

## Optionale Quellen

- Does the Dog Die: vorbereitet, nicht aktiv
- Common Sense Media: vorbereitet, nicht aktiv
- User-Feedback: später stille Evidenz, kein Social Feature
- Manual und Local Seed: interne Quellen

Ohne Keys und Feature-Flags bleiben optionale Quellen Noop/Fallback.

## Sichtbare Ausgabe

- kurze Gründe
- Status/Confidence als Sprache
- keine Scores
- keine Prozentwerte
- keine Rankings
- keine Behauptung objektiver Audio-, Schnitt- oder Szenenprüfung

## Offene Klärungen

- Does the Dog Die: Zugriff und Nutzungsbedingungen
- Common Sense Media: Kosten, API, Partnerschaft, lokale Speicherung
