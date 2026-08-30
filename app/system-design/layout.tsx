import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "System Design — the whole map — notes",
  description:
    "System Design from the ground up — load balancers, caches, queues and the tradeoff thinking behind real interviews, laid out across three levels.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
