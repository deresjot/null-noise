"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";

import { LoadingState } from "@/components/loading-state";

type ContactErrors = {
  email?: string;
  message?: string;
  form?: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function moveFocusToStatus(target: HTMLDivElement | null) {
  if (!target) {
    return;
  }

  const header = document.querySelector(".site-header");
  const headerBottom = header instanceof HTMLElement ? header.getBoundingClientRect().bottom : 0;
  const targetTop = target.getBoundingClientRect().top;
  const nextTop = Math.max(0, window.scrollY + targetTop - headerBottom - 12);

  window.scrollTo({ left: 0, top: nextTop, behavior: "auto" });
  target.focus({ preventScroll: true });
}

export function ContactForm() {
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const trimmedEmail = email.trim();
  const trimmedMessage = message.trim();
  const hasErrors = Object.keys(errors).length > 0;
  const messageLength = trimmedMessage.length;
  const remainingCharacters = Math.max(0, 10 - messageLength);
  const tooManyCharacters = messageLength > 3000;
  const messageLengthReady = messageLength >= 10;
  const isSubmitting = status === "submitting";
  const remainingCharactersText =
    remainingCharacters === 1 ? "Noch 1 Zeichen fehlt." : `Noch ${remainingCharacters} Zeichen fehlen.`;

  useEffect(() => {
    if (hasErrors) {
      window.requestAnimationFrame(() => moveFocusToStatus(errorSummaryRef.current));
      return;
    }

    if (status === "success") {
      window.requestAnimationFrame(() => moveFocusToStatus(successRef.current));
    }
  }, [hasErrors, status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const nextErrors: ContactErrors = {};

    if (!trimmedMessage) {
      nextErrors.message = "Bitte schreibe eine kurze Nachricht.";
    } else if (trimmedMessage.length < 10) {
      nextErrors.message = "Bitte schreibe mindestens 10 Zeichen, damit der Kontext verständlich ist.";
    } else if (trimmedMessage.length > 3000) {
      nextErrors.message = "Bitte kürze die Nachricht auf höchstens 3000 Zeichen.";
    }

    if (trimmedEmail && !isValidEmail(trimmedEmail)) {
      nextErrors.email = "Bitte gib eine gültige E-Mail-Adresse ein, zum Beispiel name@example.com.";
    }

    setErrors(nextErrors);
    setStatus("idle");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setStatus("submitting");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail || undefined,
          message: trimmedMessage,
          website,
        }),
      });

      if (!response.ok) {
        let messageFromServer = "";
        try {
          const payload = (await response.json()) as { error?: string; fieldErrors?: ContactErrors };
          if (payload.fieldErrors) {
            setErrors(payload.fieldErrors);
            setStatus("idle");
            return;
          }
          messageFromServer = payload.error ?? "";
        } catch {
          messageFromServer = "";
        }

        const serverMessage =
          response.status === 429
            ? "Bitte warte kurz, bevor du eine weitere Nachricht sendest."
            : response.status === 500 || response.status === 503
              ? "Die Nachricht konnte gerade nicht gesendet werden. Bitte versuche es später erneut."
              : messageFromServer ||
                "Die Nachricht konnte gerade nicht gesendet werden. Bitte versuche es später erneut.";

        setErrors({ form: serverMessage });
        setStatus("idle");
        return;
      }

      await response.json().catch(() => ({}));
      setErrors({});
      setStatus("success");
    } catch {
      setErrors({
        form: "Die Nachricht konnte wegen eines Netzwerkfehlers nicht gesendet werden. Bitte versuche es später erneut.",
      });
      setStatus("idle");
    }
  }

  return (
    <form className="contact-form" noValidate onSubmit={handleSubmit}>
      {hasErrors ? (
        <div
          ref={errorSummaryRef}
          className="contact-form-summary"
          role="alert"
          tabIndex={-1}
          aria-labelledby="contact-error-summary-heading"
        >
          <h2 id="contact-error-summary-heading">Bitte prüfe die Eingaben</h2>
          <p>Die Nachricht wurde nicht gesendet. Korrigiere die markierten Punkte und sende erneut.</p>
          <ul className="plain-list">
            {errors.form ? <li>{errors.form}</li> : null}
            {errors.message ? (
              <li>
                <a href="#contact-message">{errors.message}</a>
              </li>
            ) : null}
            {errors.email ? (
              <li>
                <a href="#contact-email">{errors.email}</a>
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}

      {status === "success" ? (
        <div
          ref={successRef}
          className="contact-form-success"
          role="status"
          tabIndex={-1}
          aria-labelledby="contact-success-heading"
        >
          <h2 id="contact-success-heading">Deine Nachricht wurde gesendet.</h2>
          {trimmedEmail ? (
            <p>Mit der angegebenen E-Mail-Adresse ist eine direkte Antwort möglich.</p>
          ) : (
            <p>Du hast keine E-Mail-Adresse angegeben. Eine direkte Antwort ist deshalb nicht möglich.</p>
          )}
        </div>
      ) : null}

      <div className="contact-field">
        <label htmlFor="contact-email">E-Mail für Antwort (optional)</label>
        <p id="contact-email-help" className="field-note">
          Du kannst die Nachricht ohne E-Mail-Adresse senden. Dann ist keine direkte Antwort möglich.
        </p>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-describedby={errors.email ? "contact-email-help contact-email-error" : "contact-email-help"}
          aria-invalid={errors.email ? "true" : undefined}
        />
        {errors.email ? (
          <p id="contact-email-error" className="field-error">
            Fehler: {errors.email}
          </p>
        ) : null}
      </div>

      <div className="contact-field">
        <label htmlFor="contact-message">Nachricht (Pflichtfeld)</label>
        <p id="contact-message-help" className="field-note">
          Schreib kurz, worum es geht. Mindestens 10 Zeichen reichen.
        </p>
        <p
          id="contact-message-counter"
          className="contact-message-counter"
          data-ready={messageLengthReady && !tooManyCharacters}
        >
          {tooManyCharacters
            ? `${messageLength} von maximal 3000 Zeichen. Bitte kürzen.`
            : messageLengthReady
              ? `${messageLength} von 10 bis 3000 Zeichen. Mindestlänge erreicht.`
              : `${messageLength} von mindestens 10 Zeichen. ${remainingCharactersText}`}
        </p>
        <textarea
          id="contact-message"
          name="message"
          required
          minLength={10}
          maxLength={3000}
          rows={8}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          aria-describedby={
            errors.message
              ? "contact-message-help contact-message-counter contact-message-error"
              : "contact-message-help contact-message-counter"
          }
          aria-invalid={errors.message ? "true" : undefined}
        />
        {errors.message ? (
          <p id="contact-message-error" className="field-error">
            Fehler: {errors.message}
          </p>
        ) : null}
      </div>

      <button className="primary-button" type="submit" aria-disabled={isSubmitting ? "true" : undefined}>
        {isSubmitting ? <LoadingState label="Nachricht wird gesendet" variant="form" /> : "Nachricht senden"}
      </button>
      {isSubmitting ? (
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          Nachricht wird gesendet.
        </p>
      ) : null}
      <div className="contact-honeypot" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>
    </form>
  );
}
