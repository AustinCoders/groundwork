import { stageBank } from "@/lib/mock/bank";
import { STAGE_ORDER } from "@/lib/mock/loops";
import type { StageId } from "@/lib/mock/types";

// One static JSON file per stage, built once and served from the CDN. A loop
// fetches only the stages it runs, so the interview book's 420 KB never goes
// to a browser in one piece.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return STAGE_ORDER.map((stage) => ({ stage }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ stage: string }> }) {
  const { stage } = await params;
  return Response.json(stageBank(stage as StageId));
}
