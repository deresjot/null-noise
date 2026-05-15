# Accessibility-Prinzipien für null-noise

Stand: 11. April 2026

Diese Datei beschreibt die barrierebezogenen Grundentscheidungen für `null-noise`. Sie ist kein Marketing-Text und keine allgemeine Accessibility-Einführung, sondern die projektbezogene Referenz dafür, was wir bewusst tun und warum.

## Ziel

`null-noise` verfolgt digitale Barrierefreiheit nach nachvollziehbaren Standards und soll zugleich verständlich und testbar bleiben. Das bedeutet:

- Entscheidungen sollen sich auf Standards und belastbare Muster stützen.
- Die Prüfung orientiert sich an WCAG 2.2 und den Prüfansätzen des BITV-Testverfahrens.
- Interaktion soll mit Tastatur, Screenreader und reduzierter Bewegung stabil bleiben.
- Die Oberfläche soll keine zusätzliche Reizlast erzeugen.

## Grundprinzipien

### HTML-first

Wir bevorzugen native HTML-Elemente, solange sie die Aufgabe sauber lösen. Das betrifft besonders:

- `button` statt nachgebauter Klick-Flächen
- `a` statt JavaScript-Navigation
- `form`, `label`, `input`, `select`, `fieldset`, `legend` für Suche und Bewertung
- `details` und `summary` für zusätzliche, aber nicht primäre Erklärung

Der Grund ist schlicht: Native Elemente bringen Rollen, Zustände, Tastaturverhalten und Browser-Support bereits mit. Das macht die Oberfläche robuster und die Tests aussagekräftiger.

### ARIA nur ergänzend

ARIA wird nur eingesetzt, wenn native Semantik nicht reicht. Wir vermeiden ARIA, wenn sie nur ein nachgebautes Verhalten hübscher klingen lassen würde. Falsch oder halb umgesetzt ist ARIA kein Upgrade, sondern oft ein zusätzlicher Fehler.

Konkret für `null-noise` heißt das:

- keine künstlichen `menu`-, `tab`- oder `tooltip`-Muster für einfache Inhaltsgruppen
- keine Landmarken oder Labels, die nur Wiederholungen erzeugen
- keine ARIA-Rollen, die ein komplexeres Verhalten versprechen als tatsächlich vorhanden ist

### Sichtbarer Fokus

Tastaturbedienung ist hier kein Nebenaspekt. Jeder Fokuspunkt muss sichtbar bleiben und in der Reihenfolge sinnvoll sein. `null-noise` arbeitet deshalb mit klaren `:focus-visible`-Zuständen statt mit versteckten oder stilistisch abgeschwächten Fokusmarken.

### Keine rein visuelle Codierung

Wichtige Informationen dürfen nicht nur über Farbe, Intensität oder Posterbild transportiert werden. Die Einordnung bleibt immer als Text lesbar. Farben dürfen Orientierung geben, aber sie sind nie die einzige Quelle.

### Reduzierte Bewegung

Animation ist in `null-noise` nachgeordnet. Bewegungen dürfen weder Information verstecken noch Orientierung ersetzen. `prefers-reduced-motion` wird respektiert, und Interaktionen werden nicht über Bewegung erklärt.

## Warum keine Scores

`null-noise` vermeidet Prozentwerte, Rankings und scheinpräzise Gesamtwerte. Dafür gibt es drei Gründe:

1. Das Produkt trifft keine objektive Dezibel-Aussage.
2. Verdichtete Scores klingen belastbarer, als die Datenbasis oft ist.
3. Für Menschen, die schnell überfordert sind, ist eine klare sprachliche Tendenz oft hilfreicher als ein scheinbar exakter Wert.

Die Oberfläche priorisiert deshalb:

- eine kurze Erste Einschätzung
- sichtbare Unsicherheit
- nachvollziehbare Herkunft der Aussage

## Warum keine Tooltips

Kurz eingeblendete Hilfe auf Hover oder Fokus ist für `null-noise` bewusst nicht der Standard. Hover- oder Fokus-Popups sind in WCAG 2.2 regelungsintensiv und für vergrößerte Ansichten, kognitive Belastung und ungewollte Trigger anfällig.

Für `null-noise` gilt deshalb:

- Primäre Erklärung gehört direkt in die Ansicht.
- Sekundäre Erklärung wird ruhig offengelegt.
- Hilfe soll nicht flüchtig erscheinen und wieder verschwinden.

## Warum `details` und `summary`

`details` und `summary` passen zum Produkt, wenn zusätzliche Erklärung hilfreich ist, aber nicht die Hauptaussage verdrängen soll.

Der Grund für diese Wahl:

- das Muster ist nativ
- es ist keyboard-fähig
- es reduziert eigene JavaScript-Logik
- es eignet sich für ruhige, vorhersehbare Offenlegung

`null-noise` nutzt dieses Muster deshalb für "Worauf basiert das?" und ähnliche Vertiefungen, aber nicht als Ersatz für primäre Orientierung.

## Warum kein separater HTML-Sondermodus

`null-noise` baut aktuell keinen zweiten "maximal barrierefreien" Parallelpfad mit eigener Oberfläche. Der Grund ist nicht Bequemlichkeit, sondern Produktdisziplin:

- Die Standardoberfläche selbst soll der zugängliche Primärpfad sein.
- Eine zweite UI würde Inhalte, Reihenfolge und Teststand leichter auseinanderlaufen lassen.
- Getrennte Modi erhöhen Pflegeaufwand und erzeugen neue Inkonsistenzen, besonders bei Text, Fokus, Disclosure und Rückmeldungen.

Ein optionaler reduzierter Darstellungsmodus wäre nur dann sinnvoll, wenn er rein präsentational bliebe, dieselben Inhalte in derselben Reihenfolge zeigte und keinen eigenen Wartungszweig eröffnet. Für den aktuellen Stand ist das nicht klar nützlich genug, deshalb bleibt die Standard-UI der Referenzpfad.

## Warum eine eigene Seite „Barrierefreiheit“

Die Seite `/barrierefreiheit` ist keine Marketingfläche und keine Rechtsbehauptung. Sie erfüllt drei praktische Aufgaben:

- den aktuellen Stand transparent machen
- automatisierte und manuelle Prüfung sichtbar trennen
- bekannte Grenzen offen benennen, statt Accessibility pauschal zu behaupten

## BFSG-, WCAG- und EN-301-549-Kontext

Technischer Zielstandard bleibt:

- WCAG 2.2 Level AA
- EN 301 549 als europäische Referenz für digitale Angebote
- als praktische Prüforientierung zusätzlich die öffentlich dokumentierten Prüfansätze des BITV-Testverfahrens

Wichtig für die Arbeitsweise im Projekt:

- Automatisierte Tests decken nur einen Teil dieser Anforderungen ab.
- Manuelle Prüfungen bleiben verpflichtend für reale Nutzbarkeit.

Zum BFSG gilt:

- Das Barrierefreiheitsstärkungsgesetz ist seit dem 28. Juni 2025 vollständig in Kraft.
- Für erfasste Dienstleistungen darf ein Angebot nur erbracht werden, wenn die Anforderungen erfüllt sind und die Informationen nach Anlage 3 barrierefrei bereitgestellt werden.
- Online-Shops und Dienstleistungen im elektronischen Geschäftsverkehr sind ausdrücklich Teil des BFSG-Kontexts.
- Kleinstunternehmen, die Dienstleistungen anbieten, sind nach § 3 Absatz 3 BFSG ausgenommen.

Wichtig für `null-noise`:

- Eine rein informative App wie der aktuelle Stand ist nicht automatisch in jedem Fall BFSG-pflichtig.
- Sobald `null-noise` jedoch in Richtung Vertragsabschluss, bezahlter Dienste, Marktplatz oder anderer erfasster Verbraucher-Dienstleistungen geht, muss die BFSG-Frage konkret juristisch geprüft werden.

Diese Einordnung ist eine technische und produktbezogene Arbeitsgrundlage, keine Rechtsberatung.

## Referenzen

- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- W3C Understanding Focus Visible: https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html
- W3C Understanding Content on Hover or Focus: https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html
- W3C COGA, Making Content Usable for People with Cognitive and Learning Disabilities: https://www.w3.org/TR/coga-usable/
- WHATWG HTML, `details` und `summary`: https://html.spec.whatwg.org/multipage/interactive-elements.html
- W3C, Developing an Accessibility Statement: https://www.w3.org/WAI/planning/statements/
- BIK BITV-Test + WCAG 2.2 (Web), Prüfschritte: https://bitvtest.de/pruefverfahren/bitv-20-plus-web
- BIK BITV-Test, Beschreibung des Prüfverfahrens (Web): https://bitvtest.de/bitv_test/das_testverfahren_im_detail/verfahren.html
- BFSG § 14: https://www.gesetze-im-internet.de/bfsg/__14.html
- BFSG Anlage 3: https://www.gesetze-im-internet.de/bfsg/anlage_3.html
- Bundesfachstelle Barrierefreiheit, E-Commerce und BFSG: https://www.bundesfachstelle-barrierefreiheit.de/DE/Fachwissen/Produkte-und-Dienstleistungen/Barrierefreiheitsstaerkungsgesetz/E-Commerce/online-shops_node.html
