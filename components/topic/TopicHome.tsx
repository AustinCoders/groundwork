"use client";

import { useMemo } from "react";
import { HashRedirect } from "@/components/reader/HashRedirect";
import { TopicFrame } from "@/components/topic/TopicFrame";
import { FootLink, TopicPage } from "@/components/topic/TopicKit";
import { levelTotals, type LevelStat } from "@/components/topic/levelStats";
import { useCoverProgress, type CoverCard } from "@/components/topic/useCoverProgress";
import { BudgetChips } from "@/components/topic/shell/BudgetChips";
import { LevelChoice } from "@/components/topic/shell/LevelChoice";
import { TopicShell } from "@/components/topic/shell/TopicShell";
import { buildGroups, currentLevel, heroStatus } from "@/components/topic/shell/model";
import type { ShellTool } from "@/components/topic/shell/types";
import { BUDGET_STEPS } from "@/components/topic/useReadingPlan";
import { PlacementDoors } from "@/components/placement/PlacementDoors";
import { PlanPanel } from "@/components/placement/PlanPanel";
import { compactSpan, plural } from "@/lib/format";
import { notesHref } from "@/lib/topics";
import { requiresCheck } from "@/lib/completion";
import { levelWords, PICK_LEVEL_ID, planView, type PlanData } from "@/lib/placementPlan";
import { selfPlacement } from "@/lib/placementRecord";
import { clearPlacement, savePlacement } from "@/lib/placementStore";
import { usePlacementState } from "@/lib/usePlacementState";
import type { SeriesPart } from "@/components/chapter/types";
import type { Level, LevelId, Topic } from "@/content/types";

export interface TopicHomeProps {
  topic: Topic;
  levels: Level[];
  perLevel: Record<string, LevelStat>;
  curriculumNotes: string[];
  parts: SeriesPart<LevelId>[];
  cards: CoverCard[];
  checkChapterIds: string[];
  placementData: PlanData;
  relatedRoundHref: string | null;
  relatedRoundLabel: string | null;
}

export function TopicHome({
  topic,
  levels,
  perLevel,
  curriculumNotes,
  parts,
  cards,
  checkChapterIds,
  placementData,
  relatedRoundHref,
  relatedRoundLabel,
}: TopicHomeProps) {
  const basePath = notesHref(topic.id);
  const progress = useCoverProgress({
    topicId: topic.id,
    basePath,
    cards,
    completion: topic.completion,
    checkChapterIds,
  });
  const { plan, states, written, totalExercises, continueHref, continueLabel, dueCount } = progress;
  const status = usePlacementState(plan.readable.map((s) => s.id));
  const firstTime = !status.mounted || status.firstTime;
  const savedLevel = status.placement?.level ?? null;
  const totals = levelTotals(levels, perLevel);
  const placement = status.placement;

  const reviseIds = useMemo(
    () => new Set(placement ? planView(placement, placementData.chapters).reviseEarlier.map((c) => c.id) : []),
    [placement, placementData.chapters]
  );

  const nextId = !firstTime && plan.next ? plan.next.id : null;
  const openLevel = firstTime
    ? (parts[0]?.level ?? null)
    : currentLevel(cards, nextId, savedLevel, parts[0]?.level ?? null);

  const groups = useMemo(
    () =>
      buildGroups({
        parts: parts.map((part) => ({ level: part.level, title: part.title })),
        cards,
        basePath,
        done: plan.mounted ? plan.done : null,
        states: plan.mounted ? states : null,
        nextId,
        reviseIds,
        yourLevel: firstTime ? null : savedLevel,
        openLevel,
        titleOf: (card) => (requiresCheck(topic.completion) ? card.short || card.title : card.title),
      }),
    [
      parts,
      cards,
      basePath,
      plan.mounted,
      plan.done,
      states,
      nextId,
      reviseIds,
      firstTime,
      savedLevel,
      openLevel,
      topic.completion,
    ]
  );

  const nextTitle = plan.next ? plan.next.short : null;
  const outcome = plan.mounted
    ? plan.reach.size > 0
      ? `→ ${plural(plan.reach.size, "chapter")}, up to ${plan.lastInReach?.short}`
      : plan.next
        ? `→ not even ${plan.next.short} (${plan.next.minutes} min) fits`
        : "→ every chapter is read"
    : "→ pick a run for tonight";

  const tools: ShellTool[] = [
    {
      id: "practice",
      label: "Practice",
      href: `/problems?topic=${topic.id}`,
      count: totalExercises > 0 ? plural(totalExercises, "exercise") : null,
    },
    { id: "review", label: "Review", href: "/review", count: dueCount > 0 ? `${dueCount} due` : null },
    ...(relatedRoundHref
      ? [{ id: "interview", label: "Interview round", href: relatedRoundHref, count: relatedRoundLabel }]
      : []),
    ...(curriculumNotes.length > 0
      ? [{ id: "notes", label: "Notes", href: "#notes", count: plural(curriculumNotes.length, "honest note") }]
      : []),
  ];

  const hint = firstTime
    ? "choose a level"
    : placement
      ? `${levelWords(placement.level, placementData.levelNames)} plan`
      : "no plan yet";

  const picker = (
    <LevelChoice
      key="picker"
      topicId={topic.id}
      levels={levels}
      perLevel={perLevel}
      savedLevel={savedLevel}
      onShowPath={(levelId) => {
        if (status.firstTime) savePlacement(selfPlacement(levelId, placementData.chapters, Date.now()));
      }}
    />
  );
  const budget = plan.next ? (
    <BudgetChips
      key="budget"
      steps={BUDGET_STEPS}
      budget={plan.budget}
      outcome={outcome}
      onPick={(minutes) => plan.setBudget(minutes)}
    />
  ) : null;
  const planPanel = (
    <PlanPanel
      key="plan"
      data={placementData}
      state={status}
      readCount={plan.readCount}
      onReset={() => {
        clearPlacement();
        requestAnimationFrame(() => document.getElementById(`${PICK_LEVEL_ID}-summary`)?.focus());
      }}
    />
  );

  return (
    <TopicFrame
      topic={{ name: topic.name, href: `/level/${topic.id}`, mark: topic.mark, accent: topic.accent }}
      back={{ href: "/", label: "Home", fixed: true }}
      reading
      layout="reader"
      skip={{ label: `Skip to ${topic.name}` }}
    >
      <HashRedirect basePath={basePath} />
      <TopicPage accent={topic.accent} id="top">
        <TopicShell
          topic={{ name: topic.name }}
          ready={status.mounted}
          hero={{
            title: topic.name,
            lead: firstTime
              ? `${plural(totals.chapters, "chapter")}, about ${compactSpan(totals.minutes)} of reading. How do you want to begin?`
              : null,
            status: firstTime ? null : heroStatus(plan.readCount, written, nextTitle),
            action: firstTime ? null : { label: continueLabel, href: continueHref },
            choice: firstTime ? (
              <PlacementDoors
                data={placementData}
                basePath={basePath}
                pickHref={`#${PICK_LEVEL_ID}`}
                label={`How to begin ${topic.name}`}
              />
            ) : null,
          }}
          pathTitle={firstTime ? "The path" : "Your path"}
          pathCount={plural(written, "chapter")}
          groups={groups}
          tools={tools}
          details={{
            id: PICK_LEVEL_ID,
            title: "Plan & level",
            hint,
            children: firstTime ? [picker, budget] : [planPanel, budget, picker],
          }}
          notes={curriculumNotes.length > 0 ? { id: "notes", title: "Honest notes", items: curriculumNotes } : null}
          foot={<FootLink href="/">All topics</FootLink>}
        />
      </TopicPage>
    </TopicFrame>
  );
}
