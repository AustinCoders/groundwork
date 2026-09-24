import type { Metadata } from "next";
import { MockView } from "@/app/mock/MockView";
import { mockQuestions } from "@/lib/mockQuestions";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Mock interview",
  description:
    "Random questions from the JavaScript and React interview banks, on a timer, with a self-scored summary at the end.",
  path: "/mock",
});

export default function MockPage() {
  return <MockView questions={mockQuestions()} />;
}
