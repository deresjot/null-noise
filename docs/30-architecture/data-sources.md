# Datenquellen

## Grundsatz

`null-noise` darf nicht hart von externen APIs abhängen, wenn Keys fehlen. Externe Quellen müssen sauber zurückfallen und dürfen keine API-Keys im Repo erzwingen.

## TMDb

- Status: aktiv
- Zweck: Titel, Suche, Poster, Genres, Keywords, Overview und externe Detaildaten
- Rolle: Katalog- und Metadatenbasis
- Wichtig: TMDb-Daten sind nicht identisch mit der null-noise-Erstlesart

## Watchmode

- Status: optional, nur für Verfügbarkeit relevant
- Zweck: Provider, direkte Angebotslinks, Preise oder Formate
- Aktivierung nur mit `WATCHMODE_API_KEY`
- Ohne Key bleibt der bestehende Fallback aktiv

## Letterboxd

- Status: sekundär/optional, falls im Projekt weiter relevant
- Zweck: möglicher Zusatzblick, nicht Kernquelle der Erstlesart
- Nicht Teil der aktiven Evidence-Basis für Reizwirkung

## Does the Dog Die

- Status: vorbereitet, nicht aktiv
- Feature Flag: `ENABLE_DTTD_EVIDENCE`
- Env: `DOES_THE_DOG_DIE_API_KEY`
- Zweck: Trigger-/Content-Warnings als mögliche Evidence für emotionale, auditive, visuelle oder Vorhersehbarkeits-Signale
- Ohne Flag/Key: Noop/Fallback
- Vor produktiver Aktivierung: Zugriff und Nutzungsbedingungen klären

## Common Sense Media

- Status: vorbereitet, nicht aktiv
- Feature Flag: `ENABLE_CSM_EVIDENCE`
- Env: `COMMON_SENSE_MEDIA_API_KEY`
- Zweck: kuratierte Inhalts-, Alters- und Themeninformationen als mögliche Evidence
- Ohne Flag/Key: Noop/Fallback
- Nicht on-demand produktiv aktivieren
- Vor produktiver Aktivierung: Kosten, API, Partnerschaft und lokale Speicherung klären

## User-Feedback

- Status: später als stille Evidenz möglich
- Kein Social Feature
- Keine öffentliche Bewertung
- Mehrere übereinstimmende Rückmeldungen können Confidence erhöhen
- Einzelne Rückmeldung bleibt schwach

## Manual und Local Seed

- Status: vorbereitete Quellen für interne oder lokale Evidenz
- `manual` darf nur genutzt werden, wenn wirklich manuell geprüfte Evidenz vorliegt
- `local_seed` kann für lokale Startdaten dienen, darf aber keine externe Belastbarkeit vortäuschen

## Sicherheitsregeln

- keine API-Keys hardcoden
- keine echten Keys in `.env.example`
- keine externen Quellen ohne Fallback aktivieren
- Tests müssen ohne externe Keys laufen
