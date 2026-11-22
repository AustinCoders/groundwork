export type StrengthScore = 0 | 1 | 2 | 3 | 4;

export interface Strength {
  score: StrengthScore;
  label: string;
  tip: string | null;
}

const LABELS = ["Too weak", "Weak", "Fair", "Good", "Strong"] as const;

const COMMON = new Set([
  "password",
  "passw0rd",
  "qwerty",
  "qwertyuiop",
  "letmein",
  "iloveyou",
  "admin",
  "welcome",
  "abc123",
  "monkey",
  "dragon",
  "football",
  "baseball",
  "sunshine",
  "princess",
  "master",
  "shadow",
  "superman",
  "trustno1",
  "groundwork",
  "asdfghjkl",
  "zxcvbnm",
]);

const SEQUENCES = ["0123456789", "abcdefghijklmnopqrstuvwxyz", "qwertyuiop", "asdfghjkl", "zxcvbnm"];

export function isCommonPassword(value: string): boolean {
  const lower = value.toLowerCase();
  if (/^(\d)\1+$/.test(lower) || /^\d+$/.test(lower)) return true;
  const core = lower.replace(/[\d\W_]+$/, "").replace(/^[\d\W_]+/, "");
  return COMMON.has(lower) || (core.length > 0 && COMMON.has(core));
}

function hasSequence(lower: string): boolean {
  for (const run of SEQUENCES) {
    for (let i = 0; i + 4 <= run.length; i++) {
      const piece = run.slice(i, i + 4);
      if (lower.includes(piece) || lower.includes([...piece].reverse().join(""))) return true;
    }
  }
  return false;
}

function personalParts(hints: readonly string[]): string[] {
  const parts: string[] = [];
  for (const hint of hints) {
    const local = hint.toLowerCase().split("@")[0] ?? "";
    for (const piece of local.split(/[^a-z0-9]+/)) if (piece.length >= 3) parts.push(piece);
  }
  return parts;
}

export function passwordStrength(value: string, hints: readonly string[] = []): Strength {
  if (!value) return { score: 0, label: "", tip: null };
  const lower = value.toLowerCase();
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(value)).length;
  const personal = personalParts(hints).some((part) => lower.includes(part));
  const repeated = /(.)\1{3,}/.test(value);
  const sequence = hasSequence(lower);

  if (isCommonPassword(value)) {
    return { score: 0, label: LABELS[0], tip: "That is one of the first passwords attackers try. Choose another." };
  }
  if (value.length < 8) {
    return { score: 0, label: LABELS[0], tip: "Use at least 8 characters." };
  }

  let score = value.length >= 16 ? 3 : value.length >= 12 ? 2 : 1;
  if (classes >= 3) score += 1;
  if (personal) score -= 1;
  if (repeated || sequence) score -= 1;
  const clamped = Math.max(0, Math.min(4, score)) as StrengthScore;

  let tip: string | null = null;
  if (personal) tip = "Leave your name and email out of it.";
  else if (repeated || sequence) tip = "Avoid runs like 1234, abcd or aaaa.";
  else if (value.length < 12) tip = "Longer is stronger: try 12 or more characters.";
  else if (classes < 3) tip = "Mix in a capital letter or a symbol.";

  return { score: clamped, label: LABELS[clamped], tip };
}
