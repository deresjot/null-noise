import Link from "next/link";

import { ExplanationPanel } from "@/components/explanation-panel";
import { MascotMark } from "@/components/mascot-mark";
import { ResultList } from "@/components/result-list";
import { SearchForm } from "@/components/search-form";
import { StatusPanel } from "@/components/status-panel";
import { siteClaim, siteName } from "@/lib/constants";
import { getFeaturedTitlesState } from "@/lib/queries";
import { getBetaNoteText } from "@/lib/runtime-config";

export default async function HomePage() {
  const { data: featuredTitles, unavailable: featuredTitlesUnavailable } =
    await getFeaturedTitlesState();
  const betaNote = getBetaNoteText();

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">{siteName}</p>
          <h1>{siteClaim}</h1>
          <p className="field-note">{betaNote}</p>
          <p className="lead">
            null-noise hilft mit erklärten Audio-Reizprofilen dabei, Filme und Serien ruhiger
            einzuordnen. Die erste öffentliche Beta konzentriert sich bewusst auf lesbare
            Reizprofile, getrennte Titeldaten und klare Grenzen statt auf künstliche Produktreife.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" href="/suche">
              Zur Suche
            </Link>
            <Link className="secondary-link" href="/erklaerung">
              Skalen und Grenzen verstehen
            </Link>
          </div>
        </div>
        <div className="hero-stack">
          <section className="panel panel-emphasis search-panel" aria-labelledby="home-search-heading">
            <p className="eyebrow">Direkter Einstieg</p>
            <h2 id="home-search-heading">Suche erst im profilierten Katalog und ergänze nur bei Bedarf.</h2>
            <p>
              Reizprofile bleiben die Hauptquelle. Wenn dort noch nichts vorliegt, können getrennte
              Titeldaten ergänzen, ohne wie eine fertige Bewertung zu wirken.
            </p>
            <SearchForm
              action="/suche"
              filters={{
                q: "",
                tone: "all",
                kind: "all",
                avoidPeaks: false,
                avoidDensity: false,
              }}
            />
          </section>

          <section className="hero-mascot-panel" aria-labelledby="quiet-companion-heading">
            <div className="mascot-lockup">
              <MascotMark className="hero-mascot-frame" imageClassName="hero-mascot" decorative priority />
              <div>
                <p className="eyebrow">Ruhige Oberfläche</p>
                <h2 id="quiet-companion-heading">
                  Wenig visuelle Lautstärke, klare Zustände und keine versteckten Hilfen
                </h2>
              </div>
            </div>
            <p>
              null-noise bleibt bewusst sparsam: ohne Kontozwang, ohne Tracker und ohne
              objektiv klingende Scheinwerte. Stattdessen stehen Klarheit, Tastaturbedienung und
              erklärbare Reizprofile im Mittelpunkt.
            </p>
          </section>
        </div>
      </section>

      <section className="content-grid">
        <ExplanationPanel />
        <section className="panel" aria-labelledby="why-heading">
          <p className="eyebrow">Warum null-noise?</p>
          <h2 id="why-heading">Reizprofile als Orientierung statt als Scheinpräzision</h2>
          <p>
            Viele Menschen brauchen vor dem Schauen eine stillere Entscheidungshilfe als klassische
            Empfehlungsoberflächen. Die Kernfrage bleibt bewusst einfach: Passt dieser Titel gerade
            zu meiner sensorischen Belastbarkeit oder wäre er eher unnötig belastend?
          </p>
          <p>
            Deshalb trennt null-noise Reizprofil, Metadaten und Unsicherheit sichtbar voneinander.
            Die Oberfläche bleibt dabei zurückhaltend: ohne hektische Übergänge, ohne Hover-only-
            Hilfen und ohne künstliche Genauigkeit.
          </p>
        </section>
      </section>

      <section aria-labelledby="featured-heading" className="section-stack">
        <div className="section-header">
          <p className="eyebrow">Beispielkatalog</p>
          <h2 id="featured-heading">Titel mit bereits vorhandenem Reizprofil</h2>
          <p>Diese lokale Basis zeigt, wie Reizprofil, Confidence und Transparenzdaten zusammenkommen.</p>
        </div>
        {featuredTitlesUnavailable ? (
          <StatusPanel
            title="Die lokale Titelbasis ist gerade nicht verfügbar"
            text="Die Beispieltitel konnten gerade nicht geladen werden. Suche und Erklärungen bleiben weiter nutzbar."
            tone="warning"
          />
        ) : null}
        <ResultList
          titles={featuredTitles}
          emptyTitle="Noch keine Titel hinterlegt"
          emptyText="Der Beispielkatalog wird in dieser Basis lokal aus Mock-Daten gespeist."
        />
      </section>
    </>
  );
}
