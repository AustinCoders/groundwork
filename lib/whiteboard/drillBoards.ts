import { box } from "@/lib/whiteboard/templates";
import { routeArrows, type El } from "@/lib/whiteboard/model";

export interface DrillBoard {
  chapter: string;
  title: string;
}

export const DRILL_BOARDS: DrillBoard[] = [
  { chapter: "sysdes-walkthrough-simple", title: "Design a URL shortener" },
  { chapter: "sysdes-walkthrough-medium", title: "Design a social news feed" },
  { chapter: "sysdes-walkthrough-kv-store", title: "Design a key-value store for session and cart data" },
  { chapter: "sysdes-walkthrough-notifications", title: "Design a notification system" },
  { chapter: "sysdes-walkthrough-crawler", title: "Design a web crawler for a search index" },
  { chapter: "sysdes-walkthrough-payments", title: "Design a marketplace checkout payment system" },
];

const LANES: [string, string][] = [
  ["Requirements: what is in, what is out", "yellow-soft"],
  ["Numbers: volume, peak, storage", "blue-soft"],
  ["API and data model", "green-soft"],
  ["Risks and follow-ups to volunteer", "purple-soft"],
];

export function drillBoard(chapter: string): DrillBoard | null {
  return DRILL_BOARDS.find((board) => board.chapter === chapter) ?? null;
}

export function buildDrillBoard(board: DrillBoard): El[] {
  const heading = box("text", 0, 0, Math.ceil(board.title.length * 18) + 8, 48, board.title, { fontSize: 32 });
  const lanes = LANES.map(([text, fill], i) =>
    box("sticky", (i % 2) * 290, 80 + Math.floor(i / 2) * 170, 270, 150, text, { fill, fontSize: 18 })
  );
  const frame = box("rect", 0, 440, 560, 520, "Draw the design here", {
    fill: "paper",
    dash: "dashed",
    width: 1,
    fontSize: 20,
  });
  return routeArrows([heading, ...lanes, frame]);
}
