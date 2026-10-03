import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Your reading path",
  description:
    "The order to read a topic in, at your level, with the practice for each chapter and progress you can tick off.",
  path: "/path",
  index: false,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
