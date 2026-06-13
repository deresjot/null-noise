type LoadingStateProps = {
  className?: string;
  label: string;
  live?: boolean;
  variant?: "inline" | "page" | "form";
};

export function LoadingState({
  className,
  label,
  live = false,
  variant = "inline",
}: LoadingStateProps) {
  const Component = variant === "page" ? "div" : "span";
  const liveProps = live
    ? ({
        "aria-atomic": "true",
        "aria-live": "polite",
        role: "status",
      } as const)
    : {};

  return (
    <Component className={["loading-state", `loading-state-${variant}`, className].filter(Boolean).join(" ")} {...liveProps}>
      <span className="loading-state-mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span className="loading-state-label">{label}</span>
    </Component>
  );
}
