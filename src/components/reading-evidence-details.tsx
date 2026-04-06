type ReadingEvidenceEntry = {
  label: string;
  value: string;
};

type ReadingEvidenceDetailsProps = {
  entries: ReadingEvidenceEntry[];
  intro: string;
  summary?: string;
  title?: string;
};

export function ReadingEvidenceDetails({
  entries,
  intro,
  summary = "Worauf basiert das?",
  title = "Worauf basiert das?",
}: ReadingEvidenceDetailsProps) {
  if (!entries.length && !intro.trim()) {
    return null;
  }

  return (
    <details className="reading-evidence" name="reading-evidence">
      <summary>{summary}</summary>
      <div className="reading-evidence-body">
        <p className="field-note reading-evidence-intro">{intro}</p>
        {entries.length ? (
          <dl className="reading-evidence-list" aria-label={title}>
            {entries.map((entry) => (
              <div key={`${entry.label}-${entry.value}`}>
                <dt>{entry.label}</dt>
                <dd>{entry.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </details>
  );
}
