"use client";

import Image from "next/image";
import { type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";

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
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    window.queueMicrotask(() => {
      setIsUnlocked(window.localStorage.getItem(previewStorageKey) === "true");
      setHasCheckedStorage(true);
    });
  }, []);

  useEffect(() => {
    if (!hasCheckedStorage || isUnlocked) {
      return;
    }

    inputRef.current?.focus();
  }, [hasCheckedStorage, isUnlocked]);

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
    <main className="preview-gate" aria-labelledby="preview-gate-heading">
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
        <p className="eyebrow">Private Vorschau</p>
        <h1 id="preview-gate-heading">null-noise</h1>
        <p className="preview-gate-copy">
          Eine ruhige Entscheidungshilfe für Filme und Serien: erste Einschätzungen,
          grobe Reizwirkung und ein kleiner lokaler Merkbereich, ohne Konto oder Tracking.
        </p>
        <form className="preview-gate-form" onSubmit={handleSubmit}>
          <label htmlFor="preview-password">Passwort</label>
          <div className="preview-gate-field">
            <input
              ref={inputRef}
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
              Vorschau öffnen
            </button>
          </div>
          {error ? (
            <p className="field-note preview-gate-error" role="alert">
              {error}
            </p>
          ) : null}
        </form>
      </section>
    </main>
  );
}
