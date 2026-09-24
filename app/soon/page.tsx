import type { Metadata } from "next";
import SoonClient from "./SoonClient";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Coming soon",
  description: "This topic is planned and the syllabus is written, but the chapters are not there yet.",
  path: "/soon",
  index: false,
});

export default function SoonPage() {
  return <SoonClient />;
}
