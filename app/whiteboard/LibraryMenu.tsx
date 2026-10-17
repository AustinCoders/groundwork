"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { NameDialog } from "@/components/Modal";
import { partFromEls, PART_GROUPS, PARTS, type Part } from "@/lib/whiteboard/library";
import { unionBounds, type El } from "@/lib/whiteboard/model";
import { addSavedPart, listSavedParts, removeSavedPart, type SavedPart } from "@/lib/whiteboard/storage";
import { placeTemplate } from "@/lib/whiteboard/templates";
import { ElementView } from "./ElementView";
import { Icon } from "./icons";
import styles from "./whiteboard.module.css";
import library from "./library.module.css";

type Build = () => El[];

function Preview({ build }: { build: Build }) {
  const els = useMemo(() => placeTemplate({ build }, [0, 0]), [build]);
  const b = unionBounds(els) ?? { x: 0, y: 0, w: 100, h: 60 };
  const pad = 14;
  return (
    <svg
      className={library.partPreview}
      viewBox={`${b.x - pad} ${b.y - pad} ${b.w + pad * 2} ${b.h + pad * 2}`}
      aria-hidden="true"
    >
      {els.map((el) => (
        <ElementView key={el.id} el={el} />
      ))}
    </svg>
  );
}

function Tile({
  label,
  build,
  onPick,
  onRemove,
}: {
  label: string;
  build: Build;
  onPick: (build: Build) => void;
  onRemove?: () => void;
}) {
  return (
    <div className={library.partCell}>
      <button type="button" role="menuitem" className={library.partTile} onClick={() => onPick(build)}>
        <Preview build={build} />
        <span>{label}</span>
      </button>
      {onRemove && (
        <button
          type="button"
          className={library.partRemove}
          aria-label={`Remove ${label} from your parts`}
          onClick={onRemove}
        >
          ×
        </button>
      )}
    </div>
  );
}

export function LibraryMenu({ selection, onPick }: { selection: El[]; onPick: (build: Build) => void }) {
  const [open, setOpen] = useState(false);
  const [naming, setNaming] = useState(false);
  const [saved, setSaved] = useState<SavedPart[]>([]);
  const [problem, setProblem] = useState<string | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const savedBuilds = useMemo(() => saved.map((p) => ({ part: p, build: partFromEls(p.els) })), [saved]);

  useEffect(() => {
    if (!open) return;
    function onDown(e: PointerEvent) {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      setOpen(false);
    }
    window.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function toggle() {
    if (!open) {
      setSaved(listSavedParts());
      setProblem(null);
    }
    setOpen((v) => !v);
  }

  function pick(build: Build) {
    setOpen(false);
    onPick(build);
  }

  const shown = (group: string): Part[] => PARTS.filter((p) => p.group === group);
  const canSave = selection.some((e) => e.kind !== "image");

  return (
    <div className={`${styles.popWrap} ${library.libraryWrap}`} ref={wrap}>
      <button
        type="button"
        className={styles.tool}
        aria-label="Parts library"
        aria-expanded={open}
        aria-haspopup="menu"
        data-tip="Parts library"
        onClick={toggle}
      >
        <Icon name="library" />
      </button>
      {open && (
        <div className={`${styles.templatesPop} ${library.libraryPop}`} role="menu" aria-label="Parts library">
          <p className={styles.menuH}>System design parts</p>
          {PART_GROUPS.map((group) => (
            <section key={group} aria-label={group}>
              <p className={library.partGroup}>{group}</p>
              <div className={library.partGrid}>
                {shown(group).map((p) => (
                  <Tile key={p.id} label={p.label} build={p.build} onPick={pick} />
                ))}
              </div>
            </section>
          ))}
          <section aria-label="Your parts">
            <p className={library.partGroup}>Your parts</p>
            {savedBuilds.length > 0 && (
              <div className={library.partGrid}>
                {savedBuilds.map(({ part, build }) => (
                  <Tile
                    key={part.id}
                    label={part.name}
                    build={build}
                    onPick={pick}
                    onRemove={() => {
                      removeSavedPart(part.id);
                      setSaved(listSavedParts());
                    }}
                  />
                ))}
              </div>
            )}
            <button
              type="button"
              className={library.partSave}
              disabled={!canSave}
              onClick={() => {
                setOpen(false);
                setNaming(true);
              }}
            >
              {canSave ? "Save selection as a part" : "Select something to save it as a part"}
            </button>
            {problem && <p className={library.partProblem}>{problem}</p>}
          </section>
        </div>
      )}
      {naming && (
        <NameDialog
          title="Save as a part"
          label="Name"
          initial="My part"
          confirmLabel="Save part"
          onSubmit={(name) => {
            if (!addSavedPart(name, selection)) setProblem("This browser is out of room — remove a saved part first.");
            setSaved(listSavedParts());
          }}
          onClose={() => setNaming(false)}
        />
      )}
    </div>
  );
}
