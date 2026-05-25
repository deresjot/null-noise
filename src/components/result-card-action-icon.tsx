type ResultCardActionIconProps = {
  name: "details" | "remember" | "seen";
};

export function ResultCardActionIcon({ name }: ResultCardActionIconProps) {
  if (name === "remember") {
    return (
      <svg
        aria-hidden="true"
        className="result-card-action-icon"
        fill="none"
        focusable="false"
        viewBox="0 0 24 24"
      >
        <path d="M7 4.75h10v14.5l-5-3-5 3V4.75Z" />
      </svg>
    );
  }

  if (name === "seen") {
    return (
      <svg
        aria-hidden="true"
        className="result-card-action-icon"
        fill="none"
        focusable="false"
        viewBox="0 0 24 24"
      >
        <path d="M4.75 12s2.5-4.25 7.25-4.25S19.25 12 19.25 12 16.75 16.25 12 16.25 4.75 12 4.75 12Z" />
        <path d="M10.1 12.1 11.35 13.35 14.1 10.65" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="result-card-action-icon"
      fill="none"
      focusable="false"
      viewBox="0 0 24 24"
    >
      <path d="M7.25 4.75h6.2l3.3 3.3v11.2H7.25V4.75Z" />
      <path d="M13.25 4.9V8.25h3.35" />
      <path d="M9.75 11.5h4.5" />
      <path d="M9.75 14.5h4.5" />
    </svg>
  );
}
