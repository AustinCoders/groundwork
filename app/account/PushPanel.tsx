"use client";

import { useEffect, useState } from "react";
import { pushState, turnOffPush, turnOnPush, updatePush, type PushPrefs, type PushState } from "@/lib/account/push";
import styles from "./account.module.css";
import own from "./safety.module.css";

const ROWS: { key: keyof PushPrefs; title: string; body: string }[] = [
  { key: "mocks", title: "Mock interview reminders", body: "15 minutes before a mock with a friend starts." },
  { key: "goal", title: "Evening goal nudge", body: "At 7 pm if today's daily goal is not done yet." },
  { key: "news", title: "Requests and invites", body: "Connection, buddy, group and mock interview news." },
];

const DEFAULT: PushPrefs = { mocks: true, goal: true, news: true };

export function PushPanel() {
  const [state, setState] = useState<PushState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    void pushState().then((s) => {
      if (live) setState(s);
    });
    return () => {
      live = false;
    };
  }, []);

  async function on() {
    setBusy(true);
    setError(null);
    const r = await turnOnPush(DEFAULT);
    setBusy(false);
    if (!r.ok) setError(r.error ?? "Something went wrong.");
    setState(await pushState());
  }

  async function off() {
    setBusy(true);
    await turnOffPush();
    setBusy(false);
    setState({ kind: "off" });
  }

  async function toggle(key: keyof PushPrefs) {
    if (state?.kind !== "on") return;
    const prefs = { ...state.prefs, [key]: !state.prefs[key] };
    setBusy(true);
    const r = await updatePush(prefs);
    setBusy(false);
    if (r.ok) setState({ kind: "on", prefs });
    else setError(r.error ?? "Something went wrong.");
  }

  if (!state) return <div className={styles.card} aria-busy="true" />;

  return (
    <div className={styles.card}>
      {state.kind === "unsupported" ? (
        <p className={styles.body}>
          {state.ios
            ? "On iPhone, add Groundwork to your home screen first: tap Share, then “Add to Home Screen”. Open it from there and come back to this page."
            : "This browser cannot show notifications. Try Chrome, Edge or Firefox, or install Groundwork as an app."}
        </p>
      ) : state.kind === "blocked" ? (
        <p className={styles.body}>
          Notifications are blocked for this site. Allow them in your browser&apos;s site settings, then reload.
        </p>
      ) : state.kind === "off" ? (
        <>
          <p className={styles.body}>
            Get a phone or desktop notification for mock interviews, your evening goal and new requests. This is set per
            device.
          </p>
          <div className={styles.row}>
            <button
              type="button"
              className={`${styles.btn} ${styles.primary}`}
              disabled={busy}
              onClick={() => void on()}
            >
              {busy ? "Turning on…" : "Turn on for this device"}
            </button>
          </div>
        </>
      ) : (
        <>
          <ul className={own.toggles}>
            {ROWS.map((row) => (
              <li key={row.key} className={own.toggle}>
                <span className={own.toggleText}>
                  <strong id={`push-${row.key}`}>{row.title}</strong>
                  <span>{row.body}</span>
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={state.prefs[row.key]}
                  aria-labelledby={`push-${row.key}`}
                  className={own.switch}
                  disabled={busy}
                  onClick={() => void toggle(row.key)}
                >
                  <span className={own.knob} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          <div className={styles.row}>
            <button
              type="button"
              className={`${styles.btn} ${styles.ghostDanger}`}
              disabled={busy}
              onClick={() => void off()}
            >
              Turn off on this device
            </button>
          </div>
        </>
      )}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
