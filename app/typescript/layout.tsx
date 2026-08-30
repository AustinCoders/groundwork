import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TypeScript — the whole map — notes",
  description:
    "TypeScript from the ground up — types, generics, narrowing and the compiler, laid out across three levels.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
