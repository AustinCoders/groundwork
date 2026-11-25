import { bookRounds } from "@/lib/interviewBook";

export const PEER_ROUNDS: Record<string, string[]> = {
  javascript: ["r3", "r3ts"],
  react: ["r4"],
  frontend: ["r4fe", "r2"],
  backend: ["r5", "r6"],
  "system-design": ["r8", "s2"],
  dsa: ["r7", "s1"],
  behavioural: ["r11", "r10", "r11lp"],
};

export interface PeerQuestion {
  id: string;
  round: string;
  q: string;
  a: string | null;
  say: string | null;
  trap: string | null;
  fu: string[];
}

export function peerQuestions(topic: string): PeerQuestion[] | null {
  const ids = PEER_ROUNDS[topic];
  if (!ids) return null;
  const all = bookRounds();
  const rounds = ids.map((id) => all.find((r) => r.id === id)).filter((r) => r !== undefined);
  return rounds.flatMap((r) =>
    r.questions
      .filter((q) => !q.bulk)
      .map((q) => ({ id: q.id, round: r.navTitle, q: q.q, a: q.a, say: q.say, trap: q.trap, fu: q.fu.slice(0, 4) }))
  );
}
