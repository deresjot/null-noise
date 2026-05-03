import packageJson from "../../package.json";

export const currentBuild = {
  version: packageJson.version,
  label: "Mobile App-Experiment, Relay-Bundle und Live-Test-Pass",
  releasedAt: "2026-05-03 · 12:41 CEST",
};

export const releaseNotes = [
  {
    version: packageJson.version,
    label: "Mobile App-Experiment, Relay-Bundle und Live-Test-Pass",
    releasedAt: "2026-05-03",
    entries: [
      "Der optionale Mobile-App-Experimentmodus bleibt per `?view=app` erreichbar, ohne die Standardansicht zu ersetzen.",
      "Das Copy-Bundle ist jetzt als KI-Relay-Bundle mit echten Markdown-Kopien für stabile App-Uploads eingeordnet.",
      "Release-Stand wurde nach lokaler Prüfung, Push und Production-Deploy für den Live-Test sichtbar aktualisiert.",
    ],
  },
  {
    version: "0.8.3",
    label: "Spike Layout Stabilization Pass",
    releasedAt: "2026-04-18",
    entries: [
      "Die Spike-Detailseite wurde visuell beruhigt: linke Hauptspalte klarer priorisiert, rechte Infospalte flacher und weniger kapselartig.",
      "Empfehlungskarten unter `Dazu passt auch …` wurden verdichtet: kompaktere Kartenhöhe, geringere Scrolllast, erste Einschätzung bleibt vollständig sichtbar.",
      "Der Bereich `Verfügbar bei` wurde rhythmisch ruhiger eingebunden und als nachgeordneter Abschnitt klarer lesbar gemacht.",
      "Auf `/suche` wurde `search-direct-starts` als responsive Kachelreihe geschärft, inklusive stabiler Fokus- und Klickflächen.",
      "Der linke Artefaktrand in Browse-Gruppen wurde bereinigt, indem die doppelte linke Kante aus Wrapper- und Gruppenrahmung entfernt wurde.",
    ],
  },
  {
    version: "0.8.2",
    label: "Lokale Titelübernahme",
    releasedAt: "2026-03-28",
    entries: [
      "Externe TMDb-Titel können jetzt bewusst in einen lokalen null-noise-Titel mit vorläufiger Startbasis überführt werden.",
      "Nach der lokalen Übernahme führt die Suche direkt auf die lokale Detailseite mit Bewertungsformular statt nur auf getrennte Metadaten.",
      "TMDb bleibt dabei reine Metadatenquelle: Reizprofil, Wirkung, Confidence und spätere Verdichtung bleiben null-noise-intern.",
    ],
  },
  {
    version: "0.8.1",
    label: "Bewertung gehärtet",
    releasedAt: "2026-03-28",
    entries: [
      "Die anonyme Bewertungsabgabe wird jetzt serverseitig über Origin-Prüfung, Rate-Limit, Titel-Cooldown und eine kleine Zeitplausibilitätsprüfung robuster gebremst.",
      "Erfolg und Ablehnung bleiben im UI ruhig und nicht-technisch, ohne Konten oder Profilbildung einzuführen.",
      "Reizprofil und beruhigende Wirkung werden weiterhin getrennt aggregiert und bleiben klar vom Metadatenkontext getrennt.",
    ],
  },
  {
    version: "0.7.0",
    label: "Wirkung getrennt",
    releasedAt: "2026-03-27",
    entries: [
      "Das Reizprofil wurde um die getrennte Wirkungsdimension soothingEffect erweitert.",
      "Mock-Daten werden jetzt aus kleinen diskreten Einzelbewertungen per Median zu Reizprofil und beruhigender Wirkung verdichtet.",
      "Die Detailseite zeigt zusätzlich eine ruhige subjektive Wirkung und die vorbereitete vierte Bewertungsfrage.",
    ],
  },
  {
    version: "0.6.2",
    label: "Claim integriert",
    releasedAt: "2026-03-27",
    entries: [
      "Der Claim wurde ruhig in die Startseite integriert und typografisch unter dem Produktnamen verankert.",
      "Startseite, Suche und Erklärung verwenden jetzt etwas konsistentere Formulierungen rund um Ruhe, Orientierung und Einschätzung.",
      "Meta-Beschreibung und Sharing-Text greifen den Claim zurückhaltend auf, ohne die Oberfläche werblicher zu machen.",
    ],
  },
  {
    version: "0.6.1",
    label: "Poster gedaempft",
    releasedAt: "2026-03-27",
    entries: [
      "Externe Haupttreffer können jetzt ein kleines Poster als visuelle Orientierung zeigen.",
      "Poster laufen über einen lokalen Serverpfad und werden im UI stark entsättigt, abgegraut und leicht abgeblendet dargestellt.",
      "Wenn kein Poster vorhanden ist, bleibt die Karte ohne leeren Platzhalter stabil.",
    ],
  },
  {
    version: "0.6.0",
    label: "Reizprofil geklaert",
    releasedAt: "2026-03-27",
    entries: [
      "Das Reizprofil wurde auf drei klar benannte Audio-Achsen mit gemeinsamer 0-bis-4-Skala vereinfacht.",
      "Confidence wird jetzt aus der Zahl der Einschätzungen abgeleitet und offen als niedrig, mittel oder hoch gezeigt.",
      "Poster werden vorerst bewusst nicht direkt geladen, damit Metadaten-Kontext und Datenschutzlogik sauber bleiben.",
    ],
  },
  {
    version: "0.5.2",
    label: "Maskottchen heller",
    releasedAt: "2026-03-27",
    entries: [
      "Das Platzhalter-Maskottchen wurde in eine deutlich hellere, weichere Gesichtsform umgestellt.",
      "Der dunkle Flächenblock wurde entfernt, damit das Zeichen in kleiner Größe leichter und ruhiger wirkt.",
      "Footer-Build-Stand auf 0.5.2 angehoben.",
    ],
  },
  {
    version: "0.5.0",
    label: "Editoriales UI",
    releasedAt: "2026-03-27",
    entries: [
      "UI auf eine luftigere, editorialere Sprache mit ruhigerer Typografie und weniger Kachelwirkung umgestellt.",
      "Header, Footer, Startseite und Suchseite in eine konsistente, reduzierte Layoutlogik überführt.",
      "Platzhalter-Logo, Favicon und Sharing-Vorschau an die neue Markenrichtung angepasst.",
    ],
  },
  {
    version: "0.4.4",
    label: "TMDb-Vorschläge",
    releasedAt: "2026-03-27",
    entries: [
      "Das Suchfeld kann während der Eingabe serverseitige Vorschläge aus TMDb nachladen.",
      "Die Vorschläge bleiben als eigene kleine Liste unter dem Feld und ersetzen kein Reizprofil.",
      "Kurze, naheliegende Titelvervollständigungen werden in der TMDb-Relevanz höher gewichtet.",
    ],
  },
  {
    version: "0.1.0",
    label: "MVP-Basis",
    releasedAt: "2026-03-22",
    entries: [
      "Grundlegende barrierearme Such- und Detailoberfläche mit Mock-Daten.",
      "Erklärungssystem, Bedienhinweise und semantische UI-Bausteine.",
    ],
  },
] as const;
