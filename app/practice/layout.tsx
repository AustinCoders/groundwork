import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";
export const metadata: Metadata = {
  title: `Practice — ${SITE_NAME}`,
  description: "Write JavaScript, run it in the browser, and check it against real tests.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
