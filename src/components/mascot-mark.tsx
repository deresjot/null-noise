interface MascotMarkProps {
  className?: string;
  title?: string;
  decorative?: boolean;
}

export function MascotMark({
  className,
  title = "null-noise Maskottchen",
  decorative = false,
}: MascotMarkProps) {
  return (
    <svg
      aria-hidden={decorative}
      aria-label={decorative ? undefined : title}
      className={className}
      role={decorative ? undefined : "img"}
      viewBox="0 0 128 128"
      xmlns="http://www.w3.org/2000/svg"
    >
      {!decorative ? <title>{title}</title> : null}
      <circle cx="64" cy="64" r="41" fill="#E4E1DC" />
      <circle cx="64" cy="64" r="41" fill="none" stroke="#B8B1A8" strokeWidth="2.2" />
      <circle cx="50" cy="57" r="3.8" fill="#8F877E" />
      <circle cx="78" cy="57" r="3.8" fill="#8F877E" />
      <circle cx="42" cy="72" r="4.5" fill="#F1ECE5" />
      <circle cx="86" cy="72" r="4.5" fill="#F1ECE5" />
      <path
        d="M57 72c2.5 3 4.9 3 7.2 0 2.5 3 4.9 3 7.2 0"
        fill="none"
        stroke="#8F877E"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
      />
    </svg>
  );
}
