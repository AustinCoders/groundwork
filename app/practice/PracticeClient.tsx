"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { Shell } from "@/components/Shell";
import { BackButton } from "@/components/practice/BackButton";
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
  exerciseId?: string;
}

export default function PracticeClient({ exerciseId, ...rest }: PracticeClientProps) {
  if (exerciseId) return <PracticeBody id={exerciseId} fromQuery={false} {...rest} />;
  return (
    <Suspense fallback={null}>
      <PracticeFromQuery {...rest} />
    </Suspense>
  );
}

function PracticeFromQuery(props: Omit<PracticeClientProps, "exerciseId">) {
  const searchParams = useSearchParams();
  return <PracticeBody id={searchParams.get("id")} fromQuery {...props} />;
}

function PracticeBody({
  id,
  fromQuery,
  chapterLinks,
}: {
  id: string | null;
  fromQuery: boolean;
  chapterLinks: Record<string, ChapterLink>;
}) {
  const isFree = !id || id === "free";
  const exercise: PracticeExercise | null | undefined = isFree
    ? FREE_EXERCISE
    : allExercisesData.find((e) => e.id === id);

  useEffect(() => {
    if (!fromQuery) return;
    document.title = exercise && !isFree ? `${exercise.title} — practice` : "Playground — practice";
  }, [exercise, isFree, fromQuery]);

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
