import { buildCatalogue } from "@/lib/resume/catalogue";

export const dynamic = "force-static";

export function GET() {
  return Response.json(buildCatalogue());
}
