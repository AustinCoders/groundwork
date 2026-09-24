import { exercise, exercises } from "@/lib/content";
import { recordPolyglot } from "@/lib/polyglot/record";

// One static JSON file per problem: its signature and test cases recorded from
// the reference solution, so the editor can offer the problem in any language.
// Fetched only when the reader switches away from JavaScript.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return exercises().map((ex) => ({ slug: ex.id }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ex = exercise(slug);
  return Response.json(ex ? recordPolyglot(ex) : { ok: false, reason: "No such problem." });
}
