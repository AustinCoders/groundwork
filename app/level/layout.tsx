import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";
export const metadata: Metadata = {
  title: `Pick your level — ${SITE_NAME}`,
  description: "Where are you with this topic? Pick a level and get a reading path.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
