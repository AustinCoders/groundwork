"use client";

import Link from "next/link";
import { BackButton } from "@/components/practice/BackButton";
import { FontPicker, ThemePicker } from "@/components/ThemeFontPicker";
import { SITE_NAME } from "@/lib/site";
import styles from "./AppHeader.module.css";

export interface AppHeaderProps {
  title: string;
  fallbackHref?: string;
  fallbackLabel?: string;
  children?: React.ReactNode;
}

export function AppHeader({ title, fallbackHref = "/", fallbackLabel = "Home", children }: AppHeaderProps) {
  return (
    <header className={styles.head}>
      <BackButton variant="bar" fallbackHref={fallbackHref} fallbackLabel={fallbackLabel} />
      <Link className={styles.brand} href="/" aria-label={`${SITE_NAME} home`} prefetch={false}>
        <span className="brand__mark" aria-hidden="true">
          JS
        </span>
      </Link>
      <h1 className={styles.title}>{title}</h1>
      {children && <div className={styles.slot}>{children}</div>}
      <div className={styles.prefs}>
        <div className={styles.pref}>
          <ThemePicker openUp={false} compact />
        </div>
        <div className={styles.pref}>
          <FontPicker openUp={false} compact />
        </div>
      </div>
    </header>
  );
}

export function BareShell({
  title,
  skipLabel,
  skipHref = "#main",
  header = true,
  children,
}: {
  title: string;
  skipLabel: string;
  skipHref?: string;
  header?: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
      <a className="skip-link" href={skipHref}>
        {skipLabel}
      </a>
      <div className={styles.page}>
        {header && <AppHeader title={title} />}
        <main className={styles.main} id="main">
          {!header && <h1 className="visually-hidden">{title}</h1>}
          {children}
        </main>
      </div>
    </>
  );
}
