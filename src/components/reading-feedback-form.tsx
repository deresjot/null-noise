"use client";

import { useEffect, useRef, useState, type FormEvent, type RefObject } from "react";
import { CircleAlert, CircleCheck, CircleX, Info } from "lucide-react";
import { useRouter } from "next/navigation";

import { RatingFormGuard } from "./rating-form-guard";
import { ToneFaceIcon } from "./tone-face-icon";

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
  {
    label: "Eher ruhig",
    value: "calmer",
    text: "Für mich fühlte es sich leichter an.",
    tone: "quiet",
  },
  {
    label: "Eher wechselhaft",
    value: "match",
    text: "Die Einordnung passt ungefähr.",
    tone: "balanced",
  },
  {
    label: "Eher intensiv",
    value: "stronger",
    text: "Für mich war es dichter oder lauter.",
    tone: "intense",
  },
] as const;

const statusIconByTone = {
  neutral: Info,
  success: CircleCheck,
  warning: CircleAlert,
  error: CircleX,
} as const;

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
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
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
        <p className="field-note reading-feedback-guidance">
          Ein Fingertipp reicht. Du kannst deine Wahrnehmung später wieder ändern.
        </p>
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
          {feedbackChoices.map((choice) => {
            return (
            <button
              key={choice.value}
              className="quiet-button reading-feedback-button"
              data-selected={selectedChoice === choice.value ? "true" : "false"}
              disabled={isSubmitting}
              name="feedback"
              aria-pressed={selectedChoice === choice.value}
              type="submit"
              value={choice.value}
              onClick={() => setSelectedChoice(choice.value)}
            >
              <span className="reading-feedback-choice-icon" aria-hidden="true">
                <ToneFaceIcon tone={choice.tone} />
              </span>
              <span className="reading-feedback-choice-copy">
                <span className="reading-feedback-choice-label">{choice.label}</span>
                <span className="reading-feedback-choice-text">{choice.text}</span>
              </span>
            </button>
            );
          })}
        </div>
      </form>

      {status ? <ReadingFeedbackStatus status={status} statusRef={statusRef} /> : null}
    </section>
  );
}

function ReadingFeedbackStatus({
  status,
  statusRef,
}: {
  status: FeedbackStatus;
  statusRef: RefObject<HTMLDivElement | null>;
}) {
  const StatusIcon = statusIconByTone[status.tone];

  return (
    <div
      ref={statusRef}
      className="panel status-panel status-panel-inline reading-feedback-status"
      data-tone={status.tone}
      role={status.tone === "error" ? "alert" : "status"}
      aria-live={status.tone === "error" ? "assertive" : "polite"}
      aria-atomic="true"
      tabIndex={-1}
    >
      <div className="status-panel-head">
        <span className="status-panel-icon" aria-hidden="true">
          <StatusIcon size={22} strokeWidth={2.8} />
        </span>
        <div className="status-panel-copy">
          <p className="status-panel-kicker">
            {status.tone === "error" ? "Fehler" : status.tone === "success" ? "Erfolg" : "Hinweis"}
          </p>
          <h4 className="status-panel-title">{status.title}</h4>
        </div>
      </div>
      <p className="status-panel-text">{status.text}</p>
    </div>
  );
}
