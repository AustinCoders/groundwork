"use client";

import { createContext, useContext } from "react";

/**
 * Which topics actually have written chapters, computed once on the server
 * (lib/topicStats already walks chapter bodies for the home page) and handed
 * down as plain ids — so client components like Shell can tell "ready to
 * read" apart from "route exists but it's still an outline" without
 * importing chapter content themselves.
 */
const TopicsReadyContext = createContext<Set<string> | null>(null);

export function TopicsReadyProvider({ ids, children }: { ids: string[]; children: React.ReactNode }) {
  return <TopicsReadyContext.Provider value={new Set(ids)}>{children}</TopicsReadyContext.Provider>;
}

export function useReadyTopicIds(): Set<string> | null {
  return useContext(TopicsReadyContext);
}
