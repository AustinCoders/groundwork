const PATHS = {
  reset: <path d="M4 4v6h6M4.6 15a8 8 0 101.9-8.3L4 10" />,
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a1 1 0 011-1h9" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7" />,
  cross: <path d="M6 6l12 12M18 6L6 18" />,
  expand: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
  command: <path d="M9 6a3 3 0 10-3 3h12a3 3 0 10-3-3v12a3 3 0 103-3H6a3 3 0 103 3z" />,
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  more: <path d="M5 12h.01M12 12h.01M19 12h.01" />,
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
      style={{ margin: 0, flex: "none" }}
    >
      {PATHS[name]}
    </svg>
  );
}
