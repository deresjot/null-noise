import type { SearchFilters } from "@/lib/types";

import { SearchQueryField } from "./search-query-field";

interface SearchFormProps {
  action: string;
  filters: SearchFilters;
  variant?: "default" | "compact" | "hero" | "stage";
  submitLabel?: string;
}

const toneLegend = "Eher vermeiden";
const avoidPeaksLabel = "Möglichst ohne harte Spitzen";
const avoidDensityLabel = "Dichte Klangflächen vermeiden";
const titlePlaceholder = "z. B. Arrival, The Bear oder Past Lives";

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

          <fieldset
            className="checkbox-group checkbox-group-compact checkbox-group-compact-filters"
            data-has-active={filters.avoidPeaks || filters.avoidDensity ? "true" : "false"}
          >
            <legend>{toneLegend}</legend>
            <label className={filters.avoidPeaks ? "is-active" : undefined}>
              <input
                type="checkbox"
                name="avoidPeaks"
                value="true"
                defaultChecked={filters.avoidPeaks}
              />
              {avoidPeaksLabel}
            </label>
            <label className={filters.avoidDensity ? "is-active" : undefined}>
              <input
                type="checkbox"
                name="avoidDensity"
                value="true"
                defaultChecked={filters.avoidDensity}
              />
              {avoidDensityLabel}
            </label>
          </fieldset>
        </div>
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

          <fieldset
            className="checkbox-group checkbox-group-compact checkbox-group-compact-filters"
            data-has-active={filters.avoidPeaks || filters.avoidDensity ? "true" : "false"}
          >
            <legend>{toneLegend}</legend>
            <label className={filters.avoidPeaks ? "is-active" : undefined}>
              <input
                type="checkbox"
                name="avoidPeaks"
                value="true"
                defaultChecked={filters.avoidPeaks}
              />
              {avoidPeaksLabel}
            </label>
            <label className={filters.avoidDensity ? "is-active" : undefined}>
              <input
                type="checkbox"
                name="avoidDensity"
                value="true"
                defaultChecked={filters.avoidDensity}
              />
              {avoidDensityLabel}
            </label>
          </fieldset>

          <button className="primary-button search-submit-button" type="submit">
            {submitLabel}
          </button>
        </div>
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

      <fieldset
        className="checkbox-group"
        data-has-active={filters.avoidPeaks || filters.avoidDensity ? "true" : "false"}
      >
        <legend>{toneLegend}</legend>
        <label className={filters.avoidPeaks ? "is-active" : undefined}>
          <input
            type="checkbox"
            name="avoidPeaks"
            value="true"
            defaultChecked={filters.avoidPeaks}
          />
          {avoidPeaksLabel}
        </label>
        <label className={filters.avoidDensity ? "is-active" : undefined}>
          <input
            type="checkbox"
            name="avoidDensity"
            value="true"
            defaultChecked={filters.avoidDensity}
          />
          {avoidDensityLabel}
        </label>
      </fieldset>

      <button className="primary-button" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
