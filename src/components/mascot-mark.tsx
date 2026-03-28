import Image from "next/image";

interface MascotMarkProps {
  className?: string;
  imageClassName?: string;
  title?: string;
  decorative?: boolean;
  priority?: boolean;
  variant?: "default" | "compact";
}

export function MascotMark({
  className,
  imageClassName,
  title = "null-noise Maskottchen",
  decorative = false,
  priority = false,
  variant = "default",
}: MascotMarkProps) {
  const src =
    variant === "compact"
      ? "/brand/null-noise-fig2-mark-crop.png"
      : "/brand/null-noise-fig2-transparent.png";

  return (
    <span className={className}>
      <Image
        alt={decorative ? "" : title}
        aria-hidden={decorative ? true : undefined}
        className={imageClassName ?? "mascot-mark-image"}
        height={1024}
        priority={priority}
        sizes="(max-width: 720px) 96px, 128px"
        src={src}
        width={1024}
      />
    </span>
  );
}
