import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";

export const SPEEDS = [
  { id: "slow", label: "Slow", ms: 1800 },
  { id: "normal", label: "Normal", ms: 1100 },
  { id: "fast", label: "Fast", ms: 500 },
] as const;

export type SpeedId = (typeof SPEEDS)[number]["id"];

export function usePlayback(count: number) {
  const last = count - 1;
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<SpeedId>("normal");
  const backRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const playRef = useRef<HTMLButtonElement>(null);

  const go = useCallback(
    (to: number) => {
      const target = Math.min(Math.max(to, 0), last);
      const active = document.activeElement;
      if (target === last && active === nextRef.current) playRef.current?.focus();
      if (target === 0 && active === backRef.current) nextRef.current?.focus();
      setIndex(target);
      if (target === last) setPlaying(false);
    },
    [last]
  );

  const jump = useCallback(
    (to: number) => {
      setPlaying(false);
      go(to);
    },
    [go]
  );

  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (index === last) go(0);
    setPlaying(true);
  };

  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => go(index + 1), SPEEDS.find((entry) => entry.id === speed)!.ms);
    return () => clearTimeout(timer);
  }, [playing, index, speed, go]);

  useEffect(() => {
    const pauseWhenHidden = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => document.removeEventListener("visibilitychange", pauseWhenHidden);
  }, []);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target as HTMLElement;
    const onRange = target instanceof HTMLInputElement && target.type === "range";
    const onButton = target.closest("button") !== null;
    if (event.key === " ") {
      if (onRange || onButton) return;
      if (!event.repeat) togglePlay();
    } else if (event.key === "ArrowLeft" || event.key === "ArrowRight" || event.key === "Home" || event.key === "End") {
      if (onRange) return;
      if (event.key === "ArrowLeft") jump(index - 1);
      else if (event.key === "ArrowRight") jump(index + 1);
      else jump(event.key === "Home" ? 0 : last);
    } else {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  }

  return { index, last, playing, speed, setSpeed, jump, togglePlay, onKeyDown, backRef, nextRef, playRef };
}
