import { CircleAlert, CircleCheck, CircleX, Info } from "lucide-react";

interface StatusPanelProps {
  title: string;
  text: string;
  tone?: "neutral" | "success" | "warning" | "error";
  id?: string;
  className?: string;
  headingAs?: "h2" | "h3" | "h4";
}

const toneLabels = {
  neutral: "Hinweis",
  success: "Erfolg",
  warning: "Achtung",
  error: "Fehler",
} as const;

const toneIcons = {
  neutral: Info,
  success: CircleCheck,
  warning: CircleAlert,
  error: CircleX,
} as const;

export function StatusPanel({
  title,
  text,
  tone = "neutral",
  id,
  className,
  headingAs = "h2",
}: StatusPanelProps) {
  const HeadingTag = headingAs;
  const role = tone === "error" ? "alert" : "status";
  const liveMode = tone === "error" ? "assertive" : "polite";
  const StatusIcon = toneIcons[tone];

  return (
    <div
      id={id}
      tabIndex={-1}
      className={["panel", "status-panel", className].filter(Boolean).join(" ")}
      data-tone={tone}
      role={role}
      aria-live={liveMode}
      aria-atomic="true"
    >
      <div className="status-panel-head">
        <span className="status-panel-icon" aria-hidden="true">
          <StatusIcon size={22} strokeWidth={2.3} />
        </span>
        <div className="status-panel-copy">
          <p className="status-panel-kicker">{toneLabels[tone]}</p>
          <HeadingTag className="status-panel-title">{title}</HeadingTag>
        </div>
      </div>
      <p className="status-panel-text">{text}</p>
    </div>
  );
}
