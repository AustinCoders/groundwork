"use client";

import { createContext, useContext } from "react";
import type { LevelId, TopicNav } from "@/content/types";

export interface GuideNav {
  id: string;
  name: string;
  mark: string;
  accent: string;
  href: string;
  total: number;
  groups: { title: string; chapters: { id: string; num: string; title: string; href: string }[] }[];
}

const TopicsNavContext = createContext<TopicNav[]>([]);
const GuidesNavContext = createContext<GuideNav[]>([]);

export function TopicsNavProvider({
  topics,
  guides = [],
  children,
}: {
  topics: TopicNav[];
  guides?: GuideNav[];
  children: React.ReactNode;
}) {
  return (
    <TopicsNavContext.Provider value={topics}>
      <GuidesNavContext.Provider value={guides}>{children}</GuidesNavContext.Provider>
    </TopicsNavContext.Provider>
  );
}

export function useTopicsNav(): TopicNav[] {
  return useContext(TopicsNavContext);
}

export function useGuidesNav(): GuideNav[] {
  return useContext(GuidesNavContext);
}

function fileHref(notes: string | null): string {
  return `/${(notes || "notes.html").replace(/\.html$/, "")}`;
}

export function navHref(t: TopicNav, savedLevel?: string | null): string {
  if (t.status !== "ready" || t.written === 0) return `/${t.id}`;
  if (!t.levelIds) return fileHref(t.notes);

  const known = savedLevel && t.levelIds.indexOf(savedLevel as LevelId) !== -1;
  return known ? `/path/${t.id}/${savedLevel}` : `/level/${t.id}`;
}
