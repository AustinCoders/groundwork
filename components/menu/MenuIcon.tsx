const PATHS = {
  problems: "M9 4h6v3H9zM6 5.5H5v15h14v-15h-1M9 12h6M9 16h4",
  playground: "M5 4h14v16H5zM9 9l3 3-3 3M13.5 15H16",
  mock: "M12 21a8 8 0 100-16 8 8 0 000 16zM12 9v4l2.5 1.5M9.5 2.5h5",
  whiteboard: "M3.5 5h17v11h-17zM8 20l2-4M16 20l-2-4M7 11l3-2.5 2.5 2 4-3.5",
  review: "M4 12a8 8 0 0113.7-5.6L20 8.5M20 4v4.5h-4.5M20 12a8 8 0 01-13.7 5.6L4 15.5M4 20v-4.5h4.5",
  progress: "M5 20V11M12 20V5M19 20v-6",
  home: "M4 11l8-7 8 7M6 9.5V20h12V9.5M10 20v-5h4v5",
  interview: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 16a4 4 0 100-8 4 4 0 000 8zM12 12h.01",
  architecture: "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 17.5l9 5 9-5",
  narrator: "M4 9h4l5-4v14l-5-4H4zM16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12",
  shortcuts: "M3 7h18v10H3zM7 11h.01M11 11h.01M15 11h.01M8 14.5h8",
  languages: "M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14",
  web: "M12 21a9 9 0 100-18 9 9 0 000 18zM3 12h18M12 3c2.5 2.6 3.7 5.6 3.7 9S14.5 18.4 12 21c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3z",
  backend: "M4 4.5h16v6H4zM4 13.5h16v6H4zM8 7.5h.01M8 16.5h.01",
  data: "M12 9c4.4 0 8-1.3 8-3s-3.6-3-8-3-8 1.3-8 3 3.6 3 8 3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
  cs: "M8 8h8v8H8zM4 10h4M4 14h4M16 10h4M16 14h4M10 4v4M14 4v4M10 16v4M14 16v4",
  devops: "M7 18a4 4 0 01-.6-7.95A6 6 0 0118 9.5a4.2 4.2 0 01-.5 8.5z",
  engineering: "M14.5 6.5a4 4 0 00-5 5L4 17l3 3 5.5-5.5a4 4 0 005-5l-2.5 2.5-2.5-.5-.5-2.5z",
  ai: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM18 16l.8 2.2L21 19l-2.2.8L18 22l-.8-2.2L15 19l2.2-.8z",
  search: "M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-4-4",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8zM4.5 20c.8-3.6 3.8-5.5 7.5-5.5s6.7 1.9 7.5 5.5",
  print: "M7 9V3h10v6M7 17H5a2 2 0 01-2-2v-4a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2h-2M7 14h10v7H7z",
} as const;

export type MenuIconName = keyof typeof PATHS;

export function MenuIcon({ name, size = 18 }: { name: MenuIconName; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ margin: 0 }}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
