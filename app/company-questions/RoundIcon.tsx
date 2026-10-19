const PATHS: Record<string, string> = {
  timer: "M12 21a8 8 0 100-16 8 8 0 000 16zM12 9v4l2.5 1.5M9.5 2.5h5",
  phone: "M6 4h3l1.5 4-2 1.5a11 11 0 005 5L15 12.5l4 1.5v3a2 2 0 01-2 2A13 13 0 014 6a2 2 0 012-2z",
  braces:
    "M8 4C6 4 5 5 5 7v2c0 1.5-.7 2.5-2 3 1.3.5 2 1.5 2 3v2c0 2 1 3 3 3M16 4c2 0 3 1 3 3v2c0 1.5.7 2.5 2 3-1.3.5-2 1.5-2 3v2c0 2-1 3-3 3",
  blocks: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM15.5 13l4 3.5-4 3.5z",
  diagram: "M4 5h6v4H4zM14 15h6v4h-6zM14 5h6v4h-6zM4 15h6v4H4zM10 7h4M7 9v6M17 9v6M10 17h4",
  chip: "M8 8h8v8H8zM4 10h4M4 14h4M16 10h4M16 14h4M10 4v4M14 4v4M10 16v4M14 16v4",
  database:
    "M12 9c4.4 0 8-1.3 8-3s-3.6-3-8-3-8 1.3-8 3 3.6 3 8 3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
  wrench: "M14.5 6.5a4 4 0 00-5 5L4 17l3 3 5.5-5.5a4 4 0 005-5l-2.5 2.5-2.5-.5-.5-2.5z",
  chat: "M4 5h16v11H9l-5 4zM8 9h8M8 12h5",
  handshake: "M3 12l4-4 4 3 3-3 4 4M7 8l-4 4 5 5 3-1 2 2 4-4M14 8l4 4",
  flag: "M5 21V4M5 5h12l-2 4 2 4H5",
  package: "M12 3l8 4v10l-8 4-8-4V7zM4 7l8 4 8-4M12 11v10",
  layers: "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 17.5l9 5 9-5",
};

export function RoundIcon({ name, size = 22 }: { name: string; size?: number }) {
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
      <path d={PATHS[name] ?? PATHS.layers} />
    </svg>
  );
}
