import { OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";
import { topicOgAlt, topicOgImage } from "@/lib/topicOg";

const TOPIC = "react";
const HEADLINE = "Components, state, and the server boundary";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = topicOgAlt(TOPIC, HEADLINE);

export default function OpengraphImage() {
  return topicOgImage(TOPIC, HEADLINE);
}
