"use client";

import { useEffect, useId, useRef, useState } from "react";

type SearchSuggestionItem = {
  externalId: string;
  title: string;
  mediaType: "movie" | "series";
  releaseYear: number | null;
  source: "tmdb";
};

type SearchSuggestionResponse =
  | {
      kind: "success";
      message: string;
      items: SearchSuggestionItem[];
    }
  | {
      kind: "empty" | "disabled" | "error";
      message: string;
      items: [];
    };

interface SearchQueryFieldProps {
  defaultValue: string;
}

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 220;

function formatMediaType(value: SearchSuggestionItem["mediaType"]): string {
  return value === "movie" ? "Film" : "Serie";
}

function formatSuggestionMeta(item: SearchSuggestionItem): string {
  return `${formatMediaType(item.mediaType)} · ${item.releaseYear ?? "Jahr offen"} · TMDb`;
}

export function SearchQueryField({ defaultValue }: SearchQueryFieldProps) {
  const inputId = useId();
  const statusId = useId();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [query, setQuery] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestionItem[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusKind, setStatusKind] = useState<"idle" | "loading" | "empty" | "error">("idle");

  useEffect(() => {
    const normalizedQuery = query.trim();
    let currentController: AbortController | null = null;

    abortRef.current?.abort();

    if (normalizedQuery.length < MIN_QUERY_LENGTH) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      const controller = new AbortController();
      currentController = controller;
      abortRef.current = controller;
      setStatusKind("loading");
      setStatusMessage("TMDb-Vorschläge werden geladen.");

      try {
        const searchParams = new URLSearchParams({ q: normalizedQuery });
        const response = await fetch(`/api/search/suggestions?${searchParams.toString()}`, {
          method: "GET",
          signal: controller.signal,
          cache: "no-store",
        });
        const payload = (await response.json().catch(() => null)) as SearchSuggestionResponse | null;

        if (!response.ok || !payload) {
          setSuggestions([]);
          setStatusKind("error");
          setStatusMessage("Externe Vorschläge sind gerade nicht verfügbar.");
          return;
        }

        if (payload.kind === "success") {
          setSuggestions(payload.items);
          setStatusKind(payload.items.length ? "idle" : "empty");
          setStatusMessage(
            payload.items.length
              ? "Vorschläge aus TMDb. Sie ergänzen die Suche, ersetzen aber kein Reizprofil."
              : "Keine passenden externen Vorschläge gefunden.",
          );
          return;
        }

        setSuggestions([]);
        setStatusKind(payload.kind === "empty" ? "empty" : "error");
        setStatusMessage(
          payload.kind === "empty"
            ? "Keine passenden externen Vorschläge gefunden."
            : "Externe Vorschläge sind gerade nicht verfügbar.",
        );
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setSuggestions([]);
        setStatusKind("error");
        setStatusMessage("Externe Vorschläge sind gerade nicht verfügbar.");
      }
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
      currentController?.abort();
    };
  }, [query]);

  function handleSuggestionSelect(title: string) {
    setQuery(title);
    setSuggestions([]);
    setStatusKind("idle");
    setStatusMessage("");

    if (inputRef.current) {
      inputRef.current.value = title;
    }

    inputRef.current?.form?.requestSubmit();
  }

  function handleChange(nextValue: string) {
    setQuery(nextValue);
    setIsOpen(true);

    if (nextValue.trim().length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setStatusKind("idle");
      setStatusMessage("");
    }
  }

  function handleBlur(event: React.FocusEvent<HTMLDivElement>) {
    if (!wrapperRef.current?.contains(event.relatedTarget as Node | null)) {
      setIsOpen(false);
    }
  }

  const shouldShowSuggestions =
    isOpen && query.trim().length >= MIN_QUERY_LENGTH && (suggestions.length > 0 || statusKind !== "idle");

  return (
    <div
      ref={wrapperRef}
      className="field-group field-group-wide search-query-field"
      onBlur={handleBlur}
      onFocus={() => setIsOpen(true)}
    >
      <label htmlFor={inputId}>Film oder Serie suchen</label>
      <input
        ref={inputRef}
        id={inputId}
        name="q"
        type="search"
        value={query}
        placeholder="z. B. Arrival, Dark oder ruhiger Film"
        autoComplete="off"
        aria-describedby={statusMessage ? statusId : undefined}
        onChange={(event) => handleChange(event.target.value)}
      />

      {shouldShowSuggestions ? (
        <div className="search-suggestions" aria-live="polite">
          {statusMessage ? (
            <p id={statusId} className="field-note search-suggestions-status">
              {statusMessage}
            </p>
          ) : null}

          {suggestions.length ? (
            <>
              <p className="search-suggestions-label">TMDb-Vorschläge</p>
              <ul className="search-suggestions-list">
                {suggestions.map((item) => (
                  <li key={item.externalId}>
                    <button
                      className="search-suggestion-button"
                      type="button"
                      onClick={() => handleSuggestionSelect(item.title)}
                    >
                      <span className="search-suggestion-title">{item.title}</span>
                      <span className="search-suggestion-meta">{formatSuggestionMeta(item)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
