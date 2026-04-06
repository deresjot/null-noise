import { ImageResponse } from "next/og";

export const contentType = "image/png";
export const size = {
  width: 180,
  height: 180,
};

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#6DBB60",
          borderRadius: "40px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "104px",
            height: "80px",
            left: "16px",
            top: "18px",
            borderRadius: "48% 52% 58% 42% / 44% 38% 62% 56%",
            background: "#5A87DF",
          }}
        />
        <div
          style={{
            position: "relative",
            width: "88px",
            height: "88px",
            borderRadius: "42% 58% 46% 54% / 45% 61% 39% 55%",
            background: "#EFC94B",
            transform: "translate(34px, -26px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "86px",
            height: "86px",
            right: "18px",
            bottom: "18px",
            borderRadius: "56% 44% 53% 47% / 43% 57% 43% 57%",
            background: "#EF735B",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "84px",
            height: "84px",
            left: "-12px",
            bottom: "20px",
            borderRadius: "999px",
            background: "rgba(255, 244, 225, 0.34)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "70px",
            top: "74px",
            width: "10px",
            height: "10px",
            borderRadius: "999px",
            background: "#181A21",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "88px",
            top: "76px",
            width: "8px",
            height: "8px",
            borderRadius: "999px",
            background: "#181A21",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "72px",
            top: "95px",
            width: "26px",
            height: "14px",
            borderBottom: "4px solid #181A21",
            borderRadius: "0 0 18px 18px",
            transform: "rotate(-4deg)",
          }}
        />
      </div>
    ),
    size,
  );
}
