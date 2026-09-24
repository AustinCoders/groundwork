import type { Metadata } from "next";
import { HomeView } from "@/app/HomeView";
import { INTERVIEW_TOTAL_QUESTIONS, INTERVIEW_TOTAL_ROUNDS } from "@/lib/interviewContent";
import { topicsNav } from "@/lib/topics";
import { siteStats, topicStats } from "@/lib/topicStats";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function HomePage() {
  return (
    <HomeView
      topicsList={topicsNav()}
      stats={siteStats()}
      perTopic={topicStats()}
      interviewStats={{ rounds: INTERVIEW_TOTAL_ROUNDS, questions: INTERVIEW_TOTAL_QUESTIONS }}
    />
  );
}
