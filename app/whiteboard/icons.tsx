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

const PATHS: Record<Tool | "undo" | "redo" | "image" | "menu" | "grid", React.ReactNode> = {
  select: <path d="M5 3l14 8-6 1.5L10 19z" />,
  hand: (
    <path d="M8 13V5.5a1.5 1.5 0 013 0V11m0-6.5a1.5 1.5 0 013 0V11m0-5a1.5 1.5 0 013 0v7a7 7 0 01-7 7h-.5a6 6 0 01-4.9-2.6L4 13.5a1.5 1.5 0 012.4-1.8L8 13" />
  ),
  pen: <path d="M4 20l4-1 11-11-3-3L5 16zM14 6l3 3" />,
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

export function Icon({ name }: { name: keyof typeof PATHS }) {
  return <svg {...base}>{PATHS[name]}</svg>;
}
