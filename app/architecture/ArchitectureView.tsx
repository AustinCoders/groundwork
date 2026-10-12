"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Copy, Scene, Tape } from "@/components/home/Stage";
import { Card, Compose, Join, Remark, Tag, type JoinTo, type Slot } from "@/components/topic/Compose";
import { TopIcon } from "@/components/practice/TopIcon";
import { Check, Journey, JourneyStop, Station, StopHead } from "@/components/topic/Journey";
import {
  Actions,
  Band,
  Button,
  CardKicker,
  Chips,
  Facts,
  Foot,
  FootLink,
  Heading,
  Kicker,
  Lead,
  List,
  Row,
  TopicPage,
  Underlined,
  topicKit,
} from "@/components/topic/TopicKit";
import { TopicFrame, type FrameTopic } from "@/components/topic/TopicFrame";
import { ARCH_PARTS as PARTS } from "@/lib/architectureParts";
import { formatSpan, plural } from "@/lib/format";
import { useMounted, useProgressValue } from "@/lib/hooks";
import { progress } from "@/lib/storage";
import type { RepoStats } from "@/lib/repoStats";
import styles from "./architecture.module.css";

export interface ChapterCard {
  id: string;
  num: string;
  title: string;
  short?: string;
  subtitle: string;
  level: "beginner" | "intermediate" | "advanced";
  minutes: number;
}

interface MapNode {
  chapter: string;
  label: string;
  note: string;
}

interface Lane {
  id: string;
  title: string;
  when: string;
  nodes: MapNode[];
}

const LANES: Lane[] = [
  {
    id: "browser",
    title: "Your browser",
    when: "while you read and code",
    nodes: [
      { chapter: "arch-rendering", label: "Pages", note: "Server-rendered HTML, hydrated into small client islands" },
      { chapter: "arch-playground", label: "Editor", note: "CodeMirror, plus a worker for Prettier, ESLint and types" },
      {
        chapter: "arch-runtimes",
        label: "Runtimes",
        note: "JS, Python, SQL, C/C++, Ruby, PHP and Lua, run as WebAssembly",
      },
      { chapter: "arch-grading", label: "Grading", note: "Tests and recorded cases decide pass or fail" },
      { chapter: "arch-debugger", label: "Debugger", note: "Step through JS and Python line by line" },
      {
        chapter: "arch-whiteboard",
        label: "Whiteboard",
        note: "An SVG board with undo, arrows that follow and share links",
      },
      { chapter: "arch-mock", label: "Mock interviews", note: "Planner, rubric scoring and an adaptive interviewer" },
      { chapter: "arch-state", label: "State", note: "localStorage, the URL and share hashes; no accounts" },
    ],
  },
  {
    id: "edge",
    title: "Vercel",
    when: "on every request",
    nodes: [
      { chapter: "arch-request-path", label: "CDN", note: "Serves prerendered pages straight from the edge" },
      { chapter: "arch-apis", label: "Functions", note: "The /api routes, test cases and mock question banks" },
      { chapter: "arch-search", label: "Search indexes", note: "One JSON index per topic, fetched on demand" },
      { chapter: "arch-routes", label: "Routes", note: "Every URL and why it looks the way it does" },
    ],
  },
  {
    id: "build",
    title: "The build",
    when: "before you arrive",
    nodes: [
      { chapter: "arch-content-model", label: "Content", note: "Topics, chapters and exercises written as TypeScript" },
      { chapter: "arch-build", label: "Build", note: "Static params, recorded cases, indexes and the sitemap" },
      { chapter: "arch-design-system", label: "Design system", note: "Nine themes, seven hands, two shells" },
      { chapter: "arch-tech-stack", label: "Stack", note: "Every dependency, and what is deliberately absent" },
    ],
  },
  {
    id: "around",
    title: "Around it",
    when: "on every push",
    nodes: [
      {
        chapter: "arch-testing",
        label: "Tests & CI",
        note: "Unit tests, end-to-end, accessibility and honesty checks",
      },
      { chapter: "arch-delivery", label: "Delivery", note: "Branches, previews, cleanup and error reporting" },
      { chapter: "arch-performance", label: "Performance", note: "Lighthouse budgets and what each page ships" },
      { chapter: "arch-security", label: "Security", note: "Sandboxing your code and distrusting share links" },
    ],
  },
];

const HERO_LANES: { id: string; at: Slot; join?: JoinTo }[] = [
  { id: "build", at: "a", join: "right" },
  { id: "edge", at: "b", join: "down" },
  { id: "browser", at: "c", join: "left" },
  { id: "around", at: "d" },
];
const PREVIEW_NODES = 4;

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

function splitTitle(title: string): [string, string] {
  const words = title.split(" ");
  const tail = Math.min(2, words.length - 1);
  return [words.slice(0, words.length - tail).join(" "), words.slice(words.length - tail).join(" ")];
}

export function ArchitectureView({
  topic,
  title,
  lead,
  basePath,
  chapters,
  stats,
  written,
  exercises,
}: {
  topic: FrameTopic;
  title: string;
  lead: string;
  basePath: string;
  chapters: ChapterCard[];
  stats: RepoStats;
  written: number;
  exercises: number;
}) {
  const mounted = useMounted();
  const byId = useMemo(() => new Map(chapters.map((c) => [c.id, c])), [chapters]);

  const doneKey = useProgressValue(
    () =>
      chapters
        .filter((c) => progress.isChapterDone(c.id))
        .map((c) => c.id)
        .join(","),
    ""
  );
  const done = useMemo(() => new Set(doneKey ? doneKey.split(",") : []), [doneKey]);
  const next = chapters.find((c) => !done.has(c.id)) ?? chapters[0];
  const totalMinutes = chapters.reduce((n, c) => n + c.minutes, 0);
  const started = mounted && done.size > 0;
  const [titleLead, titleTail] = splitTitle(title);

  const facts: { value: string; label: string }[] = [
    { value: formatNumber(stats.pages), label: "page routes" },
    { value: formatNumber(stats.routeHandlers), label: `route handlers, ${stats.apiFunctions} under /api` },
    { value: formatNumber(stats.codeLines), label: `lines of app code in ${formatNumber(stats.codeFiles)} files` },
    { value: formatNumber(stats.contentLines), label: "lines of written content" },
    { value: `${stats.runnableLanguages} of ${stats.languages}`, label: "languages run in the browser" },
    { value: formatNumber(exercises), label: "exercises with tests" },
    { value: `${stats.dependencies} + ${stats.devDependencies}`, label: "dependencies + dev tools" },
    { value: `${stats.unitTestFiles} + ${stats.e2eSpecs}`, label: "unit test files + browser specs" },
  ];
  const half = Math.ceil(facts.length / 2);

  return (
    <TopicFrame
      topic={topic}
      reading
      layout="reader"
      skip={{ label: "Skip to the architecture" }}
      actions={
        <Link className="btn btn--primary" href={`${basePath}/${next.id}`}>
          {started ? "Continue reading" : "Start reading"}
          <TopIcon name="next" size={16} />
        </Link>
      }
    >
      <TopicPage accent={topic.accent}>
        <Scene className={topicKit.hero}>
          <Copy>
            <Kicker mark={topic.mark}>A design review of the site you are reading</Kicker>
            <Heading>
              {titleLead} <Underlined>{titleTail}</Underlined>
            </Heading>
            <Lead>{lead}</Lead>
            <div className={mounted ? undefined : topicKit.pending}>
              <Actions>
                <Button href={`${basePath}/${next.id}`}>
                  {started ? "Continue with" : "Start here:"} {next.short || next.title}{" "}
                  <span aria-hidden="true">→</span>
                </Button>
                <Button ghost href="#map-title">
                  The system on one page
                </Button>
              </Actions>
            </div>
            <Chips>
              <span className={topicKit.chip}>{plural(chapters.length, "chapter")}</span>
              <span className={topicKit.chip}>
                about {totalMinutes >= 90 ? `${Math.round(totalMinutes / 60)} hours` : `${totalMinutes} minutes`} of
                reading
              </span>
              <span className={topicKit.chip}>{written} chapters written across the site</span>
              {mounted && <span className={topicKit.chip}>{done.size} read by you</span>}
            </Chips>
          </Copy>
          <Compose layout="loop">
            {HERO_LANES.map(({ id, at, join }, i) => {
              const lane = LANES.find((l) => l.id === id)!;
              return (
                <Card key={id} decor at={at} taped={i === 0}>
                  {i === 1 && <Tag tone="success">✓ every number measured</Tag>}
                  <CardKicker>
                    {String(i + 1).padStart(2, "0")} · {lane.when}
                  </CardKicker>
                  <p className={styles.laneName}>{lane.title}</p>
                  <p className={styles.laneChips}>
                    {lane.nodes.slice(0, PREVIEW_NODES).map((n) => (
                      <span key={n.chapter}>{n.label}</span>
                    ))}
                  </p>
                  {join && <Join to={join} />}
                  {i === HERO_LANES.length - 1 && <Remark>build, deploy, request, run</Remark>}
                </Card>
              );
            })}
          </Compose>
        </Scene>

        <Band
          no="01"
          id="facts-title"
          label="Measured at build time"
          title="The site, counted"
          sub="Counted from the repository during the build that made this page, including the unflattering ones."
          count={plural(facts.length, "number")}
        >
          <section className={styles.measured} aria-label="Measured at build time">
            <Tape rot={-3} />
            <Facts items={facts.slice(0, half)} />
            <Facts items={facts.slice(half)} />
          </section>
        </Band>

        <Band
          no="02"
          id="map-title"
          label="The system on one page"
          title="Pick any box"
          sub="Every row is a chapter. Read the ones behind the part you care about first."
          count={plural(
            LANES.reduce((n, l) => n + l.nodes.length, 0),
            "box"
          )}
        >
          {LANES.map((lane, li) => (
            <div key={lane.id} className={topicKit.level}>
              <Station
                no={String(li + 1).padStart(2, "0")}
                name={lane.title}
                id={`lane-${lane.id}`}
                blurb={lane.when}
                chips={[plural(lane.nodes.length, "chapter")]}
              />
              <List columns>
                {lane.nodes.map((n) => {
                  const ch = byId.get(n.chapter);
                  return (
                    <Row
                      key={n.chapter}
                      code={ch?.num}
                      title={n.label}
                      sub={n.note}
                      href={ch ? `${basePath}/${ch.id}` : null}
                      done={mounted && ch ? done.has(ch.id) : false}
                    />
                  );
                })}
              </List>
            </div>
          ))}
        </Band>

        <Band
          no="03"
          id="order-title"
          label="Read it in order"
          title="Three parts, one trail"
          sub="From what the site is made of, to how a request runs, to how it holds up."
          count={plural(chapters.length, "chapter")}
        >
          {PARTS.map((part, pi) => {
            const list = chapters.filter((c) => c.level === part.level);
            if (!list.length) return null;
            const read = mounted ? list.filter((c) => done.has(c.id)).length : 0;
            return (
              <div key={part.level} className={topicKit.level}>
                <Station
                  no={String(pi + 1).padStart(2, "0")}
                  name={part.title}
                  id={`part-${part.level}`}
                  blurb={part.blurb}
                  chips={[plural(list.length, "chapter"), `${read} / ${list.length} read`]}
                />
                <Journey
                  count={list.length}
                  slot={150}
                  walked={read / list.length}
                  label={`${part.title}: every chapter`}
                >
                  {list.map((c) => {
                    const isRead = mounted && done.has(c.id);
                    const isNext = started && c.id === next.id;
                    return (
                      <JourneyStop
                        key={c.id}
                        state={isRead ? "done" : isNext ? "next" : "todo"}
                        sticker={isNext ? "▸ pick up here" : undefined}
                      >
                        <StopHead
                          code={c.num}
                          title={c.title}
                          sub={c.subtitle}
                          href={`${basePath}/${c.id}`}
                          end={
                            <>
                              <span className={topicKit.chip}>{formatSpan(c.minutes)}</span>
                              {isRead && <Check />}
                            </>
                          }
                        />
                      </JourneyStop>
                    );
                  })}
                </Journey>
              </div>
            );
          })}
        </Band>

        <Foot>
          <FootLink href="/">All topics</FootLink>
          <FootLink href={`${basePath}/${chapters[0].id}`}>Start at the first chapter</FootLink>
        </Foot>
      </TopicPage>
    </TopicFrame>
  );
}
