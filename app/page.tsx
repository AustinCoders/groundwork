import { HomeView } from "@/app/HomeView";
import { INTERVIEW_TOTAL_QUESTIONS, INTERVIEW_TOTAL_ROUNDS } from "@/lib/interviewContent";
import { topics } from "@/lib/topics";
import { siteStats, topicStats } from "@/lib/topicStats";

export default function HomePage() {
  return (
    <HomeView
      topicsList={topics()}
      stats={siteStats()}
      perTopic={topicStats()}
      interviewStats={{ rounds: INTERVIEW_TOTAL_ROUNDS, questions: INTERVIEW_TOTAL_QUESTIONS }}
    />
  );
}
