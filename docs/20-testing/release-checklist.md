# Release-Checkliste

## Automatisierte Prüfung

- `npm run lint`
- `npm run build`
- `npm run test:unit`
- `npm run test:axe-core`
- `npm run test:a11y`
- `npx playwright test`

## Manuelle Kernprüfung

- Kernrouten: `/`, `/suche`, `/suche?q=Arrival`, `/titel/mondfenster`, `/barrierefreiheit`
- Tastaturfluss und sichtbarer Fokus
- Screenreader-Smoke
- Reflow bei 320 CSS-Pixeln
- Zoom bei 400 %
- keine Console-Errors
- keine Score-/Prozent-UI
- Mobile Scrollgefühl nach Deploy auf echtem iPhone
