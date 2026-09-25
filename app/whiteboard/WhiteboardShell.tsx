"use client";

import dynamic from "next/dynamic";
import { Shell } from "@/components/Shell";

const Board = dynamic(() => import("./Board").then((m) => m.Board), {
  ssr: false,
  loading: () => (
    <p className="sub" style={{ margin: "40px auto", textAlign: "center" }}>
      Setting up the board…
    </p>
  ),
});

export function WhiteboardShell() {
  return (
    <Shell skipLabel="Skip to the whiteboard" skipHref="#board" variant="focused" workspace>
      <Board />
    </Shell>
  );
}
