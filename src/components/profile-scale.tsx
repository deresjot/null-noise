import { scaleLabels } from "@/lib/constants";
import { getToneValue } from "@/lib/profile";
import type { ScaleValue } from "@/lib/types";

interface ProfileScaleProps {
  featured?: boolean;
  label: string;
  help: string;
  rangeHigh: string;
  rangeLow: string;
  value: ScaleValue;
  valueLabel: string;
}

const steps: ScaleValue[] = [0, 1, 2, 3, 4];

export function ProfileScale({
  featured = false,
  label,
  help,
  rangeHigh,
  rangeLow,
  value,
  valueLabel,
}: ProfileScaleProps) {
  const tone = getToneValue(value);

  return (
    <article className="scale-card" data-featured={featured} data-tone={tone}>
      <div className="scale-headline">
        <p className="scale-kicker">{featured ? "Besonders relevant" : "Einordnung"}</p>
        <h3>{label}</h3>
        <p>{help}</p>
      </div>
      <div className="scale-legend" aria-hidden="true">
        <span>{rangeLow}</span>
        <span>{rangeHigh}</span>
      </div>
      <div className="scale-steps" aria-hidden="true">
        {steps.map((step) => (
          <span
            key={step}
            className={step <= value ? "scale-step scale-step-active" : "scale-step"}
            data-tone={tone}
          />
        ))}
      </div>
      <p className="scale-value">{valueLabel}</p>
      <p className="scale-meta">{`Stufe ${value} von 4 · grobe Einschätzung`}</p>
      <p className="scale-help">{scaleLabels[value].description}</p>
    </article>
  );
}
