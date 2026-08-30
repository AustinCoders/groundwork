import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Redis — the whole map — notes",
  description:
    "Redis from the ground up — data types, caching, and the pub/sub and queue patterns it powers, laid out across three levels.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
