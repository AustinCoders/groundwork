import type { ReactNode } from "react";
import { ClosurePlayer } from "@/components/play/ClosurePlayerLoader";
import { Player } from "@/components/play/PlayerLoader";
import { loadClosureTracer } from "@/lib/play/closure/registry";
import { loadTracer } from "@/lib/play/registry";
import { Eyebrow } from "@/components/ui/MenuKit";
import styles from "@/components/topic/reader.module.css";

function Island({ id, children }: { id: string; children: ReactNode }) {
  return (
    <section
      className={styles.island}
      data-island="play"
      data-play={id}
      data-no-smooth=""
      data-speech-exclude=""
      aria-label="Play it"
    >
      <Eyebrow no="▶" as="p">
        Play it
      </Eyebrow>
      {children}
    </section>
  );
}

export async function PlayIsland({ id }: { id: string }) {
  const tracer = await loadTracer(id);
  const closure = tracer ? null : loadClosureTracer(id);
  if (closure) {
    return (
      <Island id={id}>
        <ClosurePlayer title={closure.title} lines={closure.lines} frames={closure.frames} />
      </Island>
    );
  }
  if (!tracer) {
    return (
      <Island id={id}>
        <p className={styles.islandText}>There is no step-by-step player for this part of the chapter.</p>
      </Island>
    );
  }
  return (
    <Island id={id}>
      <Player title={tracer.title} lines={tracer.lines} frames={tracer.run(tracer.defaultInput)} />
    </Island>
  );
}
