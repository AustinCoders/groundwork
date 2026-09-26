import type { Metadata } from "next";
import { topicCoverMetadata } from "@/components/reader/topicPages";
import { InterviewLanding } from "@/app/interview/InterviewLanding";
import { INTERVIEW_TOTAL_QUESTIONS } from "@/lib/interviewContent";
import { bankQuestions, bookRounds, PARTS, roundCards } from "@/lib/interviewBook";

export function generateMetadata(): Metadata {
  return topicCoverMetadata("interview");
}

export default function Page() {
  const rounds = bookRounds();
  const bank = bankQuestions();
  return (
    <InterviewLanding
      rounds={roundCards()}
      parts={PARTS}
      daily={bank
        .filter((q) => q.test)
        .map((q) => ({
          id: q.id,
          q: q.q,
          test: q.test,
          roundId: q.roundId,
          roundCode: q.roundCode,
          roundTitle: q.roundTitle,
        }))}
      totals={{
        rounds: rounds.length,
        questions: INTERVIEW_TOTAL_QUESTIONS,
        followUps: rounds.reduce((n, r) => n + r.counts.followUps, 0),
        traps: rounds.reduce((n, r) => n + r.counts.traps, 0),
      }}
    />
  );
}
