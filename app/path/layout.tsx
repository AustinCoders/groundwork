import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";
export const metadata: Metadata = {
  title: `Your path — ${SITE_NAME}`,
  description: "Your reading path: the chapters that matter at your level, in order, with practice.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
