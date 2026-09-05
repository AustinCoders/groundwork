import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interview — the whole loop",
  description:
    "Every round of the interview loop, in order — screening call through the offer number. What each round is really testing, the answer, the code, the wrong answer that loses the room, and the follow-up they push with next.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
