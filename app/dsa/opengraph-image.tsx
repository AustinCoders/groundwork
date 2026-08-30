import { ImageResponse } from "next/og";
import { chapters } from "@/lib/content";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "DSA in JS — every classic interview pattern, from two pointers to segment trees";

export default function OpengraphImage() {
  const written = chapters("dsa").filter((c) => c.ready).length;

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
            fontSize: 38,
            fontWeight: 700,
            transform: "rotate(-4deg)",
          }}
        >
          Σ
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 34, fontWeight: 700 }}>DSA in JS</div>
          <div style={{ fontSize: 21, color: "#8a8377" }}>patterns, not puzzle answers</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.02em", maxWidth: 980 }}>
          Every classic interview pattern, two pointers to segment trees
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          {[`${written} chapters`, "beginner → advanced", "interview strategy"].map((chip) => (
            <div
              key={chip}
              style={{
                fontSize: 22,
                padding: "9px 20px",
                color: "#4a463f",
                border: "2px solid #d6d0c4",
                borderRadius: 999,
              }}
            >
              {chip}
            </div>
          ))}
        </div>
      </div>
    </div>,
    size
  );
}
