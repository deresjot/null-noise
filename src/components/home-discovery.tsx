import Link from "next/link";

import { ResultPoster } from "@/components/result-poster";
import { ToneFaceIcon } from "@/components/tone-face-icon";
import type {
  MetadataSpikeBrowseSectionId,
  MetadataSpikeBrowseState,
} from "@/lib/metadata-spike";
import { getTmdbPosterProxyPath, type MetadataSpikeTitle } from "@/lib/metadata-shared";

type DiscoveryDirection = {
  description: string;
  id: MetadataSpikeBrowseSectionId;
  marker: string;
  searchPath: string;
  title: string;
};

const discoveryDirections: DiscoveryDirection[] = [
  {
    description: "Wenig Druck, eher klare Form.",
    id: "quiet",
    marker: "≈",
    searchPath: "/suche?tone=calm&view=grid#results-heading",
    title: "Eher ruhig",
  },
  {
    description: "Mit Bewegung, aber erkennbarem Rahmen.",
    id: "balanced",
    marker: "↕",
    searchPath: "/suche?tone=balanced&view=grid#results-heading",
    title: "Eher wechselhaft",
  },
  {
    description: "Dichter, lauter oder mit stärkeren Spitzen.",
    id: "loud",
    marker: "✦",
    searchPath: "/suche?tone=intense&view=grid#results-heading",
    title: "Eher intensiv",
  },
];

function formatMediaType(value: MetadataSpikeTitle["mediaType"]): string {
  return value === "movie" ? "Film" : "Serie";
}

function formatMetaLine(item: MetadataSpikeTitle): string {
  return [formatMediaType(item.mediaType), item.releaseYear ?? "Jahr offen"]
    .filter(Boolean)
    .join(" · ");
}

function getDetailPath(item: MetadataSpikeTitle): string {
  return `/spike/metadaten/${item.mediaType}/${item.sourceId}`;
}

function getDirectionItem(
  state: MetadataSpikeBrowseState,
  directionId: MetadataSpikeBrowseSectionId,
): MetadataSpikeTitle | null {
  if (state.kind !== "success") {
    return null;
  }

  return state.sections.find((section) => section.id === directionId)?.items[0] ?? null;
}

export function HomeDiscovery({ state }: { state: MetadataSpikeBrowseState }) {
  return (
    <section className="home-discovery-stage" aria-labelledby="home-discovery-heading">
      <header className="home-discovery-stage-header">
        <div>
          <p className="eyebrow">Streifzug</p>
          <h2 id="home-discovery-heading">Drei Fundstücke. Drei Richtungen.</h2>
          <p className="home-discovery-stage-note">
            Kein Ranking und kein endloser Feed. Nur drei unterschiedliche Möglichkeiten zum
            Anfangen.
          </p>
        </div>
        <Link
          className="secondary-button-link home-discovery-more"
          href="/suche?mix=home-discovery-next&view=grid#results-heading"
          tabIndex={0}
        >
          Mehr Fundstücke
        </Link>
      </header>

      <ul className="plain-list home-fundstueck-grid">
        {discoveryDirections.map((direction, index) => {
          const item = getDirectionItem(state, direction.id);
          const href = item ? getDetailPath(item) : direction.searchPath;

          return (
            <li key={direction.id}>
              <article
                className="home-fundstueck-card"
                data-browse-id={direction.id}
                data-has-title={item ? "true" : "false"}
              >
                <Link
                  className="home-fundstueck-link"
                  href={href}
                  tabIndex={0}
                >
                  <div className="home-fundstueck-art">
                    {item ? (
                      <ResultPoster
                        decorative
                        priority={index === 0}
                        sizes="(max-width: 760px) 7rem, (max-width: 1100px) 28vw, 22rem"
                        src={getTmdbPosterProxyPath(item.posterPath, "w500")}
                        title={item.title}
                      />
                    ) : (
                      <ToneFaceIcon
                        className="home-fundstueck-fallback-mark"
                        tone={direction.id === "quiet" ? "quiet" : direction.id === "balanced" ? "balanced" : "intense"}
                      />
                    )}
                  </div>

                  <div className="home-fundstueck-copy">
                    <p className="home-fundstueck-direction">
                      <ToneFaceIcon
                        className="home-fundstueck-marker"
                        tone={direction.id === "quiet" ? "quiet" : direction.id === "balanced" ? "balanced" : "intense"}
                      />
                      <span>
                        <span className="home-fundstueck-kicker">Erste Einschätzung</span>
                        <strong>{direction.title}</strong>
                      </span>
                    </p>
                    {item ? <p className="home-fundstueck-meta">{formatMetaLine(item)}</p> : null}
                    <h3>{item?.title ?? `${direction.title} stöbern`}</h3>
                    <p className="home-fundstueck-description">{direction.description}</p>
                    <span className="home-fundstueck-action">
                      {item ? "Fundstück öffnen" : "Auswahl öffnen"}
                      <span aria-hidden="true"> →</span>
                    </span>
                  </div>
                </Link>
              </article>
            </li>
          );
        })}
      </ul>

      <p className="home-discovery-source">
        Titelmetadaten von TMDb. Die Richtung ist eine vorsichtige null-noise-Einschätzung und
        keine Qualitätswertung.
      </p>
    </section>
  );
}
