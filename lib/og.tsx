import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const PAPER = "#faf8f2";
const INK = "#1b1b1b";
const MUTED = "#4a463f";
const FAINT = "#8a8377";
const RULE = "#d6d0c4";

const ACCENTS: Record<string, string> = {
  yellow: "#d9a51b",
  red: "#e0a9a0",
  mint: "#7fae95",
  blue: "#6f8fc4",
  ink: "#1b1b1b",
};

export interface OgCard {
  /** One or two characters in the hand-drawn badge — a topic's mark. */
  mark: string;
  /** Small line beside the badge: which part of the site this is. */
  kicker: string;
  /** The small grey line under the kicker. */
  sub: string;
  /** The big line. Keep it to about eight words or it wraps past the card. */
  headline: string;
  /** Up to three short facts along the bottom. */
  chips?: string[];
  accent?: string;
}

/**
 * Every share card on the site, drawn once. Before this, the level pages,
 * /problems and the interview book all inherited the homepage's card, so a
 * link to any of them previewed as the homepage.
 */
export function ogCard({ mark, kicker, sub, headline, chips = [], accent = "red" }: OgCard) {
  const rule = ACCENTS[accent] || ACCENTS.red;
  const markSize = mark.length > 2 ? 28 : mark.length > 1 ? 34 : 40;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: PAPER,
        color: INK,
      }}
    >
      <div style={{ position: "absolute", left: 44, top: 0, bottom: 0, width: 3, background: rule }} />

      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <div
          style={{
            width: 76,
            height: 76,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `5px solid ${INK}`,
            borderRadius: "52% 48% 51% 49% / 49% 52% 48% 51%",
            fontSize: markSize,
            fontWeight: 700,
            transform: "rotate(-4deg)",
          }}
        >
          {mark}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 34, fontWeight: 700 }}>{kicker}</div>
          <div style={{ fontSize: 21, color: FAINT }}>{sub}</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div
          style={{
            fontSize: headline.length > 54 ? 56 : 64,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            maxWidth: 980,
          }}
        >
          {headline}
        </div>
        {chips.length > 0 && (
          <div style={{ display: "flex", gap: 14 }}>
            {chips.map((chip) => (
              <div
                key={chip}
                style={{
                  fontSize: 22,
                  padding: "9px 20px",
                  color: MUTED,
                  border: `2px solid ${RULE}`,
                  borderRadius: 999,
                }}
              >
                {chip}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>,
    OG_SIZE
  );
}
