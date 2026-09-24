import type { Metadata } from "next";
import SoonClient from "./SoonClient";
import { pageMetadata } from "@/lib/metadata";

// Which topic is named comes from ?topic= on the client, so there is nothing
// here for a search result to be about.
export const metadata: Metadata = pageMetadata({
  title: "Coming soon",
  description: "This topic is planned and the syllabus is written, but the chapters are not there yet.",
  path: "/soon",
  index: false,
});

export default function SoonPage() {
  return <SoonClient />;
}
