import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
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
          width: 400,
          height: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "24px solid #1b1b1b",
          borderRadius: "52% 48% 51% 49% / 49% 52% 48% 51%",
          color: "#1b1b1b",
          fontSize: 190,
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
