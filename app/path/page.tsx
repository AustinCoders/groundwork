"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { lastLevel } from "@/lib/storage";
import { level as findLevel, topic as findTopic } from "@/lib/topics";
import { topicStats } from "@/lib/topicStats";

function PathRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const topicId = searchParams.get("topic") || "js";
    const topic = findTopic(topicId);

    if (!topic || !topic.levels || topic.status !== "ready" || topicStats()[topic.id]?.written === 0) {
      router.replace(topic ? `/${topic.id}` : "/");
      return;
    }

    const levelParam = searchParams.get("level");
    const saved = lastLevel();
    const levelId =
      (levelParam && findLevel(levelParam, topic.id) && levelParam) ||
      (saved && findLevel(saved, topic.id) && saved) ||
      "beginner";
    router.replace(`/path/${topic.id}/${levelId}`);
  }, [router, searchParams]);

  return null;
}

export default function PathPage() {
  return (
    <Suspense fallback={null}>
      <PathRedirect />
    </Suspense>
  );
}
