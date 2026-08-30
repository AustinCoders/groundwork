import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "SQL & Databases — the whole map — notes",
  description:
    "SQL & Databases from the ground up — the relational model, indexes, transactions and scaling, laid out across three levels.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
