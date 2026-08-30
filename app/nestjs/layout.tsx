import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Nest.js — the whole map — notes",
  description:
    "Nest.js from the ground up — dependency injection, modules, guards and the request lifecycle, laid out across three levels.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
