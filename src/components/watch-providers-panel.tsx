import type { MetadataWatchProviderState } from "@/lib/metadata-spike";

type WatchProvidersPanelProps = {
  heading?: string;
  headingLevel?: "h2" | "h3";
  prominence?: "default" | "featured";
  state: MetadataWatchProviderState;
};

const watchProviderGroupOrder = ["flatrate", "free", "rent", "buy"] as const;

function formatRegionLabel(region: string): string {
  if (region === "DE") {
    return "Deutschland";
  }

  return region;
}

function getGroupDisplayLabel(id: string, fallback: string): string {
  if (id === "flatrate") {
    return "Streamingdienste";
  }

  if (id === "rent") {
    return "Leihen";
  }

  if (id === "buy") {
    return "Kaufen";
  }

  if (id === "free") {
    return "Kostenlos";
  }

  return fallback;
}

function formatPrice(price: number, region: string): string {
  if (region === "DE") {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 2,
    }).format(price);
  }

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

function formatOfferDetail(
  provider: { format: string | null; price: number | null },
  region: string,
): string | null {
  if (!provider.format || typeof provider.price !== "number") {
    return null;
  }

  return `${provider.format} · ${formatPrice(provider.price, region)}`;
}

function getProviderLinkLabel(offerMode: "direct" | "listing"): string {
  return offerMode === "direct" ? "Direkt zum Angebot" : "Zur Angebotsseite";
}

export function WatchProvidersPanel({
  heading = "Verfügbar bei",
  headingLevel = "h3",
  prominence = "default",
  state,
}: WatchProvidersPanelProps) {
  const HeadingTag = headingLevel;
  const orderedGroups =
    state.kind === "success"
      ? [...state.groups].sort(
          (left, right) =>
            watchProviderGroupOrder.indexOf(left.id) - watchProviderGroupOrder.indexOf(right.id),
        )
      : [];

  return (
    <section
      className="watch-provider-panel"
      data-prominence={prominence}
      aria-labelledby="watch-providers-heading"
    >
      <div className="watch-provider-head">
        <HeadingTag id="watch-providers-heading">{heading}</HeadingTag>
        <p className="field-note">
          {state.source === "watchmode"
            ? `Für ${formatRegionLabel(state.region)}. Wenn möglich direkt zum Angebot, sonst weiter zur gemeinsamen Übersichtsseite.`
            : `Für ${formatRegionLabel(state.region)}. Direktlinks sind gerade nicht verfügbar. Die Angebotsseite bleibt aber offen.`}
        </p>
      </div>

      {state.kind === "success" ? (
        <>
          <div className="watch-provider-summary" aria-label={`Angebotsarten in ${formatRegionLabel(state.region)}`}>
            <p className="watch-provider-summary-region">{formatRegionLabel(state.region)}</p>
            <ul className="plain-list watch-provider-summary-list">
              {orderedGroups.map((group) => (
                <li key={`summary-${group.id}`} className="watch-provider-summary-chip">
                  <span>{getGroupDisplayLabel(group.id, group.label)}</span>
                  <strong>{group.providers.length}</strong>
                </li>
              ))}
            </ul>
          </div>

          <div className="watch-provider-grid">
            {orderedGroups.map((group) => (
              <section key={group.id} className="watch-provider-group" aria-labelledby={`watch-${group.id}`}>
                <p className="watch-provider-group-title" id={`watch-${group.id}`}>
                  {getGroupDisplayLabel(group.id, group.label)}
                </p>
                <ul className="plain-list watch-provider-list">
                  {group.providers.map((provider) => (
                    <li key={`${group.id}-${provider.id}`}>
                      {provider.offerUrl ? (
                        <a
                          className="watch-provider-link"
                          href={provider.offerUrl}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <span className="watch-provider-link-copy">
                            <span className="watch-provider-link-name">{provider.name}</span>
                            {formatOfferDetail(provider, state.region) ? (
                              <span className="watch-provider-link-detail">
                                {formatOfferDetail(provider, state.region)}
                              </span>
                            ) : null}
                          </span>
                          <span className="watch-provider-link-meta">
                            {getProviderLinkLabel(provider.offerMode)}
                          </span>
                        </a>
                      ) : (
                        provider.name
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <p className="watch-provider-meta">
            {state.attribution}{" "}
            {state.source === "tmdb" && state.link
              ? "Die offizielle Quelle liefert hier gerade eine gemeinsame Angebotsseite."
              : null}{" "}
            {state.link ? (
              <a href={state.link} rel="noreferrer" target="_blank">
                {state.source === "watchmode" ? "Fallback bei TMDb öffnen" : "Alle Angebote bei TMDb öffnen"}
              </a>
            ) : null}
          </p>
        </>
      ) : (
        <p className="field-note watch-provider-empty">
          {state.message}{" "}
          {"link" in state && state.link ? (
            <a href={state.link} rel="noreferrer" target="_blank">
              Zur Angebotsseite
            </a>
          ) : null}
        </p>
      )}
    </section>
  );
}
