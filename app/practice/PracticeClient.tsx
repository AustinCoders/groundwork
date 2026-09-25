"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { Shell } from "@/components/Shell";
import { BackButton } from "@/components/practice/BackButton";
import { PracticeWorkspace } from "@/components/practice/PracticeWorkspace";
import { FREE_EXERCISE, type PracticeExercise } from "@/lib/practiceFree";
import { problemHref } from "@/lib/problemHref";

export interface ChapterLink {
  id: string;
  num: string;
  short: string;
  href: string;
}

export interface NeighbourLink {
  id: string;
  title: string;
}

export interface PracticeClientProps {
  exercise?: PracticeExercise;
  chapter?: ChapterLink | null;
  prev?: NeighbourLink | null;
  next?: NeighbourLink | null;
}

export default function PracticeClient({ exercise, chapter = null, prev = null, next = null }: PracticeClientProps) {
  if (exercise) return <PracticeBody exercise={exercise} isFree={false} chapter={chapter} prev={prev} next={next} />;
  return (
    <Suspense fallback={null}>
      <PracticeFromQuery />
    </Suspense>
  );
}

function PracticeFromQuery() {
  const router = useRouter();
  const id = useSearchParams().get("id");
  const problem = id && id !== "free" ? id : null;

  useEffect(() => {
    if (problem) router.replace(problemHref(problem));
  }, [problem, router]);

  if (problem)
    return (
      <p className="sub" style={{ margin: "40px auto", textAlign: "center" }}>
        Opening the problem…
      </p>
    );
  return <PracticeBody exercise={FREE_EXERCISE} isFree chapter={null} prev={null} next={null} />;
}

function PracticeBody({
  exercise,
  isFree,
  chapter,
  prev,
  next,
}: {
  exercise: PracticeExercise;
  isFree: boolean;
  chapter: ChapterLink | null;
  prev: NeighbourLink | null;
  next: NeighbourLink | null;
}) {
  return (
    <Shell
      skipLabel="Skip to the editor"
      skipHref="#editor"
      variant="focused"
      workspace
      contextNav={
        <nav className="site-sidenav__section" aria-label="This exercise">
          <BackButton
            variant="rail"
            fallbackHref={chapter ? chapter.href : "/"}
            fallbackLabel={chapter ? `Back to ${chapter.short}` : "Home"}
          />
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
