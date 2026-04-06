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
          background: "linear-gradient(180deg, #f8f5ef 0%, #efe8dd 100%)",
          color: "#222636",
          fontFamily: '"Avenir Next", "Segoe UI", "Helvetica Neue", sans-serif',
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            padding: "62px",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "56px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 640 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                fontSize: 20,
                fontWeight: 700,
                color: "#69706d",
                textTransform: "uppercase",
                letterSpacing: 1.1,
                fontFamily: '"Avenir Next", "Segoe UI", "Helvetica Neue", sans-serif',
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 5,
                  background: "linear-gradient(180deg, #7b9085 0%, #60756c 100%)",
                }}
              />
              null-noise
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                fontSize: 74,
                fontWeight: 700,
                lineHeight: 0.94,
                letterSpacing: -2.8,
                marginTop: 28,
                fontFamily: '"Iowan Old Style", "Palatino Linotype", Georgia, serif',
              }}
            >
              <div style={{ display: "flex" }}>Titel finden.</div>
              <div style={{ display: "flex" }}>Reiz grob einschätzen.</div>
            </div>
            <div
              style={{
                marginTop: 26,
                fontSize: 28,
                lineHeight: 1.4,
                maxWidth: 560,
                color: "#5b625f",
              }}
            >
              {`${siteClaim} Keine Scores, nur eine erste Tendenz und den Stand dahinter.`}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              width: 360,
              height: 360,
              border: "1px solid rgba(84, 89, 96, 0.14)",
              background: "rgba(255,253,249,0.88)",
              borderRadius: 34,
              padding: 36,
              alignItems: "flex-start",
              flexDirection: "column",
              gap: 22,
              boxShadow: "0 18px 48px rgba(47,53,60,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#69706d",
                  fontFamily: '"Avenir Next", "Segoe UI", "Helvetica Neue", sans-serif',
                  textTransform: "uppercase",
                  letterSpacing: 1.1,
                }}
              >
                so sieht es aus
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 34,
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: -1.2,
                  fontFamily: '"Iowan Old Style", "Palatino Linotype", Georgia, serif',
                }}
              >
                Vorläufig. Wachsend. Belastbarer.
              </div>
            </div>
            <div
              style={{
                display: "flex",
                width: "100%",
                flexDirection: "column",
                gap: 18,
                marginTop: 8,
              }}
            >
              {[
                { label: "ruhig", color: "#7b9085" },
                { label: "ausgeglichen", color: "#a88f67" },
                { label: "intensiv", color: "#916c6a" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 20,
                      color: "#5b625f",
                    }}
                  >
                    <span>{item.label}</span>
                    <span>sichtbar benannt</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      width: "100%",
                      height: 18,
                      borderRadius: 999,
                      background: "#e7e1d5",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        width: item.label === "ausgeglichen" ? "66%" : "42%",
                        background: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
