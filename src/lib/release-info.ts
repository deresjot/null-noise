import packageJson from "../../package.json";

export const currentBuild = {
  version: packageJson.version,
  label: "Legal pages and mobile UI maintenance",
  releasedAt: "2026-05-14 · 16:37 CEST",
};

export const releaseNotes = [
  {
    version: packageJson.version,
    label: "Legal pages and mobile UI maintenance",
    releasedAt: "2026-05-14",
    entries: [
      "Legal pages now use the verified contact address for Sebastian Jansen and keep the missing postal address as an explicit review item instead of inventing data.",
      "Accessibility, privacy and imprint copy were aligned with the current private hobby/reference-project scope.",
      "Footer release metadata now uses a more technical build/changelog vocabulary and reflects the latest legal-page update.",
      "Header, hero, search form, direction tiles, mobile result lists and footer layout remain stabilized against clipped text and horizontal overflow.",
    ],
  },
  {
    version: "0.8.3",
    label: "Metadata spike layout stabilization",
    releasedAt: "2026-04-18",
    entries: [
      "Refined the metadata detail layout with a clearer main column and a flatter secondary information column.",
      "Compacted `Dazu passt auch ...` cards to reduce scroll load while keeping the first assessment visible.",
      "Moved `Verfügbar bei` into a quieter secondary section with more predictable reading rhythm.",
      "Hardened `/suche` direct-start cards as responsive targets with stable focus and click areas.",
      "Removed the doubled left edge in browse groups caused by overlapping wrapper and group borders.",
    ],
  },
  {
    version: "0.8.2",
    label: "Local title import",
    releasedAt: "2026-03-28",
    entries: [
      "Added an explicit path for importing external TMDb titles into local null-noise records with provisional seed data.",
      "Search now routes imported titles to the local detail page with the rating form instead of only showing metadata.",
      "Kept TMDb scoped to metadata; stimulus profile, effect, confidence and aggregation stay internal to null-noise.",
    ],
  },
  {
    version: "0.8.1",
    label: "Rating write path hardening",
    releasedAt: "2026-03-28",
    entries: [
      "Added server-side guards for anonymous ratings: origin check, rate limit, title cooldown and a small timing plausibility check.",
      "Kept success and rejection feedback calm in the UI without introducing accounts or profile building.",
      "Maintained separate aggregation for stimulus profile and soothing effect, independent from metadata context.",
    ],
  },
  {
    version: "0.7.0",
    label: "Separate effect dimension",
    releasedAt: "2026-03-27",
    entries: [
      "Extended the stimulus model with the separate `soothingEffect` dimension.",
      "Aggregated mock data from discrete sample ratings via median values for profile and soothing effect.",
      "Added the subjective soothing-effect readout and prepared the fourth rating question on detail pages.",
    ],
  },
  {
    version: "0.6.2",
    label: "Claim integration",
    releasedAt: "2026-03-27",
    entries: [
      "Integrated the product claim into the homepage and anchored it below the product name.",
      "Aligned homepage, search and explanation copy around calm orientation and provisional assessment.",
      "Updated metadata and sharing text without moving the product surface toward marketing copy.",
    ],
  },
  {
    version: "0.6.1",
    label: "Muted poster assets",
    releasedAt: "2026-03-27",
    entries: [
      "Enabled small poster thumbnails for external primary results as optional visual orientation.",
      "Routed posters through a local server path and rendered them desaturated, greyed and slightly dimmed.",
      "Kept cards stable when no poster asset is available.",
    ],
  },
  {
    version: "0.6.0",
    label: "Stimulus profile simplification",
    releasedAt: "2026-03-27",
    entries: [
      "Simplified the stimulus profile into three named audio axes with a shared 0-to-4 scale.",
      "Derived confidence from the number of assessments and exposed it as low, medium or high.",
      "Deferred direct poster loading to keep metadata context and privacy behavior easier to reason about.",
    ],
  },
  {
    version: "0.5.2",
    label: "Logo placeholder refresh",
    releasedAt: "2026-03-27",
    entries: [
      "Reworked the placeholder mark into a brighter, softer face shape.",
      "Removed the dark backing block so the mark reads lighter at small sizes.",
      "Updated visible footer build metadata to 0.5.2.",
    ],
  },
  {
    version: "0.5.0",
    label: "Editorial UI pass",
    releasedAt: "2026-03-27",
    entries: [
      "Moved the UI toward a lighter editorial language with calmer typography and less card weight.",
      "Aligned header, footer, homepage and search page around a reduced layout system.",
      "Updated placeholder logo, favicon and sharing preview for the new visual direction.",
    ],
  },
  {
    version: "0.4.4",
    label: "TMDb suggestions",
    releasedAt: "2026-03-27",
    entries: [
      "Added server-side TMDb suggestions while typing in the search field.",
      "Rendered suggestions as a separate list below the field without replacing stimulus profiles.",
      "Weighted short, likely title completions higher in TMDb relevance sorting.",
    ],
  },
  {
    version: "0.1.0",
    label: "MVP baseline",
    releasedAt: "2026-03-22",
    entries: [
      "Shipped the first search and detail surface with accessibility goals and mock data.",
      "Added the initial explanation system, usage guidance and semantic UI building blocks.",
    ],
  },
] as const;
