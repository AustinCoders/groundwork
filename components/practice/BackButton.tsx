"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useClientValue } from "@/lib/hooks";
import { cameFromRaw, parseTrail, shortTitle } from "@/lib/navTrail";

function currentPath() {
  return window.location.pathname + window.location.search;
}

export function BackButton({
  fallbackHref,
  fallbackLabel,
  variant,
  className,
}: {
  fallbackHref: string;
  fallbackLabel: string;
  variant: "rail" | "bar" | "icon";
  className?: string;
}) {
  const router = useRouter();
  const raw = useClientValue(cameFromRaw, "");
  const here = useClientValue(currentPath, "");
  const trail = parseTrail(raw, here);
  const label = trail ? `Back to ${shortTitle(trail.title)}` : fallbackLabel;
  const href = trail ? trail.path : fallbackHref;

  const content =
    variant === "icon" ? (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 12H5M11 18l-6-6 6-6" />
      </svg>
    ) : variant === "rail" ? (
      <>
        <span className="site-navlink__icon" aria-hidden="true">
          ←
        </span>
        <span className="site-navlink__name btn__label">{label}</span>
      </>
    ) : (
      <>
        <span aria-hidden="true">←</span>
        <span className="back-btn__label">{label}</span>
      </>
    );

  return (
    <Link
      className={className ?? (variant === "rail" ? "site-navlink" : "back-btn")}
      aria-label={variant === "icon" ? label : undefined}
      id={variant === "rail" ? "back-chapter" : undefined}
      href={href}
      title={variant === "icon" ? undefined : label}
      data-tip={variant === "icon" ? label : undefined}
      onClick={(e) => {
        if (!trail || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        if (window.history.length > 1) {
          e.preventDefault();
          router.back();
        }
      }}
    >
      {content}
    </Link>
  );
}
