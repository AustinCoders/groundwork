"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { readPlacement } from "@/lib/placementStore";
import { lastLevel } from "@/lib/storage";

export function PathRedirect({ targets, topic }: { targets: Record<string, string[] | null>; topic?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const topicId = topic ?? (searchParams.get("topic") || "js");
    const levelIds = targets[topicId];

    if (!levelIds) {
      router.replace(topicId in targets ? `/${topicId}` : "/");
      return;
    }

    const levelParam = searchParams.get("level");
    const saved = topicId === "dsa" ? (readPlacement()?.level ?? null) : lastLevel();
    const levelId =
      (levelParam && levelIds.includes(levelParam) && levelParam) ||
      (saved && levelIds.includes(saved) && saved) ||
      "beginner";
    router.replace(`/path/${topicId}/${levelId}`);
  }, [router, searchParams, targets, topic]);

  return null;
}
