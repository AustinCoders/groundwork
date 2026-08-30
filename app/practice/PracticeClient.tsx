"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Shell } from "@/components/Shell";
import { PracticeWorkspace } from "@/components/practice/PracticeWorkspace";
import { practice as allExercisesData } from "@/content/practice";
import { FREE_EXERCISE, type PracticeExercise } from "@/lib/practiceFree";

export interface ChapterLink {
  id: string;
  num: string;
  short: string;
  href: string;
}

export interface PracticeClientProps {
  chapterLinks: Record<string, ChapterLink>;
}

export default function PracticeClient(props: PracticeClientProps) {
  return (
    <Suspense fallback={null}>
      <PracticePageInner {...props} />
    </Suspense>
  );
}

function PracticePageInner({ chapterLinks }: PracticeClientProps) {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const isFree = !id || id === "free";
  const exercise: PracticeExercise | null | undefined = isFree
    ? FREE_EXERCISE
    : allExercisesData.find((e) => e.id === id);

  if (!exercise) {
    return (
      <div className="narrow" style={{ margin: "40px auto", padding: "0 16px" }}>
        <section className="sheet">
          <h2>No such exercise</h2>
          <p className="sub">The link points at an exercise that does not exist.</p>
          <p>
            <Link className="btn" href="/">
              Back to the topics
            </Link>{" "}
            <Link className="btn" href="/practice?id=free">
              Open the playground
            </Link>
          </p>
        </section>
      </div>
    );
  }

  const chapter = exercise.chapter ? (chapterLinks[exercise.chapter] ?? null) : null;
  const allExercises = allExercisesData;
  const index = allExercises.findIndex((e) => e.id === exercise.id);
  const prev = !isFree ? ((allExercises[index - 1] as PracticeExercise | undefined) ?? null) : null;
  const next = !isFree ? ((allExercises[index + 1] as PracticeExercise | undefined) ?? null) : null;

  return (
    <Shell
      skipLabel="Skip to the editor"
      skipHref="#editor"
      playgroundNav={
        <nav className="site-sidenav__section" aria-label="This exercise">
          <Link className="site-navlink" id="back-chapter" href={chapter ? chapter.href : "/"}>
            <span className="site-navlink__icon" aria-hidden="true">
              ←
            </span>
            <span className="site-navlink__name btn__label">{chapter ? `Back to ${chapter.short}` : "Home"}</span>
          </Link>
        </nav>
      }
    >
      <PracticeWorkspace
        key={exercise.id}
        exercise={exercise}
        isFree={isFree}
        chapter={chapter}
        prev={prev}
        next={next}
      />
    </Shell>
  );
}
