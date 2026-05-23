"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";

import {
  dispatchTitlePocketChange,
  isPocketEntryStored,
  removePocketEntry,
  storePocketEntry,
  type TitlePocketEntry,
} from "@/lib/title-pocket";

type TitlePocketActionsProps = {
  entry: TitlePocketEntry;
  variant?: "detail" | "tile";
};

type TitlePocketFeedback = {
  text: string;
  tone: "error" | "success";
} | null;

export function TitlePocketActions({
  entry,
  variant = "tile",
}: TitlePocketActionsProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [remembered, setRemembered] = useState(false);
  const [seen, setSeen] = useState(false);
  const [feedback, setFeedback] = useState<TitlePocketFeedback>(null);
  const seenButtonLabel = variant === "tile" ? (seen ? "Gesehen" : "Gesehen?") : seen ? "Schon gesehen" : "Schon gesehen?";
  const localStateLabel = useMemo(() => {
    if (remembered) {
      return "Lokal gemerkt";
    }

    if (seen) {
      return "Lokal als gesehen markiert";
    }

    return "Noch nicht lokal markiert";
  }, [remembered, seen]);

  useLayoutEffect(() => {
    const syncState = () => {
      setRemembered(isPocketEntryStored("remembered", entry.key));
      setSeen(isPocketEntryStored("seen", entry.key));
    };

    syncState();
    window.addEventListener("storage", syncState);
    window.addEventListener("null-noise-title-pocket-change", syncState as EventListener);

    return () => {
      window.removeEventListener("storage", syncState);
      window.removeEventListener("null-noise-title-pocket-change", syncState as EventListener);
    };
  }, [entry.key]);

  useLayoutEffect(() => {
    const card = rootRef.current?.closest<HTMLElement>(".result-card");

    if (!card) {
      return;
    }

    card.dataset.titleRemembered = remembered ? "true" : "false";
    card.dataset.titleSeen = seen ? "true" : "false";
  }, [remembered, seen]);

  function toggleRemembered() {
    try {
      if (remembered) {
        removePocketEntry("remembered", entry.key);
        setRemembered(false);
        setFeedback({
          text: "Wieder aus Merken genommen.",
          tone: "success",
        });
      } else {
        storePocketEntry("remembered", entry);
        removePocketEntry("seen", entry.key);
        setRemembered(true);
        setSeen(false);
        setFeedback({
          text: "Für später gemerkt.",
          tone: "success",
        });
      }

      dispatchTitlePocketChange();
    } catch {
      setFeedback({
        text: "Konnte gerade nicht lokal gespeichert werden.",
        tone: "error",
      });
    }
  }

  function toggleSeen() {
    try {
      if (seen) {
        removePocketEntry("seen", entry.key);
        setSeen(false);
        setFeedback({
          text: "Nicht mehr als gesehen markiert.",
          tone: "success",
        });
      } else {
        storePocketEntry("seen", entry);
        removePocketEntry("remembered", entry.key);
        setSeen(true);
        setRemembered(false);
        setFeedback({
          text: "Als schon gesehen markiert.",
          tone: "success",
        });
      }

      dispatchTitlePocketChange();
    } catch {
      setFeedback({
        text: "Konnte gerade nicht lokal gespeichert werden.",
        tone: "error",
      });
    }
  }

  return (
    <div
      className={`title-pocket-actions title-pocket-actions-${variant}`}
      data-state={remembered ? "remembered" : seen ? "seen" : "idle"}
      data-variant={variant}
      ref={rootRef}
    >
      {variant === "detail" ? (
        <p className="field-note title-pocket-note">
          Nur in diesem Browser. Ohne Konto und ohne Wolke.
        </p>
      ) : null}
      <div className="title-pocket-actions-row">
        <button
          aria-label={`${remembered ? "Merken für" : "Für später merken"} ${entry.title}`}
          aria-pressed={remembered}
          className="quiet-button title-pocket-button"
          data-active={remembered ? "true" : "false"}
          type="button"
          onClick={toggleRemembered}
        >
          <span aria-hidden="true" className="title-pocket-button-mark" />
          <span>{remembered ? "Gemerkt" : "Merken"}</span>
        </button>
        <button
          aria-label={`${seen ? "Schon gesehen für" : "Als schon gesehen markieren für"} ${entry.title}`}
          aria-pressed={seen}
          className="quiet-button title-pocket-button"
          data-active={seen ? "true" : "false"}
          type="button"
          onClick={toggleSeen}
        >
          <span aria-hidden="true" className="title-pocket-button-mark" />
          <span>{seenButtonLabel}</span>
        </button>
      </div>
      <p className="title-pocket-state" aria-live="polite">
        {localStateLabel}
      </p>
      {feedback ? (
        <p
          className="field-note title-pocket-feedback"
          data-tone={feedback.tone}
          role="status"
        >
          {feedback.text}
        </p>
      ) : null}
    </div>
  );
}
