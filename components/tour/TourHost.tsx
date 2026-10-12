"use client";

import { TourDialog } from "@/components/tour/TourDialog";
import { TourPrompt } from "@/components/tour/TourPrompt";

export default function TourHost({
  mode,
  onStart,
  onClose,
}: {
  mode: "prompt" | "tour";
  onStart: () => void;
  onClose: () => void;
}) {
  return mode === "tour" ? <TourDialog onClose={onClose} /> : <TourPrompt onStart={onStart} onClose={onClose} />;
}
