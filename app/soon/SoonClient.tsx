"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { Crumbs } from "@/components/Crumbs";
import { Shell } from "@/components/Shell";
import { topic as findTopic } from "@/lib/topics";
import { escapeHtml } from "@/lib/format";
import { useMounted } from "@/lib/hooks";

export default function SoonClient() {
  return (
    <Suspense fallback={null}>
      <SoonPageInner />
    </Suspense>
  );
}

function SoonPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mounted = useMounted();

  const topicId = searchParams.get("topic") || "";
  const topic = findTopic(topicId);

  useEffect(() => {
    if (!mounted) return;
    if (!topic) {
      router.replace("/");
      return;
    }
    if (topic.status === "ready") {
      router.replace(`/level?topic=${topic.id}`);
    }
  }, [mounted, topic, router]);

  if (!mounted || !topic || topic.status === "ready") return null;

  const planned = topic.planned || [];

  return (
    <Shell skipLabel="Skip to the content">
      <Crumbs items={[{ label: "All topics", href: "/" }, { label: topic.name }]} />

      <section className="sheet hero soon-hero">
        <div className="soon-stamp" aria-hidden="true">
          not written yet
        </div>

        <svg className="soon-doodle" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 3 C7 3 4 6.2 4 10 c0 3 2 4.6 4 5.8 .8.5 1.2 1 1.2 2.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="9.2" cy="21" r="1.1" fill="currentColor" />
        </svg>

        <div className="soon-hero__main">
          <div className="soon-head">
            <span
              className="topic__mark"
              id="soon-mark"
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: escapeHtml(topic.mark) }}
            />
            <div>
              <h1 id="soon-title">{topic.name}</h1>
              <p className="topic__tagline" id="soon-tagline">
                {topic.tagline}
              </p>
            </div>
          </div>

          <p className="hero__lead" id="soon-blurb">
            {topic.blurb}
          </p>

          <div className="hero__actions">
            <Link className="btn btn--primary btn--big" href="/level?topic=js">
              See the JavaScript path →
            </Link>
            <Link className="btn btn--big" href="/">
              Back to all topics
            </Link>
          </div>
        </div>

        <div className="sticky mint soon-hero__aside">
          <span className="ttl">Meanwhile</span>
          JavaScript is the one topic with a full syllabus mapped out — beginner through advanced, 23 sections. A few
          are already written, and the exercises that exist run right here in the browser. Most of what makes React,
          Node or Nest confusing traces back to JavaScript&apos;s scope, prototypes and async sections anyway.
        </div>
      </section>

      {planned.length > 0 && (
        <section className="sheet" id="plan-sheet">
          <h2>What&apos;s planned for this one</h2>
          <p className="sub">The outline exists — the writing doesn&apos;t. This is the order it will be written in.</p>
          <ol className="plan" id="plan-list">
            {planned.map((item, i) => (
              <li key={i}>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <footer className="site-foot">
        <Link href="/">All topics</Link>
        <Link href="/notes">JS notes</Link>
      </footer>
    </Shell>
  );
}
