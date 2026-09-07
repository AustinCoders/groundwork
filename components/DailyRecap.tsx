"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { plural } from "@/lib/format";
import { useLastLevel } from "@/lib/hooks";
import { activity, dayKey, store } from "@/lib/storage";
import { navHref, topicOfDay } from "@/lib/topicNav";
import type { TopicNav } from "@/content/types";

const RECAP_SHOWN_KEY = "jsnotes:recap-shown";

export function DailyRecap({ topics }: { topics: TopicNav[] }) {
  const [yesterdayCount, setYesterdayCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const savedLevel = useLastLevel();
  const topic = topicOfDay(topics);

  useEffect(() => {
    const today = dayKey();
    if (store.get<string | null>(RECAP_SHOWN_KEY, null) === today) return;

    const yesterday = dayKey(Date.now() - 24 * 60 * 60 * 1000);
    const count = activity.all()[yesterday] || 0;
    if (count === 0) return;

    const kick = setTimeout(() => {
      setYesterdayCount(count);
      setVisible(true);
    }, 900);
    return () => clearTimeout(kick);
  }, []);

  function dismiss() {
    setVisible(false);
    store.set(RECAP_SHOWN_KEY, dayKey());
  }

  if (!visible || !topic) return null;

  const href = navHref(topic, savedLevel);

  return (
    <div className="daily-recap" role="status">
      <button className="daily-recap__close" type="button" onClick={dismiss} aria-label="Dismiss">
        ✕
      </button>
      <p className="daily-recap__yesterday">🔥 Yesterday you knocked out {plural(yesterdayCount, "thing")}.</p>
      <p className="daily-recap__today">
        Today, try{" "}
        <Link href={href} onClick={dismiss} prefetch={false}>
          <span dangerouslySetInnerHTML={{ __html: topic.name }} />
        </Link>
      </p>
    </div>
  );
}
