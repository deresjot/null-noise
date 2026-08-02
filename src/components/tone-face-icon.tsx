type ToneFaceIconProps = {
  className?: string;
  tone: "quiet" | "balanced" | "intense";
};

export function ToneFaceIcon({ className, tone }: ToneFaceIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={["tone-face-icon", className].filter(Boolean).join(" ")}
      data-tone={tone}
      focusable="false"
      viewBox="0 0 64 64"
    >
      <circle className="tone-face-ring" cx="32" cy="32" r="25.5" />
      {tone === "quiet" ? (
        <>
          <path className="tone-face-feature" d="M18 24c2.7 3.2 7.3 3.2 10 0" />
          <path className="tone-face-feature" d="M36 24c2.7 3.2 7.3 3.2 10 0" />
          <path className="tone-face-feature" d="M24 36c4.2 5.2 11.8 5.2 16 0" />
        </>
      ) : tone === "balanced" ? (
        <>
          <circle className="tone-face-dot" cx="22" cy="25" r="3.2" />
          <circle className="tone-face-dot" cx="42" cy="25" r="3.2" />
          <path className="tone-face-feature" d="M24 40h16" />
        </>
      ) : (
        <>
          <path className="tone-face-feature" d="M17 23h11" />
          <path className="tone-face-feature" d="M36 23h11" />
          <path className="tone-face-feature" d="M22 24v4" />
          <path className="tone-face-feature" d="M42 24v4" />
          <path className="tone-face-feature" d="M21 36c3.6 5.4 9.4 7 17 6" />
        </>
      )}
    </svg>
  );
}
