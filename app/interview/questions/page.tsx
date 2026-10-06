import type { Metadata } from "next";
import { QuestionBank } from "@/app/interview/questions/QuestionBank";
import { bankQuestions, PARTS } from "@/lib/interviewBook";
import { INTERVIEW_TOTAL_QUESTIONS } from "@/lib/interviewContent";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Interview question bank",
  description:
    "Every question in the interview book in one place: search it, filter it by round, and drill it as flashcards until the shaky ones stick.",
  path: "/interview/questions",
});

export default function Page() {
  return <QuestionBank questions={bankQuestions()} parts={PARTS} totalQuestions={INTERVIEW_TOTAL_QUESTIONS} />;
}
