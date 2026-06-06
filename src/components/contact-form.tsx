"use client";

import { type FormEvent, useRef, useState } from "react";

type ContactErrors = {
  email?: string;
  message?: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function buildMailto(email: string, message: string) {
  const body = [message.trim(), "", `Antwortadresse: ${email.trim()}`].join("\n");

  return `mailto:mail@sebastianjansen.com?subject=${encodeURIComponent(
    "Kontakt zu null-noise",
  )}&body=${encodeURIComponent(body)}`;
}

export function ContactForm() {
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<"idle" | "success">("idle");

  const trimmedEmail = email.trim();
  const trimmedMessage = message.trim();
  const hasErrors = Object.keys(errors).length > 0;
  const mailtoHref = buildMailto(trimmedEmail, trimmedMessage);
  const messageLength = trimmedMessage.length;
  const remainingCharacters = Math.max(0, 10 - messageLength);
  const messageLengthReady = messageLength >= 10;
  const remainingCharactersText =
    remainingCharacters === 1 ? "Noch 1 Zeichen fehlt." : `Noch ${remainingCharacters} Zeichen fehlen.`;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: ContactErrors = {};

    if (!trimmedMessage) {
      nextErrors.message = "Bitte schreibe eine kurze Nachricht.";
    } else if (trimmedMessage.length < 10) {
      nextErrors.message = "Bitte schreibe mindestens 10 Zeichen, damit der Kontext verständlich ist.";
    }

    if (!trimmedEmail) {
      nextErrors.email = "Bitte gib eine E-Mail-Adresse an, damit eine Antwort möglich ist.";
    } else if (!isValidEmail(trimmedEmail)) {
      nextErrors.email = "Bitte gib eine gültige E-Mail-Adresse ein, zum Beispiel name@example.com.";
    }

    setErrors(nextErrors);
    setStatus("idle");

    if (Object.keys(nextErrors).length > 0) {
      window.requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }

    setStatus("success");
    window.requestAnimationFrame(() => successRef.current?.focus());
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
          <p>Die Nachricht wurde nicht vorbereitet. Korrigiere die markierten Felder und sende erneut.</p>
          <ul className="plain-list">
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
          <h2 id="contact-success-heading">Nachricht bereit zum Absenden</h2>
          <p>
            Die Eingaben wurden nur in diesem Browser vorbereitet und nicht gespeichert oder
            automatisch verschickt. Sende die Nachricht im Mailprogramm ab.
          </p>
          <p>Mit der angegebenen E-Mail ist eine Antwort möglich, wenn du die Nachricht versendest.</p>
          <p>
            <a className="secondary-button-link" href={mailtoHref}>
              Im Mailprogramm absenden
            </a>
          </p>
        </div>
      ) : null}

      <div className="contact-field">
        <label htmlFor="contact-email">E-Mail für Antwort (Pflichtfeld)</label>
        <p id="contact-email-help" className="field-note">
          Die Adresse wird nur für eine Antwort in dein Mailprogramm übernommen.
        </p>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
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
          data-ready={messageLengthReady}
          aria-live="polite"
        >
          {messageLengthReady
            ? `${messageLength} von mindestens 10 Zeichen. Mindestlänge erreicht.`
            : `${messageLength} von mindestens 10 Zeichen. ${remainingCharactersText}`}
        </p>
        <textarea
          id="contact-message"
          name="message"
          required
          minLength={10}
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

      <button className="primary-button" type="submit">
        Nachricht absenden
      </button>
    </form>
  );
}
