import type { Profile } from "@/lib/account/session";

const PREFIX = "gw-onboarded:";

export function needsOnboarding(profile: Profile | null): boolean {
  if (!profile) return false;
  return profile.goal === null && profile.experience === null && profile.targetRole === null;
}

export function onboardingDone(userId: string): boolean {
  try {
    return localStorage.getItem(PREFIX + userId) !== null;
  } catch {
    return true;
  }
}

export function markOnboardingDone(userId: string): void {
  try {
    localStorage.setItem(PREFIX + userId, String(Date.now()));
  } catch {}
}
