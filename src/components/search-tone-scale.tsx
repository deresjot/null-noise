type SearchToneScaleValue = "ruhig" | "ausgeglichen" | "intensiv" | null;
type SearchToneScaleMode = "rated" | "growing" | "seed" | "pending";
type SearchToneScaleEmphasis = "default" | "card" | "hero";
const toneMeterSegments = 12;
const cardToneSegments = [
  { key: "ruhig", label: "ruhiger" },
  { key: "ausgeglichen", label: "mittig" },
  { key: "intensiv", label: "intensiver" },
] as const;

interface SearchToneScaleProps {
  caption?: string;
  compact?: boolean;
  endLabel?: string;
  emphasis?: SearchToneScaleEmphasis;
  mode?: SearchToneScaleMode;
  note?: string;
  showCaption?: boolean;
  showValueLabel?: boolean;
  startLabel?: string;
  value: SearchToneScaleValue;
  valueLabel?: string;
}

export function SearchToneScale({
  caption,
  compact = false,
  endLabel = "laut",
  emphasis = "default",
  mode,
  note,
  showCaption = true,
  showValueLabel = true,
  startLabel = "leise",
  value,
  valueLabel,
}: SearchToneScaleProps) {
  const resolvedMode = mode ?? (value ? "rated" : "pending");
  const currentLabel = valueLabel ?? value ?? "noch offen";
  const resolvedCaption =
    caption ??
    (resolvedMode === "seed"
      ? "Erste Tendenz"
      : "Tendenz");
  const filledSegments =
    value === "ruhig"
      ? 3
      : value === "ausgeglichen"
        ? 7
        : value === "intensiv"
          ? 11
          : 0;

  return (
    <div
      aria-label={`${resolvedCaption}: ${currentLabel}`}
      className="search-tone-scale"
      data-compact={compact ? "true" : "false"}
      data-emphasis={emphasis}
      data-mode={resolvedMode}
      data-strength={value ?? "pending"}
      data-state={value ? "ready" : "pending"}
      data-tone={value ?? "pending"}
      role="group"
    >
      {showCaption || showValueLabel ? (
        <div
          className="search-tone-scale-captionrow"
          data-solo={showValueLabel ? "false" : "true"}
        >
          {showCaption ? <p className="search-tone-scale-caption">{resolvedCaption}</p> : null}
          {showValueLabel ? <p className="search-tone-scale-value">{currentLabel}</p> : null}
        </div>
      ) : null}

      <div className="search-tone-scale-core">
        <div className="search-tone-scale-signal" aria-hidden="true">
          {emphasis === "card" ? (
            <div className="search-tone-scale-triad" data-tone={value ?? "pending"}>
              {cardToneSegments.map((segment) => (
                <span
                  key={segment.key}
                  className="search-tone-scale-triad-segment"
                  data-active={value === segment.key ? "true" : "false"}
                  data-tone={segment.key}
                >
                  {segment.label}
                </span>
              ))}
            </div>
          ) : (
            <div className="search-tone-scale-bar">
              {Array.from({ length: toneMeterSegments }, (_, index) => {
                const zone = index < 4 ? "ruhig" : index < 8 ? "ausgeglichen" : "intensiv";
                return (
                  <span
                    key={index}
                    className="search-tone-scale-segment"
                    data-active={index < filledSegments ? "true" : "false"}
                    data-edge={filledSegments > 0 && index === filledSegments - 1 ? "true" : "false"}
                    data-zone={zone}
                  />
                );
              })}
            </div>
          )}
          {compact || emphasis === "card" ? null : (
            <div className="search-tone-scale-axis-copy">
              <span>{startLabel}</span>
              <span>{endLabel}</span>
            </div>
          )}
        </div>

        {!compact && note ? <p className="field-note search-tone-scale-note">{note}</p> : null}
      </div>
    </div>
  );
}
