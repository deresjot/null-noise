import type { SearchFilters } from "@/lib/types";

import { SearchQueryField } from "./search-query-field";

interface SearchFormProps {
  action: string;
  filters: SearchFilters;
}

export function SearchForm({ action, filters }: SearchFormProps) {
  return (
    <form action={action} aria-label="Titelsuche" className="search-form" role="search">
      <SearchQueryField defaultValue={filters.q} />

      <div className="field-row">
        <div className="field-group">
          <label htmlFor="tone">Gesamteindruck</label>
          <select id="tone" name="tone" defaultValue={filters.tone}>
            <option value="all">Alle</option>
            <option value="calm">Ruhig</option>
            <option value="balanced">Ausgeglichen</option>
            <option value="intense">Intensiv</option>
          </select>
        </div>

        <div className="field-group">
          <label htmlFor="kind">Typ</label>
          <select id="kind" name="kind" defaultValue={filters.kind}>
            <option value="all">Film und Serie</option>
            <option value="movie">Film</option>
            <option value="series">Serie</option>
          </select>
        </div>
      </div>

      <fieldset className="checkbox-group">
        <legend>Empfindliche Reize meiden</legend>
        <label>
          <input
            type="checkbox"
            name="avoidPeaks"
            value="true"
            defaultChecked={filters.avoidPeaks}
          />
          Keine deutlichen Geräuschspitzen
        </label>
        <label>
          <input
            type="checkbox"
            name="avoidDensity"
            value="true"
            defaultChecked={filters.avoidDensity}
          />
          Wenig dauerhafte Klangbelastung
        </label>
      </fieldset>

      <button className="primary-button" type="submit">
        Ergebnisse anzeigen
      </button>
    </form>
  );
}
