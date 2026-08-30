"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Shell } from "@/components/Shell";
import { GIT_BODY_HTML } from "@/content/git-body";
import { useMounted } from "@/lib/hooks";

const SECTIONS: { id: string; num: string; title: string }[] = [
  { id: "model", num: "G1", title: "The mental model" },
  { id: "objects", num: "G2", title: "What Git stores" },
  { id: "areas", num: "G3", title: "The three areas" },
  { id: "daily", num: "G4", title: "Everyday commands" },
  { id: "branch", num: "G5", title: "Branches & HEAD" },
  { id: "remote", num: "G6", title: "Remotes & syncing" },
  { id: "merge", num: "G7", title: "Merging & conflicts" },
  { id: "rebase", num: "G8", title: "Rebase" },
  { id: "undo", num: "G9", title: "Undoing anything" },
  { id: "tools", num: "G10", title: "Detective tools" },
  { id: "flow", num: "G11", title: "Team workflows" },
  { id: "hygiene", num: "G12", title: "Commit hygiene" },
  { id: "scale", num: "G13", title: "Scale & edge cases" },
  { id: "danger", num: "G14", title: "Danger zone" },
  { id: "interview", num: "G15", title: "Interview bank" },
  { id: "cheat", num: "G16", title: "Cheat sheet" },
];

function legacyCopy(text: string): boolean {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.cssText = "position:fixed;top:-1000px;opacity:0";
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(ta);
  return ok;
}

export default function GitPage() {
  const mounted = useMounted();
  const [activeId, setActiveId] = useState<string | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mounted || !mainRef.current) return;
    const container = mainRef.current;
    const cleanups: (() => void)[] = [];

    container.querySelectorAll<HTMLElement>(".codeblock").forEach((wrap) => {
      const pre = wrap.querySelector("pre");
      const btn = wrap.querySelector<HTMLButtonElement>(".codeblock__copy");
      if (!pre || !btn) return;

      const onClick = () => {
        const text = (pre as HTMLElement).innerText;
        const done = (ok: boolean) => {
          btn.textContent = ok ? "copied ✓" : "copy failed";
          btn.classList.toggle("is-done", ok);
          setTimeout(() => {
            btn.textContent = "copy";
            btn.classList.remove("is-done");
          }, 1600);
        };
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(
            () => done(true),
            () => done(false)
          );
        } else {
          done(legacyCopy(text));
        }
      };
      btn.addEventListener("click", onClick);
      cleanups.push(() => btn.removeEventListener("click", onClick));
    });

    return () => cleanups.forEach((fn) => fn());
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const sections = SECTIONS.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => Boolean(el));
    if (!("IntersectionObserver" in window) || !sections.length) return;

    const seen = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) seen.add(entry.target);
          else seen.delete(entry.target);
        });
        const first = sections.find((s) => seen.has(s));
        if (first) setActiveId(first.id);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [mounted]);

  if (!mounted) return null;

  return (
    <Shell
      skipLabel="Skip to the content"
      topicId="git"
      sidebarExtra={
        <nav className="site-sidenav__section" aria-label="Contents">
          <div className="site-sidenav__head">
            <h2 className="site-sidenav__heading">Contents</h2>
            <span className="site-sidenav__count">16 sections</span>
          </div>
          <div id="git-nav-list">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                className={`site-navlink${activeId === s.id ? " is-active" : ""}`}
                href={`#${s.id}`}
                data-target={s.id}
              >
                <span className="site-navlink__num" aria-hidden="true">
                  {s.num}
                </span>
                <span className="site-navlink__name">{s.title}</span>
              </a>
            ))}
          </div>
        </nav>
      }
    >
      <div ref={mainRef} dangerouslySetInnerHTML={{ __html: GIT_BODY_HTML }} />

      <footer className="site-foot">
        <Link href="/">All topics</Link>
        <Link href="/notes">JS notes</Link>
      </footer>
    </Shell>
  );
}
