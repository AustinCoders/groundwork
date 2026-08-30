import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "DSA in JS — the whole map — notes",
  description:
    "DSA in JS from the ground up — every classic interview pattern, from two pointers to segment trees, plus interview strategy.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
