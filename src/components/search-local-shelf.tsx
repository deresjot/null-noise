"use client";

import Link from "next/link";
import { useLayoutEffect, useMemo, useState } from "react";

import {
  clearPocketEntries,
  dispatchTitlePocketChange,
  listPocketEntries,
  readHideSeenTitlesPreference,
  removePocketEntry,
  titlePocketChangeEvent,
  type TitlePocketEntry,
  writeHideSeenTitlesPreference,
} from "@/lib/title-pocket";

import { ResultPoster } from "./result-poster";

function applyTitleMemoryState(
  remembered: TitlePocketEntry[],
  seen: TitlePocketEntry[],
  hideSeenTitles: boolean,
): number {
  const rememberedKeys = new Set(remembered.map((entry) => entry.key));
  const seenKeys = new Set(seen.map((entry) => entry.key));
  let hiddenSeenCount = 0;

  document.querySelectorAll<HTMLElement>("[data-title-pocket-key]").forEach((card) => {
    const key = card.dataset.titlePocketKey;

    if (!key) {
      return;
    }

    const isSeen = seenKeys.has(key);
    const isRemembered = rememberedKeys.has(key);
    const listItem = card.closest("li") as HTMLElement | null;

    card.dataset.titleSeen = isSeen ? "true" : "false";
    card.dataset.titleRemembered = isRemembered ? "true" : "false";

    if (listItem) {
      listItem.hidden = hideSeenTitles && isSeen;

      if (hideSeenTitles && isSeen) {
        hiddenSeenCount += 1;
      }
    }
  });

  return hiddenSeenCount;
}

function loadPocketState() {
  const remembered = listPocketEntries("remembered");
  const seen = listPocketEntries("seen");

  return {
    hideSeenTitles: readHideSeenTitlesPreference(),
    remembered,
    seen,
  };
}

type SearchLocalShelfProps = {
  showWhenEmpty?: boolean;
};

type ShelfFeedback = {
  text: string;
  tone: "error" | "neutral" | "success";
} | null;

function PocketList({
  emptyLabel,
  items,
  onRemove,
  removeKind,
  title,
}: {
  emptyLabel: string;
  items: TitlePocketEntry[];
  onRemove: (item: TitlePocketEntry) => void;
  removeKind: "remembered" | "seen";
  title: string;
}) {
  const visibleItems = items.slice(0, 4);

  return (
    <section className="search-local-shelf-group" aria-labelledby={`local-shelf-${removeKind}`}>
      <div className="search-local-shelf-copy">
        <h2 id={`local-shelf-${removeKind}`}>{title}</h2>
        <p className="field-note">
          {items.length
            ? `${items.length} ${items.length === 1 ? "Titel" : "Titel"} bleiben lokal in diesem Browser.`
            : emptyLabel}
        </p>
      </div>
      {items.length ? (
        <ul className="search-local-shelf-list">
          {visibleItems.map((item) => (
            <li key={`${removeKind}-${item.key}`}>
              <article className="search-local-shelf-card">
                <Link
                  aria-label={`${title}: ${item.title} öffnen`}
                  className="search-local-shelf-poster"
                  href={item.href}
                >
                  <ResultPoster sizes="6rem" src={item.posterSrc} title={item.title} />
                </Link>
                <div className="search-local-shelf-card-copy">
                  <p className="card-topline">{item.meta}</p>
                  <h3>
                    <Link href={item.href}>{item.title}</Link>
                  </h3>
                  <p className="field-note">{item.toneLabel}</p>
                  <p className="field-note search-local-shelf-reason">{item.reason}</p>
                </div>
                <button
                  className="quiet-button search-local-shelf-remove"
                  type="button"
                  onClick={() => onRemove(item)}
                >
                  {removeKind === "remembered" ? "Entfernen" : "Zurücknehmen"}
                </button>
              </article>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export function SearchLocalShelf({
  showWhenEmpty = false,
}: SearchLocalShelfProps) {
  const [remembered, setRemembered] = useState<TitlePocketEntry[]>([]);
  const [seen, setSeen] = useState<TitlePocketEntry[]>([]);
  const [hideSeenTitles, setHideSeenTitles] = useState(false);
  const [hiddenSeenCount, setHiddenSeenCount] = useState(0);
  const [feedback, setFeedback] = useState<ShelfFeedback>(null);

  useLayoutEffect(() => {
    const update = () => {
      const nextState = loadPocketState();
      setRemembered(nextState.remembered);
      setSeen(nextState.seen);
      setHideSeenTitles(nextState.hideSeenTitles);
      setHiddenSeenCount(
        applyTitleMemoryState(
          nextState.remembered,
          nextState.seen,
          nextState.hideSeenTitles,
        ),
      );
    };

    update();
    window.addEventListener(titlePocketChangeEvent, update as EventListener);
    window.addEventListener("storage", update);

    return () => {
      window.removeEventListener(titlePocketChangeEvent, update as EventListener);
      window.removeEventListener("storage", update);
    };
  }, []);

  const hasContent = useMemo(
    () => remembered.length > 0 || seen.length > 0,
    [remembered.length, seen.length],
  );

  function commitLocalChange(
    run: () => void,
    successText: string,
    errorText = "Der lokale Zustand konnte gerade nicht gespeichert werden.",
    tone: "neutral" | "success" = "success",
  ) {
    try {
      run();
      dispatchTitlePocketChange();
      setFeedback({ text: successText, tone });
    } catch {
      setFeedback({ text: errorText, tone: "error" });
    }
  }

  function handleRemoveItem(kind: "remembered" | "seen", item: TitlePocketEntry) {
    commitLocalChange(
      () => {
        removePocketEntry(kind, item.key);
      },
      kind === "remembered"
        ? "Aus Merken entfernt."
        : "Nicht mehr als gesehen markiert.",
    );
  }

  if (!hasContent && !showWhenEmpty) {
    return null;
  }

  return (
    <section className="search-local-shelf" aria-labelledby="search-local-shelf-heading">
      <header className="search-local-shelf-header">
        <div className="search-local-shelf-copy">
          <p className="eyebrow">Nur in diesem Browser</p>
          <h2 id="search-local-shelf-heading">Für später und schon gesehen</h2>
          <p className="field-note">
            Kein Konto, keine Wolke. Nur eine kleine Merkhilfe, damit Browse weniger Reibung macht.
          </p>
        </div>
        <div className="search-local-shelf-actions">
          {remembered.length ? (
            <button
              className="quiet-button search-local-shelf-action"
              type="button"
              onClick={() =>
                commitLocalChange(
                  () => {
                    clearPocketEntries("remembered");
                  },
                  "Gemerkte Titel geleert.",
                )
              }
            >
              Gemerkte Titel leeren
            </button>
          ) : null}
          {seen.length ? (
            <button
              className="quiet-button search-local-shelf-action"
              type="button"
              onClick={() =>
                commitLocalChange(
                  () => {
                    clearPocketEntries("seen");
                    writeHideSeenTitlesPreference(false);
                    setHideSeenTitles(false);
                  },
                  "Gesehene Titel zurückgesetzt.",
                )
              }
            >
              Gesehene zurücksetzen
            </button>
          ) : null}
          {seen.length ? (
            <label className="search-local-shelf-toggle">
              <input
                checked={hideSeenTitles}
                type="checkbox"
                onChange={(event) => {
                  const nextValue = event.currentTarget.checked;

                  commitLocalChange(
                    () => {
                      writeHideSeenTitlesPreference(nextValue);
                      setHideSeenTitles(nextValue);
                    },
                    nextValue
                      ? "Gesehene Titel werden hier ausgeblendet."
                      : "Gesehene Titel sind wieder sichtbar.",
                    "Die Ausblendung konnte gerade nicht gespeichert werden.",
                    "neutral",
                  );
                }}
              />
              <span>Schon gesehene Titel hier ausblenden</span>
            </label>
          ) : null}
        </div>
      </header>

      {feedback ? (
        <p
          className="field-note search-local-shelf-feedback"
          data-tone={feedback.tone}
          role="status"
        >
          {feedback.text}
        </p>
      ) : null}

      {hideSeenTitles && hiddenSeenCount ? (
        <p className="field-note search-local-shelf-hidden-note">
          {hiddenSeenCount} {hiddenSeenCount === 1 ? "Titel ist" : "Titel sind"} im Browse gerade
          ausgeblendet.
        </p>
      ) : null}

      {hasContent ? (
        <div className="search-local-shelf-grid">
          <PocketList
            emptyLabel="Noch nichts gemerkt."
            items={remembered}
            onRemove={(item) => handleRemoveItem("remembered", item)}
            removeKind="remembered"
            title="Für später gemerkt"
          />
          <PocketList
            emptyLabel="Noch nichts als gesehen markiert."
            items={seen}
            onRemove={(item) => handleRemoveItem("seen", item)}
            removeKind="seen"
            title="Schon gesehen"
          />
        </div>
      ) : (
        <p className="field-note search-local-shelf-empty">
          Noch nichts gemerkt oder als gesehen markiert. Wenn du später etwas festhalten willst,
          landet es hier.
        </p>
      )}
    </section>
  );
}
