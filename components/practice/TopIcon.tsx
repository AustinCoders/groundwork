const PATHS = {
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  list: <path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" />,
  prev: <path d="M15 18l-6-6 6-6" />,
  next: <path d="M9 18l6-6-6-6" />,
  live: <path d="M13 3L5 14h6l-1 7 8-11h-6z" />,
  link: (
    <path d="M10 14a4.5 4.5 0 006.4 0l3-3a4.5 4.5 0 00-6.4-6.4l-1.2 1.2M14 10a4.5 4.5 0 00-6.4 0l-3 3a4.5 4.5 0 006.4 6.4l1.2-1.2" />
  ),
  debug: (
    <>
      <rect x="7" y="8" width="10" height="12" rx="5" />
      <path d="M12 12v4M9 5l1.5 3M15 5l-1.5 3M4 13h3M17 13h3M5 19l2.5-1.5M19 19l-2.5-1.5M5 8l2.5 1.5M19 8l-2.5 1.5" />
    </>
  ),
};

export type TopIconName = keyof typeof PATHS;

export function TopIcon({ name, size = 18 }: { name: TopIconName; size?: number }) {
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
    >
      {PATHS[name]}
    </svg>
  );
}
