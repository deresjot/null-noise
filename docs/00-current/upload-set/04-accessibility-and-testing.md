# Accessibility und Testing

## Accessibility-Prinzipien

- HTML-first
- ARIA nur ergänzend
- echte Links für Navigation
- echte Buttons für Aktionen
- sichtbarer Fokus
- keine rein visuelle Codierung
- keine Tooltip-only-Inhalte
- keine Hover-only-Hilfe
- reduzierte Bewegung respektieren
- `details`/`summary` für ruhige Vertiefung

## Mobile-Kriterien

- Touch-Ziele ausreichend groß
- kein horizontaler Overflow bei 320 CSS-Pixeln
- keine sticky Controls, die Inhalt oder Fokus verdecken
- safe-area-inset-bottom beachten, falls bottom/sticky genutzt wird
- keine Gesten-only-Bedienung
- keine neuen Scroll-Jank-Ursachen

## Automatisierte Tests

```sh
npm run lint
npm run build
npm run test:unit
npm run test:axe-core
npm run test:a11y
npx playwright test
```

## Manuelle Smoke-Checks

- Tastaturfluss
- sichtbarer Fokus
- Screenreader-Smoke
- Reflow bei 320 CSS-Pixeln
- Zoom bei 400 %
- mobile Scrollprüfung auf echtem iPhone nach Deploy
- keine Console-Errors
- keine Score-/Prozent-UI

## Grenzen

Automatisierte Tests ersetzen keine manuelle Prüfung mit echter Touch- und Screenreader-Nutzung.
