# null-noise Docs

Diese Doku ist absichtlich auf 10 fachliche Markdown-Dateien begrenzt. Die Dateien unter `docs/llm-upload/` sind eine kompakte Übergabe-Kopie für andere LLMs und sollen inhaltlich mit den fachlichen Quellen synchron bleiben.

## Einstieg

- `00-current/llm-context.md`: kurzer Kontext fuer neue Arbeitsrunden
- `00-current/current-state.md`: aktueller lokaler Stand und offene Pruefungen
- `00-current/current-runbook.md`: lokale Kommandos, Test- und Security-Checks

## Prinzipien

- `10-principles/product-principles.md`: Produktgrenzen und Referenzziele
- `10-principles/ux-principles.md`: reduzierte kognitive Last und ruhige Interaktion
- `10-principles/a11y-principles.md`: Accessibility-Grundentscheidungen

## Umsetzung und Pruefung

- `20-testing/testing-and-release.md`: automatisierte/manuelle Tests und Release-Mindeststandard
- `30-architecture/evidence-and-data-sources.md`: Evidence-Modell und externe Quellen
- `30-architecture/ui-component-strategy.md`: Komponentenstrategie und UI-Policy

## Arbeitsregel

Wenn eine Doku-Aussage doppelt wirkt, wird sie in die passendste der 10 fachlichen Dateien integriert und die Upload-Kopie entsprechend aktualisiert. Keine Secrets, `.env`-Werte, Screenshots, ZIPs oder Recovery-Dateien in `docs/` ablegen.
