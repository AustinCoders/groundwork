"use client";

import dynamic from "next/dynamic";
import { BareShell } from "@/components/AppHeader";

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
    <BareShell title="Whiteboard" skipLabel="Skip to the whiteboard" skipHref="#board" header={false}>
      <Board />
    </BareShell>
  );
}
