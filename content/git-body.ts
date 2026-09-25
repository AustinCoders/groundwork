import type { GitSection } from "./git/types";
import { gitHeroFigure } from "./git/hero";
import { gitModel } from "./git/model";
import { gitObjects } from "./git/objects";
import { gitAreas } from "./git/areas";
import { gitDaily } from "./git/daily";
import { gitConfig } from "./git/config";
import { gitBranch } from "./git/branch";
import { gitRemote } from "./git/remote";
import { gitMerge } from "./git/merge";
import { gitRebase } from "./git/rebase";
import { gitUndo } from "./git/undo";
import { gitTools } from "./git/tools";
import { gitFlow } from "./git/flow";
import { gitGithub } from "./git/github";
import { gitHygiene } from "./git/hygiene";
import { gitScale } from "./git/scale";
import { gitDanger } from "./git/danger";
import { gitInterview } from "./git/interview";
import { gitCheat } from "./git/cheat";

export type { GitSection };

export interface GitPart {
  level: string;
  title: string;
  blurb: string;
}

export const GIT_PARTS: GitPart[] = [
  {
    level: "foundations",
    title: "Foundations",
    blurb: "What a repository really is, and the commands you use every day.",
  },
  {
    level: "together",
    title: "Working together",
    blurb: "Branches, remotes, merging, rebasing and how teams ship through pull requests.",
  },
  {
    level: "rescue",
    title: "Rescue",
    blurb: "Undo anything, find the commit that broke it, and survive the dangerous moments.",
  },
  {
    level: "mastery",
    title: "Mastery",
    blurb: "Clean history, very large repositories, the interview bank and the cheat sheet.",
  },
];

const ORDER: [GitSection | undefined, string][] = [
  [gitModel, "foundations"],
  [gitObjects, "foundations"],
  [gitAreas, "foundations"],
  [gitConfig, "foundations"],
  [gitDaily, "foundations"],
  [gitBranch, "together"],
  [gitRemote, "together"],
  [gitMerge, "together"],
  [gitRebase, "together"],
  [gitGithub, "together"],
  [gitFlow, "together"],
  [gitUndo, "rescue"],
  [gitTools, "rescue"],
  [gitDanger, "rescue"],
  [gitHygiene, "mastery"],
  [gitScale, "mastery"],
  [gitInterview, "mastery"],
  [gitCheat, "mastery"],
];

export const GIT_CHAPTERS: (GitSection & { part: string })[] = ORDER.filter((entry): entry is [GitSection, string] =>
  Boolean(entry[0])
).map(([s, part], i) => ({ ...s, num: `G${i + 1}`, part }));

export const GIT_HERO_FIGURE = gitHeroFigure;

export const GIT_SECTIONS: { id: string; num: string; title: string }[] = GIT_CHAPTERS.map((s) => ({
  id: s.id,
  num: s.num,
  title: s.short,
}));

export const GIT_BODY_HTML = GIT_CHAPTERS.map((s) => s.body).join("\n");
