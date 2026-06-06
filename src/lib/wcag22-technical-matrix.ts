export type WcagTechnicalStatus = "pass" | "fail" | "not-applicable" | "manual-review";

export type WcagTechnicalCriterion = {
  criterion: string;
  title: string;
  level: "A" | "AA" | "AAA";
  technicalCoverage: string;
  status: WcagTechnicalStatus;
  wcagUrl: string;
};

const understandingBaseUrl = "https://www.w3.org/WAI/WCAG22/Understanding/";

export const wcag22AaTechnicalMatrix: WcagTechnicalCriterion[] = [
  {
    criterion: "1.1.1",
    title: "Non-text Content",
    level: "A",
    technicalCoverage:
      "Axe prüft Textalternativen; zusätzlich wird im DOM geprüft, ob sichtbare Bilder alt-Text, dekorativen Status oder einen versteckten Kontext haben.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}non-text-content.html`,
  },
  {
    criterion: "1.2.1",
    title: "Audio-only and Video-only",
    level: "A",
    technicalCoverage:
      "Die geprüften Routen enthalten keine Audio-, Video- oder Track-Elemente; das Kriterium ist im aktuellen Feature-Scope nicht anwendbar.",
    status: "not-applicable",
    wcagUrl: `${understandingBaseUrl}audio-only-and-video-only-prerecorded.html`,
  },
  {
    criterion: "1.2.2",
    title: "Captions",
    level: "A",
    technicalCoverage:
      "Die geprüften Routen enthalten keine aufgezeichneten Audio-/Video-Inhalte; Untertitel-Prüfung ist deshalb nicht anwendbar.",
    status: "not-applicable",
    wcagUrl: `${understandingBaseUrl}captions-prerecorded.html`,
  },
  {
    criterion: "1.2.3",
    title: "Audio Description or Media Alternative",
    level: "A",
    technicalCoverage:
      "Die geprüften Routen enthalten kein aufgezeichnetes Video; Audiodeskription oder Medienalternative ist hier nicht anwendbar.",
    status: "not-applicable",
    wcagUrl: `${understandingBaseUrl}audio-description-or-media-alternative-prerecorded.html`,
  },
  {
    criterion: "1.2.4",
    title: "Captions Live",
    level: "AA",
    technicalCoverage:
      "Es gibt keine Live-Audio- oder Live-Video-Inhalte auf den geprüften Routen.",
    status: "not-applicable",
    wcagUrl: `${understandingBaseUrl}captions-live.html`,
  },
  {
    criterion: "1.2.5",
    title: "Audio Description",
    level: "AA",
    technicalCoverage:
      "Es gibt kein aufgezeichnetes Video auf den geprüften Routen; Audiodeskription ist deshalb nicht anwendbar.",
    status: "not-applicable",
    wcagUrl: `${understandingBaseUrl}audio-description-prerecorded.html`,
  },
  {
    criterion: "1.3.1",
    title: "Info and Relationships",
    level: "A",
    technicalCoverage:
      "Axe prüft Strukturregeln; zusätzlich werden Landmarken, genau ein main, genau ein h1, Überschriften, Listen, Tabellenstrukturen sowie das Kontaktformular mit nativen Labels, Hilfetexten und Fehlermeldungen geprüft.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}info-and-relationships.html`,
  },
  {
    criterion: "1.3.2",
    title: "Meaningful Sequence",
    level: "A",
    technicalCoverage:
      "Playwright prüft DOM-Reihenfolge, Landmarken und Überschriften-Sichtbarkeit auf den Kernrouten; die Kontaktseite wird von Einführung über Datensparsamkeit bis Formular in dieser Reihenfolge geprüft.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}meaningful-sequence.html`,
  },
  {
    criterion: "1.3.3",
    title: "Sensory Characteristics",
    level: "A",
    technicalCoverage:
      "Quelltext und DOM werden auf Hinweise geprüft, die ausschließlich über Form, Position, Größe oder Farbe funktionieren würden.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}sensory-characteristics.html`,
  },
  {
    criterion: "1.3.4",
    title: "Orientation",
    level: "AA",
    technicalCoverage:
      "Die Kernrouten werden in schmalen und breiten Viewports geprüft; die Oberfläche erzwingt keine feste Portrait- oder Landscape-Nutzung.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}orientation.html`,
  },
  {
    criterion: "1.3.5",
    title: "Identify Input Purpose",
    level: "AA",
    technicalCoverage:
      "Formularfelder werden auf erkennbare Namen, Labels und sinnvolle Autocomplete-/Input-Kontexte geprüft; die Kontakt-E-Mail ist Pflichtfeld und nutzt `type=email` sowie `autocomplete=email`.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}identify-input-purpose.html`,
  },
  {
    criterion: "1.4.1",
    title: "Use of Color",
    level: "A",
    technicalCoverage:
      "Axe prüft erkennbare Farbprobleme; zusätzlich werden aktive Zustände, Fokuszustände und textliche Labels gegen rein farbliche Codierung abgesichert.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}use-of-color.html`,
  },
  {
    criterion: "1.4.2",
    title: "Audio Control",
    level: "A",
    technicalCoverage: "Es gibt keine automatisch abspielenden Audio- oder Medieninhalte.",
    status: "not-applicable",
    wcagUrl: `${understandingBaseUrl}audio-control.html`,
  },
  {
    criterion: "1.4.3",
    title: "Contrast Minimum",
    level: "AA",
    technicalCoverage:
      "Axe prüft Textkontrast auf den gerenderten Kernrouten inklusive Kontaktformular; Fehler-, Hilfe- und Statusmeldungen verlassen sich nicht auf Opacity-Fades.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}contrast-minimum.html`,
  },
  {
    criterion: "1.4.4",
    title: "Resize Text",
    level: "AA",
    technicalCoverage:
      "Die Routen werden bei 320 CSS-Pixeln und großen Viewports geprüft; Inhalte dürfen nicht horizontal ausbrechen oder unbedienbar werden.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}resize-text.html`,
  },
  {
    criterion: "1.4.5",
    title: "Images of Text",
    level: "AA",
    technicalCoverage:
      "DOM-Smoke prüft Bildzwecke; die Brand-Grafik ist dekorativ innerhalb eines benannten Startseiten-Links, wesentliche Information bleibt Text.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}images-of-text.html`,
  },
  {
    criterion: "1.4.10",
    title: "Reflow",
    level: "AA",
    technicalCoverage:
      "Kernrouten inklusive `/kontakt` werden bei 320, 390 und 430 CSS-Pixeln auf horizontalen Overflow und erreichbare Inhalte geprüft.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}reflow.html`,
  },
  {
    criterion: "1.4.11",
    title: "Non-text Contrast",
    level: "AA",
    technicalCoverage:
      "Axe und Computed-Style-Smokes prüfen Fokus-, Control-, Button-, Navigation- und Statuszustände; Kontaktfehler und Erfolgsmeldung haben zusätzlich sichtbare Rahmen und Text.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}non-text-contrast.html`,
  },
  {
    criterion: "1.4.12",
    title: "Text Spacing",
    level: "AA",
    technicalCoverage:
      "Der Test injiziert erhöhte Zeilenhöhe, Zeichenabstand, Wortabstand und Absatzabstände und prüft danach auf horizontalen Overflow, auch auf dem Kontaktformular.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}text-spacing.html`,
  },
  {
    criterion: "1.4.13",
    title: "Content on Hover or Focus",
    level: "AA",
    technicalCoverage:
      "DOM-Smoke prüft, dass keine Tooltip-/Popover-Pflichtinhalte vorhanden sind; Zusatzinformationen bleiben über native Disclosure-Muster erreichbar.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}content-on-hover-or-focus.html`,
  },
  {
    criterion: "2.1.1",
    title: "Keyboard",
    level: "A",
    technicalCoverage:
      "Playwright tabbt durch interaktive Elemente, fokussiert Controls und prüft, dass sichtbare Bedienelemente per Tastatur erreichbar bleiben; das Kontaktformular nutzt native Eingabefelder und einen echten Submit-Button.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}keyboard.html`,
  },
  {
    criterion: "2.1.2",
    title: "No Keyboard Trap",
    level: "A",
    technicalCoverage:
      "Tab-Reihenfolge und fokussierbare Bereiche werden begrenzt geprüft; Mobile-Menü, Disclosure und Kontaktformular dürfen den Fokus nicht einschließen.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}no-keyboard-trap.html`,
  },
  {
    criterion: "2.1.4",
    title: "Character Key Shortcuts",
    level: "A",
    technicalCoverage: "Es wurden keine eigenen Einzelzeichen-Tastaturkürzel erkannt.",
    status: "not-applicable",
    wcagUrl: `${understandingBaseUrl}character-key-shortcuts.html`,
  },
  {
    criterion: "2.2.1",
    title: "Timing Adjustable",
    level: "A",
    technicalCoverage:
      "Es gibt keine Session-Timeouts, Meta-Refreshes oder zeitkritischen UI-Abläufe auf den geprüften Routen.",
    status: "not-applicable",
    wcagUrl: `${understandingBaseUrl}timing-adjustable.html`,
  },
  {
    criterion: "2.2.2",
    title: "Pause, Stop, Hide",
    level: "A",
    technicalCoverage:
      "Reduced-Motion wird emuliert; bewegte Zustände bleiben kurz, rein dekorativ und verdecken keine Information.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}pause-stop-hide.html`,
  },
  {
    criterion: "2.3.1",
    title: "Three Flashes",
    level: "A",
    technicalCoverage:
      "DOM-Smoke prüft, dass keine Video-, Canvas-, Blink- oder Marquee-Inhalte vorhanden sind, die Flackern auslösen könnten.",
    status: "not-applicable",
    wcagUrl: `${understandingBaseUrl}three-flashes-or-below-threshold.html`,
  },
  {
    criterion: "2.4.1",
    title: "Bypass Blocks",
    level: "A",
    technicalCoverage:
      "Der Skip-Link zu main-content wird per Tastatur fokussiert, sichtbar gemacht und als Bypass vor der Navigation geprüft, auch bevor die Kontaktformular-Felder erreicht werden.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}bypass-blocks.html`,
  },
  {
    criterion: "2.4.2",
    title: "Page Titled",
    level: "A",
    technicalCoverage:
      "Jede geprüfte Route muss einen nicht-leeren Dokumenttitel und die erwartete sichtbare Hauptüberschrift haben.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}page-titled.html`,
  },
  {
    criterion: "2.4.3",
    title: "Focus Order",
    level: "A",
    technicalCoverage:
      "Tab-Reihenfolge, Fokuslandung und sichtbarer Fokus werden auf bis zu 80 fokussierbaren Elementen pro Route geprüft; Kontaktfehler- und Erfolgsmeldungen werden nach Submit programmatisch fokussiert.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}focus-order.html`,
  },
  {
    criterion: "2.4.4",
    title: "Link Purpose",
    level: "A",
    technicalCoverage:
      "Alle sichtbaren Links müssen einen zugänglichen Namen haben; wiederholte Links werden auf verständliche Bezeichnungen geprüft.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}link-purpose-in-context.html`,
  },
  {
    criterion: "2.4.5",
    title: "Multiple Ways",
    level: "AA",
    technicalCoverage:
      "Header- und Footer-Navigation werden auf wiederkehrende Linkziele geprüft: Start, Suche und Erklärung/Hilfe sind im Header erreichbar; Barrierefreiheit, Kontakt, Datenschutz und Impressum bleiben im Footer erreichbar.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}multiple-ways.html`,
  },
  {
    criterion: "2.4.6",
    title: "Headings and Labels",
    level: "AA",
    technicalCoverage:
      "Sichtbare Überschriften dürfen nicht leer sein; Kontaktformular, Buttons und Controls müssen verständliche sichtbare Labels wie `E-Mail für Antwort (Pflichtfeld)` und `Nachricht (Pflichtfeld)` haben.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}headings-and-labels.html`,
  },
  {
    criterion: "2.4.7",
    title: "Focus Visible",
    level: "AA",
    technicalCoverage:
      "Für fokussierte Elemente wird ein sichtbarer Computed-Style geprüft: Outline, Box-Shadow, Border-Kontrast oder gleichwertige Fokusmarkierung; das umfasst Textarea und Statuszusammenfassungen.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}focus-visible.html`,
  },
  {
    criterion: "2.4.11",
    title: "Focus Not Obscured Minimum",
    level: "AA",
    technicalCoverage:
      "Fokussierte Elemente werden in den Viewport gebracht und auf sichtbare Schnittmenge mit dem Viewport geprüft; Kontaktfelder und Submit-Button müssen sichtbar erreichbar bleiben.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}focus-not-obscured-minimum.html`,
  },
  {
    criterion: "2.5.1",
    title: "Pointer Gestures",
    level: "A",
    technicalCoverage: "Es gibt keine Multipoint- oder Pfadgesten-UI auf den geprüften Routen.",
    status: "not-applicable",
    wcagUrl: `${understandingBaseUrl}pointer-gestures.html`,
  },
  {
    criterion: "2.5.2",
    title: "Pointer Cancellation",
    level: "A",
    technicalCoverage:
      "Interaktionen nutzen native Links, Buttons und Formularcontrols; es wurden keine pointerdown-only-Aktivierungen erkannt.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}pointer-cancellation.html`,
  },
  {
    criterion: "2.5.3",
    title: "Label in Name",
    level: "A",
    technicalCoverage:
      "Wenn sichtbarer Text und aria-label zusammen vorkommen, muss der sichtbare Text im zugänglichen Namen enthalten bleiben; das Kontaktformular nutzt sichtbare Labels ohne abweichende aria-labels.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}label-in-name.html`,
  },
  {
    criterion: "2.5.4",
    title: "Motion Actuation",
    level: "A",
    technicalCoverage: "Es wurden keine Device-Motion-Handler oder bewegungsgesteuerten Aktionen erkannt.",
    status: "not-applicable",
    wcagUrl: `${understandingBaseUrl}motion-actuation.html`,
  },
  {
    criterion: "2.5.7",
    title: "Dragging Movements",
    level: "AA",
    technicalCoverage: "Es gibt keine Drag-and-Drop- oder draggable-UI auf den geprüften Routen.",
    status: "not-applicable",
    wcagUrl: `${understandingBaseUrl}dragging-movements.html`,
  },
  {
    criterion: "2.5.8",
    title: "Target Size Minimum",
    level: "AA",
    technicalCoverage:
      "Fokussierbare Ziele werden auf mindestens 24px Breite/Höhe geprüft; Kontaktformularfelder und Submit-Button werden zusätzlich als konkrete Targets geprüft.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}target-size-minimum.html`,
  },
  {
    criterion: "3.1.1",
    title: "Language of Page",
    level: "A",
    technicalCoverage: "Das html-lang-Attribut muss auf den geprüften Routen `de` sein.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}language-of-page.html`,
  },
  {
    criterion: "3.1.2",
    title: "Language of Parts",
    level: "AA",
    technicalCoverage:
      "Lang-Attribute werden auf plausible Werte geprüft; fremdsprachige Pflichtbereiche sind im aktuellen Scope nicht vorhanden.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}language-of-parts.html`,
  },
  {
    criterion: "3.2.1",
    title: "On Focus",
    level: "A",
    technicalCoverage:
      "Fokus darf keine automatische Navigation oder unerwartete Zustandsänderung auslösen; Fokus-Smokes prüfen stabile Route, sichtbare Markierung und ruhige Kontaktformular-Fokuswechsel.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}on-focus.html`,
  },
  {
    criterion: "3.2.2",
    title: "On Input",
    level: "A",
    technicalCoverage:
      "Formularänderungen laufen über native Controls und explizite Submit-/Change-Flows; die Kontaktseite zeigt Fehler oder Erfolg erst nach bewusstem Submit.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}on-input.html`,
  },
  {
    criterion: "3.2.3",
    title: "Consistent Navigation",
    level: "AA",
    technicalCoverage:
      "Die Reihenfolge und Wiederkehr der Header-/Footer-Navigation wird über Kernrouten geprüft; der Kontakt-Link bleibt im Footer konsistent erreichbar.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}consistent-navigation.html`,
  },
  {
    criterion: "3.2.4",
    title: "Consistent Identification",
    level: "AA",
    technicalCoverage:
      "Wiederkehrende Links, Buttons und Controls werden auf konsistente Namen und Rollen geprüft; Kontakt bleibt als Footer-Link und Formularziel gleich benannt.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}consistent-identification.html`,
  },
  {
    criterion: "3.2.6",
    title: "Consistent Help",
    level: "A",
    technicalCoverage:
      "Hilfe-/Erklärungslinks und Kontakt bleiben konsistent erreichbar; relevante Hilfe-, Kontakt- und Legal-Routen werden als Kernrouten geprüft.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}consistent-help.html`,
  },
  {
    criterion: "3.3.1",
    title: "Error Identification",
    level: "A",
    technicalCoverage:
      "Axe, Formular- und Status-Smokes prüfen, dass Kontakt-Fehlerzusammenfassung und Feldfehler textlich benannt, fokussierbar und nicht nur farblich codiert sind.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}error-identification.html`,
  },
  {
    criterion: "3.3.2",
    title: "Labels or Instructions",
    level: "A",
    technicalCoverage:
      "Formularfelder und Controls müssen Labels, sichtbare Anweisungen oder zugängliche Namen haben; Kontakt-Hilfetexte sind über `aria-describedby` mit den Feldern verbunden.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}labels-or-instructions.html`,
  },
  {
    criterion: "3.3.3",
    title: "Error Suggestion",
    level: "AA",
    technicalCoverage:
      "Kontakt-Fehlermeldungen geben konkrete Korrekturhinweise für leere/zu kurze Nachricht und ungültige E-Mail; Statusbereiche bleiben ruhig sichtbar.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}error-suggestion.html`,
  },
  {
    criterion: "3.3.4",
    title: "Error Prevention Legal/Financial/Data",
    level: "AA",
    technicalCoverage:
      "Es gibt keine rechtlichen oder finanziellen Transaktionsformulare; das Kontaktformular sendet oder speichert nicht automatisch und verlangt nur die Nachricht als Pflichtfeld.",
    status: "not-applicable",
    wcagUrl: `${understandingBaseUrl}error-prevention-legal-financial-data.html`,
  },
  {
    criterion: "3.3.7",
    title: "Redundant Entry",
    level: "A",
    technicalCoverage: "Es gibt keinen mehrstufigen Re-Entry-Flow; das Kontaktformular verlangt Nachricht und E-Mail nur einmal.",
    status: "not-applicable",
    wcagUrl: `${understandingBaseUrl}redundant-entry.html`,
  },
  {
    criterion: "3.3.8",
    title: "Accessible Authentication Minimum",
    level: "AA",
    technicalCoverage: "Es gibt keinen Login- oder Authentifizierungsflow; die Kontaktseite nutzt keine Captcha-, Profil- oder Account-Hürde.",
    status: "not-applicable",
    wcagUrl: `${understandingBaseUrl}accessible-authentication-minimum.html`,
  },
  {
    criterion: "4.1.2",
    title: "Name Role Value",
    level: "A",
    technicalCoverage:
      "Axe und DOM-Smokes prüfen interaktive Namen, Rollen, Zustände wie aria-expanded und native Button-/Link-/Formularsemantik; Kontaktfelder bleiben native input/textarea/button-Controls.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}name-role-value.html`,
  },
  {
    criterion: "4.1.3",
    title: "Status Messages",
    level: "AA",
    technicalCoverage:
      "Statusmeldungen und Live-Regionen werden auf role=status bzw. verständliche Aktualisierungstexte geprüft; Kontakt-Erfolg und Fehlerzusammenfassung werden für Screenreader erfassbar fokussiert bzw. gemeldet.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}status-messages.html`,
  },
  {
    criterion: "1.2.6",
    title: "Sign Language",
    level: "AAA",
    technicalCoverage:
      "Es gibt keine aufgezeichneten Video-/Audioinhalte auf den geprüften Routen; Gebärdensprache ist im aktuellen Feature-Scope nicht anwendbar.",
    status: "not-applicable",
    wcagUrl: `${understandingBaseUrl}sign-language-prerecorded.html`,
  },
  {
    criterion: "1.2.7",
    title: "Extended Audio Description",
    level: "AAA",
    technicalCoverage:
      "Es gibt kein aufgezeichnetes Video auf den geprüften Routen; erweiterte Audiodeskription ist nicht anwendbar.",
    status: "not-applicable",
    wcagUrl: `${understandingBaseUrl}extended-audio-description-prerecorded.html`,
  },
  {
    criterion: "1.2.8",
    title: "Media Alternative",
    level: "AAA",
    technicalCoverage:
      "Es gibt kein aufgezeichnetes Video auf den geprüften Routen; eine Medienalternative ist hier nicht anwendbar.",
    status: "not-applicable",
    wcagUrl: `${understandingBaseUrl}media-alternative-prerecorded.html`,
  },
  {
    criterion: "1.2.9",
    title: "Audio-only Live",
    level: "AAA",
    technicalCoverage: "Es gibt keine Live-Audio-Inhalte auf den geprüften Routen.",
    status: "not-applicable",
    wcagUrl: `${understandingBaseUrl}audio-only-live.html`,
  },
  {
    criterion: "1.3.6",
    title: "Identify Purpose",
    level: "AAA",
    technicalCoverage:
      "Native Controls und Labels werden automatisch geprüft; ob alle UI-Zwecke nach AAA ausreichend programmatisch bestimmbar sind, bleibt manuell offen.",
    status: "manual-review",
    wcagUrl: `${understandingBaseUrl}identify-purpose.html`,
  },
  {
    criterion: "1.4.6",
    title: "Contrast Enhanced",
    level: "AAA",
    technicalCoverage:
      "Axe `wcag2aaa` prüft Enhanced Contrast auf den Kernrouten; die aktuellen Kontrast-Fundstellen wurden über dunklere Text-, Button- und Badge-Farben geschlossen.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}contrast-enhanced.html`,
  },
  {
    criterion: "1.4.7",
    title: "Low or No Background Audio",
    level: "AAA",
    technicalCoverage: "Es gibt keine Hintergrund-Audioinhalte.",
    status: "not-applicable",
    wcagUrl: `${understandingBaseUrl}low-or-no-background-audio.html`,
  },
  {
    criterion: "1.4.8",
    title: "Visual Presentation",
    level: "AAA",
    technicalCoverage:
      "Reflow und Text-Spacing werden automatisch geprüft; vollständige AAA-Bewertung zu Spaltenbreite, Blocksatz, Zeilenabstand und Nutzeranpassung bleibt manuell offen.",
    status: "manual-review",
    wcagUrl: `${understandingBaseUrl}visual-presentation.html`,
  },
  {
    criterion: "1.4.9",
    title: "Images of Text No Exception",
    level: "AAA",
    technicalCoverage:
      "Automatischer Bild-Smoke findet keine informativen Bilder von Text; Brand-Grafik ist dekorativ innerhalb eines benannten Links.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}images-of-text-no-exception.html`,
  },
  {
    criterion: "2.1.3",
    title: "Keyboard No Exception",
    level: "AAA",
    technicalCoverage:
      "Die geprüften Interaktionen nutzen native Links, Buttons und Formularcontrols; der Tastatur-Smoke findet keinen nicht per Tastatur erreichbaren Kernpfad.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}keyboard-no-exception.html`,
  },
  {
    criterion: "2.2.3",
    title: "No Timing",
    level: "AAA",
    technicalCoverage: "Es gibt keine zeitabhängigen Aufgaben oder Timeouts auf den geprüften Routen.",
    status: "not-applicable",
    wcagUrl: `${understandingBaseUrl}no-timing.html`,
  },
  {
    criterion: "2.2.4",
    title: "Interruptions",
    level: "AAA",
    technicalCoverage: "Es gibt keine automatisch einblendenden Unterbrechungen im geprüften Flow.",
    status: "not-applicable",
    wcagUrl: `${understandingBaseUrl}interruptions.html`,
  },
  {
    criterion: "2.2.5",
    title: "Re-authenticating",
    level: "AAA",
    technicalCoverage: "Es gibt keine Authentifizierung und damit keine Re-Authentifizierung.",
    status: "not-applicable",
    wcagUrl: `${understandingBaseUrl}re-authenticating.html`,
  },
  {
    criterion: "2.2.6",
    title: "Timeouts",
    level: "AAA",
    technicalCoverage: "Es gibt keine Sitzungs-Timeouts im geprüften Scope.",
    status: "not-applicable",
    wcagUrl: `${understandingBaseUrl}timeouts.html`,
  },
  {
    criterion: "2.3.2",
    title: "Three Flashes",
    level: "AAA",
    technicalCoverage:
      "DOM-Smoke findet keine Video-, Canvas-, Blink- oder Marquee-Inhalte, die Flashing auslösen könnten.",
    status: "not-applicable",
    wcagUrl: `${understandingBaseUrl}three-flashes.html`,
  },
  {
    criterion: "2.3.3",
    title: "Animation from Interactions",
    level: "AAA",
    technicalCoverage:
      "Reduced-Motion wird emuliert; Interaktionsanimationen sind dekorativ, kurz und werden bei reduzierter Bewegung zurückgenommen.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}animation-from-interactions.html`,
  },
  {
    criterion: "2.4.8",
    title: "Location",
    level: "AAA",
    technicalCoverage:
      "Dokumenttitel, h1 und aktive Navigation geben Orientierung; eine vollständige AAA-Bewertung der Standortinformation bleibt manuell offen.",
    status: "manual-review",
    wcagUrl: `${understandingBaseUrl}location.html`,
  },
  {
    criterion: "2.4.9",
    title: "Link Purpose Link Only",
    level: "AAA",
    technicalCoverage:
      "Automatische Linknamen-Smokes prüfen, dass Links aus ihrem Namen heraus verständlich bleiben; Screenreader-Kontext bleibt manuell zu prüfen.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}link-purpose-link-only.html`,
  },
  {
    criterion: "2.4.10",
    title: "Section Headings",
    level: "AAA",
    technicalCoverage:
      "Die Kernrouten werden auf genau ein h1 und nicht-leere Abschnittsüberschriften geprüft.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}section-headings.html`,
  },
  {
    criterion: "2.4.12",
    title: "Focus Not Obscured Enhanced",
    level: "AAA",
    technicalCoverage:
      "Der aktuelle Smoke prüft sichtbare Fokuslage im Viewport; ob kein Teil des Fokusindikators verdeckt ist, bleibt als AAA-Enhanced-Detail manuell offen.",
    status: "manual-review",
    wcagUrl: `${understandingBaseUrl}focus-not-obscured-enhanced.html`,
  },
  {
    criterion: "2.4.13",
    title: "Focus Appearance",
    level: "AAA",
    technicalCoverage:
      "Fokus-Sichtbarkeit wird automatisch geprüft; die exakte AAA-Flächen-/Kontrastanforderung für Fokusindikatoren bleibt manuell offen.",
    status: "manual-review",
    wcagUrl: `${understandingBaseUrl}focus-appearance.html`,
  },
  {
    criterion: "2.5.5",
    title: "Target Size Enhanced",
    level: "AAA",
    technicalCoverage:
      "AA-Mindestgröße wird automatisch geprüft; die strengere 44px-AAA-Zielgröße ist noch nicht als harter automatischer Gate umgesetzt.",
    status: "manual-review",
    wcagUrl: `${understandingBaseUrl}target-size-enhanced.html`,
  },
  {
    criterion: "2.5.6",
    title: "Concurrent Input Mechanisms",
    level: "AAA",
    technicalCoverage:
      "Die App beschränkt Eingabemodalitäten nicht; native Controls bleiben für Touch, Tastatur und Pointer nutzbar.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}concurrent-input-mechanisms.html`,
  },
  {
    criterion: "3.1.3",
    title: "Unusual Words",
    level: "AAA",
    technicalCoverage:
      "Ungewöhnliche Begriffe, Produktwörter und externe Abkürzungen können nicht zuverlässig automatisch bewertet werden; redaktionelle Prüfung bleibt offen.",
    status: "manual-review",
    wcagUrl: `${understandingBaseUrl}unusual-words.html`,
  },
  {
    criterion: "3.1.4",
    title: "Abbreviations",
    level: "AAA",
    technicalCoverage:
      "Abkürzungen wie WCAG, TMDb oder PWA brauchen redaktionelle Bewertung; die automatische Matrix markiert das als manuell offen.",
    status: "manual-review",
    wcagUrl: `${understandingBaseUrl}abbreviations.html`,
  },
  {
    criterion: "3.1.5",
    title: "Reading Level",
    level: "AAA",
    technicalCoverage:
      "Leseniveau und ergänzende Erklärungen können nicht belastbar per Browser-Smoke bewertet werden; manuelle Textprüfung bleibt offen.",
    status: "manual-review",
    wcagUrl: `${understandingBaseUrl}reading-level.html`,
  },
  {
    criterion: "3.1.6",
    title: "Pronunciation",
    level: "AAA",
    technicalCoverage:
      "Aussprachehilfen sind nicht automatisch bestimmbar; aktuell manuell offen, falls mehrdeutige Wörter fachlich relevant werden.",
    status: "manual-review",
    wcagUrl: `${understandingBaseUrl}pronunciation.html`,
  },
  {
    criterion: "3.2.5",
    title: "Change on Request",
    level: "AAA",
    technicalCoverage:
      "Navigation und Zustandswechsel laufen über explizite Links, Buttons, Submit oder bewusste Auswahländerungen.",
    status: "pass",
    wcagUrl: `${understandingBaseUrl}change-on-request.html`,
  },
  {
    criterion: "3.3.5",
    title: "Help",
    level: "AAA",
    technicalCoverage:
      "Erklärung, Barrierefreiheit, Datenschutz, Impressum und Kontakt sind erreichbar; ob jede Aufgabe genug kontextuelle Hilfe hat, bleibt manuell offen.",
    status: "manual-review",
    wcagUrl: `${understandingBaseUrl}help.html`,
  },
  {
    criterion: "3.3.6",
    title: "Error Prevention All",
    level: "AAA",
    technicalCoverage:
      "Such- und Feedback-Flows haben ruhige Statusmeldungen; vollständige AAA-Bewertung für alle Eingaben bleibt manuell offen.",
    status: "manual-review",
    wcagUrl: `${understandingBaseUrl}error-prevention-all.html`,
  },
  {
    criterion: "3.3.9",
    title: "Accessible Authentication Enhanced",
    level: "AAA",
    technicalCoverage: "Es gibt keinen Authentifizierungsflow.",
    status: "not-applicable",
    wcagUrl: `${understandingBaseUrl}accessible-authentication-enhanced.html`,
  },
] satisfies ReadonlyArray<WcagTechnicalCriterion>;

export const wcagTechnicalStatusLabels: Record<WcagTechnicalStatus, string> = {
  fail: "❌ Automatisch: Fail",
  "manual-review": "⚠️ Manuell offen",
  "not-applicable": "ℹ️ Automatisch: nicht anwendbar",
  pass: "✅ Automatisch: Pass",
};
