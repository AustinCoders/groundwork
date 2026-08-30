import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `Coming soon — ${SITE_NAME}`,
  description: "These notes are still being written.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
