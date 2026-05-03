import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export const contentType = "image/png";
export const size = {
  width: 1200,
  height: 630,
};

const brand = {
  ink: "#2B0F1F",
  sand: "#F3EDE6",
  white: "#FFFDF8",
};

async function getImageDataUrl(filename: string): Promise<string> {
  const buffer = await readFile(path.join(process.cwd(), "public", "brand", filename));
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

export default async function OpenGraphImage() {
  const logoSrc = await getImageDataUrl("null-noise-logo.png");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "56px",
          padding: "54px 64px",
          background: brand.sand,
          color: brand.ink,
          border: `18px solid ${brand.ink}`,
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "460px",
            height: "328px",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "28px",
            background: brand.white,
            border: `8px solid ${brand.ink}`,
          }}
        >
          <img
            src={logoSrc}
            alt="Null Noise Logo"
            style={{
              width: "360px",
              height: "360px",
              objectFit: "contain",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            maxWidth: "470px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: "72px",
                fontWeight: 900,
                lineHeight: 0.94,
                letterSpacing: 0,
                textTransform: "uppercase",
              }}
            >
              Null Noise
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "40px",
                fontWeight: 760,
                lineHeight: 1,
                letterSpacing: 0,
              }}
            >
              ruhiger finden
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "54px",
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: 0,
            }}
          >
            Filme und Serien ruhiger auswählen.
          </div>
          <div
            style={{
              display: "flex",
              padding: "18px 22px",
              borderRadius: "18px",
              background: brand.white,
              border: `4px solid ${brand.ink}`,
              fontSize: "26px",
              fontWeight: 700,
            }}
          >
            Metadaten vorsichtig lesen. Situativ ruhiger entscheiden.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
