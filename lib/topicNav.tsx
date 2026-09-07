"use client";

import { createContext, useContext } from "react";
import type { LevelId, TopicNav } from "@/content/types";

const TopicsNavContext = createContext<TopicNav[]>([]);

export function TopicsNavProvider({ topics, children }: { topics: TopicNav[]; children: React.ReactNode }) {
  return <TopicsNavContext.Provider value={topics}>{children}</TopicsNavContext.Provider>;
}

export function useTopicsNav(): TopicNav[] {
  return useContext(TopicsNavContext);
}

export function findNav(list: TopicNav[], id?: string | null): TopicNav | null {
  if (!id) return null;
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) return list[i];
  }
  return null;
}

function fileHref(notes: string | null): string {
  return `/${(notes || "notes.html").replace(/\.html$/, "")}`;
}

export function navNotesHref(list: TopicNav[], topicId?: string | null): string {
  return fileHref(findNav(list, topicId)?.notes ?? null);
}

export function navHref(t: TopicNav, savedLevel?: string | null): string {
  if (t.status !== "ready") return `/soon?topic=${t.id}`;
  if (!t.levelIds) return fileHref(t.notes);

  const known = savedLevel && t.levelIds.indexOf(savedLevel as LevelId) !== -1;
  return known ? `/path?topic=${t.id}&level=${savedLevel}` : `/level/${t.id}`;
}

export function topicOfDay<T>(candidates: T[]): T | null {
  if (!candidates.length) return null;
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
  return candidates[dayOfYear % candidates.length];
}
