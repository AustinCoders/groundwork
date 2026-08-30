import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Git — from first commit to reflog rescue",
  description:
    "Git from first commit to reflog rescue — the mental model, the everyday commands, and how to undo anything without panic.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
