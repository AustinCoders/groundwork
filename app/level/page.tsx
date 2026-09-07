"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

// Old shape: /level?topic=js. Kept as a client redirect so bookmarks and any
// stale link still land, without making this a server render.
function LevelRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const topic = searchParams.get("topic") || "js";
    router.replace(`/level/${encodeURIComponent(topic)}`);
  }, [router, searchParams]);

  return null;
}

export default function LevelQueryPage() {
  return (
    <Suspense fallback={null}>
      <LevelRedirect />
    </Suspense>
  );
}
