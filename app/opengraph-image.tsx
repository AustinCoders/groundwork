import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${SITE_NAME} — handwritten notes on web development`;

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: "#faf8f2",
        color: "#1b1b1b",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 44,
          top: 0,
          bottom: 0,
          width: 3,
          background: "#e0a9a0",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <div
          style={{
            width: 76,
            height: 76,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "5px solid #1b1b1b",
            borderRadius: "52% 48% 51% 49% / 49% 52% 48% 51%",
            fontSize: 34,
            fontWeight: 700,
            transform: "rotate(-4deg)",
          }}
        >
          JS
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 34, fontWeight: 700 }}>{SITE_NAME}</div>
          <div style={{ fontSize: 21, color: "#8a8377" }}>handwritten · web dev</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
          Notes you can actually study from
        </div>
        <div style={{ fontSize: 27, color: "#4a463f", lineHeight: 1.45, maxWidth: 900 }}>{SITE_DESCRIPTION}</div>
      </div>
    </div>,
    size
  );
}
