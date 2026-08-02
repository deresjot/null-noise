"use client";

import Image from "next/image";
import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import { ToneFaceIcon } from "./tone-face-icon";

const previewStorageKey = "null-noise-preview-unlocked";
const previewPhrase = "preview";

type PreviewGateProps = {
  children: ReactNode;
};

export function PreviewGate({ children }: PreviewGateProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isMotionPaused, setIsMotionPaused] = useState(false);

  useEffect(() => {
    window.queueMicrotask(() => {
      const showIntroPreview =
        window.location.hostname === "localhost" &&
        new URLSearchParams(window.location.search).get("intro") === "1";

      setIsUnlocked(
        !showIntroPreview && window.localStorage.getItem(previewStorageKey) === "true",
      );
      setHasCheckedStorage(true);
    });
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.trim() !== previewPhrase) {
      setError("Das Passwort passt gerade nicht.");
      return;
    }

    window.localStorage.setItem(previewStorageKey, "true");
    setError("");
    setIsUnlocked(true);
  }

  if (hasCheckedStorage && isUnlocked) {
    return children;
  }

  return (
    <main
      className="preview-gate"
      data-motion={isMotionPaused ? "paused" : "playing"}
      aria-labelledby="preview-gate-heading"
    >
      <div className="preview-gate-atmosphere" aria-hidden="true">
        <span className="preview-gate-glow preview-gate-glow-one" />
        <span className="preview-gate-glow preview-gate-glow-two" />
        <span className="preview-gate-grain" />
      </div>
      <div className="preview-gate-layout">
        <section className="preview-gate-panel">
          <div className="preview-gate-brand" aria-hidden="true">
            <Image
              alt=""
              className="preview-gate-logo"
              height={1254}
              src="/brand/nullnoise-logo.svg"
              width={1603}
            />
            <Image
              alt=""
              className="preview-gate-wordmark"
              height={1080}
              src="/brand/nullnoise-wortmarke.svg"
              width={1920}
            />
          </div>
          <p className="preview-gate-kicker">Private Beta · ohne Tracking</p>
          <h1 id="preview-gate-heading">Was passt heute in deinen Kopf?</h1>
          <p className="preview-gate-copy">
            null-noise hilft dir, Filme und Serien nach ihrer möglichen Reizwirkung auszuwählen –
            ruhig, wechselhaft oder intensiv. Ohne Rankings und ohne Social-Druck.
          </p>
          <form className="preview-gate-form" onSubmit={handleSubmit}>
            <label htmlFor="preview-password">Passwort zur Vorschau</label>
            <div className="preview-gate-field">
              <input
                autoComplete="current-password"
                id="preview-password"
                name="preview-password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.currentTarget.value);
                  setError("");
                }}
              />
              <button className="primary-button" type="submit">
                <svg
                  aria-hidden="true"
                  className="preview-gate-button-icon"
                  fill="none"
                  height="20"
                  viewBox="0 0 24 24"
                  width="20"
                >
                  <path
                    d="M7 10V8a5 5 0 0 1 10 0v2"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.8"
                  />
                  <path
                    d="M6.5 10h11A1.5 1.5 0 0 1 19 11.5v7A1.5 1.5 0 0 1 17.5 20h-11A1.5 1.5 0 0 1 5 18.5v-7A1.5 1.5 0 0 1 6.5 10Z"
                    stroke="currentColor"
                    strokeLinejoin="round"
                    strokeWidth="2.8"
                  />
                  <path
                    d="M12 14v2.25"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="2.8"
                  />
                </svg>
                <span>Vorschau öffnen</span>
              </button>
            </div>
            {error ? (
              <p className="field-note preview-gate-error" role="alert">
                {error}
              </p>
            ) : null}
          </form>
          <p className="preview-gate-trust">Kein Konto. Keine Profile. Deine Auswahl bleibt bei dir.</p>
        </section>

        <aside className="preview-gate-intro" aria-label="Drei mögliche Reizrichtungen">
          <div className="preview-signal-scene" aria-hidden="true">
            <span className="preview-signal-echo preview-signal-echo-one" />
            <span className="preview-signal-echo preview-signal-echo-two" />
            <span className="preview-signal-sweep" />
            <span className="preview-signal-orbs">
              <i className="preview-orb preview-orb-calm" />
              <i className="preview-orb preview-orb-mixed" />
              <i className="preview-orb preview-orb-intense" />
              <i className="preview-orb preview-orb-blue" />
              <i className="preview-orb preview-orb-violet" />
            </span>
            <span className="preview-signal-orbit preview-signal-orbit-outer" />
            <span className="preview-signal-orbit preview-signal-orbit-inner" />
            <span className="preview-signal-dot preview-signal-dot-one">
              <ToneFaceIcon tone="quiet" />
            </span>
            <span className="preview-signal-dot preview-signal-dot-two">
              <ToneFaceIcon tone="balanced" />
            </span>
            <span className="preview-signal-dot preview-signal-dot-three">
              <ToneFaceIcon tone="intense" />
            </span>
          </div>
          <div className="preview-signal-copy">
            <p className="preview-signal-overline">Drei Kategorien zur Orientierung.</p>
            <ol className="preview-signal-list">
              <li data-tone="quiet"><ToneFaceIcon tone="quiet" /><strong>Eher ruhig</strong></li>
              <li data-tone="mixed"><ToneFaceIcon tone="balanced" /><strong>Eher wechselhaft</strong></li>
              <li data-tone="intense"><ToneFaceIcon tone="intense" /><strong>Eher intensiv</strong></li>
            </ol>
          </div>
          <button
            className="preview-motion-toggle"
            type="button"
            aria-pressed={isMotionPaused}
            disabled={!hasCheckedStorage}
            onClick={() => setIsMotionPaused((value) => !value)}
          >
            <span aria-hidden="true">{isMotionPaused ? "▶" : "Ⅱ"}</span>
            {isMotionPaused ? "Animation fortsetzen" : "Animation pausieren"}
          </button>
        </aside>
      </div>
    </main>
  );
}
