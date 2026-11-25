"use client";

import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/Modal";
import { backupCodesLeft, backupCodesText, createBackupCodes } from "@/lib/account/backupCodes";
import { useAccount } from "@/lib/account/session";
import styles from "./backup.module.css";

export function BackupCodes({ fresh }: { fresh: boolean }) {
  const account = useAccount();
  const [left, setLeft] = useState<number | null | undefined>(undefined);
  const [codes, setCodes] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let live = true;
    void backupCodesLeft().then((result) => {
      if (!live) return;
      if (result.ok) setLeft(result.value);
      else setError(result.error);
    });
    return () => {
      live = false;
    };
  }, [reload]);

  async function make() {
    setBusy(true);
    setError(null);
    const result = await createBackupCodes();
    setBusy(false);
    if (result.ok) {
      setCodes(result.value);
      setReload((n) => n + 1);
    } else setError(result.error);
  }

  useEffect(() => {
    if (!fresh) return;
    let live = true;
    void createBackupCodes().then((result) => {
      if (!live) return;
      if (result.ok) {
        setCodes(result.value);
        setReload((n) => n + 1);
      } else setError(result.error);
    });
    return () => {
      live = false;
    };
  }, [fresh]);

  const text = codes ? backupCodesText(codes, account.user?.email ?? "", new Date()) : "";

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function download() {
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "groundwork-backup-codes.txt";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  if (left === null) return null;

  if (codes) {
    return (
      <section className={styles.box} aria-labelledby="backup-title" data-fresh="true">
        <h3 id="backup-title" className={styles.title}>
          Save your backup codes
        </h3>
        <p className={styles.body}>
          If you lose your phone, one of these gets you back in. Each works once. Keep them somewhere safe, like a
          password manager. You will not see them again.
        </p>
        <ol className={styles.codes} aria-label="Backup codes">
          {codes.map((code) => (
            <li key={code}>
              <code>{code}</code>
            </li>
          ))}
        </ol>
        <div className={styles.row}>
          <button type="button" className={styles.btn} onClick={() => void copy()}>
            {copied ? "Copied" : "Copy all"}
          </button>
          <button type="button" className={styles.btn} onClick={download}>
            Download .txt
          </button>
          <button type="button" className={styles.primary} onClick={() => setCodes(null)}>
            I saved them
          </button>
        </div>
      </section>
    );
  }

  const none = left === 0;
  return (
    <section className={styles.box} aria-labelledby="backup-title" data-warn={none || undefined}>
      <div className={styles.head}>
        <h3 id="backup-title" className={styles.title}>
          Backup codes
        </h3>
        {left !== undefined && (
          <span className={styles.count} data-low={(left ?? 0) <= 2 || undefined}>
            {left} of 10 left
          </span>
        )}
      </div>
      <p className={styles.body}>
        {none
          ? "You have none. If you lose your phone you will be locked out, so make them now."
          : "One-time codes for when your phone is lost or reset. Making new ones cancels the old ones."}
      </p>
      <div className={styles.row}>
        <button
          type="button"
          className={none ? styles.primary : styles.btn}
          disabled={busy || left === undefined}
          onClick={() => (none ? void make() : setAsking(true))}
        >
          {busy ? "Making…" : none ? "Make backup codes" : "Make new codes"}
        </button>
      </div>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      {asking && (
        <ConfirmDialog
          title="Make new backup codes?"
          body={<p>Your old codes stop working right away.</p>}
          confirmLabel="Make new codes"
          onConfirm={() => void make()}
          onClose={() => setAsking(false)}
        />
      )}
    </section>
  );
}
