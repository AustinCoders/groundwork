import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Cloud & DevOps — the whole map — notes",
  description:
    "Cloud and DevOps from the ground up — compute, IAM, IaC and the pipeline that ships code, laid out across three levels.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
