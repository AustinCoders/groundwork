"use client";

import "lenis/dist/lenis.css";
import { useEffect } from "react";
import { prefersMotion } from "@/lib/dom";

let current: { scrollTo: (y: number, instant?: boolean) => void; stop: () => void; start: () => void } | null = null;

function useSmoothScroll() {
  useEffect(() => {
    if (!prefersMotion()) return;
    let dead = false;
    let loop = 0;
    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null;
    import("lenis").then(({ default: Lenis }) => {
      if (dead) return;
      const l = new Lenis({
        lerp: 0.085,
        smoothWheel: true,
        anchors: { offset: -64 },
        prevent: (node) => Boolean(node.closest("[role=dialog], textarea, .cm-editor, [data-no-smooth]")),
      });
      lenis = l;
      current = {
        scrollTo: (y, instant) => l.scrollTo(y, { immediate: Boolean(instant) }),
        stop: () => l.stop(),
        start: () => l.start(),
      };
      const tick = (t: number) => {
        l.raf(t);
        loop = requestAnimationFrame(tick);
      };
      loop = requestAnimationFrame(tick);
    });
    return () => {
      dead = true;
      cancelAnimationFrame(loop);
      lenis?.destroy();
      current = null;
    };
  }, []);
}

export function useScrollFx(root: React.RefObject<HTMLElement | null>, scan: unknown = null) {
  useSmoothScroll();

  useEffect(() => {
    const host = root.current;
    if (!host || !prefersMotion() || !("IntersectionObserver" in window)) return;
    host.setAttribute("data-fx-root", "on");
    const bar = host.querySelector<HTMLElement>("[data-scrollbar]");
    const els = Array.from(host.querySelectorAll<HTMLElement>("[data-fx]"));
    const live = new Set<HTMLElement>();
    const clamp = (n: number) => Math.min(1, Math.max(0, n));

    const measure = (el: HTMLElement, h: number, y: number, max: number) => {
      const r = el.getBoundingClientRect();
      const start = r.top + y - h;
      const travel = Math.min(h * 0.32, max - start);
      const enter = start <= 0 || travel <= 0 ? 1 : clamp((y - start) / travel);
      el.style.setProperty("--in", enter.toFixed(3));
      el.style.setProperty("--vp", clamp((h - r.top) / (h + r.height)).toFixed(3));
      el.style.setProperty("--out", clamp(-r.top / Math.max(1, r.height)).toFixed(3));
    };

    const frame = (all: boolean) => {
      const h = window.innerHeight;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - h;
      (all ? els : live).forEach((el) => measure(el, h, y, max));
      bar?.style.setProperty("--sp", (max > 0 ? y / max : 0).toFixed(4));
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) live.add(e.target as HTMLElement);
          else live.delete(e.target as HTMLElement);
        });
        frame(true);
      },
      { rootMargin: "15% 0px 15% 0px" }
    );
    els.forEach((el) => io.observe(el));
    frame(true);

    let raf = 0;
    const onScroll = () => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          frame(false);
        });
    };
    const onResize = () => frame(true);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      els.forEach((el) => {
        el.style.removeProperty("--in");
        el.style.removeProperty("--vp");
        el.style.removeProperty("--out");
      });
      host.removeAttribute("data-fx-root");
    };
  }, [root, scan]);
}

export const smoothScroll = {
  to(y: number, instant = false) {
    if (current) current.scrollTo(y, instant);
    else window.scrollTo({ top: y, behavior: instant ? "auto" : "smooth" });
  },
  stop() {
    current?.stop();
  },
  start() {
    current?.start();
  },
};
