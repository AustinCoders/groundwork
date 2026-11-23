import type { ResumeAnalysis } from "./types";

export function forStorage(analysis: ResumeAnalysis): ResumeAnalysis {
  return {
    ...analysis,
    parsed: {
      ...analysis.parsed,
      email: analysis.parsed.email ? "on file" : null,
      phone: analysis.parsed.phone ? "on file" : null,
      sections: analysis.parsed.sections.map((s) => ({ ...s, lines: [] })),
    },
    fixes: analysis.fixes.map((f) => (f.id === "personal" ? { ...f, quotes: [] } : f)),
  };
}
