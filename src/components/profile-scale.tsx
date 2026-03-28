import { scaleLabels } from "@/lib/constants";
import { formatScale } from "@/lib/format";
import type { ScaleValue } from "@/lib/types";

interface ProfileScaleProps {
  label: string;
  help: string;
  value: ScaleValue;
}

const steps: ScaleValue[] = [0, 1, 2, 3, 4];

export function ProfileScale({ label, help, value }: ProfileScaleProps) {
  return (
    <article className="scale-card">
      <div className="scale-headline">
        <h3>{label}</h3>
        <p>{help}</p>
      </div>
      <div className="scale-steps" aria-hidden="true">
        {steps.map((step) => (
          <span
            key={step}
            className={step <= value ? "scale-step scale-step-active" : "scale-step"}
          />
        ))}
      </div>
      <p className="scale-value">{formatScale(value)}</p>
      <p className="scale-help">{scaleLabels[value].description}</p>
    </article>
  );
}
