import { useMemo } from "react";
import { useProgressValue } from "@/lib/hooks";
import { progress } from "@/lib/storage";
import { parseDone } from "./roadmapModel";

export function useDone() {
  const key = useProgressValue(() => `p:${Object.keys(progress.all().chapters).join(",")}`, "");
  const done = useMemo(() => parseDone(key || "p:"), [key]);
  return { done, loaded: key !== "" };
}
