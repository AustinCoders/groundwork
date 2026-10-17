"use client";

import { Fragment, useId, useLayoutEffect, useRef } from "react";
import type { Binding, Cell, ClosureFrame, HeapView, Remark, ScopeView } from "@/lib/play/closure/types";
import playerStyles from "./player.module.css";
import styles from "./closurePlayer.module.css";
import { SPEEDS, usePlayback } from "./usePlayback";

function describe(heap: HeapView[], id: number): string {
  const target = heap.find((entry) => entry.id === id);
  if (!target) return "an object";
  if (target.kind === "function") return `function ${target.name}`;
  if (target.kind === "array")
    return `an array of ${target.items.length} ${target.items.length === 1 ? "item" : "items"}`;
  return "an object";
}

function codeMarker(ran: boolean, queued: boolean) {
  if (ran && queued) return "ran next";
  if (ran) return "ran";
  return queued ? "next" : "";
}

function CellView({ cell, heap }: { cell: Cell; heap: HeapView[] }) {
  if (cell.kind !== "ref") return <span data-kind={cell.kind}>{cell.text}</span>;
  return (
    <span
      className={styles.pointer}
      data-points-to={cell.id}
      role="img"
      aria-label={`points to ${describe(heap, cell.id)}`}
    />
  );
}

function Rows({ bindings, heap }: { bindings: Binding[]; heap: HeapView[] }) {
  if (!bindings.length) return <p className={styles.empty}>no variables yet</p>;
  return (
    <dl className={styles.rows}>
      {bindings.map((binding) => (
        <div key={binding.name} className={styles.row} data-returned={binding.returned}>
          <dt>{binding.returned ? "returns" : binding.name}</dt>
          <dd>
            <CellView cell={binding.value} heap={heap} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

function scopeName(scope: ScopeView) {
  return scope.kind === "function" ? `${scope.label}()` : scope.label;
}

function FrameView({ scope, heap }: { scope: ScopeView; heap: HeapView[] }) {
  const ended = scope.kind === "function" ? "call" : "scope";
  return (
    <section
      className={styles.frame}
      data-frame={scope.id}
      data-current={scope.current}
      data-kept={!scope.running}
      aria-label={`Frame ${scope.id}, ${scopeName(scope)}${scope.running ? "" : ", kept alive"}`}
    >
      <header className={styles.frameHead}>
        <strong>{scopeName(scope)}</strong>
        <span>#{scope.id}</span>
      </header>
      {!scope.running && (
        <p className={styles.keptNote}>
          {ended} ended, kept alive by{" "}
          {scope.keptBy.length ? scope.keptBy.map((name) => `ƒ ${name}`).join(", ") : "a closure"}
        </p>
      )}
      {scope.enclosedBy !== null && <p className={styles.note}>can also see frame #{scope.enclosedBy}</p>}
      <Rows bindings={scope.bindings} heap={heap} />
    </section>
  );
}

function ObjectView({ entry, heap }: { entry: HeapView; heap: HeapView[] }) {
  if (entry.kind === "function") {
    return (
      <section
        className={styles.object}
        data-object={entry.id}
        data-closure={entry.closesOver !== null}
        aria-label={`Function ${entry.name}`}
      >
        <header className={styles.objectHead}>
          <strong>
            ƒ {entry.name}({entry.params})
          </strong>
          <span>function</span>
        </header>
        {entry.closesOver !== null ? (
          <p className={styles.chip} data-closes-over={entry.closesOver}>
            closes over frame #{entry.closesOver}
          </p>
        ) : (
          <p className={styles.empty}>defined at the top level</p>
        )}
      </section>
    );
  }
  if (entry.kind === "array") {
    return (
      <section className={styles.object} data-object={entry.id} aria-label={`Array of ${entry.items.length}`}>
        <header className={styles.objectHead}>
          <strong>array</strong>
          <span>{entry.items.length} items</span>
        </header>
        {entry.items.length ? (
          <ol className={styles.cells}>
            {entry.items.map((item, at) => (
              <li key={at}>
                <small>{at}</small>
                <CellView cell={item} heap={heap} />
              </li>
            ))}
          </ol>
        ) : (
          <p className={styles.empty}>empty</p>
        )}
      </section>
    );
  }
  return (
    <section className={styles.object} data-object={entry.id} aria-label="Object">
      <header className={styles.objectHead}>
        <strong>object</strong>
      </header>
      {entry.entries.length ? (
        <dl className={styles.rows}>
          {entry.entries.map((property) => (
            <div key={property.key} className={styles.row}>
              <dt>{property.key}</dt>
              <dd>
                <CellView cell={property.value} heap={heap} />
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className={styles.empty}>empty</p>
      )}
    </section>
  );
}

function RemarkText({ remark }: { remark: Remark }) {
  return (
    <li data-closure={remark.closure}>
      {remark.text
        .split("`")
        .map((part, at) => (at % 2 ? <code key={at}>{part}</code> : <Fragment key={at}>{part}</Fragment>))}
    </li>
  );
}

function pathBetween(startX: number, startY: number, endX: number, endY: number, loopRight: boolean): string {
  if (loopRight) return `M${startX} ${startY} C${startX + 36} ${startY},${endX + 36} ${endY},${endX} ${endY}`;
  const direction = endX >= startX ? 1 : -1;
  const reach = Math.max(36, Math.abs(endX - startX) / 2);
  return `M${startX} ${startY} C${startX + direction * reach} ${startY},${endX - direction * reach} ${endY},${endX} ${endY}`;
}

function drawArrows(stage: HTMLElement, layer: SVGGElement, pointerClass: string, closureClass: string) {
  const origin = stage.getBoundingClientRect();
  const arrows: Element[] = [];
  const add = (d: string, className: string, marker: string) => {
    const path = document.createElementNS(layer.namespaceURI, "path");
    path.setAttribute("d", d);
    path.setAttribute("class", className);
    path.setAttribute("marker-end", `url(#${marker})`);
    arrows.push(path);
  };
  stage.querySelectorAll<HTMLElement>("[data-points-to]").forEach((dot) => {
    const target = stage.querySelector<HTMLElement>(`[data-object="${dot.dataset.pointsTo}"]`);
    if (!target) return;
    const from = dot.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    const insideObject = dot.closest("[data-object]") !== null;
    const startX = from.left + from.width / 2 - origin.left;
    const startY = from.top + from.height / 2 - origin.top;
    const endX = (insideObject ? to.right + 2 : to.left - 2) - origin.left;
    add(
      pathBetween(startX, startY, endX, to.top + 18 - origin.top, insideObject),
      pointerClass,
      "closure-player-pointer-head"
    );
  });
  stage.querySelectorAll<HTMLElement>("[data-closes-over]").forEach((chip) => {
    const target = stage.querySelector<HTMLElement>(`[data-frame="${chip.dataset.closesOver}"]`);
    if (!target) return;
    const from = chip.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    add(
      pathBetween(
        from.left - origin.left,
        from.top + from.height / 2 - origin.top,
        to.right + 2 - origin.left,
        to.top + 18 - origin.top,
        false
      ),
      closureClass,
      "closure-player-closure-head"
    );
  });
  layer.replaceChildren(...arrows);
}

export function ClosurePlayer({ title, lines, frames }: { title: string; lines: string[]; frames: ClosureFrame[] }) {
  const playback = usePlayback(frames.length);
  const { index, last, playing, speed, jump, togglePlay, onKeyDown, backRef, nextRef, playRef } = playback;
  const scrubId = useId();
  const stageRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<SVGGElement>(null);
  const frame = frames[index];
  const ranLine = index > 0 ? frames[index - 1].line : null;
  const stepText = `Step ${index + 1} of ${frames.length}`;

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const layer = layerRef.current;
    if (!stage || !layer) return;
    const redraw = () => drawArrows(stage, layer, styles.pointerArrow, styles.closureArrow);
    redraw();
    const observer = new ResizeObserver(redraw);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [frame]);

  return (
    <div
      className={`${playerStyles.player} ${styles.closurePlayer}`}
      role="group"
      aria-label={`${title} player`}
      tabIndex={-1}
      onKeyDown={onKeyDown}
    >
      <div className={styles.narration} role="status">
        <ul>
          {frame.remarks.map((remark, at) => (
            <RemarkText key={at} remark={remark} />
          ))}
        </ul>
        {index < last && (
          <p className={styles.upNext}>
            Next line to run: <code>{lines[frame.line - 1]?.trim()}</code> (line {frame.line})
          </p>
        )}
      </div>

      <div className={playerStyles.controls}>
        <button
          ref={backRef}
          type="button"
          className={playerStyles.button}
          disabled={index === 0}
          onClick={() => jump(index - 1)}
        >
          Back
        </button>
        <button
          ref={nextRef}
          type="button"
          className={playerStyles.button}
          disabled={index === last}
          onClick={() => jump(index + 1)}
        >
          Next
        </button>
        <button ref={playRef} type="button" className={playerStyles.button} aria-pressed={playing} onClick={togglePlay}>
          {playing ? "Pause" : "Play"}
        </button>
        <button type="button" className={playerStyles.button} onClick={() => jump(0)}>
          Reset
        </button>
        <div role="group" aria-label="Speed" className={playerStyles.speed}>
          {SPEEDS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className={playerStyles.button}
              aria-pressed={speed === entry.id}
              onClick={() => playback.setSpeed(entry.id)}
            >
              {entry.label}
            </button>
          ))}
        </div>
      </div>

      <div className={playerStyles.scrub}>
        <label htmlFor={scrubId} className={playerStyles.scrubLabel}>
          {stepText}
        </label>
        <input
          id={scrubId}
          className={playerStyles.range}
          type="range"
          min={1}
          max={frames.length}
          step={1}
          value={index + 1}
          aria-valuetext={stepText}
          onChange={(event) => jump(Number(event.target.value) - 1)}
        />
      </div>

      <div className={styles.lower}>
        <div>
          <p className={playerStyles.label}>Code</p>
          <ol className={playerStyles.code} role="list" aria-label={`${title} code`} tabIndex={0}>
            {lines.map((text, at) => {
              const number = at + 1;
              const ran = number === ranLine;
              const queued = number === frame.line && index < last;
              return (
                <li
                  key={number}
                  className={playerStyles.codeLine}
                  data-ran={ran}
                  data-next={queued}
                  aria-current={queued ? "step" : undefined}
                >
                  <span className={playerStyles.marker}>{codeMarker(ran, queued)}</span>
                  <code className={playerStyles.codeText}>{text || " "}</code>
                </li>
              );
            })}
          </ol>
          <p className={`${playerStyles.label} ${styles.outputLabel}`}>Printed output</p>
          <p className={styles.output} role="log" aria-label="Printed output">
            {frame.output || "nothing printed yet"}
          </p>
        </div>

        <div className={styles.memory}>
          <p className={playerStyles.label}>What the engine holds in memory</p>
          <div className={styles.scroller}>
            <div ref={stageRef} className={styles.stage}>
              <div className={styles.columns}>
                <div className={styles.column}>
                  <p className={styles.columnTitle}>Frames</p>
                  <section className={styles.frame} data-frame="global" aria-label="Global scope">
                    <header className={styles.frameHead}>
                      <strong>Global</strong>
                    </header>
                    <Rows bindings={frame.globals} heap={frame.heap} />
                  </section>
                  {frame.scopes.map((scope) => (
                    <FrameView key={scope.id} scope={scope} heap={frame.heap} />
                  ))}
                </div>
                <div className={styles.column}>
                  <p className={styles.columnTitle}>Objects</p>
                  {frame.heap.length ? (
                    frame.heap.map((entry) => <ObjectView key={entry.id} entry={entry} heap={frame.heap} />)
                  ) : (
                    <p className={styles.empty}>no objects yet</p>
                  )}
                </div>
              </div>
              <svg className={styles.arrows} aria-hidden="true">
                <defs>
                  <marker
                    id="closure-player-pointer-head"
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="7"
                    markerHeight="7"
                    orient="auto"
                  >
                    <path d="M0 0L10 5L0 10z" className={styles.pointerHead} />
                  </marker>
                  <marker
                    id="closure-player-closure-head"
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="7"
                    markerHeight="7"
                    orient="auto"
                  >
                    <path d="M0 0L10 5L0 10z" className={styles.closureHead} />
                  </marker>
                </defs>
                <g ref={layerRef} />
              </svg>
            </div>
          </div>
          <ul className={styles.legend}>
            <li data-link="pointer">a variable points to an object</li>
            <li data-link="closure">a function remembers the frame it was made in</li>
            <li data-link="kept">dashed frame: its call ended, but something still needs it</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
