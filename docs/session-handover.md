# null-noise: Session-Handover

Stand: 28. März 2026

## Aktueller Git-Stand

- Branch: `beta-ui-polish`
- Letzter Commit: `5763662` – `Refine null-noise beta UX and profile clarity`
- Arbeitsbaum: sauber
- Remote-Branch: `origin/beta-ui-polish`

## Aktueller Vercel-Stand

- Production bleibt auf `master` und wurde in dieser Runde nicht verändert.
- Der aktuelle Arbeitsstand liegt auf dem Preview-Branch `beta-ui-polish`.
- Die Branch-Preview ist derzeit über Vercel Authentication geschützt.
- Relevante Preview-URL:
  - `https://null-noise-git-beta-ui-polish-deresjots-projects.vercel.app/`
- Relevante Production-URL:
  - `https://null-noise.vercel.app/`

## Was in dieser Runde konkret fertig wurde

### Explizite Detail-CTAs

- Lokale Trefferkarten haben jetzt einen klar sichtbaren sekundären CTA zur Detailseite.
- Externe Treffer zeigen weiter `Für null-noise anlegen` als Primäraktion.
- Falls ein externer Titel bereits lokal existiert, wird stattdessen klar auf die lokale Detailseite geführt.

### Markenfläche / Maskottchen

- Das Maskottchen ist jetzt konsequenter als dekoratives Brand-Element eingebettet.
- Kein Card-Rahmen, kein Border, kein Shadow.
- Transparente PNG-Assets werden genutzt; kleine Kontexte nutzen einen engeren Crop.

### UI-Korrekturen

- Hinweis-/Statusboxen haben wieder saubere Kanten.
- Dropdown-Pfeile sind rechts sauber ausgerichtet.
- Suchkarten und kompakte Kartenbereiche haben stabilere Aktionszonen und klarere Abstände.
- Borders und Flächen verhalten sich konsistenter und weniger „pillig“.

### Profil-/Seed-Klarheit

- Die Detailseite erklärt das Reizprofil ruhiger als Einschätzung statt Messwert.
- `peakIntensity` ist visuell priorisiert.
- `soothingEffect` bleibt klar getrennt als `Subjektive Wirkung`.
- Seed-Titel (`metadata_inference`) werden im UI deutlicher als vorläufige Einschätzung kenntlich gemacht.

## Wichtige fachliche Leitplanken, die weiter gelten

- Keine Änderung an Bewertungslogik, Aggregation oder TMDb-Flow in dieser Runde.
- TMDb liefert weiter nur Metadaten, kein Reizprofil.
- `metadata_inference` bleibt eine vorläufige Startbasis und kein fertiges Profil.
- `soothingEffect` bleibt getrennt von der Reizintensität.
- Öffentliche Production auf Vercel bleibt sinnvollerweise weiter vorsichtig und ehrlich.

## Zuletzt lokal erfolgreich geprüft

- `npm run test:unit`
- `npm run lint`
- `npm run build`
- `npx playwright test`

Zuletzt gemeldeter Stand:

- Vitest: `44 passed`
- Playwright: `19 passed, 2 skipped`

## Sinnvolle nächste Schritte

### Wenn weiter am Preview gearbeitet wird

1. Branch `beta-ui-polish` lokal weiterverwenden.
2. Änderungen lokal prüfen.
3. Auf denselben Branch committen und pushen.
4. Branch-Preview in Vercel prüfen.
5. Erst danach bei Bedarf nach `master` mergen.

### Inhaltlich naheliegende nächste Themen

1. Projektdoku knapp nachziehen:
   - `docs/project-summary.md`
2. Preview visuell auf mobilen Viewports noch einmal gezielt prüfen.
3. Offene UI-Feinheiten nur punktuell nachziehen, nicht neu gestalten.
4. Erst nach finalem Preview-Check entscheiden, ob `beta-ui-polish` in `master` gemergt werden soll.

## Relevante Dateien aus den letzten Runden

- `src/app/page.tsx`
- `src/app/titel/[slug]/page.tsx`
- `src/app/globals.css`
- `src/components/site-header.tsx`
- `src/components/mascot-mark.tsx`
- `src/components/result-list.tsx`
- `src/components/external-result-list.tsx`
- `src/components/search-tone-scale.tsx`
- `src/components/profile-scale.tsx`
- `src/lib/format.ts`
- `public/brand/null-noise-fig2-transparent.png`
- `public/brand/null-noise-fig2-mark-crop.png`

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
