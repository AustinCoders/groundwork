import { OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";
import { topicOgAlt, topicOgImage } from "@/lib/topicOg";

const TOPIC = "js";
const HEADLINE = "How the language actually runs, not how to use it";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = topicOgAlt(TOPIC, HEADLINE);

export default function OpengraphImage() {
  return topicOgImage(TOPIC, HEADLINE);
}
