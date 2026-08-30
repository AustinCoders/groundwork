import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Web Security — the whole map — notes",
  description:
    "Web security from the ground up — OWASP, injection, auth and the attacker's view, laid out across three levels.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
