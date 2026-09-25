import type { Metadata } from "next";
import PracticeClient from "./PracticeClient";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Playground",
  description: "Write JavaScript, TypeScript, Python or SQL in the browser, run it, and check it against real tests.",
  path: "/practice",
});

export default function PracticePage() {
  return <PracticeClient />;
}
