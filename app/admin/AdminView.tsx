"use client";

import { useCallback, useEffect, useState } from "react";
import { SignInGate } from "@/components/account/SignInGate";
import { ConfirmDialog } from "@/components/Modal";
import {
  amIAdmin,
  loadAdmin,
  resolveReport,
  suspendUser,
  type AdminReport,
  type AdminResult,
  type AdminView as View,
} from "@/lib/account/admin";
import { useAccount } from "@/lib/account/session";
import people from "@/app/people/people.module.css";
import styles from "./admin.module.css";

const REASONS: Record<string, string> = {
  spam: "Spam or advertising",
  harassment: "Harassment or bullying",
  fake: "Fake account",
  inappropriate: "Rude or inappropriate profile",
  other: "Something else",
};

const STAT_LABELS: [keyof View["stats"], string][] = [
  ["users", "Accounts"],
  ["new_week", "New this week"],
  ["members", "In connections"],
  ["groups", "Study groups"],
  ["mocks", "Mocks booked"],
  ["open_reports", "Open reports"],
  ["suspended", "Suspended"],
];

function date(iso: string | null): string {
  return iso
    ? new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })
    : "";
}

export function AdminView() {
  return (
    <SignInGate feature="account">
      <Admin />
    </SignInGate>
  );
}

function Admin() {
  const account = useAccount();
  const userId = account.user?.id ?? "";
  const [gate, setGate] = useState<"checking" | "no" | "two_step" | "yes">("checking");
  const [view, setView] = useState<View | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [suspending, setSuspending] = useState<{ report: AdminReport; days: number } | null>(null);
  const [reason, setReason] = useState("");
  const [lifting, setLifting] = useState<{ id: string; name: string } | null>(null);
  const [showDone, setShowDone] = useState(false);

  const reload = useCallback(async () => {
    const r = await loadAdmin();
    if (r.ok) setView(r.value);
    else setError(r.error);
  }, []);

  useEffect(() => {
    if (!userId) return;
    let live = true;
    void amIAdmin().then(async (me) => {
      if (!live) return;
      if (!me.ok || !me.value.admin) {
        setGate("no");
        return;
      }
      if (!me.value.twoStep) {
        setGate("two_step");
        return;
      }
      setGate("yes");
      const r = await loadAdmin();
      if (!live) return;
      if (r.ok) setView(r.value);
      else setError(r.error);
    });
    return () => {
      live = false;
    };
  }, [userId]);

  async function run(task: () => Promise<AdminResult<string>>, text: string) {
    setBusy(true);
    setNote(null);
    const r = await task();
    setBusy(false);
    if (!r.ok) setNote({ ok: false, text: r.error });
    else if (["saved", "suspended", "lifted"].includes(r.value)) {
      setNote({ ok: true, text });
      await reload();
    } else
      setNote({
        ok: false,
        text: r.value === "not_allowed" ? "Admins cannot be suspended here." : "That did not work.",
      });
  }

  if (gate === "checking") return <div className={people.wait} aria-busy="true" aria-label="Checking access" />;
  if (gate === "no") {
    return (
      <div className={people.page}>
        <section className={people.card}>
          <h1 className={people.title}>Admins only</h1>
          <p className={people.hint}>This page is for the people who run Groundwork.</p>
        </section>
      </div>
    );
  }
  if (gate === "two_step") {
    return (
      <div className={people.page}>
        <section className={people.card}>
          <h1 className={people.title}>Turn on two-step sign-in first</h1>
          <p className={people.hint}>
            Admin tools can suspend accounts, so they need two-step sign-in. Turn it on in your account, sign out and
            sign in again with the app code.
          </p>
          <a className={people.btnPrimary} href="/account#account-two-step">
            Open two-step settings
          </a>
        </section>
      </div>
    );
  }
  if (!view) {
    return error ? (
      <div className={people.page}>
        <p className={people.error} role="alert">
          {error}
        </p>
      </div>
    ) : (
      <div className={people.wait} aria-busy="true" aria-label="Loading reports" />
    );
  }

  const open = view.reports.filter((r) => !r.resolved);
  const done = view.reports.filter((r) => r.resolved);

  return (
    <div className={people.page}>
      <header className={people.head}>
        <h1 className={people.h1}>Admin</h1>
        <p className={people.headMeta}>Reports, suspensions and a log of every admin action.</p>
      </header>
      {note && (
        <div className={people.toast}>
          <p className={note.ok ? people.ok : people.error} role={note.ok ? "status" : "alert"}>
            {note.text}
          </p>
        </div>
      )}
      <dl className={styles.stats}>
        {STAT_LABELS.map(([key, label]) => (
          <div key={key} data-alert={(key === "open_reports" && view.stats[key] > 0) || undefined}>
            <dt>{label}</dt>
            <dd>{view.stats[key]}</dd>
          </div>
        ))}
      </dl>

      <div className={people.columns}>
        <div className={people.main}>
          <section className={people.card} aria-labelledby="admin-open">
            <h2 id="admin-open" className={people.title}>
              Open reports <span className={people.count}>{open.length}</span>
            </h2>
            {open.length === 0 ? (
              <p className={people.empty}>Nothing to look at. 🎉</p>
            ) : (
              <ul className={styles.reports}>
                {open.map((r) => (
                  <ReportRow
                    key={r.id}
                    report={r}
                    busy={busy}
                    onDismiss={() => void run(() => resolveReport(r.id, "dismissed"), "Report dismissed.")}
                    onWarn={() => void run(() => resolveReport(r.id, "warned"), "Marked as warned.")}
                    onSuspend={(days) => {
                      setReason(`${REASONS[r.reason] ?? r.reason}`);
                      setSuspending({ report: r, days });
                    }}
                  />
                ))}
              </ul>
            )}
          </section>
          {done.length > 0 && (
            <section className={people.card} aria-labelledby="admin-done">
              <div className={people.cardHead}>
                <h2 id="admin-done" className={people.title}>
                  Handled <span className={people.count}>{done.length}</span>
                </h2>
                <button type="button" className={people.btnQuiet} onClick={() => setShowDone((v) => !v)}>
                  {showDone ? "Hide" : "Show"}
                </button>
              </div>
              {showDone && (
                <ul className={styles.reports}>
                  {done.map((r) => (
                    <li key={r.id} className={styles.report} data-done>
                      <p className={styles.reportHead}>
                        <strong>{r.reported.name || r.reported.username}</strong> · {REASONS[r.reason] ?? r.reason} ·{" "}
                        <span className={people.tag}>{r.resolution}</span>
                      </p>
                      <p className={people.hint}>{date(r.at)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>
        <aside className={people.side}>
          <section className={people.card} aria-labelledby="admin-suspended">
            <h2 id="admin-suspended" className={people.title}>
              Suspended
            </h2>
            {view.suspended.length === 0 ? (
              <p className={people.hint}>Nobody is suspended.</p>
            ) : (
              <ul className={people.plain}>
                {view.suspended.map((u) => (
                  <li key={u.id} className={people.plainRow}>
                    <span>
                      {u.name || u.username} <span className={people.handle}>@{u.username}</span>
                    </span>
                    <span className={people.when}>until {date(u.until)}</span>
                    <button
                      type="button"
                      className={people.btnQuiet}
                      disabled={busy}
                      onClick={() => setLifting({ id: u.id, name: u.name || u.username })}
                    >
                      Lift
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className={people.card} aria-labelledby="admin-log">
            <h2 id="admin-log" className={people.title}>
              Log
            </h2>
            {view.log.length === 0 ? (
              <p className={people.hint}>No admin actions yet.</p>
            ) : (
              <ul className={styles.log}>
                {view.log.map((l, i) => (
                  <li key={i}>
                    <strong>{l.admin}</strong> {l.action}: {l.detail}
                    <span className={people.when}> · {date(l.at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>

      {suspending && (
        <ConfirmDialog
          title={`Suspend ${suspending.report.reported.name || suspending.report.reported.username} for ${suspending.days} days?`}
          body={
            <>
              <p>They are signed out everywhere and cannot sign in or use connections until it ends.</p>
              <label className={styles.reasonLabel} htmlFor="suspend-reason">
                Reason (kept in the admin log)
              </label>
              <input
                id="suspend-reason"
                className={styles.reasonInput}
                value={reason}
                maxLength={200}
                onChange={(e) => setReason(e.target.value)}
              />
            </>
          }
          confirmLabel="Suspend"
          danger
          onConfirm={() => {
            const s = suspending;
            void run(async () => {
              const first = await suspendUser(s.report.reported.id, s.days, reason);
              if (!first.ok || first.value !== "suspended") return first;
              await resolveReport(s.report.id, "suspended");
              return first;
            }, `Suspended for ${s.days} days.`);
          }}
          onClose={() => setSuspending(null)}
        />
      )}
      {lifting && (
        <ConfirmDialog
          title={`Lift the suspension for ${lifting.name}?`}
          body={<p>They can sign in again straight away.</p>}
          confirmLabel="Lift it"
          onConfirm={() => void run(() => suspendUser(lifting.id, 0, "lifted"), "Suspension lifted.")}
          onClose={() => setLifting(null)}
        />
      )}
    </div>
  );
}

function ReportRow({
  report,
  busy,
  onDismiss,
  onWarn,
  onSuspend,
}: {
  report: AdminReport;
  busy: boolean;
  onDismiss: () => void;
  onWarn: () => void;
  onSuspend: (days: number) => void;
}) {
  const r = report;
  return (
    <li className={styles.report}>
      <p className={styles.reportHead}>
        <strong>{r.reported.name || r.reported.username}</strong>{" "}
        <span className={people.handle}>@{r.reported.username}</span>
        {r.reported.reports > 1 && <span className={styles.repeat}>{r.reported.reports} reports</span>}
        {r.reported.suspendedUntil && <span className={people.tag}>suspended</span>}
      </p>
      {r.reported.headline && <p className={people.hint}>“{r.reported.headline}”</p>}
      <p className={styles.reason}>
        <strong>{REASONS[r.reason] ?? r.reason}</strong>
        {r.note && <> — {r.note}</>}
      </p>
      <p className={people.hint}>
        Reported by {r.reporter.name || r.reporter.username} · {date(r.at)}
        {r.reported.joined && ` · account made ${date(r.reported.joined)}`}
      </p>
      <div className={people.row}>
        <button type="button" className={people.btnQuiet} disabled={busy} onClick={onDismiss}>
          Dismiss
        </button>
        <button type="button" className={people.btn} disabled={busy} onClick={onWarn}>
          Mark warned
        </button>
        {[1, 7, 30].map((days) => (
          <button key={days} type="button" className={people.btnDanger} disabled={busy} onClick={() => onSuspend(days)}>
            Suspend {days}d
          </button>
        ))}
      </div>
    </li>
  );
}
