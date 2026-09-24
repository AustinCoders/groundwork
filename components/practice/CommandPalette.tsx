"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export interface Command {
  id: string;
  label: string;
  keys?: string;
  group: string;
  run: () => void;
}

function score(query: string, text: string): number {
  if (!query) return 1;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  const direct = t.indexOf(q);
  if (direct !== -1) return 1000 - direct;
  let at = 0;
  let gaps = 0;
  for (const ch of q) {
    const next = t.indexOf(ch, at);
    if (next === -1) return 0;
    gaps += next - at;
    at = next + 1;
  }
  return 500 - gaps;
}

export function CommandPalette({
  open,
  commands,
  onClose,
}: {
  open: boolean;
  commands: Command[];
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const matches = useMemo(
    () =>
      commands
        .map((c) => ({ c, s: score(query, `${c.group}: ${c.label}`) }))
        .filter((m) => m.s > 0)
        .sort((a, b) => b.s - a.s)
        .map((m) => m.c),
    [commands, query]
  );

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  function close() {
    setQuery("");
    setActive(0);
    onClose();
  }

  function choose(c: Command | undefined) {
    if (!c) return;
    close();
    requestAnimationFrame(() => c.run());
  }

  return (
    <div className="palette" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="palette__box" role="dialog" aria-label="Command palette">
        <input
          ref={inputRef}
          className="palette__input"
          placeholder="Type a command…"
          aria-label="Command"
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-list"
          aria-activedescendant={matches[active] ? `palette-${matches[active].id}` : undefined}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              close();
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, matches.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              choose(matches[active]);
            }
          }}
        />
        <ul className="palette__list" id="palette-list" role="listbox" ref={listRef}>
          {matches.length === 0 && <li className="palette__empty">No matching commands</li>}
          {matches.map((c, i) => (
            <li
              key={c.id}
              id={`palette-${c.id}`}
              role="option"
              aria-selected={i === active}
              className="palette__item"
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(c);
              }}
            >
              <span className="palette__group">{c.group}:</span> {c.label}
              {c.keys && <kbd className="palette__keys">{c.keys}</kbd>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
