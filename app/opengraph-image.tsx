import { SITE_DESCRIPTION } from "@/lib/site";
import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Groundwork — handwritten notes on web development";

export default function OpengraphImage() {
  return ogCard({
    mark: "JS",
    kicker: "Groundwork",
    sub: "handwritten · web dev",
    headline: "Notes you can actually study from",
    chips: [SITE_DESCRIPTION.split("—")[0].trim()],
  });
}
