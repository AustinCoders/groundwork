import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "React — the whole map — notes",
  description:
    "React from the ground up — components, hooks, rendering and the server boundary, laid out across three levels.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
