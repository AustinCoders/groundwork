import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { buildConnector, type BuiltConnector, type ConnectorLive } from "@/lib/connector";
import styles from "./connectors.module.css";

const WIDE = "(min-width: 1081px)";
const HOP = 6;
const LAND = 3;

type Traveller = "plane" | "pencil" | "bookmark" | "compass" | "flag" | "key";

export interface Link {
  label: string;
  fact: string;
  traveller: Traveller;
}

interface View {
  built: BuiltConnector;
  link: Link;
}

const GLYPHS: Record<Traveller, ReactNode> = {
  plane: (
    <>
      <path className={styles.paper} d="M2 16 L30 4 L22 28 L15 19 Z" />
      <path className={styles.line} d="M15 19 L30 4" />
    </>
  ),
  pencil: (
    <>
      <path className={styles.wood} d="M3 11 H21 L30 16 L21 21 H3 Z" />
      <path className={styles.tip} d="M22 12.5 L30 16 L22 19.5 Z" />
      <path className={styles.line} d="M8 11 V21" />
    </>
  ),
  bookmark: (
    <>
      <path className={styles.ribbon} d="M3 10 H26 L30 16 L26 22 H3 Z" />
      <circle className={styles.hole} cx="9" cy="16" r="2" />
    </>
  ),
  compass: (
    <>
      <path className={styles.north} d="M16 16 L30 16 L16 10 Z M16 16 L30 16 L16 22 Z" />
      <path className={styles.south} d="M16 16 L2 16 L16 10 Z M16 16 L2 16 L16 22 Z" />
      <circle className={styles.hole} cx="16" cy="16" r="2.2" />
    </>
  ),
  flag: (
    <>
      <path className={styles.line} d="M4 3 V30" />
      <path className={styles.cloth} d="M4 4 H27 L21 10 L27 16 H4 Z" />
    </>
  ),
  key: (
    <>
      <circle className={styles.keyRing} cx="8" cy="16" r="5" />
      <path className={styles.line} d="M13 16 H30 M24 16 V22 M28 16 V20" />
    </>
  ),
};

function measure(host: HTMLElement): { measured: BuiltConnector[]; ids: string[]; height: number } | null {
  const sections = Array.from(host.querySelectorAll<HTMLElement>("[data-scene]"));
  if (sections.length < 2) return null;
  const scroll = window.scrollY;
  const places = sections.map((section) => {
    const scene = section.querySelector<HTMLElement>("[data-scene-root]");
    const badge = section.querySelector<HTMLElement>("[data-waypoint]");
    if (!scene || !badge) return null;
    const box = section.getBoundingClientRect();
    const sceneBox = scene.getBoundingClientRect();
    const badgeBox = badge.getBoundingClientRect();
    const pinned = section.hasAttribute("data-pinned");
    const stage = pinned ? (section.querySelector("[data-pin-box]")?.getBoundingClientRect().height ?? 0) : 0;
    const wrapperTop = box.top + scroll;
    const slack = pinned ? (stage - sceneBox.height) / 2 : 0;
    const top = pinned ? wrapperTop + slack : sceneBox.top + scroll;
    const bottom = pinned ? wrapperTop + box.height - slack : sceneBox.bottom + scroll;
    const visible = Array.from(scene.querySelectorAll<HTMLElement>("[data-stage]")).find(
      (stageEl) => stageEl.getBoundingClientRect().width > 0
    );
    const stageBox = visible?.getBoundingClientRect();
    return {
      id: section.id,
      top,
      bottom,
      stageX: stageBox ? stageBox.left + stageBox.width / 2 : sceneBox.left + sceneBox.width / 2,
      badgeX: badgeBox.left + badgeBox.width / 2,
      badgeTop: top + (badgeBox.top - sceneBox.top),
    };
  });
  const measured: BuiltConnector[] = [];
  const ids: string[] = [];
  for (let i = 0; i + 1 < places.length; i++) {
    const from = places[i];
    const to = places[i + 1];
    if (!from || !to) continue;
    measured.push(
      buildConnector({
        from: { x: from.stageX, y: from.bottom + HOP },
        to: { x: to.badgeX, y: to.badgeTop - LAND },
        gapTop: from.bottom,
        gapBottom: to.top,
      })
    );
    ids.push(to.id);
  }
  return { measured, ids, height: document.documentElement.scrollHeight };
}

export function Connectors({ liveRef, links }: { liveRef: RefObject<ConnectorLive | null>; links: Link[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const mask = useId();
  const [views, setViews] = useState<View[]>([]);
  const [targets, setTargets] = useState<string[]>([]);

  useEffect(() => {
    const layer = ref.current;
    const host = layer?.parentElement;
    if (!layer || !host) return;
    const wide = window.matchMedia(WIDE);
    let frame = 0;
    const run = () => {
      frame = 0;
      const next = wide.matches ? measure(host) : null;
      const list = next ? next.measured.map((built, i) => ({ built, link: links[i] })).filter((view) => view.link) : [];
      setViews((now) =>
        now.length === list.length &&
        now.every((view, i) => view.built.d === list[i].built.d && view.built.top === list[i].built.top)
          ? now
          : list
      );
      setTargets(next ? next.ids : []);
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(run);
    };
    const observer = new ResizeObserver(queue);
    observer.observe(host);
    host.querySelectorAll("[data-scene-root]").forEach((scene) => observer.observe(scene));
    window.addEventListener("resize", queue);
    wide.addEventListener("change", queue);
    void document.fonts?.ready.then(queue);
    queue();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", queue);
      wide.removeEventListener("change", queue);
    };
  }, [links]);

  useEffect(() => {
    const layer = ref.current;
    if (!layer || views.length === 0) {
      liveRef.current = null;
      return;
    }
    const els = Array.from(layer.querySelectorAll<HTMLElement>("[data-connector]"));
    liveRef.current = {
      items: els.flatMap((el, i) => {
        const target = document.getElementById(targets[i] ?? "");
        const built = views[i]?.built;
        return target && built
          ? [{ el, target, startY: built.top, endY: built.top + built.height, d: -1, docked: false }]
          : [];
      }),
    };
    return () => {
      liveRef.current = null;
    };
  }, [views, targets, liveRef]);

  return (
    <div ref={ref} className={styles.layer} aria-hidden="true">
      {views.map(({ built, link }, i) => {
        const path = { offsetPath: `path("${built.d}")` } as CSSProperties;
        return (
          <div
            key={i}
            className={styles.connector}
            data-connector
            data-traveller={link.traveller}
            style={{ left: built.left, top: built.top, width: built.width, height: built.height }}
          >
            <svg className={styles.svg} width={built.width} height={built.height} focusable="false">
              <defs>
                <mask
                  id={`${mask}-${i}`}
                  maskUnits="userSpaceOnUse"
                  x="-20"
                  y="-20"
                  width={built.width + 40}
                  height={built.height + 40}
                >
                  <path className={styles.reveal} d={built.d} pathLength={1} />
                </mask>
              </defs>
              <path className={styles.dash} d={built.d} mask={`url(#${mask}-${i})`} />
            </svg>
            <span className={styles.label} style={{ left: built.swing.x, top: built.swing.y }}>
              {link.label}
            </span>
            <svg className={styles.sparkle} style={path} viewBox="0 0 24 24" focusable="false">
              <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" />
            </svg>
            <span className={styles.fact} style={path} data-fact>
              {link.fact}
            </span>
            <svg className={styles.rider} style={path} viewBox="0 0 32 32" focusable="false" data-rider>
              {GLYPHS[link.traveller]}
            </svg>
          </div>
        );
      })}
    </div>
  );
}
