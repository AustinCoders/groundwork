import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Testing — the whole map — notes",
  description:
    "Testing from the ground up — unit, integration, e2e and the discipline of trust, laid out across three levels.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
