export type NavIconName = "topics" | "practice" | "how" | "paths" | "book" | "faq";

const PATHS: Record<NavIconName, string[]> = {
  topics: [
    "M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5z",
    "M20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5z",
  ],
  practice: ["M8 8 4 12l4 4", "M16 8l4 4-4 4", "M13.5 5 10.5 19"],
  how: ["M12 3v3", "M12 18v3", "M3 12h3", "M18 12h3", "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"],
  paths: ["M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z", "M18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z", "M6 15V12a4 4 0 0 1 4-4h6"],
  book: ["M7 4h10a2 2 0 0 1 2 2v14l-7-3-7 3V6a2 2 0 0 1 2-2z", "M9 9h6", "M9 12h4"],
  faq: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6", "M12 17h.01"],
};

export function NavIcon({ name }: { name: NavIconName }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
