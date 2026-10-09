"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import { FocusTrap } from "@/components/FocusTrap";
import { ContinueCard } from "@/components/menu/ContinueCard";
import { Fold } from "@/components/menu/Fold";
import { MenuIcon } from "@/components/menu/MenuIcon";
import { ProgressStrip, useMenuStats } from "@/components/menu/ProgressStrip";
import { HOME_ACTION, QUICK_ACTIONS, QuickActions, isUnder } from "@/components/menu/QuickActions";
import { Settings } from "@/components/menu/Settings";
import { Shortcuts, useShortcutLabel } from "@/components/menu/Shortcuts";
import { GuideList, HitLink, TopicList, topicHit, type Hit } from "@/components/menu/Topics";
import { continueCard } from "@/lib/continueCard";
import { isEditableTarget, isMenuShortcut } from "@/lib/menuShortcut";
import { readResume } from "@/lib/resume";
import { isReadable } from "@/lib/topicCategories";
import { useGuidesNav, useTopicsNav } from "@/lib/topicNav";
import { SITE_NAME } from "@/lib/site";
import type { TopicNav } from "@/content/types";
import styles from "./SiteDrawer.module.css";

const MENU_BUTTON = 'button[aria-haspopup="dialog"][aria-label="Menu"]';

function topicBases(t: TopicNav): string[] {
  return [`/${(t.notes || "notes.html").replace(/\.html$/, "")}`, `/level/${t.id}`];
}

function SignIn() {
  return (
    <button
      type="button"
      className={styles.signIn}
      aria-disabled="true"
      aria-label="Sign in, coming soon"
      onClick={(e) => e.preventDefault()}
    >
      <MenuIcon name="user" size={15} />
      <span>Sign in</span>
      <span className={styles.soonTag}>soon</span>
    </button>
  );
}

function DrawerBody({
  onClose,
  reading,
  searchRef,
  searchOnOpen,
  header,
}: {
  onClose: () => void;
  header: React.ReactNode;
  reading: boolean;
  searchRef: React.RefObject<HTMLInputElement | null>;
  searchOnOpen: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const guides = useGuidesNav();
  const topics = useTopicsNav().filter((t) => !guides.some((g) => g.id === t.id));
  const stats = useMenuStats();
  const shortcut = useShortcutLabel();
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const [query, setQuery] = useState("");
  const [card] = useState(() => continueCard(readResume(), topics, guides));
  const results = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!searchOnOpen) return;
    const frame = requestAnimationFrame(() => searchRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [searchOnOpen, searchRef]);

  function toggle(id: string, isOpen: boolean) {
    setOpen((prev) => {
      if (prev.has(id) === isOpen) return prev;
      const next = new Set(prev);
      if (isOpen) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  const current = topics.find((t) => topicBases(t).some((b) => isUnder(pathname, b)))?.id ?? null;
  const readyCount = topics.filter(isReadable).length;

  const q = query.trim().toLowerCase();
  const hits: Hit[] = q
    ? [
        ...[HOME_ACTION, ...QUICK_ACTIONS].map((l) => ({
          href: l.href,
          label: l.label,
          mark: l.mark,
          accent: l.accent,
          meta: "Page",
        })),
        ...topics.map(topicHit),
        ...guides.flatMap((g) => [
          { href: g.href, label: g.name, mark: g.mark, accent: g.accent, meta: `${g.total} chapters` },
          ...g.groups.flatMap((grp) =>
            grp.chapters.map((c) => ({ href: c.href, label: c.title, mark: g.mark, accent: g.accent, meta: g.name }))
          ),
        ]),
      ].filter((h) => h.label.toLowerCase().includes(q))
    : [];

  function onSearchKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && hits[0]) {
      e.preventDefault();
      router.push(hits[0].href);
      onClose();
    }
    if (e.key === "ArrowDown") {
      const first = results.current?.querySelector<HTMLElement>("a");
      if (first) {
        e.preventDefault();
        first.focus();
      }
    }
    if (e.key === "Escape" && query) {
      setQuery("");
    }
  }

  return (
    <>
      <div className={styles.sticky}>
        {header}
        <div className={styles.search}>
          <label htmlFor="menu-search" className="visually-hidden">
            Jump to a page or topic
          </label>
          <MenuIcon name="search" size={16} />
          <input
            id="menu-search"
            ref={searchRef}
            type="search"
            value={query}
            placeholder="Jump to a page or topic"
            aria-keyshortcuts="Control+K Meta+K"
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onSearchKey}
          />
          {query ? (
            <button type="button" className={styles.clear} aria-label="Clear the search" onClick={() => setQuery("")}>
              ×
            </button>
          ) : (
            <kbd className={styles.hint} aria-hidden="true">
              {shortcut}
            </kbd>
          )}
        </div>
      </div>
      {q ? (
        <section className={styles.results} aria-label="Results" ref={results}>
          {hits.length ? (
            <ul className={styles.hits}>
              {hits.map((h) => (
                <li key={h.href + h.label}>
                  <HitLink hit={h} here={false} onClose={onClose} />
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>Nothing matches “{query.trim()}”.</p>
          )}
        </section>
      ) : (
        <>
          <ContinueCard card={card} onClose={onClose} />
          <ProgressStrip stats={stats} onClose={onClose} />
          <QuickActions stats={stats} onClose={onClose} />
          <section aria-labelledby="menu-topics">
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionH} id="menu-topics">
                <span className={styles.marker}>Topics</span>
              </h2>
              <span className={styles.sectionCount}>
                {readyCount} to read · {topics.length - readyCount} soon
              </span>
            </div>
            <TopicList topics={topics} current={current} onClose={onClose} />
            <div className={styles.folds}>
              {guides.map((g) => {
                const here = g.groups.flatMap((grp) => grp.chapters).find((c) => c.href === pathname);
                return (
                  <Fold
                    key={g.id}
                    id={g.id}
                    icon={g.id === "interview" ? "interview" : "architecture"}
                    title={g.name}
                    summary={here ? here.num : `${g.total} chapters`}
                    open={open.has(g.id)}
                    onToggle={toggle}
                  >
                    <GuideList guide={g} pathname={pathname} onClose={onClose} />
                  </Fold>
                );
              })}
            </div>
          </section>
          <Settings reading={reading} open={open} onToggle={toggle} />
          <Shortcuts reading={reading} open={open.has("shortcuts")} onToggle={toggle} />
        </>
      )}
    </>
  );
}

export function SiteDrawer({
  open,
  onClose: closeMenu,
  reading = false,
}: {
  open: boolean;
  onClose: () => void;
  reading?: boolean;
}) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchOnOpen, setSearchOnOpen] = useState(false);
  const onClose = useCallback(() => {
    setSearchOnOpen(false);
    closeMenu();
  }, [closeMenu]);

  useEffect(() => {
    function onShortcut(e: KeyboardEvent) {
      if (!isMenuShortcut(e) || isEditableTarget(e.target)) return;
      if (open) {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (document.querySelector("[aria-modal=true]")) return;
      const button = document.querySelector<HTMLButtonElement>(MENU_BUTTON);
      if (!button) return;
      e.preventDefault();
      setSearchOnOpen(true);
      button.focus();
      button.click();
    }
    document.addEventListener("keydown", onShortcut);
    return () => document.removeEventListener("keydown", onShortcut);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      const field = e.target as HTMLInputElement | null;
      if (field?.type === "search" && field.value) return;
      if ((e.target as HTMLElement | null)?.closest?.("[role=listbox], [data-radix-popper-content-wrapper]")) return;
      e.stopPropagation();
      onClose();
    }
    document.addEventListener("keydown", onKey, true);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className={styles.root}>
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <FocusTrap>
        <aside className={styles.drawer} role="dialog" aria-modal="true" aria-label={`${SITE_NAME} menu`}>
          <DrawerBody
            header={
              <div className={styles.head}>
                <Link href="/" className={styles.brand} onClick={onClose}>
                  <span className="brand__mark" aria-hidden="true">
                    G
                  </span>
                  <span className={styles.brandName}>{SITE_NAME}</span>
                </Link>
                <SignIn />
                <button type="button" className={styles.close} aria-label="Close the menu" onClick={onClose}>
                  ×
                </button>
              </div>
            }
            onClose={onClose}
            reading={reading}
            searchRef={searchRef}
            searchOnOpen={searchOnOpen}
          />
          <div className={styles.foot}>
            {reading && (
              <button
                type="button"
                className={styles.action}
                onClick={() => {
                  flushSync(onClose);
                  window.print();
                }}
              >
                <MenuIcon name="print" size={16} />
                Print or save as PDF
              </button>
            )}
            <p className={styles.footNote}>
              Your progress stays in this browser, and nothing here needs an account.{" "}
              <Link href="/architecture" onClick={onClose}>
                How this is built
              </Link>{" "}
              <span aria-hidden="true">·</span>{" "}
              <Link href="/privacy" onClick={onClose}>
                Privacy
              </Link>
            </p>
          </div>
        </aside>
      </FocusTrap>
    </div>,
    document.body
  );
}
