import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Kubernetes — the whole map — notes",
  description:
    "Kubernetes from the ground up — Pods, Deployments, Services and the control plane, laid out across three levels.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
