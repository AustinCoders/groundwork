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

export type ShellTone = "green" | "orange" | "purple" | "blue" | "teal" | "red";

export type StageStatus = "yours" | "next" | "started" | "fresh" | "done";

export interface ShellGroup {
  id: string;
  name: string;
  promise: string | null;
  tone: ShellTone;
  status: StageStatus;
  peek: string | null;
  chapters: ShellChapter[];
  written: number;
  read: number;
  yours: boolean;
  open: boolean;
}

export interface ShellAction {
  label: string;
  href: string;
  id?: string;
  onClick?: () => void;
}

export interface ShellTeaserStop {
  id: string;
  name: string;
  promise: string | null;
  tone: ShellTone;
}

export interface ShellTeaser {
  caption: string;
  stops: ShellTeaserStop[];
}

export interface ShellUpNext {
  code: string;
  title: string;
  meta: string;
}

export interface ShellStanding {
  kicker: string;
  name: string | null;
  tone: ShellTone;
  read: number;
  total: number;
  summary: string;
  upNext: ShellUpNext | null;
  recheck: ShellAction | null;
  prompt: { text: string; link: ShellAction } | null;
}

export interface ShellHero {
  eyebrow: string | null;
  title: ReactNode;
  lead: string | null;
  status: string | null;
  note: string | null;
  action: ShellAction | null;
  links: ShellAction[];
  teaser: ShellTeaser | null;
  standing: ShellStanding | null;
  choice: ReactNode;
}

export type ToolGlyph = "pencil" | "loop" | "chat" | "note";

export interface ShellTool {
  id: string;
  label: string;
  href: string;
  count: string | null;
  glyph: ToolGlyph;
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
  pathHint: string | null;
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
  promise?: string | null;
}
