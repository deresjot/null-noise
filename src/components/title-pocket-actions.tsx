"use client";

import { useLayoutEffect, useState } from "react";

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
  const [remembered, setRemembered] = useState(false);
  const [seen, setSeen] = useState(false);
  const [feedback, setFeedback] = useState<TitlePocketFeedback>(null);

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
    <div className={`title-pocket-actions title-pocket-actions-${variant}`}>
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
          {remembered ? "Gemerkt" : "Merken"}
        </button>
        <button
          aria-label={`${seen ? "Schon gesehen für" : "Als schon gesehen markieren für"} ${entry.title}`}
          aria-pressed={seen}
          className="quiet-button title-pocket-button"
          data-active={seen ? "true" : "false"}
          type="button"
          onClick={toggleSeen}
        >
          {seen ? "Schon gesehen" : "Schon gesehen?"}
        </button>
      </div>
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
