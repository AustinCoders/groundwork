import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS masks and rounds this itself, so it needs padding the favicon doesn't.
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#faf8f2",
      }}
    >
      <div
        style={{
          width: 130,
          height: 130,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "8px solid #1b1b1b",
          borderRadius: "52% 48% 51% 49% / 49% 52% 48% 51%",
          color: "#1b1b1b",
          fontSize: 62,
          fontWeight: 700,
          letterSpacing: "-0.04em",
          transform: "rotate(-4deg)",
        }}
      >
        JS
      </div>
    </div>,
    size
  );
}
