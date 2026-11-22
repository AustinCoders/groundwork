"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { OPEN_AUTH_EVENT, safeNext, type AuthMode } from "@/lib/account/config";
import { bootAccount } from "@/lib/account/session";

const AuthDialog = dynamic(() => import("@/components/account/AuthDialog").then((m) => m.AuthDialog), {
  ssr: false,
});

const MODES: readonly string[] = ["sign-in", "sign-up", "magic", "forgot"];

export function AuthHost() {
  const [open, setOpen] = useState<{ mode: AuthMode; next: string } | null>(null);

  useEffect(() => {
    bootAccount();
    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<{ mode?: string; next?: string }>).detail ?? {};
      const mode = MODES.includes(detail.mode ?? "") ? (detail.mode as AuthMode) : "sign-in";
      const here = `${window.location.pathname}${window.location.search}`;
      setOpen({ mode, next: safeNext(detail.next ?? here) });
    };
    window.addEventListener(OPEN_AUTH_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_AUTH_EVENT, onOpen);
  }, []);

  if (!open) return null;
  return <AuthDialog initialMode={open.mode} next={open.next} onClose={() => setOpen(null)} />;
}
