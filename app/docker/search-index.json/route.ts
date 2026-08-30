import { searchIndexResponse } from "@/components/reader/searchIndex";

export const dynamic = "force-static";

export function GET() {
  return searchIndexResponse("docker");
}
