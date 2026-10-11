"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import { FocusTrap } from "@/components/FocusTrap";
import { Appearance } from "@/components/menu/Appearance";
import { ContinueCard } from "@/components/menu/ContinueCard";
import { MenuIcon } from "@/components/menu/MenuIcon";
import { useMenuStats } from "@/components/menu/menuStats";
import { HOME_ACTION, QUICK_ACTIONS, QuickActions, isUnder } from "@/components/menu/QuickActions";
import { useShortcutLabel } from "@/components/menu/Shortcuts";
import { HitLink, TopicsSection, topicHit, type Hit } from "@/components/menu/Topics";
import { ClearButton, CloseButton, KeyHint, SearchPill, kit } from "@/components/ui/MenuKit";
import { continueCard } from "@/lib/continueCard";
import { isEditableTarget, isMenuShortcut } from "@/lib/menuShortcut";
import { readResume } from "@/lib/resume";
import { useGuidesNav, useTopicsNav } from "@/lib/topicNav";
import { SITE_NAME } from "@/lib/site";
import type { TopicNav } from "@/content/types";
import styles from "./SiteDrawer.module.css";

const MENU_BUTTON = "button[data-menu-button]";

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

  const q = query.trim().toLowerCase();
  const hits: Hit[] = q
    ? [
        ...[HOME_ACTION, ...QUICK_ACTIONS].map((l) => ({
          href: l.href,
          label: l.label,
          mark: l.mark,
          meta: "Page",
        })),
        ...topics.map(topicHit),
        ...guides.flatMap((g) => [
          { href: g.href, label: g.name, mark: g.mark, meta: `${g.total} chapters` },
          ...g.groups.flatMap((grp) =>
            grp.chapters.map((c) => ({ href: c.href, label: c.title, mark: c.num, meta: g.name }))
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
        <SearchPill
          trailing={
            query ? (
              <ClearButton label="Clear the search" onClear={() => setQuery("")} />
            ) : (
              <KeyHint>{shortcut}</KeyHint>
            )
          }
        >
          <label htmlFor="menu-search" className="visually-hidden">
            Jump to a page or topic
          </label>
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
        </SearchPill>
      </div>
      {q ? (
        <section className={styles.results} aria-label="Results" ref={results}>
          {hits.length ? (
            <ul className={kit.rows}>
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
          <ContinueCard card={card} stats={stats} onClose={onClose} />
          <QuickActions stats={stats} onClose={onClose} />
          <TopicsSection topics={topics} guides={guides} current={current} pathname={pathname} onClose={onClose} />
          <Appearance reading={reading} open={open} onToggle={toggle} />
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
                <CloseButton label="Close the menu" onClose={onClose} />
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
              Your progress stays in this browser; no account needed.{" "}
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
