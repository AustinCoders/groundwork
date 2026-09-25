"use client";

import { useEffect, useMemo, useState } from "react";
import type { Trace, TreeView, View } from "@/lib/debug/view";
import type { RunnerOutputEntry } from "@/lib/runner";

function isPrimitive(v: View): boolean {
  return v.t === "num" || v.t === "str" || v.t === "bool" || v.t === "null" || v.t === "undef" || v.t === "big";
}

function Prim({ view }: { view: View }) {
  if (!("v" in view)) return null;
  return <span className={`dv-prim dv-prim--${view.t}`}>{view.t === "str" ? JSON.stringify(view.v) : view.v}</span>;
}

function Boxes({ items, len, label }: { items: View[]; len: number; label?: (i: number) => string }) {
  return (
    <span className="dv-boxes">
      {items.map((item, i) => (
        <span key={i} className="dv-box">
          <span className="dv-box__v">
            <ValueView view={item} />
          </span>
          <span className="dv-box__i">{label ? label(i) : i}</span>
        </span>
      ))}
      {len > items.length && <span className="dv-more">+{len - items.length}</span>}
      {len === 0 && <span className="dv-empty">empty</span>}
    </span>
  );
}

function Grid({ rows }: { rows: View[] }) {
  return (
    <table className="dv-grid">
      <tbody>
        {rows.map((row, r) => (
          <tr key={r}>
            <th scope="row">{r}</th>
            {row.t === "arr" &&
              row.items.map((cell, c) => (
                <td key={c}>
                  <ValueView view={cell} />
                </td>
              ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Tree({ node }: { node: TreeView | null }) {
  if (!node) return <span className="dv-tree__nil">∅</span>;
  const leaf = !node.l && !node.r;
  return (
    <span className="dv-tree__node">
      <span className="dv-tree__v">
        <ValueView view={node.v} />
      </span>
      {!leaf && (
        <span className="dv-tree__kids">
          <Tree node={node.l} />
          <Tree node={node.r} />
        </span>
      )}
    </span>
  );
}

export function ValueView({ view }: { view: View }) {
  switch (view.t) {
    case "arr":
      if (view.items.length && view.items.every((row) => row.t === "arr" && row.items.every(isPrimitive)))
        return <Grid rows={view.items} />;
      return <Boxes items={view.items} len={view.len} />;
    case "set":
      return (
        <span className="dv-tag-wrap">
          <span className="dv-tag">Set</span>
          <Boxes items={view.items} len={view.len} label={() => ""} />
        </span>
      );
    case "map":
      return (
        <table className="dv-table">
          <tbody>
            {view.entries.map(([k, v], i) => (
              <tr key={i}>
                <th scope="row">
                  <ValueView view={k} />
                </th>
                <td>
                  <ValueView view={v} />
                </td>
              </tr>
            ))}
            {view.len === 0 && (
              <tr>
                <td className="dv-empty">empty Map</td>
              </tr>
            )}
          </tbody>
        </table>
      );
    case "obj":
      return (
        <span className="dv-obj">
          {view.cls && <span className="dv-tag">{view.cls}</span>}
          <table className="dv-table">
            <tbody>
              {view.entries.map(([k, v]) => (
                <tr key={k}>
                  <th scope="row">{k}</th>
                  <td>
                    <ValueView view={v} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </span>
      );
    case "list":
      return (
        <span className="dv-list">
          {view.items.map((item, i) => (
            <span key={i} className="dv-list__node">
              <span className="dv-box__v">
                <ValueView view={item} />
              </span>
              <span className="dv-list__arrow" aria-hidden="true">
                →
              </span>
            </span>
          ))}
          <span className="dv-list__end">{view.cycle ? "↺ back to the start" : view.more ? "…" : "null"}</span>
        </span>
      );
    case "tree":
      return (
        <span className="dv-tree">
          <Tree node={view.root} />
        </span>
      );
    case "fn":
      return <span className="dv-prim dv-prim--fn">ƒ {view.v}</span>;
    case "more":
      return <span className="dv-more">…</span>;
    case "tdz":
      return <span className="dv-empty">not yet</span>;
    default:
      return <Prim view={view} />;
  }
}

export function DebugPanel({
  trace,
  output,
  onLine,
}: {
  trace: Trace;
  output: RunnerOutputEntry[];
  onLine: (line: number | null) => void;
}) {
  const total = trace.steps.length;
  const [index, setIndex] = useState(0);
  const step = trace.steps[index];
  const prev = index > 0 ? trace.steps[index - 1] : null;

  useEffect(() => {
    onLine(step ? step.line : null);
  }, [step, onLine]);

  useEffect(() => () => onLine(null), [onLine]);

  const vars = useMemo(
    () => (step ? Object.entries(step.vars).filter(([, v]) => v.t !== "tdz" && v.t !== "fn") : []),
    [step]
  );
  const printed = output.filter((o) => o.kind !== "table" && (o.step ?? 0) <= index + 1);

  if (!total) return <p className="panel__empty">Nothing ran — is there any code outside a function?</p>;

  const go = (i: number) => setIndex(Math.max(0, Math.min(total - 1, i)));

  return (
    <div
      className="debug"
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
    >
      <div className="debug__bar">
        <button type="button" className="debug__btn" aria-label="First step" onClick={() => go(0)}>
          ⏮
        </button>
        <button type="button" className="debug__btn" aria-label="Previous step" onClick={() => go(index - 1)}>
          ◀
        </button>
        <button
          type="button"
          className="debug__btn debug__btn--main"
          aria-label="Next step"
          onClick={() => go(index + 1)}
        >
          ▶
        </button>
        <button type="button" className="debug__btn" aria-label="Last step" onClick={() => go(total - 1)}>
          ⏭
        </button>
        <input
          className="debug__slider"
          type="range"
          min={0}
          max={total - 1}
          value={index}
          aria-label="Step"
          onChange={(e) => go(Number(e.target.value))}
        />
        <span className="debug__count" aria-live="polite">
          step {index + 1} / {total}
          {trace.truncated ? "+" : ""}
        </span>
      </div>
      <p className="debug__where">
        line <b>{step.line}</b> · in <b>{step.fn}</b>
        {step.depth > 1 ? ` · ${step.depth} calls deep` : ""}
      </p>
      {vars.length === 0 ? (
        <p className="panel__empty">No variables in scope yet.</p>
      ) : (
        <dl className="debug__vars">
          {vars.map(([name, view]) => {
            const changed = prev && JSON.stringify(prev.vars[name]) !== JSON.stringify(view);
            return (
              <div key={name} className="debug__var" data-changed={changed || undefined}>
                <dt>{name}</dt>
                <dd>
                  <ValueView view={view} />
                </dd>
              </div>
            );
          })}
        </dl>
      )}
      {printed.length > 0 && (
        <div className="debug__out">
          <p className="debug__out-h">Printed so far</p>
          {printed.map((o, i) => (
            <div key={i} className={`line line--${o.kind}`}>
              <span>{"text" in o ? o.text : ""}</span>
            </div>
          ))}
        </div>
      )}
      {trace.truncated && (
        <p className="debug__note">The trace stops after {total} steps; the rest of the run is not recorded.</p>
      )}
    </div>
  );
}
