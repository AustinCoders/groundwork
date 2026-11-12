import localFont from "next/font/local";

export const caveat = localFont({
  src: [{ path: "./font-files/caveat-1.woff2", weight: "500 700", style: "normal" }],
  variable: "--font-caveat",
  display: "fallback",
});
export const kalam = localFont({
  src: [
    { path: "./font-files/kalam-1.woff2", weight: "300", style: "normal" },
    { path: "./font-files/kalam-2.woff2", weight: "400", style: "normal" },
    { path: "./font-files/kalam-3.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-kalam",
  display: "fallback",
});
export const jetbrainsMono = localFont({
  src: [{ path: "./font-files/jetbrains-mono-1.woff2", weight: "100 800", style: "normal" }],
  variable: "--font-jetbrains-mono",
  preload: false,
});
export const patrickHand = localFont({
  src: [{ path: "./font-files/patrick-hand-1.woff2", weight: "400", style: "normal" }],
  variable: "--font-patrick-hand",
  preload: false,
});
export const shadowsIntoLight = localFont({
  src: [{ path: "./font-files/shadows-into-light-1.woff2", weight: "400", style: "normal" }],
  variable: "--font-shadows-into-light",
  preload: false,
});
export const architectsDaughter = localFont({
  src: [{ path: "./font-files/architects-daughter-1.woff2", weight: "400", style: "normal" }],
  variable: "--font-architects-daughter",
  preload: false,
});
export const reenieBeanie = localFont({
  src: [{ path: "./font-files/reenie-beanie-1.woff2", weight: "400", style: "normal" }],
  variable: "--font-reenie-beanie",
  preload: false,
});
export const gochiHand = localFont({
  src: [{ path: "./font-files/gochi-hand-1.woff2", weight: "400", style: "normal" }],
  variable: "--font-gochi-hand",
  preload: false,
});
export const neucha = localFont({
  src: [{ path: "./font-files/neucha-1.woff2", weight: "400", style: "normal" }],
  variable: "--font-neucha",
  preload: false,
});
export const permanentMarker = localFont({
  src: [{ path: "./font-files/permanent-marker-1.woff2", weight: "400", style: "normal" }],
  variable: "--font-permanent-marker",
  preload: false,
});
export const indieFlower = localFont({
  src: [{ path: "./font-files/indie-flower-1.woff2", weight: "400", style: "normal" }],
  variable: "--font-indie-flower",
  preload: false,
});
export const dancingScript = localFont({
  src: [{ path: "./font-files/dancing-script-1.woff2", weight: "600 700", style: "normal" }],
  variable: "--font-dancing-script",
  preload: false,
});
export const handlee = localFont({
  src: [{ path: "./font-files/handlee-1.woff2", weight: "400", style: "normal" }],
  variable: "--font-handlee",
  preload: false,
});
export const literata = localFont({
  src: [
    { path: "./font-files/literata-2.woff2", weight: "400 700", style: "normal" },
    { path: "./font-files/literata-italic-1.woff2", weight: "400 700", style: "italic" },
  ],
  variable: "--font-literata",
  preload: false,
});
export const roboto = localFont({
  src: [{ path: "./font-files/roboto-1.woff2", weight: "400 700", style: "normal" }],
  variable: "--font-roboto",
  preload: false,
});

export const fontVariables = [
  caveat.variable,
  kalam.variable,
  jetbrainsMono.variable,
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
  literata.variable,
  roboto.variable,
].join(" ");
