"use client";

import { useCallback } from "react";
import { LookDialog } from "@/components/tour/LookDialog";
import { focusLeftBehind, focusMenuPill } from "@/components/tour/menuPill";
import { rememberTourSeen } from "@/components/tour/tourStore";

export function TourPrompt({ onStart, onClose }: { onStart: () => void; onClose: () => void }) {
  const skip = useCallback(() => {
    rememberTourSeen();
    onClose();
    requestAnimationFrame(() => focusLeftBehind() && focusMenuPill());
  }, [onClose]);

  return <LookDialog onClose={skip} onStart={onStart} />;
}
