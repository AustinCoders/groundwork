import type { Tool } from "@/lib/whiteboard/model";

const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

type Extra =
  | "undo"
  | "redo"
  | "image"
  | "menu"
  | "grid"
  | "shapes"
  | "share"
  | "templates"
  | "fullscreen"
  | "help"
  | "lock"
  | "unlock"
  | "group"
  | "alignLeft"
  | "alignCentre"
  | "alignRight"
  | "alignTop"
  | "alignMiddle"
  | "alignBottom"
  | "spreadX"
  | "spreadY";

const PATHS: Record<Tool | Extra, React.ReactNode> = {
  select: <path d="M5 3l14 8-6 1.5L10 19z" />,
  hand: (
    <path d="M8 13V5.5a1.5 1.5 0 013 0V11m0-6.5a1.5 1.5 0 013 0V11m0-5a1.5 1.5 0 013 0v7a7 7 0 01-7 7h-.5a6 6 0 01-4.9-2.6L4 13.5a1.5 1.5 0 012.4-1.8L8 13" />
  ),
  pen: <path d="M4 20l4-1 11-11-3-3L5 16zM14 6l3 3" />,
  highlighter: <path d="M9 15l-3 3v2h6l2-2M9 15l7-10 4 3-7 10zM6 20h14" />,
  laser: (
    <>
      <circle cx="17" cy="7" r="2.5" />
      <path d="M4 20c3-1 6-4 8-7s2.5-3.5 3.3-4.3" />
    </>
  ),
  triangle: <path d="M12 4l9 16H3z" />,
  hexagon: <path d="M7.5 4h9l4.5 8-4.5 8h-9L3 12z" />,
  star: <path d="M12 3l2.7 5.6 6.2.9-4.5 4.3 1.1 6.1L12 17l-5.5 2.9 1.1-6.1L3.1 9.5l6.2-.9z" />,
  cylinder: (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="2.5" />
      <path d="M5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6" />
    </>
  ),
  parallelogram: <path d="M7 5h14l-4 14H3z" />,
  cloud: <path d="M7 18a4 4 0 01-.5-8 5.5 5.5 0 0110.6-1.5A4.5 4.5 0 0117.5 18z" />,
  shapes: (
    <>
      <circle cx="7.5" cy="7.5" r="3.5" />
      <path d="M13 4h7v7h-7zM7.5 13l4 7h-8z" />
      <path d="M16.5 14v6M13.5 17h6" />
    </>
  ),
  share: <path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6" />,
  templates: <path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z" />,
  fullscreen: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 114 2c-.9.6-1.5 1.1-1.5 2.2M12 17h.01" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 018 0v4" />
    </>
  ),
  unlock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 017.5-2" />
    </>
  ),
  group: <path d="M3 7V3h4M17 3h4v4M21 17v4h-4M7 21H3v-4M8 8h5v5H8zM11 11h5v5h-5z" />,
  alignLeft: <path d="M4 3v18M8 7h10v4H8zM8 13h6v4H8z" />,
  alignCentre: <path d="M12 3v18M6 7h12v4H6zM8 13h8v4H8z" />,
  alignRight: <path d="M20 3v18M6 7h10v4H6zM10 13h6v4h-6z" />,
  alignTop: <path d="M3 4h18M7 8v10h4V8zM13 8v6h4V8z" />,
  alignMiddle: <path d="M3 12h18M7 6v12h4V6zM13 8v8h4V8z" />,
  alignBottom: <path d="M3 20h18M7 6v10h4V6zM13 10v6h4v-6z" />,
  spreadX: <path d="M4 4v16M20 4v16M9 8h6v8H9z" />,
  spreadY: <path d="M4 4h16M4 20h16M8 9h8v6H8z" />,
  line: <path d="M5 19L19 5" />,
  arrow: <path d="M5 19L19 5M10 5h9v9" />,
  rect: <rect x="4" y="6" width="16" height="12" rx="2" />,
  ellipse: <ellipse cx="12" cy="12" rx="8" ry="6" />,
  diamond: <path d="M12 3l9 9-9 9-9-9z" />,
  text: <path d="M5 6V4h14v2M12 4v16M9 20h6" />,
  sticky: <path d="M5 4h14v10l-6 6H5zM13 20v-6h6" />,
  eraser: <path d="M8 20h12M5.5 14.5l7-7a2 2 0 012.8 0l2.2 2.2a2 2 0 010 2.8L11 19H8.5z" />,
  undo: <path d="M9 14L4 9l5-5M4 9h10a6 6 0 010 12h-3" />,
  redo: <path d="M15 14l5-5-5-5M20 9H10a6 6 0 000 12h3" />,
  image: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 16l5-5 5 5 3-3 5 5" />
      <circle cx="16" cy="9" r="1.5" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  grid: <path d="M4 4h16v16H4zM4 12h16M12 4v16" />,
};

export type IconName = keyof typeof PATHS;

export function Icon({ name }: { name: IconName }) {
  return <svg {...base}>{PATHS[name]}</svg>;
}
