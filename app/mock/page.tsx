import type { Metadata } from "next";
import { MockView } from "@/app/mock/MockView";
import { mockQuestions } from "@/lib/mockQuestions";

export const metadata: Metadata = {
  title: "Mock interview — timed questions",
  description:
    "Random questions from the JavaScript and React interview banks, on a timer, with a self-scored summary.",
  alternates: { canonical: "/mock" },
};

export default function MockPage() {
  return <MockView questions={mockQuestions()} />;
}
