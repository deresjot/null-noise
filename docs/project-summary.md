# null-noise: Projektzusammenfassung

Stand: Version `0.8.3` am 28. März 2026

## 1. Ausgangspunkt und Produktidee

`null-noise` ist als barrierearme Web-App für Filme und Serien gestartet, die sensorische Belastung nicht als scheinbar objektiven Messwert darstellt, sondern als erklärtes Reizprofil. Der Kern ist bis heute gleich geblieben:

- Reizprofile statt Dezibel-Versprechen
- ruhige, verständliche Oberfläche statt Entertainment-UI
- Privacy by Design statt Tracking, Kontozwang oder Profilbildung
- Accessibility als Kernfunktion statt nachträgliches Compliance-Thema

Die Produktfrage lautet bewusst schlicht: Ist ein Titel für mich gerade ruhig genug oder potenziell belastend?

## 2. Frühe Produkt- und Architekturentscheidungen

Zu Beginn wurde ein belastbares MVP-Konzept mit klaren Grenzen angelegt:

- Fokus zunächst nur auf akustische Belastung
- visuelle Reizdimensionen erst als spätere Erweiterung
- kein Social Layer, keine Gamification, keine Personalisierung
- keine Nutzerkonten im MVP
- keine direkte Verbindung vom Browser zu externen APIs

Technisch wurde deshalb eine kleine, robuste Next.js-Basis gewählt:

- Next.js App Router
- TypeScript
- semantische UI-Komponenten ohne schwere UI-Library
- Route Handlers für serverseitige Endpunkte
- Prisma/PostgreSQL als Zielmodell für spätere Persistenz
- Playwright und axe für frühe Accessibility-Prüfung
- Vitest für fokussierte Logik- und Mapping-Tests

Diese Architektur wurde absichtlich nicht auf „schnell große Features“ optimiert, sondern auf nachvollziehbare Zustände, saubere Trennung und spätere Erweiterbarkeit.

## 3. Datenmodell und Trennung der Verantwortlichkeiten

Ein wesentlicher Grundsatz war früh die strikte Trennung verschiedener Datenarten:

1. externe Titeldaten
2. eigenes Reizprofil
3. spätere Einzelbewertungen
4. Aggregation
5. Confidence

Der Grund dafür war inhaltlich und UX-seitig wichtig:

- Externe Filmdatenbanken wissen nichts über sensorische Belastung.
- Reizprofile sollen nicht wie automatisch berechnete Wahrheiten wirken.
- Unsicherheit soll sichtbar und erklärt bleiben.

Deshalb wurden Modelle wie `stimulus_profile`, `content_flags`, `rating_count`, `source_type` und `last_reviewed_at` vorbereitet, ohne vorschnell eine produktive Bewertungslogik vorzutäuschen.

## 4. Accessibility- und Privacy-Rahmen

Von Anfang an wurde `null-noise` an WCAG 2.2 AA, EN 301 549 und den BFSG-/EAA-Kontext angelehnt. Inhaltlich hieß das:

- semantisches HTML zuerst
- ARIA nur ergänzend
- vollständige Tastaturbedienbarkeit
- sichtbare Fokuszustände
- keine Hover-only-Hilfen
- reduzierte Bewegung
- klare Fehlermeldungen und Zustände in Textform

Privacy-seitig wurden folgende Grenzen festgezogen:

- keine Tracker
- kein Fingerprinting
- keine Client-Direktaufrufe zu externen Quellen
- keine versteckten Kennungen
- kein Kontozwang
- nur minimale funktionale Speicherung

Das war nicht nur technischer Selbstschutz, sondern Teil der Produktidee: Eine App, die Menschen bei Reizreduktion hilft, sollte sie nicht parallel tracken.

## 5. UI- und Komponentenstrategie

Statt früh eine komplette Komponentenbibliothek zu übernehmen, wurde eine strenge HTML-first-Strategie eingeführt. Orientierung kam von barrierearmen Pattern-Quellen, aber jede Komponente wurde lokal bewertet. Besonders wichtig waren dabei:

- native Formularelemente
- `details` und `summary` für Disclosure
- klare Listen- und Kartenmuster
- keine künstlichen Menüs, Tabs oder Tooltips, wenn einfachere Muster reichen

Die dokumentierte Strategie dazu liegt in [docs/ui-component-strategy.md](./ui-component-strategy.md).

Später wurde die Orientierung an Inclusive Components explizit ergänzt. Die wichtigste Ableitung daraus war: Primäre Erklärung sichtbar halten und nur vertiefende Hilfe aufklappbar machen.

## 6. Erste technische Basis des MVP

Auf dieser Grundlage wurde eine lokale MVP-Basis aufgebaut:

- Startseite mit kurzer Einführung
- Suchseite
- Detailseite pro Titel
- Erklärungssystem
- Bedienhinweise
- lokaler Beispielkatalog mit Mock-Daten
- semantische Komponenten und frühe Accessibility-Smoke-Tests

Diese Phase diente nicht dazu, „fertig“ zu wirken, sondern das Grundgerüst belastbar zu machen. Der lokale Katalog wurde bewusst klein gehalten, damit Suchlogik, Reizprofil-Darstellung und Copy zunächst im kontrollierten Rahmen überprüft werden konnten.

## 7. Externe Metadaten als Integrations-Spike

Ein späterer Schritt war kein Produkt-Feature, sondern ein begrenzter Integrations-Spike: die serverseitige Anbindung an eine echte externe Titeldatenquelle.

Dabei wurden mehrere Wege geprüft:

- IMDb als theoretisch hochwertige, aber deutlich schwergewichtigere Option
- TMDb als realistischere erste Quelle für Metadaten

Die Entscheidung fiel für den Spike pragmatisch auf TMDb, weil:

- die API vergleichsweise einfach serverseitig nutzbar ist
- Suche und Basisdetails für Film und Serie direkt verfügbar sind
- das Projekt bereits einen klar getrennten Fallback-Pfad hatte

Wichtig war dabei immer:

- keine Persistenz der Antworten
- kein direkter Browserzugriff auf TMDb
- keine Vermischung mit dem eigentlichen Reizprofil
- externe API liefert nur Metadaten, keine sensorische Bewertung

So entstand der getrennte Pfad `/spike/metadaten` sowie eine minimale interne Mapping-Schicht für:

- externe ID
- Titelname
- Medientyp
- Erscheinungsjahr
- Kurzbeschreibung optional
- Posterpfad optional

## 8. Verifikation und Diagnose des TMDb-Pfads

Die TMDb-Strecke hat nicht sofort funktioniert. Es gab mehrere Iterationen, in denen klar getrennt wurde zwischen:

- fehlendem oder falschem Token
- serverseitiger Konfiguration
- funktionierendem Request-Aufbau
- Upstream-Fehlern wie `401`
- leerer Antwort
- erfolgreichem Mapping

Wichtig war hier die Entscheidung, Debugging nicht einfach sichtbar ins Produkt-UI zu kippen. Stattdessen wurde nur eine kontrollierte, nicht-sensitive Serverdiagnose ergänzt. Sie zeigte zum Beispiel:

- Token vorhanden: ja/nein
- Token-Länge
- Request gestartet: ja/nein
- Upstream-Statuscode
- Mapping erfolgreich: ja/nein

Nachdem ein korrekter `TMDB_READ_ACCESS_TOKEN` lokal hinterlegt wurde, konnte der serverseitige Live-Check schließlich erfolgreich verifiziert werden.

## 9. Entwicklung der Suche

Die Suchseite war zwischendurch visuell deutlich weiter als funktional. Deshalb wurde sie in mehreren Schritten stabilisiert.

### 9.1 Lokale Suche zuerst

Die Grundregel blieb:

1. lokaler Katalog mit Reizprofil zuerst
2. externe Titeldaten nur als klar getrennte zweite Ebene

Das war bewusst keine technische Kleinigkeit, sondern eine inhaltliche Schutzmaßnahme gegen irreführende Trefferlisten.

### 9.2 Fuzzy-Suche für den lokalen Katalog

Um die Suche alltagstauglicher zu machen, wurde eine fehlertolerante lokale Suche ergänzt. Ziel war nicht „smarte Magie“, sondern nachvollziehbare Toleranz bei leichten Tippfehlern.

Beispiel:

- `Hafn ohne Eile` findet weiterhin `Hafen ohne Eile`

### 9.3 TMDb-Fallback bei fehlendem lokalen Treffer

Wenn lokal nichts mit Reizprofil vorliegt, kann der Server getrennte Titeldaten nachladen. Dieser Pfad wurde so gestaltet, dass:

- Filter mit Reizprofilbezug den externen Fallback bewusst nicht benutzen
- leere Ergebnisse, Fehlkonfigurationen und API-Probleme klar unterschieden werden
- die UI niemals so tut, als seien externe Treffer bereits sensorisch bewertet

### 9.4 Fehlertoleranz bei externen Treffern

Bei Titeln wie `Arival` zeigte sich, dass die Rohreihenfolge von TMDb allein im UI zu unruhig wirkt. Deshalb wurden zwei Dinge ergänzt:

- ein vorsichtiger Retry für plausible Tippfehler
- eine Gewichtung, die kurze, naheliegende Vervollständigungen höher priorisiert

Dadurch landete `Arrival` bei entsprechenden Suchen deutlich plausibler an erster Stelle.

### 9.5 Vorschläge während der Eingabe

Später kamen serverseitige Vorschläge direkt im Suchfeld dazu. Sie bleiben bewusst klein und getrennt:

- keine direkte Client-Anbindung an TMDb
- keine große, komplexe Combobox-Inszenierung
- Vorschläge helfen beim Titeltext, ersetzen aber kein Reizprofil

## 10. UI-Entwicklung und gestalterische Iterationen

Die Oberfläche hat mehrere sichtbare Iterationen durchlaufen. Das war kein Selbstzweck, sondern eine Suche nach einer Form, die zugleich ruhig, zugänglich, glaubwürdig und testbar ist.

### 10.1 Frühe Basis

Die erste Version setzte vor allem auf klare Boxen, starke Typo und sichtbare Struktur. Das half beim schnellen Aufbauen der Informationsarchitektur, wirkte aber teils noch zu grob oder technisch.

### 10.2 Pattern- und Library-Orientierung

Anschließend wurden DigitalA11Y, Inclusive Components, GOV.UK und ähnliche Quellen als Pattern-Referenz dokumentiert. Das schärfte die Komponentenauswahl, ohne die App optisch wie eine Library-Sammlung wirken zu lassen.

### 10.3 Monochrom und reizärmer

Später wurde die Oberfläche stärker auf geringe Reizdichte ausgerichtet:

- weniger Farbe
- weniger visuelle Effekte
- mehr Kontrast über Typografie und Ordnung statt über bunte Signale
- robustere Zustände bei Farbsehfehlschwäche und migränesensibler Nutzung

### 10.4 Editoriales Redesign

Im aktuellen Stand wurde das UI noch einmal neu ausgerichtet, diesmal stärker mit editorialer Ruhe und mehr Weißraum. Die Leitgedanken dabei:

- weniger Kachelwand
- klarere vertikale Rhythmik
- weniger technische Zwischentöne im sichtbaren Flow
- zurückhaltenderes Markenbild
- ruhigeres Verhältnis von Text, Navigation und Ergebnislisten

Dabei wurden Startseite, Suchseite, Header, Footer sowie Logo/Icon gemeinsam betrachtet, statt nur einzelne Farben zu tauschen.

### 10.5 Beta-Schärfung der Oberfläche

Für die erste öffentliche Beta wurde die Oberfläche danach noch einmal disziplinierter gezogen, ohne die Produktlogik neu zu bauen. Die wichtigsten sichtbaren Schritte waren:

- deutlich weniger pillige Formen
- straffere Karten, Buttons, Labels und Formularfelder
- etwas kräftigere, aber kontrollierte Farbflächen
- klarere Status- und Hinweisboxen
- schnellere visuelle Einordnung in Suchtreffern

Wichtig war dabei: Farbe unterstützt jetzt Orientierung stärker, ersetzt aber weiterhin nie die textliche Bedeutung. Lokale Titel, externe Titeldaten, Statusmeldungen und Formularfeedback bleiben auch ohne reine Farbinterpretation verständlich.

## 11. Marke, Logo und Icon

Auch die Markenfigur wurde mehrfach iteriert. Frühere, verspieltere Richtungen wurden wieder verworfen, weil sie zu laut, zu illustriert oder nicht favicon-tauglich genug wirkten.

Der aktuelle Stand ist bewusst ein Platzhalter mit reduziertem kawaii Gesicht:

- einfacher
- ruhiger
- technisch robuster
- leichter mit dem UI zu harmonisieren

Wichtig war hier die bewusste Entscheidung, lieber einen stillen Platzhalter zu haben als ein zu früh „fertig“ designtes Maskottchen, das sich später wieder als falsch anfühlt.

## 12. Testing und Qualitätssicherung

Parallel zur UI- und Suchentwicklung wurde der Prüfpfad kontinuierlich mitgezogen:

- `npm run test:unit` für serverseitige Logik und Mapping
- `npm run lint` für statische Qualitätskontrolle
- `npm run build` als produktionsnaher Integritätscheck
- `npx playwright test` für Accessibility-Smoke-Tests, Navigation, Suchzustände und Regressionen

Wichtige Playwright-/Vitest-Schwerpunkte waren bisher:

- Skip-Link und Grundnavigation
- sichtbare Ergebnisstruktur
- Tippfehler in der lokalen Suche
- klare leere Zustände
- TMDb-Vorschläge beim Tippen
- Trennung von Hauptproduktfluss und technischem Metadatenpfad
- Feedback direkt an der Bewertungssektion statt verdeckt unter dem Sticky Header
- schnelle Einordnung in Suchtreffern
- minimale Live-Basis mit Impressum, Datenschutz und getrennter TMDb-Einordnung

## 13. Warum viele Dinge bewusst noch offen sind

Mehrere Themen wurden absichtlich nicht „halb fertig“ eingebaut:

- keine belastbare produktive Persistenz für öffentliche Schreibpfade
- keine Accounts
- keine Community- oder Social-Funktionen
- keine Umstellung des ganzen Produkts auf externe Metadaten
- keine Suggestion- oder Ranking-Magie über das Nötige hinaus
- kein Hosting-Umbau auf klassisches FTP-Setup

Der Grund ist jeweils derselbe: Solange Basissuche, Reizprofil-Logik, Accessibility, ehrliche Beta-Grenzen und belastbare Speicherung nicht sauber genug sind, wäre zusätzliche Produktlogik eher Scheinfortschritt als echter Fortschritt.

## 14. Aktueller Stand in einem Satz

`null-noise` ist heute ein barrierearm gedachtes Next.js-MVP mit visuell geschaerfter, ruhiger UI, einem kleinen Drei-Achsen-Reizprofil, sichtbarer Confidence auf Basis weniger Einschätzungen, verifiziertem serverseitigem TMDb-Fallback, TMDb-Vorschlägen beim Tippen, lokal anlegbaren externen Titeln mit vorläufiger Startbasis, schneller Einordnung in Suchtreffern, minimaler Live-Basis mit Impressum und Datenschutz sowie einer fuer die erste öffentliche Beta bewusst lesenden Produktkonfiguration.

## 15. Nächste sinnvolle Fragen für die weitere Entwicklung

Von hier aus sind die nächsten sinnvollen Entscheidungen nicht „noch ein Feature“, sondern eher diese:

- Wie groß soll der lokale, wirklich profilierte Katalog als nächste Testbasis werden?
- Ab wann lohnt sich persistente anonyme Bewertung tatsächlich?
- Welche redaktionellen Prozesse braucht ein verlässliches Initialprofil?
- Welche Teile der externen TMDb-Daten sollen langfristig importiert werden und welche nicht?
- Wie soll das Markenbild weiterentwickelt werden, ohne die ruhige Nutzung zu stören?

Das ist bewusst der Punkt, an dem `null-noise` jetzt steht: nicht mehr nur eine lose Idee, aber auch noch keine künstlich „fertige“ Produktinszenierung.
