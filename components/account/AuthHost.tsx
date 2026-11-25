"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { OPEN_AUTH_EVENT, safeNext, type AuthMode } from "@/lib/account/config";
import { needsOnboarding, onboardingDone } from "@/lib/account/onboarding";
import { bootAccount, signOut, useAccount } from "@/lib/account/session";

const AuthDialog = dynamic(() => import("@/components/account/AuthDialog").then((m) => m.AuthDialog), {
  ssr: false,
});

const MODES: readonly string[] = ["sign-in", "sign-up", "magic", "forgot", "welcome"];

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

  const { status, user, profile } = useAccount();
  const askCode = status === "verify";
  const askWelcome =
    !open && !askCode && status === "in" && user !== null && needsOnboarding(profile) && !onboardingDone(user.id);

  useEffect(() => {
    if (!askWelcome) return;
    const id = window.setTimeout(() => setOpen({ mode: "welcome", next: "/" }), 600);
    return () => window.clearTimeout(id);
  }, [askWelcome]);

  if (askCode) {
    return (
      <AuthDialog
        key="mfa"
        initialMode="mfa"
        next="/"
        onClose={() => {
          setOpen(null);
          void signOut();
        }}
      />
    );
  }
  if (!open) return null;
  return <AuthDialog initialMode={open.mode} next={open.next} onClose={() => setOpen(null)} />;
}
