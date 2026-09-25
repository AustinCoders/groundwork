import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { WhiteboardShell } from "./WhiteboardShell";

export const metadata: Metadata = pageMetadata({
  title: "Whiteboard",
  description:
    "An infinite whiteboard in the browser: shapes, arrows that stay attached, freehand, sticky notes, text and images, with undo, zoom, several boards, and export to PNG, SVG or a share link.",
  path: "/whiteboard",
});

export default function WhiteboardPage() {
  return <WhiteboardShell />;
}
