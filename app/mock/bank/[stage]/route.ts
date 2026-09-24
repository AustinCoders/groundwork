import { stageBank } from "@/lib/mock/bank";
import { STAGE_ORDER } from "@/lib/mock/loops";
import type { StageId } from "@/lib/mock/types";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return STAGE_ORDER.map((stage) => ({ stage }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ stage: string }> }) {
  const { stage } = await params;
  return Response.json(stageBank(stage as StageId));
}
