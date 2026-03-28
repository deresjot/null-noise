const toneScaleSteps = ["ruhig", "ausgeglichen", "intensiv"] as const;

type SearchToneScaleValue = (typeof toneScaleSteps)[number] | null;
type SearchToneScaleMode = "rated" | "seed" | "pending";

interface SearchToneScaleProps {
  mode?: SearchToneScaleMode;
  note?: string;
  value: SearchToneScaleValue;
}

export function SearchToneScale({ mode, note, value }: SearchToneScaleProps) {
  const resolvedMode = mode ?? (value ? "rated" : "pending");
  const currentLabel = value ?? "noch offen";
  const caption = resolvedMode === "seed" ? "Vorläufige Einordnung" : "Schnelle Einordnung";

  return (
    <div
      className="search-tone-scale"
      data-mode={resolvedMode}
      data-state={value ? "ready" : "pending"}
    >
      <div className="search-tone-scale-header">
        <p className="search-tone-scale-caption">{caption}</p>
        <p className="search-tone-scale-value">{currentLabel}</p>
      </div>

      <div className="search-tone-scale-track">
        {toneScaleSteps.map((step) => (
          <span
            key={step}
            className="search-tone-scale-step"
            data-active={value === step}
            data-tone={step}
          >
            {step}
          </span>
        ))}
      </div>

      {note ? <p className="field-note">{note}</p> : null}
    </div>
  );
}
