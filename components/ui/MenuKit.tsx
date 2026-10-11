import type { ReactNode } from "react";
import { MenuIcon } from "@/components/menu/MenuIcon";
import kit from "./menuKit.module.css";

export function Eyebrow({
  no,
  id,
  count,
  as: Tag = "h2",
  children,
}: {
  no: string;
  id?: string;
  count?: string;
  as?: "h2" | "p";
  children: ReactNode;
}) {
  return (
    <Tag className={kit.eyebrow}>
      <span className={kit.eyebrowNo} aria-hidden="true">
        {no}
      </span>
      <span className={kit.eyebrowText} id={id}>
        {children}
      </span>
      <span className={kit.eyebrowRule} aria-hidden="true" />
      {count && <span className={kit.eyebrowCount}>{count}</span>}
    </Tag>
  );
}

export function SearchPill({ children, trailing }: { children: ReactNode; trailing?: ReactNode }) {
  return (
    <div className={kit.search}>
      <MenuIcon name="search" size={16} />
      {children}
      {trailing}
    </div>
  );
}

export function KeyHint({ children }: { children: ReactNode }) {
  return (
    <kbd className={kit.hint} aria-hidden="true">
      {children}
    </kbd>
  );
}

export function ClearButton({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <button type="button" className={kit.clear} aria-label={label} onClick={onClear}>
      ×
    </button>
  );
}

export function CloseButton({ label, onClose }: { label: string; onClose: () => void }) {
  return (
    <button type="button" className={kit.close} aria-label={label} onClick={onClose}>
      ×
    </button>
  );
}

export { kit };

export function EyebrowToggle({
  no,
  summary,
  open,
  controls,
  onToggle,
  as: Tag = "h2",
  children,
}: {
  no: string;
  summary: string;
  open: boolean;
  controls: string;
  onToggle: () => void;
  as?: "h2" | "div";
  children: ReactNode;
}) {
  return (
    <Tag className={kit.eyebrowToggleH}>
      <button
        type="button"
        className={`${kit.eyebrow} ${kit.eyebrowToggle}`}
        aria-expanded={open}
        aria-controls={controls}
        onClick={onToggle}
      >
        <span className={kit.eyebrowNo} aria-hidden="true">
          {no}
        </span>
        <span className={kit.eyebrowText}>{children}</span>
        <span className={kit.eyebrowRule} aria-hidden="true" />
        <span className={kit.eyebrowCount}>{summary}</span>
        <span className={kit.chevron} aria-hidden="true" />
      </button>
    </Tag>
  );
}
