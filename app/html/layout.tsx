import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "HTML — the whole map — notes",
  description:
    "HTML from the ground up — semantics, forms, accessibility and the parser, laid out across three levels.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
