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
      <p className="status-panel-kicker">{toneLabels[tone]}</p>
      <HeadingTag className="status-panel-title">{title}</HeadingTag>
      <p className="status-panel-text">{text}</p>
    </div>
  );
}
