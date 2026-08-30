import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Docker — the whole map — notes",
  description:
    "Docker from the ground up — images, containers, Compose and the registry/CI workflow, laid out across three levels.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
