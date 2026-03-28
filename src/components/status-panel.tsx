interface StatusPanelProps {
  title: string;
  text: string;
  tone?: "neutral" | "warning" | "error";
}

export function StatusPanel({
  title,
  text,
  tone = "neutral",
}: StatusPanelProps) {
  return (
    <section className="panel status-panel" data-tone={tone} aria-labelledby={`${tone}-status-title`}>
      <h2 id={`${tone}-status-title`}>{title}</h2>
      <p>{text}</p>
    </section>
  );
}
