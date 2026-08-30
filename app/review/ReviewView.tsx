"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Shell } from "@/components/Shell";
import { Crumbs } from "@/components/Crumbs";
import { progress } from "@/lib/storage";
import { useMounted, useProgressValue } from "@/lib/hooks";
import { plural } from "@/lib/format";

export interface ReviewChapter {
  id: string;
  num: string;
  short: string;
  title: string;
  subtitle: string;
  topicId: string;
  topicName: string;
  href: string;
}

export function ReviewView({ chapters }: { chapters: ReviewChapter[] }) {
  const mounted = useMounted();
  const ids = useMemo(() => chapters.map((c) => c.id), [chapters]);

  // A joined string rather than an array: useSyncExternalStore compares
  // snapshots with Object.is, so a fresh array every read would loop.
  const dueKey = useProgressValue(() => progress.dueForReview(ids).join(","), "");
  const doneCount = useProgressValue(() => progress.countDone(chapters), 0);

  const due = useMemo(() => {
    if (!dueKey) return [];
    const order = dueKey.split(",");
    return order.map((id) => chapters.find((c) => c.id === id)).filter((c): c is ReviewChapter => Boolean(c));
  }, [dueKey, chapters]);

  if (!mounted) return null;

  return (
    <Shell skipLabel="Skip to the review list" progressChapters={chapters}>
      <Crumbs items={[{ label: "All topics", href: "/" }, { label: "Review" }]} />

      <section className="sheet hero">
        <span className="hero__kicker">spaced repetition</span>
        <h1>What to read again</h1>
        <p className="hero__lead">
          A chapter comes back 3 days after you read it, then a week, then three weeks, then two months, then six.
          Recognition fades quietly — this is the part that turns 60 chapters of reading into something you can still
          recall in an interview.
        </p>
        <div className="cover__meta">
          <span className="chip">{plural(doneCount, "chapter")} read</span>
          <span className="chip">{due.length} due today</span>
        </div>
      </section>

      {due.length === 0 ? (
        <section className="sheet">
          <h2>Nothing due</h2>
          <p className="sub">
            {doneCount === 0
              ? "Tick a chapter as read and it will start showing up here."
              : "Everything you've read is still fresh. Come back in a few days."}
          </p>
        </section>
      ) : (
        <>
          <h2 className="section-title">Due now</h2>
          <p className="section-note">Skim it, then mark it reviewed — that pushes it to the next, longer gap.</p>
          <ol className="steps">
            {due.map((ch) => (
              <li className="step" key={ch.id}>
                <span className="step__num" aria-hidden="true">
                  {ch.num}
                </span>
                <div>
                  <span className="step__title">{ch.title}</span>
                  <p className="step__sub">{ch.subtitle}</p>
                  <div className="step__meta">
                    <span className="tag">{ch.topicName}</span>
                  </div>
                  <div className="step__actions">
                    <Link className="btn" href={ch.href}>
                      Read it again
                    </Link>
                    <button className="btn btn--primary" type="button" onClick={() => progress.markReviewed(ch.id)}>
                      ✓ Reviewed
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </>
      )}
    </Shell>
  );
}
