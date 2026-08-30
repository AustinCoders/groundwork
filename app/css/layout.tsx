import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "CSS — the whole map — notes",
  description:
    "CSS from the ground up — the cascade, box model, flexbox/grid and modern layout, laid out across three levels.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
