"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { RatingFormGuard } from "./rating-form-guard";

type FeedbackStatus = {
  title: string;
  text: string;
  tone: "neutral" | "success" | "warning" | "error";
};

type ReadingFeedbackFormProps = {
  fields: Array<{ name: string; value: string }>;
  heading?: string;
  intro?: string;
  initialStatus?: FeedbackStatus | null;
};

const feedbackChoices = [
  { label: "Eher ruhig", value: "calmer" },
  { label: "Eher wechselhaft", value: "match" },
  { label: "Eher intensiv", value: "stronger" },
] as const;

const feedbackStatusByCode: Record<string, FeedbackStatus> = {
  success: {
    title: "Rückmeldung übernommen",
    text: "Danke. Der sichtbare Stand wurde damit leise nachgezogen.",
    tone: "success",
  },
  cooldown: {
    title: "Hier kam gerade schon etwas rein",
    text: "Lass dem Titel kurz Ruhe, dann geht es wieder.",
    tone: "warning",
  },
  limited: {
    title: "Gerade zu viele Rückmeldungen auf einmal",
    text: "Versuch es später noch einmal.",
    tone: "warning",
  },
  "too-fast": {
    title: "Das war noch zu schnell",
    text: "Bitte einmal in Ruhe schauen und dann noch einmal senden.",
    tone: "warning",
  },
  inactive: {
    title: "Rückmeldung bleibt hier gerade zu",
    text: "Lesen geht schon. Schreiben geht in dieser Instanz gerade nicht.",
    tone: "warning",
  },
  invalid: {
    title: "Die Rückmeldung war nicht vollständig",
    text: "Bitte noch einmal über einen der drei Wege senden.",
    tone: "error",
  },
  error: {
    title: "Rückmeldung ging gerade nicht durch",
    text: "Versuch es in einem Moment noch einmal.",
    tone: "error",
  },
};

function getFeedbackStatus(code: unknown): FeedbackStatus {
  if (typeof code === "string" && code in feedbackStatusByCode) {
    return feedbackStatusByCode[code];
  }

  return feedbackStatusByCode.error;
}

export function ReadingFeedbackForm({
  fields,
  heading = "Rückmeldung",
  intro = "War das für dich eher …",
  initialStatus = null,
}: ReadingFeedbackFormProps) {
  const router = useRouter();
  const statusRef = useRef<HTMLDivElement | null>(null);
  const [submittedStatus, setSubmittedStatus] = useState<FeedbackStatus | null>(null);
  const [focusStatusNonce, setFocusStatusNonce] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const status = submittedStatus ?? initialStatus;

  useEffect(() => {
    if (!status || focusStatusNonce === 0) {
      return;
    }

    statusRef.current?.focus({ preventScroll: true });
    statusRef.current?.scrollIntoView({ block: "center", behavior: "auto" });
  }, [focusStatusNonce, status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const submitter =
      "submitter" in event.nativeEvent && event.nativeEvent.submitter instanceof HTMLElement
        ? event.nativeEvent.submitter
        : null;
    const formData = submitter ? new FormData(form, submitter) : new FormData(form);

    setIsSubmitting(true);

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          "X-Requested-With": "fetch",
        },
      });
      const payload = (await response.json().catch(() => null)) as { status?: string } | null;
      const nextStatus = getFeedbackStatus(payload?.status ?? (response.ok ? "success" : "error"));

      setSubmittedStatus(nextStatus);
      setFocusStatusNonce((current) => current + 1);

      if (nextStatus.tone === "success") {
        router.refresh();
      }
    } catch {
      setSubmittedStatus(feedbackStatusByCode.error);
      setFocusStatusNonce((current) => current + 1);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="reading-feedback" aria-labelledby="reading-feedback-heading">
      <div className="reading-feedback-copy">
        <h3 id="reading-feedback-heading">{heading}</h3>
        <p className="field-note">{intro}</p>
      </div>

      <form
        action="/api/title-feedback"
        className="reading-feedback-form"
        method="post"
        onSubmit={handleSubmit}
      >
        {fields.map((field) => (
          <input key={`${field.name}-${field.value}`} type="hidden" name={field.name} value={field.value} />
        ))}
        <RatingFormGuard />

        <div className="reading-feedback-actions" role="group" aria-label={intro}>
          {feedbackChoices.map((choice) => (
            <button
              key={choice.value}
              className="quiet-button reading-feedback-button"
              disabled={isSubmitting}
              name="feedback"
              type="submit"
              value={choice.value}
            >
              {choice.label}
            </button>
          ))}
        </div>
      </form>

      {status ? (
        <div
          ref={statusRef}
          className="panel status-panel status-panel-inline reading-feedback-status"
          data-tone={status.tone}
          role={status.tone === "error" ? "alert" : "status"}
          aria-live={status.tone === "error" ? "assertive" : "polite"}
          aria-atomic="true"
          tabIndex={-1}
        >
          <p className="status-panel-kicker">
            {status.tone === "error" ? "Fehler" : status.tone === "success" ? "Erfolg" : "Hinweis"}
          </p>
          <h4 className="status-panel-title">{status.title}</h4>
          <p className="status-panel-text">{status.text}</p>
        </div>
      ) : null}
    </section>
  );
}
