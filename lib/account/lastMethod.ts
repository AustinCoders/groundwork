export const LAST_METHOD_KEY = "gw-last-sign-in";

export type SignInMethod = "google" | "github" | "password" | "code";

const METHODS: readonly string[] = ["google", "github", "password", "code"];

export function lastSignInMethod(): SignInMethod | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(LAST_METHOD_KEY);
    return saved !== null && METHODS.includes(saved) ? (saved as SignInMethod) : null;
  } catch {
    return null;
  }
}

export function rememberSignInMethod(method: SignInMethod): void {
  try {
    localStorage.setItem(LAST_METHOD_KEY, method);
  } catch {}
}
