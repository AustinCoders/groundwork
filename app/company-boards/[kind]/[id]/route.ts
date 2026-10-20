import { boardIds, companyBoard } from "@/lib/companyBoards";
import { BOARD_SOURCES, type BoardSource } from "@/lib/whiteboard/walk";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return BOARD_SOURCES.flatMap((kind) => boardIds(kind).map((id) => ({ kind, id })));
}

export async function GET(_req: Request, { params }: { params: Promise<{ kind: string; id: string }> }) {
  const { kind, id } = await params;
  const board = BOARD_SOURCES.includes(kind as BoardSource) ? companyBoard(kind as BoardSource, id) : null;
  if (!board) return new Response("Not found", { status: 404 });
  return Response.json(board);
}
