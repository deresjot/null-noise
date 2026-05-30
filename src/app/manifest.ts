import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "null-noise",
    short_name: "null-noise",
    description:
      "Eine ruhige Entscheidungshilfe für Filme und Serien: erste Einschätzung, grobe Reizwirkung und klare Auswahl ohne Konto oder Tracking.",
    lang: "de",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fff6e5",
    theme_color: "#fff6e5",
    icons: [
      {
        src: "/brand/pwa-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/pwa-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/pwa-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
