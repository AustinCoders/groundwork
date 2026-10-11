"use client";

import { usePathname } from "next/navigation";
import { PageFrame, type FrameLink, type FrameScan } from "@/components/frame/PageFrame";
import type { FrameTopic } from "@/components/topic/TopicFrame";

const LINKS: FrameLink[] = [
  { href: "/interview", label: "Rounds" },
  { href: "/interview/questions", label: "Question bank" },
  { href: "/mock", label: "Mock interview" },
];

export function BookFrame({
  topic,
  scan,
  actions,
  withLinks = true,
  skipHref,
  children,
}: {
  topic: FrameTopic;
  scan?: FrameScan;
  actions?: React.ReactNode;
  withLinks?: boolean;
  skipHref?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const home = pathname === "/interview";
  return (
    <PageFrame
      title={topic.name}
      titleHref={topic.href}
      mark={topic.mark}
      accent={topic.accent}
      links={withLinks ? LINKS : []}
      actions={actions}
      back={home ? { href: "/", label: "Home" } : { href: topic.href, label: topic.name }}
      layout="reader"
      skipLabel="Skip to the interview book"
      skipHref={skipHref}
      scan={scan}
    >
      {children}
    </PageFrame>
  );
}
