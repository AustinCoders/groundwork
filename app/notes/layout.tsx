import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "JavaScript — the whole map — notes",
  description:
    "JavaScript from the ground up — 23 sections across three levels, from how the engine runs code to security and testing.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
