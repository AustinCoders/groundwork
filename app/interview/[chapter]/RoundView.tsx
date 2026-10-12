"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { BookFrame } from "@/app/interview/BookFrame";
import { answerHtml, followUpsHtml } from "@/app/interview/answerHtml";
import {
  ChapterCrumbs,
  ChapterEndScene,
  ChapterHeaderPager,
  ChapterHero,
  ChapterInlineToc,
  Prose,
  ReaderLayout,
  ReadingColumn,
} from "@/components/chapter/ChapterKit";
import { ChapterRail, useRailParts } from "@/components/chapter/ChapterRail";
import { ChapterSearch } from "@/components/chapter/ChapterSearch";
import { ChaptersSheet, ChaptersSheetButton } from "@/components/chapter/ChaptersSheet";
import { TocCard } from "@/components/chapter/TocCard";
import { useActiveHeading } from "@/components/chapter/useActiveHeading";
import { useChapterKeys } from "@/components/chapter/useChapterKeys";
import { useChapterSearch } from "@/components/chapter/useChapterSearch";
import type { SeriesCard, SeriesPart } from "@/components/chapter/types";
import { useScrollRegions } from "@/components/reader/scrollRegions";
import type { FrameTopic } from "@/components/topic/TopicFrame";
import { plainText, truncate } from "@/lib/homeRounds";
import { confidence, CONFIDENCE_LABEL, useConfidence, type Confidence } from "@/lib/interviewConfidence";
import { useMounted, useProgressValue } from "@/lib/hooks";
import { progress, store } from "@/lib/storage";
import { plural } from "@/lib/format";
import type { BookQuestion, BookRound } from "@/lib/interviewBook";
import styles from "./round.module.css";

type Mode = "read" | "practise";
const MODE_KEY = "groundwork:interview:mode";
const modeListeners = new Set<() => void>();

function readMode(): Mode {
  return store.get<Mode>(MODE_KEY, "read") === "practise" ? "practise" : "read";
}

function subscribeMode(fn: () => void) {
  modeListeners.add(fn);
  return () => {
    modeListeners.delete(fn);
  };
}

function setMode(m: Mode) {
  store.set(MODE_KEY, m);
  modeListeners.forEach((fn) => fn());
}

const CONF: Confidence[] = ["knew", "shaky", "blank"];
const LEARN_LIMIT = 70;

function QuestionSection({
  q,
  code,
  mode,
  mark,
}: {
  q: BookQuestion;
  code: string;
  mode: Mode;
  mark: Confidence | undefined;
}) {
  const [shown, setShown] = useState(false);
  const hidden = mode === "practise" && !shown && !q.bulk;
  const card = useRef<HTMLElement>(null);
  useScrollRegions(card, hidden);
  const hasAnswer = Boolean(q.a || q.code.length || q.say || q.trap || q.note || q.after);
  const body = hidden ? followUpsHtml(q.fu) : answerHtml(q);

  return (
    <section ref={card} className={styles.q} id={q.id} data-mark={mark} aria-labelledby={`${q.id}-q`}>
      <header className={styles.qHead}>
        <span className={styles.qNo}>
          {code}.{q.n}
        </span>
        <span className={styles.qRule} aria-hidden="true" />
        {mark && (
          <span className={styles.qMark} data-mark={mark}>
            {CONFIDENCE_LABEL[mark]}
          </span>
        )}
      </header>
      <h2 className={styles.qTitle} id={`${q.id}-q`}>
        <span className={styles.qText} dangerouslySetInnerHTML={{ __html: q.q }} />
      </h2>

      {q.test && (
        <p className={styles.test}>
          <b>What they are really testing</b>
          <span dangerouslySetInnerHTML={{ __html: q.test }} />
        </p>
      )}

      {hasAnswer && hidden && (
        <div className={styles.hiddenAnswer}>
          <p>Say your answer out loud first. Then check it.</p>
          <button type="button" className={styles.hiddenGo} onClick={() => setShown(true)}>
            Show the answer
          </button>
        </div>
      )}
      {body && (
        <div className={styles.answer}>
          <Prose html={body} className="interview-body" />
        </div>
      )}

      {!q.bulk && (
        <div className={styles.confRow} role="group" aria-label={`How well did you know ${code}.${q.n}?`}>
          <span>How did you do?</span>
          {CONF.map((c) => (
            <button
              key={c}
              type="button"
              data-c={c}
              aria-pressed={mark === c}
              onClick={() => confidence.set(q.id, mark === c ? null : c)}
            >
              {CONFIDENCE_LABEL[c]}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export function RoundView({
  topic,
  round,
  partIndex,
  partTitle,
  parts,
  cards,
}: {
  topic: FrameTopic;
  round: BookRound;
  partIndex: number;
  partTitle: string;
  parts: SeriesPart<string>[];
  cards: SeriesCard<string>[];
}) {
  const mounted = useMounted();
  const mode = useSyncExternalStore(subscribeMode, readMode, () => "read" as Mode);
  const conf = useConfidence();
  const [railOpen, setRailOpen] = useState(false);
  const sheetSearchInputRef = useRef<HTMLInputElement>(null);
  const closeRail = useCallback(() => setRailOpen(false), []);

  const index = cards.findIndex((c) => c.id === round.id);
  const card = cards[index];
  const prev = cards[index - 1];
  const next = cards[index + 1];
  const basePath = topic.href;

  const doneKey = useProgressValue(
    () =>
      cards
        .filter((c) => progress.isChapterDone(c.id))
        .map((c) => c.id)
        .join(","),
    ""
  );
  const done = useMemo(() => new Set(doneKey ? doneKey.split(",") : []), [doneKey]);
  const isDone = done.has(round.id);
  const toggleRead = () => progress.setChapterDone(round.id, !isDone);

  const questions = round.questions;
  const real = questions.filter((q) => !q.bulk).length;
  const marked = questions.filter((q) => conf[q.id]).length;
  const toc = useMemo(() => questions.map((q) => ({ id: q.id, text: truncate(plainText(q.q), 120) })), [questions]);
  const marks = useMemo(() => Object.fromEntries(questions.map((q) => [q.id, conf[q.id]])), [questions, conf]);
  const { active, pct } = useActiveHeading(toc);

  const search = useChapterSearch({ topicId: "interview", basePath, chapters: cards });
  useChapterKeys({
    prevHref: prev && `${basePath}/${prev.id}`,
    nextHref: next && `${basePath}/${next.id}`,
    onSlash: () => {
      search.searchInputRef.current?.focus();
      search.searchInputRef.current?.select();
    },
  });
  const { openParts, togglePart } = useRailParts(card);

  const rail = (extra: { navListId?: string; search: React.ReactNode }) => (
    <ChapterRail
      label="Rounds"
      parts={parts}
      chapters={cards}
      chapter={card}
      basePath={basePath}
      homeLabel="The book"
      done={done}
      mounted={mounted}
      openParts={openParts}
      onTogglePart={togglePart}
      onNavigate={closeRail}
      searching={search.searching}
      matchInfo={search.matches}
      navListId={extra.navListId}
      search={extra.search}
    />
  );

  const facts = round.guide
    ? [plural(questions.length, "section"), `${round.minutes} min read`]
    : [
        plural(real, "question"),
        plural(round.counts.followUps, "follow-up"),
        ...(round.counts.traps ? [plural(round.counts.traps, "trap")] : []),
        `${round.minutes} min read`,
      ];

  return (
    <BookFrame
      topic={topic}
      scan={`${round.id}:${mode}`}
      withLinks={false}
      skipHref={`#${round.id}`}
      actions={
        <>
          <ChaptersSheetButton label="Rounds" open={railOpen} onOpen={() => setRailOpen(true)} />
          <ChapterCrumbs href={basePath} label={topic.name} part={partTitle} num={round.code} />
          <ChapterHeaderPager index={index} total={cards.length} prev={prev} next={next} basePath={basePath} />
        </>
      }
    >
      <ReaderLayout
        accent={topic.accent}
        rail={rail({
          search: (
            <ChapterSearch
              value={search.query}
              onChange={search.setQuery}
              matches={search.matches}
              otherMatches={search.otherMatches}
              chapterIds={cards.map((c) => c.id)}
              basePath={basePath}
              inputRef={search.searchInputRef}
            />
          ),
        })}
        aside={
          <TocCard
            label="In this round"
            item="Question"
            unit="rounds"
            toc={toc}
            active={active}
            pct={pct}
            marks={marks}
            read={mounted && isDone}
            onToggleRead={toggleRead}
          />
        }
      >
        <ReadingColumn id={round.id} read={isDone}>
          <ChapterHero
            mark={topic.mark}
            num={round.code}
            partLabel={`Part ${partIndex + 1} · ${partTitle}`}
            title={round.title}
            subtitleHtml={round.intro ?? undefined}
            facts={facts}
            learn={questions.map((q) => truncate(plainText(q.q), LEARN_LIMIT))}
            learnLabel="In this round"
            minutes={round.minutes}
            position={{ index: index + 1, total: cards.length }}
            read={mounted && isDone}
          />

          {(round.meta.length > 0 || round.companies.length > 0 || round.mockStage) && (
            <section className={styles.glance} aria-label="This round at a glance">
              {round.meta.length > 0 && (
                <dl className={styles.meta}>
                  {round.meta.map(([k, v]) => (
                    <div key={k} className={styles.metaCell}>
                      <dt>{k}</dt>
                      <dd dangerouslySetInnerHTML={{ __html: v }} />
                    </div>
                  ))}
                </dl>
              )}
              {(round.companies.length > 0 || round.mockStage) && (
                <div className={styles.glanceFoot}>
                  {round.companies.length > 0 && (
                    <div className={styles.companiesRow}>
                      <span className={styles.companiesLabel}>Asked at</span>
                      <ul className={styles.companies} aria-label="Asked at">
                        {round.companies.map((c) => (
                          <li key={c.name}>
                            <span className={styles.company} data-hot={c.hot || undefined}>
                              {c.name}
                              {!c.hot && <span className="visually-hidden"> (less often)</span>}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {round.mockStage && (
                    <Link href="/mock" className={styles.mockLink} prefetch={false}>
                      Practise this round as a mock →
                    </Link>
                  )}
                </div>
              )}
            </section>
          )}

          <div className={styles.mode}>
            <div className={styles.modeSwitch} role="group" aria-label="Mode">
              <button type="button" aria-pressed={mode === "read"} onClick={() => setMode("read")}>
                Read
              </button>
              <button type="button" aria-pressed={mode === "practise"} onClick={() => setMode("practise")}>
                Practise
              </button>
            </div>
            <p className={styles.modeNote}>
              {mode === "practise"
                ? "Answers stay hidden until you have said yours."
                : "Everything open, top to bottom."}
            </p>
          </div>

          {toc.length > 0 && <ChapterInlineToc toc={toc} />}

          {round.pre && <Prose html={round.pre} className="interview-body" />}
          {questions.map((q) => (
            <QuestionSection key={q.id} q={q} code={round.code} mode={mode} mark={conf[q.id]} />
          ))}
          {round.post && <Prose html={round.post} className="interview-body" />}

          <ChapterEndScene
            num={round.code}
            unit="round"
            navLabel="Rounds"
            finish={{
              num: round.code,
              read: mounted && isDone,
              readCount: mounted ? done.size : 0,
              total: cards.length,
              onToggleRead: toggleRead,
              unit: "round",
              scope: "in this book",
              doneLabel: "Round read",
              todoLabel: "Finished this round?",
              aside:
                marked > 0 ? (
                  <button
                    type="button"
                    className={styles.clearMarks}
                    onClick={() => confidence.clear(questions.map((q) => q.id))}
                  >
                    Clear my marks
                  </button>
                ) : undefined,
            }}
            prev={prev}
            next={next}
            basePath={basePath}
            homeLabel="The interview book"
          />
        </ReadingColumn>
      </ReaderLayout>

      <ChaptersSheet label="Rounds" open={railOpen} onClose={closeRail}>
        {rail({
          navListId: "nav-list-sheet",
          search: (
            <ChapterSearch
              id="search-sheet"
              value={search.query}
              onChange={search.setQuery}
              matches={search.matches}
              otherMatches={search.otherMatches}
              chapterIds={cards.map((c) => c.id)}
              basePath={basePath}
              inputRef={sheetSearchInputRef}
            />
          ),
        })}
      </ChaptersSheet>
    </BookFrame>
  );
}
