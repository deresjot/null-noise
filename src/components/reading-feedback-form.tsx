import { RatingFormGuard } from "./rating-form-guard";

type ReadingFeedbackFormProps = {
  fields: Array<{ name: string; value: string }>;
  heading?: string;
  intro?: string;
};

const feedbackChoices = [
  { label: "Eher ruhig", value: "calmer" },
  { label: "Eher wechselhaft", value: "match" },
  { label: "Eher intensiv", value: "stronger" },
] as const;

export function ReadingFeedbackForm({
  fields,
  heading = "Rückmeldung",
  intro = "War das für dich eher …",
}: ReadingFeedbackFormProps) {
  return (
    <section className="reading-feedback" aria-labelledby="reading-feedback-heading">
      <div className="reading-feedback-copy">
        <h3 id="reading-feedback-heading">{heading}</h3>
        <p className="field-note">{intro}</p>
      </div>

      <form action="/api/title-feedback" className="reading-feedback-form" method="post">
        {fields.map((field) => (
          <input key={`${field.name}-${field.value}`} type="hidden" name={field.name} value={field.value} />
        ))}
        <RatingFormGuard />

        <div className="reading-feedback-actions" role="group" aria-label={intro}>
          {feedbackChoices.map((choice) => (
            <button
              key={choice.value}
              className="quiet-button reading-feedback-button"
              name="feedback"
              type="submit"
              value={choice.value}
            >
              {choice.label}
            </button>
          ))}
        </div>
      </form>
    </section>
  );
}
