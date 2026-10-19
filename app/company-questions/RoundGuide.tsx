import Link from "next/link";
import type { CSSProperties } from "react";
import { PROCESSES } from "@/content/system-design/company-questions/process";
import { ROUND_KINDS, ROUND_ORDER } from "@/content/system-design/company-questions/rounds";
import { accentVar } from "@/lib/accent";
import { RoundIcon } from "./RoundIcon";
import { bookRoundTitle } from "./data";
import hub from "./hub.module.css";

export function RoundGuide() {
  return (
    <ul className={hub.rounds}>
      {ROUND_ORDER.map((type) => {
        const kind = ROUND_KINDS[type];
        const companies = PROCESSES.filter((entry) => entry.rounds.some((round) => round.type === type)).length;
        const books = kind.book.map((id) => ({ id, title: bookRoundTitle(id) })).filter((entry) => entry.title);
        return (
          <li key={type} style={{ "--tone": accentVar(kind.accent) } as CSSProperties}>
            <details className={hub.roundBox}>
              <summary>
                <span className={hub.roundIconBox} aria-hidden="true">
                  <RoundIcon name={kind.icon} />
                </span>
                <span className={hub.roundText}>
                  <b>{kind.label}</b>
                  <em>
                    {companies === 0
                      ? "Usually part of another round"
                      : `${companies} ${companies === 1 ? "company runs" : "companies run"} it`}
                  </em>
                </span>
                <span className={hub.roundPlus} aria-hidden="true">
                  +
                </span>
              </summary>
              <p>{kind.what}</p>
              <ul>
                {kind.asked.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {(books.length > 0 || kind.topics.length > 0) && (
                <p className={hub.roundLinks}>
                  {books.map((entry) => (
                    <Link key={entry.id} href={`/interview/${entry.id}`} prefetch={false}>
                      Book · {entry.title}
                    </Link>
                  ))}
                  {kind.topics.map((topic) => (
                    <Link key={topic.href} href={topic.href} prefetch={false}>
                      {topic.label}
                    </Link>
                  ))}
                </p>
              )}
            </details>
          </li>
        );
      })}
    </ul>
  );
}
