import Image from "next/image";

interface ResultPosterProps {
  decorative?: boolean;
  priority?: boolean;
  sizes?: string;
  title: string;
  src: string | null;
  variant?: "tile" | "detail";
}

export function ResultPoster({
  decorative = false,
  title,
  src,
  priority = false,
  sizes,
  variant = "tile",
}: ResultPosterProps) {
  const resolvedSizes =
    sizes ??
    (variant === "detail"
      ? "(max-width: 760px) min(78vw, 22rem), (max-width: 1200px) 24rem, 27rem"
      : "(max-width: 760px) 7rem, (max-width: 980px) 8rem, 13.5rem");

  return (
    <div className={`poster-thumb-frame poster-thumb-frame-${variant}`}>
      {src ? (
        <Image
          alt={decorative ? "" : `Poster zu ${title}`}
          className={`poster-thumb-image poster-thumb-image-${variant}`}
          fill
          priority={priority}
          sizes={resolvedSizes}
          src={src}
          unoptimized
        />
      ) : (
        <div
          aria-hidden={decorative ? "true" : undefined}
          aria-label={decorative ? undefined : `Kein Poster verfügbar für ${title}`}
          className={`poster-thumb-fallback poster-thumb-fallback-${variant}`}
          role={decorative ? undefined : "img"}
        >
          <span aria-hidden="true" className="poster-thumb-fallback-mark">
            NN
          </span>
          <span>Kein Poster verfügbar</span>
        </div>
      )}
    </div>
  );
}
