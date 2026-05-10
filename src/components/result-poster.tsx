import Image from "next/image";

interface ResultPosterProps {
  priority?: boolean;
  sizes?: string;
  title: string;
  src: string | null;
  variant?: "tile" | "detail";
}

export function ResultPoster({
  title,
  src,
  priority = false,
  sizes,
  variant = "tile",
}: ResultPosterProps) {
  const resolvedSizes =
    sizes ??
    (variant === "detail"
      ? "(max-width: 980px) min(78vw, 34rem), 34rem"
      : "(max-width: 760px) 100vw, (max-width: 1200px) 50vw, 25vw");

  return (
    <div className={`poster-thumb-frame poster-thumb-frame-${variant}`}>
      {src ? (
        <Image
          alt={`Poster zu ${title}`}
          className={`poster-thumb-image poster-thumb-image-${variant}`}
          fill
          priority={priority}
          sizes={resolvedSizes}
          src={src}
        />
      ) : (
        <div
          aria-label={`Kein Poster verfügbar für ${title}`}
          className={`poster-thumb-fallback poster-thumb-fallback-${variant}`}
          role="img"
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
