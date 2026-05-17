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
  blue: "#0B8FFF",
  lavender: "#C7A2FF",
  orange: "#FF6A1A",
  yellow: "#FFD21F",
  ink: "#2B0F1F",
  sand: "#FFF6E5",
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
          background: `linear-gradient(135deg, ${brand.sand} 0%, ${brand.white} 52%, #f8f4ff 100%)`,
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
            boxShadow: `18px 18px 0 ${brand.lavender}`,
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
                color: brand.blue,
              }}
            >
              Erste Einschätzung vor dem Play-Button
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
              flexDirection: "column",
              gap: "8px",
              padding: "18px 22px",
              borderRadius: "18px",
              background: brand.white,
              border: `4px solid ${brand.ink}`,
              borderLeft: `16px solid ${brand.orange}`,
              fontSize: "25px",
              fontWeight: 700,
            }}
          >
            <span>Reizprofil, Verfügbarkeit und Empfehlungen.</span>
            <span style={{ color: "#5A6170", fontSize: "22px", fontWeight: 700 }}>
              Ohne Konto. Ohne Tracking. Ohne Social-Druck.
            </span>
          </div>
          <div
            style={{
              display: "flex",
              gap: "12px",
              fontSize: "22px",
              fontWeight: 800,
            }}
          >
            {["Eher ruhig", "Eher wechselhaft", "Eher intensiv"].map((label, index) => (
              <span
                key={label}
                style={{
                  display: "flex",
                  padding: "10px 14px",
                  borderRadius: "999px",
                  background: index === 0 ? "#eaf6ee" : index === 1 ? "#fff6d8" : "#fff0ed",
                  border: `3px solid ${index === 0 ? "#2b8450" : index === 1 ? "#d2a528" : "#b8483f"}`,
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
