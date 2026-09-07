import {
  Architects_Daughter,
  Caveat,
  Cutive_Mono,
  Dancing_Script,
  Gochi_Hand,
  Handlee,
  JetBrains_Mono,
  Kalam,
  Literata,
  Neucha,
  Patrick_Hand,
  Reenie_Beanie,
  Roboto,
  Shadows_Into_Light,
} from "next/font/google";

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
export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-jetbrains-mono",
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
export const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-dancing-script",
  preload: false,
});
export const handlee = Handlee({ subsets: ["latin"], weight: "400", variable: "--font-handlee", preload: false });
export const literata = Literata({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-literata",
  preload: false,
});
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
  jetbrainsMono.variable,
  patrickHand.variable,
  shadowsIntoLight.variable,
  architectsDaughter.variable,
  reenieBeanie.variable,
  gochiHand.variable,
  neucha.variable,
  dancingScript.variable,
  handlee.variable,
  literata.variable,
  roboto.variable,
].join(" ");
