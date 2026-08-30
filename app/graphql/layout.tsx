import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "GraphQL — the whole map — notes",
  description: "GraphQL from the ground up — schemas, resolvers and the N+1 problem, laid out across three levels.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
