import { ImageResponse } from "next/og";
import { siteClaim } from "@/lib/constants";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#f7f3ec",
          color: "#191714",
          fontFamily: '"Segoe UI", "Helvetica Neue", sans-serif',
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            padding: "62px",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "52px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 640 }}>
            <div
              style={{
                display: "flex",
                fontSize: 20,
                fontWeight: 700,
                color: "#7b756d",
                textTransform: "uppercase",
                letterSpacing: 1.1,
                fontFamily: '"SFMono-Regular", Menlo, Consolas, monospace',
              }}
            >
              null-noise
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                fontSize: 78,
                fontWeight: 700,
                lineHeight: 0.92,
                letterSpacing: -3.2,
                marginTop: 26,
                fontFamily: '"Iowan Old Style", "Palatino Linotype", Georgia, serif',
              }}
            >
              <div style={{ display: "flex" }}>Vor dem Schauen</div>
              <div style={{ display: "flex" }}>ruhiger entscheiden.</div>
            </div>
            <div
              style={{
                marginTop: 24,
                fontSize: 28,
                lineHeight: 1.42,
                maxWidth: 560,
                color: "#5e5951",
              }}
            >
              {`${siteClaim} Reizprofil, Metadaten und Unsicherheit bleiben klar getrennt.`}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              width: 360,
              height: 360,
              border: "1px solid #d8d1c5",
              background: "rgba(255,255,255,0.78)",
              borderRadius: 36,
              padding: 34,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#7b756d",
                  fontFamily: '"SFMono-Regular", Menlo, Consolas, monospace',
                  textTransform: "uppercase",
                }}
              >
                ruhiger lesen
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 36,
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: -1.3,
                  fontFamily: '"Iowan Old Style", "Palatino Linotype", Georgia, serif',
                }}
              >
                leiser, klarer, erklärbar
              </div>
            </div>

            <svg viewBox="0 0 128 128" width="176" height="176" xmlns="http://www.w3.org/2000/svg">
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
          </div>
        </div>
      </div>
    ),
    size,
  );
}
