import type { ReactNode } from "react";
import type { AvatarArt as Art } from "@/lib/account/profileExtras";
import styles from "./avatarArt.module.css";

export const ART_NAMES: Record<Art, string> = {
  cat: "Cat",
  owl: "Owl",
  fox: "Fox",
  bear: "Bear",
  bunny: "Bunny",
  penguin: "Penguin",
  robot: "Robot",
  astronaut: "Astronaut",
  alien: "Alien",
  ghost: "Ghost",
  octopus: "Octopus",
  dino: "Dino",
};

const b = styles.body;
const s = styles.shade;
const f = styles.feature;
const l = styles.line;
const t = styles.thick;

const ART: Record<Art, ReactNode> = {
  cat: (
    <>
      <path className={b} d="M14 22 18 7l10 10q4-1 8 0L46 7l4 15q4 6 4 14 0 18-22 18T10 36q0-8 4-14Z" />
      <path className={s} d="m19 12 2.5 7 3-3Zm26 0-2.5 7-3-3Z" />
      <ellipse className={f} cx="24" cy="33" rx="3" ry="4" />
      <ellipse className={f} cx="40" cy="33" rx="3" ry="4" />
      <path className={f} d="M29.5 39.5h5L32 42.5Z" />
      <path className={l} d="M32 42.5q-3 3.5-6 1.5m6-1.5q3 3.5 6 1.5M21 40l-9-2m9 5-9 1m31-4 9-2m-9 5 9 1" />
    </>
  ),
  owl: (
    <>
      <path className={b} d="M16 20 14 7l10 8q8-3 16 0l10-8-2 13q6 8 6 18 0 18-22 18T10 38q0-10 6-18Z" />
      <circle className={f} cx="22.5" cy="30" r="8.5" />
      <circle className={f} cx="41.5" cy="30" r="8.5" />
      <circle className={b} cx="22.5" cy="30" r="5.5" />
      <circle className={b} cx="41.5" cy="30" r="5.5" />
      <circle className={f} cx="23.5" cy="30.5" r="2.6" />
      <circle className={f} cx="40.5" cy="30.5" r="2.6" />
      <path className={f} d="M29 38.5h6l-3 5.5Z" />
      <path className={l} d="M24 48.5q2 2 4 0m4 2q2 2 4 0m4-2q2 2 4 0" />
    </>
  ),
  fox: (
    <>
      <path className={b} d="m9 10 15 9q8-2 16 0l15-9-4 21q-2 13-19 24-17-11-19-24Z" />
      <path className={s} d="m14 16 8 5-5 5Zm36 0-8 5 5 5ZM13 31q11 2 19 15 8-13 19-15-2 13-19 24-17-11-19-24Z" />
      <ellipse className={f} cx="24" cy="31" rx="2.6" ry="3.6" />
      <ellipse className={f} cx="40" cy="31" rx="2.6" ry="3.6" />
      <circle className={f} cx="32" cy="48" r="2.8" />
    </>
  ),
  bear: (
    <>
      <circle className={b} cx="16" cy="17" r="8" />
      <circle className={b} cx="48" cy="17" r="8" />
      <circle className={s} cx="16" cy="17" r="4" />
      <circle className={s} cx="48" cy="17" r="4" />
      <circle className={b} cx="32" cy="35" r="20" />
      <ellipse className={s} cx="32" cy="43" rx="9.5" ry="7.5" />
      <circle className={f} cx="24" cy="31" r="2.8" />
      <circle className={f} cx="40" cy="31" r="2.8" />
      <ellipse className={f} cx="32" cy="40" rx="3.6" ry="2.6" />
      <path className={l} d="M32 42.5V45m-4 1q4 3 8 0" />
    </>
  ),
  bunny: (
    <>
      <ellipse className={b} cx="23" cy="15" rx="5.5" ry="13" transform="rotate(-10 23 15)" />
      <ellipse className={b} cx="41" cy="15" rx="5.5" ry="13" transform="rotate(10 41 15)" />
      <ellipse className={s} cx="23" cy="15" rx="2.4" ry="9" transform="rotate(-10 23 15)" />
      <ellipse className={s} cx="41" cy="15" rx="2.4" ry="9" transform="rotate(10 41 15)" />
      <circle className={b} cx="32" cy="38" r="17" />
      <circle className={s} cx="21.5" cy="42.5" r="3" />
      <circle className={s} cx="42.5" cy="42.5" r="3" />
      <circle className={f} cx="26" cy="36" r="2.6" />
      <circle className={f} cx="38" cy="36" r="2.6" />
      <path className={f} d="M30 41.5h4L32 44Z" />
      <path className={l} d="M32 44q-2.5 2.5-5 1m5-1q2.5 2.5 5 1" />
    </>
  ),
  penguin: (
    <>
      <ellipse className={s} cx="24" cy="60" rx="5" ry="2.5" />
      <ellipse className={s} cx="40" cy="60" rx="5" ry="2.5" />
      <ellipse className={b} cx="32" cy="37" rx="20" ry="22" />
      <path className={f} d="M13 34q0-19 19-19t19 19q-6-5-12-2-4-5-7-5t-7 5q-6-3-12 2Z" />
      <circle className={f} cx="25.5" cy="38" r="2.6" />
      <circle className={f} cx="38.5" cy="38" r="2.6" />
      <path className={f} d="M28.5 42.5h7L32 47Z" />
      <path className={s} d="M13 40q-5 6-3 13 5-3 6-9Zm38 0q5 6 3 13-5-3-6-9Z" />
    </>
  ),
  robot: (
    <>
      <path className={l} d="M32 14V7" />
      <circle className={f} cx="32" cy="6" r="3" />
      <rect className={b} x="6" y="25" width="7" height="13" rx="2.5" />
      <rect className={b} x="51" y="25" width="7" height="13" rx="2.5" />
      <rect className={b} x="12" y="13" width="40" height="34" rx="9" />
      <rect className={f} x="20" y="23" width="8" height="8" rx="2" />
      <rect className={f} x="36" y="23" width="8" height="8" rx="2" />
      <rect className={f} x="22" y="36" width="20" height="5" rx="2.5" />
      <path className={styles.gap} d="M27 36v5m5-5v5m5-5v5" />
      <rect className={s} x="26" y="47" width="12" height="6" />
      <path className={b} d="M12 64q0-11 20-11t20 11Z" />
    </>
  ),
  astronaut: (
    <>
      <path className={b} d="M12 64q0-14 10-16h20q10 2 10 16Z" />
      <rect className={s} x="22" y="46" width="20" height="5" rx="2.5" />
      <rect className={b} x="49" y="23" width="6" height="12" rx="2.5" />
      <circle className={b} cx="32" cy="29" r="20" />
      <path className={f} d="M17 28q0-10 15-10t15 10q0 12-15 12T17 28Z" />
      <path className={styles.shine} d="M21.5 26q1-5 7-6" />
    </>
  ),
  alien: (
    <>
      <path className={t} d="m24 14-4-8m20 8 4-8" />
      <circle className={b} cx="20" cy="6" r="3.2" />
      <circle className={b} cx="44" cy="6" r="3.2" />
      <path className={b} d="M32 10q20 0 20 20 0 16-20 26-20-10-20-26 0-20 20-20Z" />
      <ellipse className={f} cx="23" cy="31" rx="7" ry="4.5" transform="rotate(25 23 31)" />
      <ellipse className={f} cx="41" cy="31" rx="7" ry="4.5" transform="rotate(-25 41 31)" />
      <circle className={b} cx="21" cy="29.5" r="1.4" />
      <circle className={b} cx="43" cy="29.5" r="1.4" />
      <path className={l} d="M29 45q3 2 6 0" />
    </>
  ),
  ghost: (
    <>
      <path className={b} d="M14 30q0-20 18-20t18 20v22q-3 5-6 0-3 5-6 0-3 5-6 0-3 5-6 0-3 5-6 0-3 5-6 0Z" />
      <circle className={s} cx="20" cy="37" r="3" />
      <circle className={s} cx="44" cy="37" r="3" />
      <ellipse className={f} cx="25" cy="29" rx="3" ry="4.5" />
      <ellipse className={f} cx="39" cy="29" rx="3" ry="4.5" />
      <ellipse className={f} cx="32" cy="40" rx="3" ry="4" />
    </>
  ),
  octopus: (
    <>
      <path className={t} d="M19 36q-6 8-11 7m16-4q-2 10-8 14m16-13v15m8-16q2 10 8 14m3-17q6 8 11 7" />
      <ellipse className={b} cx="32" cy="25" rx="18" ry="17" />
      <circle className={s} cx="24" cy="16" r="2.6" />
      <circle className={s} cx="39" cy="14" r="2" />
      <circle className={s} cx="43.5" cy="20" r="1.8" />
      <circle className={f} cx="25" cy="27" r="3" />
      <circle className={f} cx="39" cy="27" r="3" />
      <circle className={b} cx="26" cy="26" r="1" />
      <circle className={b} cx="40" cy="26" r="1" />
      <path className={l} d="M28 33q4 3 8 0" />
    </>
  ),
  dino: (
    <>
      <path className={b} d="m24 19 3-10 4 9Zm9-1 4-10 3 11Zm9 3 6-6 0 9Z" />
      <path className={b} d="M14 40q-2-22 18-23 20 1 18 23 0 14-18 14T14 40Z" />
      <circle className={s} cx="42" cy="26" r="2.4" />
      <circle className={s} cx="45" cy="32" r="1.6" />
      <circle className={f} cx="24" cy="31" r="3" />
      <circle className={f} cx="40" cy="31" r="3" />
      <circle className={f} cx="28.5" cy="41" r="1.3" />
      <circle className={f} cx="35.5" cy="41" r="1.3" />
      <path className={l} d="M23 46q9 5 18 0" />
    </>
  ),
};

export function AvatarArt({ art, className }: { art: Art; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className ? `${styles.art} ${className}` : styles.art} aria-hidden="true">
      {ART[art]}
    </svg>
  );
}
