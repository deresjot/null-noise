"use client";

import Link from "next/link";
import type { ChangeEvent } from "react";

import type { SearchFilters } from "@/lib/types";

import { SearchQueryField } from "./search-query-field";

interface SearchFormProps {
  action: string;
  filters: SearchFilters;
  variant?: "default" | "compact" | "hero" | "stage";
  submitLabel?: string;
}

const filterModeLabel = "Reizspitzen dämpfen";
const avoidPeaksLabel = "Weniger harte Spitzen";
const avoidDensityLabel = "Weniger dichte Klangflächen";
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

function buildBrowsePath(filters: SearchFilters): string {
  const searchParams = new URLSearchParams();

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

type BrowsePreset = {
  id: string;
  label: string;
  filters: Partial<Pick<SearchFilters, "tone" | "avoidPeaks" | "avoidDensity">>;
};

const browsePresets: BrowsePreset[] = [
  {
    id: "calm",
    label: "Ruhig starten",
    filters: { tone: "calm" },
  },
  {
    id: "balanced",
    label: "Durchwachsen",
    filters: { tone: "balanced" },
  },
  {
    id: "intense",
    label: "Intensiv",
    filters: { tone: "intense" },
  },
];

function submitOnSelectChange(event: ChangeEvent<HTMLSelectElement>) {
  event.currentTarget.form?.requestSubmit();
}

function buildBrowsePresetPath(
  baseFilters: SearchFilters,
  preset: BrowsePreset["filters"],
): string {
  return buildBrowsePath({
    ...baseFilters,
    q: "",
    avoidPeaks: false,
    avoidDensity: false,
    ...preset,
  });
}

function SearchDirectStarts({ filters }: { filters: SearchFilters }) {
  return (
    <section className="search-direct-starts" aria-labelledby="search-direct-starts-heading">
      <h3 id="search-direct-starts-heading">Direkt starten</h3>
      <p className="field-note">Wenn noch kein Titel feststeht: eine Richtung wählen und direkt rein.</p>
      <ul className="plain-list search-direct-starts-list">
        {browsePresets.map((preset) => {
          const isActive = filters.tone === preset.filters.tone;

          return (
            <li key={preset.id}>
              <Link
                aria-current={isActive ? "page" : undefined}
                className="search-direct-start-link"
                data-active={isActive ? "true" : "false"}
                data-preset={preset.id}
                href={buildBrowsePresetPath(filters, preset.filters)}
              >
                <span className="search-direct-start-label">{preset.label}</span>
                <span aria-hidden="true" className="search-direct-start-arrow">
                  →
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
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
        <p className="active-filter-mode-note">
          Kann Treffer stark ausdünnen. Bei Leere einen Schalter wieder lösen.
        </p>
      ) : null}
    </section>
  );
}

function SearchKindToggle({ filters }: { filters: SearchFilters }) {
  const options: Array<{ value: SearchFilters["kind"]; label: string }> = [
    { value: "all", label: "Alles" },
    { value: "series", label: "Nur Serien" },
    { value: "movie", label: "Nur Filme" },
  ];

  return (
    <div className="field-group field-group-kind">
      <p className="field-label" id="kind-toggle-label">
        Format (derzeit: Filme und Serien)
      </p>
      <nav className="search-kind-toggle" aria-labelledby="kind-toggle-label">
        {options.map((option) => (
          <Link
            key={option.value}
            className="search-kind-toggle-link"
            data-active={filters.kind === option.value ? "true" : "false"}
            href={buildSearchPath({ ...filters, kind: option.value })}
          >
            {option.label}
          </Link>
        ))}
      </nav>
      <p className="field-note search-kind-note">
        Dokus und Mediathek-Beiträge laufen aktuell unter diesem Rahmen mit, bis eine eigene Achse sinnvoll trägt.
      </p>
      <input type="hidden" name="kind" value={filters.kind} />
    </div>
  );
}

export function SearchForm({
  action,
  filters,
  variant = "default",
  submitLabel = "Suchen",
}: SearchFormProps) {
  const browsePath = buildBrowsePath(filters);

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
        <p className="search-form-alt-action">
          <Link
            className="secondary-link search-browse-link"
            href={browsePath}
            aria-label="Zeig mir eine Auswahl ohne Suchbegriff"
          >
            Zeig mir was
          </Link>
        </p>
        <SearchDirectStarts filters={filters} />
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
            label="Titel"
            placeholder={titlePlaceholder}
          />
          <button className="primary-button search-submit-button" type="submit">
            {submitLabel}
          </button>
        </div>
        <p className="search-form-alt-action">
          <Link
            className="secondary-link search-browse-link"
            href={browsePath}
            aria-label="Zeig mir eine Auswahl ohne Suchbegriff"
          >
            Zeig mir was
          </Link>
        </p>
        <SearchDirectStarts filters={filters} />

        <div className="search-form-stage-controls">
          <div className="field-group field-group-tone">
            <label htmlFor="tone">Reizrichtung</label>
            <select id="tone" name="tone" value={filters.tone} onChange={submitOnSelectChange}>
              <option value="all">Alle Richtungen</option>
              <option value="calm">ruhig</option>
              <option value="balanced">durchwachsen</option>
              <option value="intense">intensiv</option>
            </select>
          </div>
          <SearchKindToggle filters={filters} />

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
            label="Titel"
            placeholder={titlePlaceholder}
          />

          <div className="field-group field-group-tone">
            <label htmlFor="tone">Reizrichtung</label>
            <select id="tone" name="tone" value={filters.tone} onChange={submitOnSelectChange}>
              <option value="all">Alle Richtungen</option>
              <option value="calm">ruhig</option>
              <option value="balanced">durchwachsen</option>
              <option value="intense">intensiv</option>
            </select>
          </div>
          <SearchKindToggle filters={filters} />

          <ActiveFilterMode filters={filters} />

          <button className="primary-button search-submit-button" type="submit">
            {submitLabel}
          </button>
          <p className="search-form-alt-action">
            <Link
              className="secondary-link search-browse-link"
              href={browsePath}
              aria-label="Zeig mir eine Auswahl ohne Suchbegriff"
            >
              Zeig mir was
            </Link>
          </p>
        </div>
        <SearchDirectStarts filters={filters} />
        {filters.avoidPeaks ? <input type="hidden" name="avoidPeaks" value="true" /> : null}
        {filters.avoidDensity ? <input type="hidden" name="avoidDensity" value="true" /> : null}
      </form>
    );
  }

  return (
      <form action={action} aria-label="Titelsuche" className="search-form" role="search">
      <SearchQueryField
        defaultValue={filters.q}
        label="Titel"
        placeholder={titlePlaceholder}
      />

      <div className="field-row">
        <div className="field-group">
          <label htmlFor="tone">Reizrichtung</label>
          <select id="tone" name="tone" value={filters.tone} onChange={submitOnSelectChange}>
            <option value="all">Alle Richtungen</option>
            <option value="calm">ruhig</option>
            <option value="balanced">durchwachsen</option>
            <option value="intense">intensiv</option>
          </select>
        </div>
        <SearchKindToggle filters={filters} />
      </div>

      <ActiveFilterMode filters={filters} />
      {filters.avoidPeaks ? <input type="hidden" name="avoidPeaks" value="true" /> : null}
      {filters.avoidDensity ? <input type="hidden" name="avoidDensity" value="true" /> : null}

      <button className="primary-button" type="submit">
        {submitLabel}
      </button>
      <p className="search-form-alt-action">
        <Link
          className="secondary-link search-browse-link"
          href={browsePath}
          aria-label="Zeig mir eine Auswahl ohne Suchbegriff"
        >
          Zeig mir was
        </Link>
      </p>
      <SearchDirectStarts filters={filters} />
    </form>
  );
}
