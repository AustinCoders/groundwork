import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Node.js — the whole map — notes",
  description:
    "Node.js from the ground up — the runtime, modules, streams and the event loop, laid out across three levels.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
