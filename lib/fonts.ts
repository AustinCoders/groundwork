import {
  Architects_Daughter,
  Bangers,
  Caveat,
  Cutive_Mono,
  Dancing_Script,
  Gochi_Hand,
  Handlee,
  Indie_Flower,
  Kalam,
  Neucha,
  Patrick_Hand,
  Permanent_Marker,
  Reenie_Beanie,
  Roboto,
  Schoolbell,
  Shadows_Into_Light,
} from "next/font/google";

// Only the default pairing (Caveat/Kalam) and the mono face used by code
// blocks are worth preloading — the rest are alternate handwriting styles
// picked via ThemeFontPicker and are fetched on demand when selected.
//
// display: "optional" on the default pair — they're self-hosted and
// preloaded, so they're almost always ready in time, but "swap" was
// letting the fallback-to-Caveat/Kalam reflow show up as layout shift
// (CLS) on the hero heading, which is also the LCP element. "optional"
// paints once, with whichever font is ready, and never swaps later.
export const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-caveat",
  display: "optional",
});
export const kalam = Kalam({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-kalam",
  display: "optional",
});
export const cutiveMono = Cutive_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-cutive-mono",
  preload: false,
});

export const patrickHand = Patrick_Hand({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-patrick-hand",
  preload: false,
});
export const shadowsIntoLight = Shadows_Into_Light({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-shadows-into-light",
  preload: false,
});
export const architectsDaughter = Architects_Daughter({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-architects-daughter",
  preload: false,
});
export const reenieBeanie = Reenie_Beanie({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-reenie-beanie",
  preload: false,
});
export const gochiHand = Gochi_Hand({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-gochi-hand",
  preload: false,
});
export const neucha = Neucha({ subsets: ["latin"], weight: "400", variable: "--font-neucha", preload: false });
export const permanentMarker = Permanent_Marker({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-permanent-marker",
  preload: false,
});
export const indieFlower = Indie_Flower({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-indie-flower",
  preload: false,
});
export const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-dancing-script",
  preload: false,
});
export const handlee = Handlee({ subsets: ["latin"], weight: "400", variable: "--font-handlee", preload: false });
export const bangers = Bangers({ subsets: ["latin"], weight: "400", variable: "--font-bangers", preload: false });
export const schoolbell = Schoolbell({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-schoolbell",
  preload: false,
});
// The one non-handwriting option — a clean sans for readers who want the
// content without the notebook conceit. One family, two weights: 700 for
// headings (existing CSS already sets font-weight there), 400 for body.
export const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-roboto",
  preload: false,
});

export const fontVariables = [
  caveat.variable,
  kalam.variable,
  cutiveMono.variable,
  patrickHand.variable,
  shadowsIntoLight.variable,
  architectsDaughter.variable,
  reenieBeanie.variable,
  gochiHand.variable,
  neucha.variable,
  permanentMarker.variable,
  indieFlower.variable,
  dancingScript.variable,
  handlee.variable,
  bangers.variable,
  schoolbell.variable,
  roboto.variable,
].join(" ");
