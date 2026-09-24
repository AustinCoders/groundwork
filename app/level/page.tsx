"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

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
