export type SourceKind = "spec" | "docs" | "paper" | "book" | "article" | "talk" | "code";

export interface ChapterSource {
  label: string;
  url: string;
  kind: SourceKind;
  backs: string;
}

export type TopicSources = Record<string, ChapterSource[]>;

export const SOURCE_KIND_NAME: Record<SourceKind, string> = {
  spec: "Specification",
  docs: "Official docs",
  paper: "Paper",
  book: "Book",
  article: "Article",
  talk: "Talk",
  code: "Source code",
};

export const SOURCES_CHECKED = "November 2026";
