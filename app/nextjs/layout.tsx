import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Next.js — the whole map — notes",
  description:
    "Next.js from the ground up — the App Router, rendering strategies and the server/client boundary, laid out across three levels.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
