import type { Metadata } from "next";
import PracticeClient, { type ChapterLink } from "./PracticeClient";
import { chapterMetas, exercise as findExercise, notesHref, topics } from "@/lib/content";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const isFree = !params.id || params.id === "free";
  if (isFree) return { title: "Playground — practice" };
  const exercise = findExercise(params.id!);
  if (!exercise) return {};
  return { title: `${exercise.title} — practice` };
}

export default function PracticePage() {
  // Exercises name a chapter id; resolve those to real routes here so the
  // editor page never imports chapter bodies to render one back-link.
  const chapterLinks: Record<string, ChapterLink> = {};
  topics().forEach((t) => {
    if (!t.levels) return;
    const base = notesHref(t.id);
    chapterMetas(t.id).forEach((ch) => {
      chapterLinks[ch.id] = { id: ch.id, num: ch.num, short: ch.short, href: `${base}/${ch.id}` };
    });
  });

  return <PracticeClient chapterLinks={chapterLinks} />;
}
