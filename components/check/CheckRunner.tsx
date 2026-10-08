"use client";

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent } from "react";
import type { Question } from "@/content/quiz-types";
import { Confetti } from "@/components/practice/Confetti";
import { ATTENTION_MS, arrivedAtCheck, passBannerText, sameGesture, startedMessage } from "@/lib/checkBanner";
import {
  CHECK_SIZE,
  correctAnswer,
  drawCheck,
  gradeAnswer,
  passMark,
  passes,
  startingOrder,
  type Answer,
} from "@/lib/checkDraw";
import { onCheckRequest } from "@/lib/checkOpen";
import { useMounted, useProgressValue } from "@/lib/hooks";
import { checkStatus } from "@/lib/quizRecord";
import { quizStore, useQuizRecord } from "@/lib/quizStore";
import { reviewNote } from "@/lib/reviewNote";
import { progress } from "@/lib/storage";
import { ChoiceList } from "./ChoiceList";
import { OrderList } from "./OrderList";
import { RichHtml } from "./RichHtml";
import styles from "./check.module.css";

interface Asking {
  name: "asking";
  questions: Question[];
  index: number;
  answers: Record<string, string[]>;
  checked: boolean;
  verdicts: Record<string, boolean>;
  banner: boolean;
}

interface Result {
  name: "result";
  questions: Question[];
  verdicts: Record<string, boolean>;
  score: number;
  passed: boolean;
  need: number;
  reviewNote: string | null;
  sectionTitles: Record<string, string>;
}

type Phase = { name: "start" } | Asking | Result;

type Refocus = "question" | "status" | "advance";

const REFOCUS_TARGET: Record<Refocus, string> = {
  question: "fieldset, [data-result-heading]",
  status: "[data-status]",
  advance: "[data-advance]",
};

const PLAIN_KEYS = new Set(["n", "p", "t", "[", "]", "/"]);

function wordsOf(sectionId: string): string {
  const words = sectionId.replace(/-/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function answerOf(question: Question, picked: string[]): Answer {
  return question.kind === "multi" || question.kind === "order" ? picked : (picked[0] ?? "");
}

function rightChoices(question: Question): { text: string; why: string }[] {
  if (question.kind === "order") return [];
  const right = new Set(correctAnswer(question) as string | string[]);
  return question.choices.filter((choice) => right.has(choice.id));
}

function dateOf(at: number): string {
  return new Date(at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function ignoreRepeat(event: ReactKeyboardEvent<HTMLButtonElement>) {
  if (event.repeat) event.preventDefault();
}

function ignoreDoubleClick(event: MouseEvent<HTMLButtonElement>): boolean {
  return event.detail > 1;
}

export function CheckRunner({
  chapterId,
  basePath,
  questions,
}: {
  chapterId: string;
  basePath: string;
  questions: Question[];
}) {
  const mounted = useMounted();
  const done = useProgressValue(() => progress.isChapterDone(chapterId), false);
  const record = useQuizRecord(chapterId);
  const status = checkStatus(mounted && done, record);
  const [phase, setPhase] = useState<Phase>({ name: "start" });
  const [attention, setAttention] = useState(0);
  const phaseRef = useRef<Phase>({ name: "start" });
  const openRef = useRef<() => void>(() => {});
  const lastOpenedAt = useRef(0);
  const legendTimer = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const lastDraw = useRef<string[]>([]);
  const refocus = useRef<Refocus | null>(null);
  const total = Math.min(CHECK_SIZE, questions.length);
  const need = passMark(total);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const keepKeysHere = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (PLAIN_KEYS.has(event.key)) event.stopPropagation();
    };
    root.addEventListener("keydown", keepKeysHere);
    return () => root.removeEventListener("keydown", keepKeysHere);
  }, []);

  useEffect(() => {
    const target = refocus.current;
    if (!target) return;
    refocus.current = null;
    rootRef.current?.querySelector<HTMLElement>(REFOCUS_TARGET[target])?.focus();
  });

  useEffect(() => () => window.clearTimeout(legendTimer.current), []);

  useEffect(() => {
    if (attention === 0) return;
    const card = rootRef.current?.closest<HTMLElement>('[data-island="check"]');
    if (!card) return;
    card.classList.remove(styles.attention);
    void card.offsetWidth;
    card.classList.add(styles.attention);
    const timer = setTimeout(() => card.classList.remove(styles.attention), ATTENTION_MS);
    return () => {
      clearTimeout(timer);
      card.classList.remove(styles.attention);
    };
  }, [attention]);

  const view: Phase = phase.name === "result" && phase.passed && !done ? { name: "start" } : phase;

  function show(next: Phase) {
    phaseRef.current = next;
    setPhase(next);
  }

  function begin(fromTick = false) {
    const drawn = drawCheck(questions, Math.random, lastDraw.current);
    lastDraw.current = drawn.map((question) => question.id);
    const answers: Record<string, string[]> = {};
    for (const question of drawn) {
      answers[question.id] =
        question.kind === "order"
          ? startingOrder(
              question.items.map((item) => item.id),
              Math.random
            )
          : [];
    }
    refocus.current = fromTick ? null : "question";
    show({ name: "asking", questions: drawn, index: 0, answers, checked: false, verdicts: {}, banner: fromTick });
    if (fromTick) focusLegendSoon();
  }

  function openFromTick() {
    if (questions.length === 0 || progress.isChapterDone(chapterId)) return;
    const current = phaseRef.current;
    if (current.name === "asking") {
      if (!current.banner) show({ ...current, banner: true });
    } else {
      begin(true);
    }
    setAttention((count) => count + 1);
  }

  function focusLegendSoon(retries = 10) {
    window.clearTimeout(legendTimer.current);
    legendTimer.current = window.setTimeout(
      () => {
        if (phaseRef.current.name !== "asking") return;
        const legend = rootRef.current?.querySelector<HTMLElement>("legend");
        if (legend) legend.focus({ preventScroll: true });
        else if (retries > 0) focusLegendSoon(retries - 1);
      },
      retries === 10 ? 0 : 16
    );
  }

  useEffect(() => {
    openRef.current = openFromTick;
  });

  useEffect(() => {
    const open = () => {
      lastOpenedAt.current = Date.now();
      openRef.current();
    };
    const forget = onCheckRequest(open);
    const onHashChange = () => {
      if (arrivedAtCheck(window.location.hash) && !sameGesture(Date.now(), lastOpenedAt.current)) open();
    };
    window.addEventListener("hashchange", onHashChange);
    onHashChange();
    return () => {
      forget();
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  function choose(question: Question, picked: string[]) {
    if (phase.name !== "asking") return;
    show({ ...phase, answers: { ...phase.answers, [question.id]: picked } });
  }

  function checkAnswer(asking: Asking) {
    const question = asking.questions[asking.index];
    const right = gradeAnswer(question, answerOf(question, asking.answers[question.id]));
    refocus.current = "advance";
    show({ ...asking, checked: true, verdicts: { ...asking.verdicts, [question.id]: right } });
  }

  function nextQuestion(asking: Asking) {
    refocus.current = "question";
    show({ ...asking, index: asking.index + 1, checked: false });
  }

  function finish(asking: Asking) {
    const score = asking.questions.filter((question) => asking.verdicts[question.id]).length;
    const missed = asking.questions.filter((question) => !asking.verdicts[question.id]);
    const passed = passes(score, asking.questions.length);
    const alreadyRead = progress.isChapterDone(chapterId);
    if (passed && !alreadyRead) progress.setChapterDone(chapterId, true);
    quizStore.recordAttempt(chapterId, { score, missed: missed.map((question) => question.id), passed });
    const note = reviewNote(progress.all().chapters[chapterId], Date.now());
    const sectionTitles: Record<string, string> = {};
    for (const question of missed) {
      sectionTitles[question.id] =
        document.getElementById(question.section)?.textContent?.trim() || wordsOf(question.section);
    }
    refocus.current = "question";
    show({
      name: "result",
      questions: asking.questions,
      verdicts: asking.verdicts,
      score,
      passed,
      need: passMark(asking.questions.length),
      reviewNote: note,
      sectionTitles,
    });
  }

  function markReadAnyway() {
    if (!progress.isChapterDone(chapterId)) progress.setChapterDone(chapterId, true);
    quizStore.recordMarkedAnyway(chapterId);
    refocus.current = "status";
    show({ name: "start" });
  }

  function markReadWithoutCheck() {
    progress.setChapterDone(chapterId, true);
    refocus.current = "status";
  }

  const statusLine = mounted && status !== "unread" && (
    <div className={styles.statusBlock}>
      <p className={styles.status} data-status={status} tabIndex={-1}>
        {status === "passed"
          ? `Checked${record?.passedAt ? `: passed on ${dateOf(record.passedAt)}` : ""}`
          : status === "not-checked"
            ? "Marked read, not checked"
            : "Read before checks"}
      </p>
      {record && record.attempts > 0 && (
        <p className={styles.best}>
          Best score {record.best} of {total}
        </p>
      )}
    </div>
  );

  let body;
  if (questions.length === 0) {
    body = (
      <>
        {mounted && done ? (
          <p className={styles.text} data-status="read" tabIndex={-1}>
            Marked as read. The check for this chapter is not written yet.
          </p>
        ) : (
          <p className={styles.text}>
            The check for this chapter is not written yet, so there is nothing to answer here.
          </p>
        )}
        {!(mounted && done) && (
          <div className={styles.actions}>
            <button type="button" className={styles.secondary} onClick={markReadWithoutCheck}>
              Mark as read
            </button>
          </div>
        )}
      </>
    );
  } else if (view.name === "start") {
    const readAlready = mounted && done;
    body = (
      <>
        {statusLine}
        <p className={styles.text}>
          {`${total} ${total === 1 ? "question" : "questions"}, pass at ${need}. The check runs in your browser and the result stays on this device, so it is a self-check and not a certificate.`}
        </p>
        {status === "read-before-checks" && (
          <p className={styles.text}>
            You marked this chapter read before checks existed. It stays read, and you can check yourself whenever you
            like.
          </p>
        )}
        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={() => begin()}>
            {readAlready ? "Check yourself" : "Start the check"}
          </button>
          {!readAlready && (
            <button type="button" className={styles.secondary} onClick={markReadAnyway}>
              Mark as read without the check
            </button>
          )}
        </div>
      </>
    );
  } else if (view.name === "asking") {
    const asking = view;
    const question = asking.questions[asking.index];
    const picked = asking.answers[question.id];
    const last = asking.index === asking.questions.length - 1;
    const canCheck = question.kind === "order" || picked.length > 0;
    const legend = `Question ${asking.index + 1} of ${asking.questions.length}`;
    const verdict = asking.checked ? (asking.verdicts[question.id] ? "Correct" : "Not quite") : "";
    body = (
      <>
        {asking.banner && (
          <div className={styles.banner} data-banner="">
            <p className={styles.bannerText}>
              {passBannerText(passMark(asking.questions.length), asking.questions.length)}
            </p>
            <button type="button" className={styles.secondary} onClick={markReadAnyway}>
              Mark as read without the check
            </button>
          </div>
        )}
        {question.kind === "order" ? (
          <OrderList
            key={question.id}
            questionId={question.id}
            legend={legend}
            prompt={question.prompt}
            items={question.items}
            order={picked}
            onChange={(order) => choose(question, order)}
            checked={asking.checked}
            correct={correctAnswer(question) as string[]}
            why={question.why}
          />
        ) : (
          <ChoiceList
            key={question.id}
            questionId={question.id}
            legend={legend}
            prompt={question.prompt}
            kind={question.kind}
            choices={question.choices}
            selected={picked}
            onChange={(next) => choose(question, next)}
            checked={asking.checked}
            correct={question.kind === "multi" ? question.answers : [question.answer]}
          />
        )}
        <p className={styles.verdict} role="status" aria-live="polite" data-verdict={verdict}>
          {verdict}
        </p>
        <div className={styles.actions}>
          {asking.checked ? (
            <button
              key="advance"
              type="button"
              className={styles.primary}
              data-advance=""
              onKeyDown={ignoreRepeat}
              onClick={(event) => {
                if (ignoreDoubleClick(event)) return;
                if (last) finish(asking);
                else nextQuestion(asking);
              }}
            >
              {last ? "See result" : "Next question"}
            </button>
          ) : (
            <button
              key="check"
              type="button"
              className={styles.primary}
              disabled={!canCheck}
              onKeyDown={ignoreRepeat}
              onClick={(event) => {
                if (!ignoreDoubleClick(event)) checkAnswer(asking);
              }}
            >
              Check answer
            </button>
          )}
        </div>
      </>
    );
  } else {
    const result = view;
    const missed = result.questions.filter((question) => !result.verdicts[question.id]);
    body = result.passed ? (
      <>
        {statusLine}
        <h3 className={styles.resultHeading} tabIndex={-1} data-result-heading="">
          Passed
        </h3>
        <p className={styles.score}>
          {result.score} of {result.questions.length}
        </p>
        <p className={styles.text}>
          {`This chapter is marked read.${result.reviewNote ? ` ${result.reviewNote}` : ""}`}
        </p>
        {missed.length > 0 && (
          <p className={styles.text}>
            {missed.length === 1 ? "One question" : `${missed.length} questions`} to look at again; the links are below.
          </p>
        )}
        {missed.length > 0 && (
          <MissedList missed={missed} basePath={basePath} chapterId={chapterId} sectionTitles={result.sectionTitles} />
        )}
        <div className={styles.actions}>
          <button type="button" className={styles.secondary} onClick={() => begin()}>
            Check again
          </button>
        </div>
        <Confetti fire />
      </>
    ) : (
      <>
        {statusLine}
        <h3 className={styles.resultHeading} tabIndex={-1} data-result-heading="">
          Not yet
        </h3>
        <p className={styles.score}>
          {result.score} of {result.questions.length}
        </p>
        <p className={styles.text}>
          You need {result.need} of {result.questions.length} to pass. Here is what to look at again, and you can try as
          often as you like.
        </p>
        <MissedList missed={missed} basePath={basePath} chapterId={chapterId} sectionTitles={result.sectionTitles} />
        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={() => begin()}>
            Try again
          </button>
          {!done && (
            <button type="button" className={styles.secondary} onClick={markReadAnyway}>
              Mark as read anyway (not checked)
            </button>
          )}
        </div>
      </>
    );
  }

  const startedNote =
    view.name === "asking" && view.banner ? startedMessage(passMark(view.questions.length), view.questions.length) : "";

  return (
    <div className={styles.runner} ref={rootRef}>
      <p className="visually-hidden" role="status" aria-live="polite">
        {startedNote}
      </p>
      {body}
    </div>
  );
}

function MissedList({
  missed,
  basePath,
  chapterId,
  sectionTitles,
}: {
  missed: Question[];
  basePath: string;
  chapterId: string;
  sectionTitles: Record<string, string>;
}) {
  return (
    <ol className={styles.missed}>
      {missed.map((question, at) => (
        <li key={question.id} className={styles.missedItem} data-missed={question.id}>
          <RichHtml
            html={question.prompt}
            label={`Code in missed question ${at + 1} of ${missed.length}`}
            className={styles.prompt}
          />
          <div className={styles.why}>
            <p className={styles.tags}>{question.kind === "order" ? "The right order" : "Right answer"}</p>
            {question.kind === "order" ? (
              <>
                <ol className={styles.rightOrder}>
                  {question.items.map((item) => (
                    <li key={item.id} dangerouslySetInnerHTML={{ __html: item.text }} />
                  ))}
                </ol>
                <span dangerouslySetInnerHTML={{ __html: question.why }} />
              </>
            ) : (
              rightChoices(question).map((choice, at) => (
                <p key={at} className={styles.rightChoice}>
                  <span dangerouslySetInnerHTML={{ __html: choice.text }} />{" "}
                  <span className={styles.rightWhy} dangerouslySetInnerHTML={{ __html: choice.why }} />
                </p>
              ))
            )}
          </div>
          <a className={styles.sectionLink} href={`${basePath}/${chapterId}#${question.section}`}>
            Read again: {sectionTitles[question.id]}
          </a>
        </li>
      ))}
    </ol>
  );
}
