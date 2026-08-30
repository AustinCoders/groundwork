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
  Schoolbell,
  Shadows_Into_Light,
} from "next/font/google";

// Only the default pairing (Caveat/Kalam) and the mono face used by code
// blocks are worth preloading — the rest are alternate handwriting styles
// picked via ThemeFontPicker and are fetched on demand when selected.
export const caveat = Caveat({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-caveat" });
export const kalam = Kalam({ subsets: ["latin"], weight: ["300", "400", "700"], variable: "--font-kalam" });
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
].join(" ");
