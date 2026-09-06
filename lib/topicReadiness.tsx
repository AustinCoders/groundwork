"use client";

import { createContext, useContext } from "react";

const TopicsReadyContext = createContext<Set<string> | null>(null);

export function TopicsReadyProvider({ ids, children }: { ids: string[]; children: React.ReactNode }) {
  return <TopicsReadyContext.Provider value={new Set(ids)}>{children}</TopicsReadyContext.Provider>;
}

export function useReadyTopicIds(): Set<string> | null {
  return useContext(TopicsReadyContext);
}
