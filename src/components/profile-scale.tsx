import type { CSSProperties } from "react";

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
  const progress = `${18 + value * 16}%`;

  return (
    <article
      className="scale-card"
      data-featured={featured}
      data-tone={tone}
      style={{ "--scale-progress": progress } as CSSProperties}
    >
      <div className="scale-headline">
        <p className="scale-kicker">{featured ? "Besonders relevant" : "Einordnung"}</p>
        <h3>{label}</h3>
        <p>{help}</p>
      </div>
      <p className="scale-value">{valueLabel}</p>
      <div className="scale-legend" aria-hidden="true">
        <span>{rangeLow}</span>
        <span>{rangeHigh}</span>
      </div>
      <div className="scale-steps" aria-hidden="true">
        <span className="scale-track" />
        <span className="scale-track-fill" data-tone={tone} />
        <span className="scale-track-marker" data-tone={tone} />
        {steps.map((step) => (
          <span key={step} className="scale-step" data-tone={step <= value ? tone : "idle"} />
        ))}
      </div>
      <p className="scale-meta">Grobe Achse, kein Messwert.</p>
      <p className="scale-help">{scaleLabels[value].description}</p>
    </article>
  );
}
