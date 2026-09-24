import type { Metadata } from "next";
import { MockApp } from "@/app/mock/MockApp";
import { mockCatalog } from "@/lib/mock/bank";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Mock interview",
  description:
    "A full interview loop for your role, level and kind of company — screening, coding graded by real tests, the deep dives, system design, behaviour and the number — with follow-ups, a rubric and a hiring-committee debrief.",
  path: "/mock",
});

export default function MockPage() {
  return <MockApp catalog={mockCatalog()} />;
}
