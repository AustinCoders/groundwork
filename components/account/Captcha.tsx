"use client";

import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import { captchaSiteKey } from "@/lib/account/config";
import { loadTurnstile, type TurnstileApi } from "@/lib/account/captcha";
import styles from "./account.module.css";

export interface CaptchaHandle {
  token: () => Promise<string | undefined>;
}

const WAIT_MS = 30_000;

export function Captcha({ ref }: { ref: Ref<CaptchaHandle> }) {
  const box = useRef<HTMLDivElement>(null);
  const api = useRef<TurnstileApi | null>(null);
  const widget = useRef<string | null>(null);
  const waiting = useRef<((token: string | undefined) => void) | null>(null);
  const siteKey = captchaSiteKey();

  useEffect(() => {
    if (!siteKey) return;
    let gone = false;
    const settle = (token: string | undefined) => {
      const resolve = waiting.current;
      waiting.current = null;
      resolve?.(token);
    };
    void loadTurnstile().then((turnstile) => {
      if (gone || !turnstile || !box.current) return;
      api.current = turnstile;
      widget.current =
        turnstile.render(box.current, {
          sitekey: siteKey,
          execution: "execute",
          appearance: "interaction-only",
          size: "flexible",
          theme: "auto",
          callback: (token) => settle(token),
          "error-callback": () => {
            settle(undefined);
            return true;
          },
          "expired-callback": () => settle(undefined),
        }) ?? null;
    });
    return () => {
      gone = true;
      if (api.current && widget.current) api.current.remove(widget.current);
      widget.current = null;
      settle(undefined);
    };
  }, [siteKey]);

  useImperativeHandle(
    ref,
    () => ({
      token: () => {
        if (!siteKey) return Promise.resolve(undefined);
        return new Promise<string | undefined>((resolve) => {
          const turnstile = api.current;
          const id = widget.current;
          if (!turnstile || !id) {
            resolve(undefined);
            return;
          }
          waiting.current?.(undefined);
          const timer = window.setTimeout(() => {
            if (waiting.current === finish) waiting.current = null;
            resolve(undefined);
          }, WAIT_MS);
          const finish = (token: string | undefined) => {
            window.clearTimeout(timer);
            resolve(token);
          };
          waiting.current = finish;
          turnstile.reset(id);
          turnstile.execute(id);
        });
      },
    }),
    [siteKey]
  );

  if (!siteKey) return null;
  return <div ref={box} className={styles.captcha} />;
}
