"use client";

import { useEffect } from "react";
import { progress } from "@/lib/storage";
import { useProgressValue } from "@/lib/hooks";

/**
 * The checkbox is client state, but the chapter <section> around it is
 * server-rendered — so the "read" class is applied to that section from
 * here rather than through a prop.
 */
export function ChapterDone({ chapterId }: { chapterId: string }) {
  const done = useProgressValue(() => progress.isChapterDone(chapterId), false);

  useEffect(() => {
    document.getElementById(chapterId)?.classList.toggle("is-done", done);
  }, [chapterId, done]);

  return (
    <label className="check chapter__done">
      <input type="checkbox" checked={done} onChange={(e) => progress.setChapterDone(chapterId, e.target.checked)} />{" "}
      mark as read
    </label>
  );
}
