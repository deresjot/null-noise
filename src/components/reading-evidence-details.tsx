type ReadingEvidenceEntry = {
  label: string;
  value: string;
};

type ReadingEvidenceDetailsProps = {
  entries: ReadingEvidenceEntry[];
  groups?: Array<{
    heading: string;
    items: string[];
  }>;
  intro: string;
  summary?: string;
  title?: string;
};

export function ReadingEvidenceDetails({
  entries,
  groups = [],
  intro,
  summary = "Worauf basiert das?",
  title = "Worauf basiert das?",
}: ReadingEvidenceDetailsProps) {
  if (!entries.length && !groups.length && !intro.trim()) {
    return null;
  }

  return (
    <details className="reading-evidence" name="reading-evidence">
      <summary>{summary}</summary>
      <div className="reading-evidence-body">
        <p className="field-note reading-evidence-intro">{intro}</p>
        {groups.length ? (
          <div className="reading-evidence-groups" aria-label="Kurze Einordnung">
            {groups.map((group) => (
              <section key={group.heading} className="reading-evidence-group">
                <h3>{group.heading}</h3>
                <ul className="plain-list">
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : null}
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
