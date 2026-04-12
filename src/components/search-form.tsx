import Link from "next/link";

import type { SearchFilters } from "@/lib/types";

import { SearchQueryField } from "./search-query-field";

interface SearchFormProps {
  action: string;
  filters: SearchFilters;
  variant?: "default" | "compact" | "hero" | "stage";
  submitLabel?: string;
}

const filterModeLabel = "Konsequent rausnehmen";
const avoidPeaksLabel = "Harte Spitzen raus";
const avoidDensityLabel = "Dichte Klangflächen raus";
const titlePlaceholder = "z. B. Arrival, The Bear oder Past Lives";

function buildSearchPath(filters: SearchFilters): string {
  const searchParams = new URLSearchParams();

  if (filters.q) {
    searchParams.set("q", filters.q);
  }

  if (filters.tone !== "all") {
    searchParams.set("tone", filters.tone);
  }

  if (filters.kind !== "all") {
    searchParams.set("kind", filters.kind);
  }

  if (filters.avoidPeaks) {
    searchParams.set("avoidPeaks", "true");
  }

  if (filters.avoidDensity) {
    searchParams.set("avoidDensity", "true");
  }

  const queryString = searchParams.toString();
  return queryString ? `/suche?${queryString}` : "/suche";
}

function ActiveFilterMode({ filters }: { filters: SearchFilters }) {
  const peaksPath = buildSearchPath({
    ...filters,
    avoidPeaks: !filters.avoidPeaks,
  });
  const densityPath = buildSearchPath({
    ...filters,
    avoidDensity: !filters.avoidDensity,
  });
  const hasActiveFilters = filters.avoidPeaks || filters.avoidDensity;

  return (
    <section className="active-filter-mode" aria-label="Aktiver Filtermodus">
      <p className="active-filter-mode-label">{filterModeLabel}</p>
      <div className="active-filter-mode-controls">
        <Link
          className="search-filter-toggle"
          data-active={filters.avoidPeaks ? "true" : "false"}
          href={peaksPath}
        >
          <span className="search-filter-toggle-state">{filters.avoidPeaks ? "Aktiv" : "Aus"}</span>
          <span>{avoidPeaksLabel}</span>
        </Link>
        <Link
          className="search-filter-toggle"
          data-active={filters.avoidDensity ? "true" : "false"}
          href={densityPath}
        >
          <span className="search-filter-toggle-state">
            {filters.avoidDensity ? "Aktiv" : "Aus"}
          </span>
          <span>{avoidDensityLabel}</span>
        </Link>
      </div>
      {hasActiveFilters ? (
        <p className="active-filter-mode-note">Filter greifen sofort auf die Trefferliste.</p>
      ) : null}
    </section>
  );
}

export function SearchForm({
  action,
  filters,
  variant = "default",
  submitLabel = "Suchen",
}: SearchFormProps) {
  if (variant === "hero") {
    return (
      <form
        action={action}
        aria-label="Titelsuche"
        className="search-form"
        data-variant="hero"
        role="search"
      >
        <SearchQueryField
          defaultValue={filters.q}
          key={`search-query-${filters.q}`}
          label="Film oder Serie"
          placeholder={titlePlaceholder}
        />
        <input type="hidden" name="tone" value={filters.tone} />
        <input type="hidden" name="kind" value={filters.kind} />
        {filters.avoidPeaks ? <input type="hidden" name="avoidPeaks" value="true" /> : null}
        {filters.avoidDensity ? <input type="hidden" name="avoidDensity" value="true" /> : null}
        <button className="primary-button search-submit-button" type="submit">
          {submitLabel}
        </button>
      </form>
    );
  }

  if (variant === "stage") {
    return (
      <form
        action={action}
        aria-label="Titelsuche verfeinern"
        className="search-form"
        data-variant="stage"
        role="search"
      >
        <div className="search-form-stage-head">
          <SearchQueryField
            defaultValue={filters.q}
            key={`search-query-${filters.q}`}
            label="Titel"
            placeholder={titlePlaceholder}
          />
          <button className="primary-button search-submit-button" type="submit">
            {submitLabel}
          </button>
        </div>

        <div className="search-form-stage-controls">
          <div className="field-group field-group-tone">
            <label htmlFor="tone">Tendenz</label>
            <select id="tone" name="tone" defaultValue={filters.tone}>
              <option value="all">Alles</option>
              <option value="calm">Eher ruhig</option>
              <option value="balanced">Wechselhaft</option>
              <option value="intense">Eher intensiv</option>
            </select>
          </div>

          <div className="field-group field-group-kind">
            <label htmlFor="kind">Format</label>
            <select id="kind" name="kind" defaultValue={filters.kind}>
              <option value="all">Alles</option>
              <option value="movie">Film</option>
              <option value="series">Serie</option>
            </select>
          </div>

          <ActiveFilterMode filters={filters} />
        </div>
        {filters.avoidPeaks ? <input type="hidden" name="avoidPeaks" value="true" /> : null}
        {filters.avoidDensity ? <input type="hidden" name="avoidDensity" value="true" /> : null}
      </form>
    );
  }

  if (variant === "compact") {
    return (
      <form
        action={action}
        aria-label="Titelsuche verfeinern"
        className="search-form"
        data-variant="compact"
        role="search"
      >
        <div className="search-form-compact-grid">
          <SearchQueryField
            defaultValue={filters.q}
            key={`search-query-${filters.q}`}
            label="Titel"
            placeholder={titlePlaceholder}
          />

          <div className="field-group field-group-tone">
            <label htmlFor="tone">Tendenz</label>
            <select id="tone" name="tone" defaultValue={filters.tone}>
              <option value="all">Alles</option>
              <option value="calm">Eher ruhig</option>
              <option value="balanced">Wechselhaft</option>
              <option value="intense">Eher intensiv</option>
            </select>
          </div>

          <div className="field-group field-group-kind">
            <label htmlFor="kind">Format</label>
            <select id="kind" name="kind" defaultValue={filters.kind}>
              <option value="all">Alles</option>
              <option value="movie">Film</option>
              <option value="series">Serie</option>
            </select>
          </div>

          <ActiveFilterMode filters={filters} />

          <button className="primary-button search-submit-button" type="submit">
            {submitLabel}
          </button>
        </div>
        {filters.avoidPeaks ? <input type="hidden" name="avoidPeaks" value="true" /> : null}
        {filters.avoidDensity ? <input type="hidden" name="avoidDensity" value="true" /> : null}
      </form>
    );
  }

  return (
      <form action={action} aria-label="Titelsuche" className="search-form" role="search">
      <SearchQueryField
        defaultValue={filters.q}
        key={`search-query-${filters.q}`}
        label="Titel"
        placeholder={titlePlaceholder}
      />

      <div className="field-row">
        <div className="field-group">
          <label htmlFor="tone">Tendenz</label>
          <select id="tone" name="tone" defaultValue={filters.tone}>
            <option value="all">Alles</option>
            <option value="calm">Eher ruhig</option>
            <option value="balanced">Wechselhaft</option>
            <option value="intense">Eher intensiv</option>
          </select>
        </div>

        <div className="field-group">
          <label htmlFor="kind">Format</label>
          <select id="kind" name="kind" defaultValue={filters.kind}>
            <option value="all">Alles</option>
            <option value="movie">Film</option>
            <option value="series">Serie</option>
          </select>
        </div>
      </div>

      <ActiveFilterMode filters={filters} />
      {filters.avoidPeaks ? <input type="hidden" name="avoidPeaks" value="true" /> : null}
      {filters.avoidDensity ? <input type="hidden" name="avoidDensity" value="true" /> : null}

      <button className="primary-button" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
