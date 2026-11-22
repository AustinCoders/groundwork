import { CAPTCHA_ORIGIN } from "@/lib/account/config";

export interface TurnstileOptions {
  sitekey: string;
  execution: "execute" | "render";
  appearance: "always" | "execute" | "interaction-only";
  size?: "normal" | "flexible" | "compact";
  theme?: "auto" | "light" | "dark";
  callback: (token: string) => void;
  "error-callback": () => boolean | void;
  "expired-callback": () => void;
}

export interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileOptions) => string | undefined;
  execute: (widget: string) => void;
  reset: (widget: string) => void;
  remove: (widget: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_URL = `${CAPTCHA_ORIGIN}/turnstile/v0/api.js?render=explicit`;

let loading: Promise<TurnstileApi | null> | null = null;

export function loadTurnstile(): Promise<TurnstileApi | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (loading) return loading;
  loading = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(window.turnstile ?? null);
    script.onerror = () => {
      loading = null;
      script.remove();
      resolve(null);
    };
    document.head.appendChild(script);
  });
  return loading;
}
