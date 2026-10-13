import type { ReactNode } from "react";

export type MarkKind = "todo" | "read" | "checked" | "unchecked" | "skipped" | "soon";

export interface ShellMark {
  kind: MarkKind;
  label: string;
  word: string | null;
}

export interface ShellChapter {
  id: string;
  code: string;
  title: string;
  href: string;
  minutes: number;
  exercises: number;
  written: boolean;
  mark: ShellMark;
  tag: string | null;
  next: boolean;
}

export interface ShellGroup {
  id: string;
  name: string;
  chapters: ShellChapter[];
  written: number;
  read: number;
  yours: boolean;
  open: boolean;
}

export interface ShellAction {
  label: string;
  href: string;
}

export interface ShellHero {
  title: string;
  lead: string | null;
  status: string | null;
  action: ShellAction | null;
  choice: ReactNode;
}

export interface ShellTool {
  id: string;
  label: string;
  href: string;
  count: string | null;
}

export interface ShellDetails {
  id: string;
  title: string;
  hint: string | null;
  children: ReactNode;
}

export interface ShellNotes {
  id: string;
  title: string;
  items: string[];
}

export interface TopicShellProps {
  topic: { name: string };
  ready: boolean;
  hero: ShellHero;
  pathTitle: string;
  pathCount: string;
  groups: ShellGroup[];
  tools: ShellTool[];
  details: ShellDetails | null;
  notes: ShellNotes | null;
  foot: ReactNode;
}

export interface ShellCard {
  id: string;
  num: string;
  title: string;
  short?: string;
  levels: string[];
  minutes: number;
  exercises: number;
  ready: boolean;
}

export interface ShellPart {
  level: string;
  title: string;
}
