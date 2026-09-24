import { exercises } from "@/lib/content";
import { plural } from "@/lib/format";
import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "All problems — every runnable interview problem on the site";

export default function OpengraphImage() {
  return ogCard({
    mark: "{}",
    kicker: "All problems",
    sub: "grouped by the pattern they teach",
    headline: "Write it in the browser, check it against real tests",
    chips: [plural(exercises().length, "problem"), "JavaScript · React · DSA", "beginner → advanced"],
    accent: "ink",
  });
}
