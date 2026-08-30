import { HomeView } from "@/app/HomeView";
import { topics } from "@/lib/topics";
import { siteStats, topicStats } from "@/lib/topicStats";

export default function HomePage() {
  return <HomeView topicsList={topics()} stats={siteStats()} perTopic={topicStats()} />;
}
