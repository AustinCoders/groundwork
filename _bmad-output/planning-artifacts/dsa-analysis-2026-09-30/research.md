# DSA section redesign: placement, mastery and visualisation research

Prepared 30 Sep 2026 for the groundwork DSA redesign. The site is free, has no accounts, keeps progress in localStorage, runs on Next.js, has no backend and uses no LLM at runtime.

**What the site has today** (read from the repo, not changed). There are 34 DSA chapters in `content/dsa/`. Each chapter is tagged `beginner`, `intermediate` or `advanced` and lists practice exercises. `/level` is where learners pick their own level. `/review` runs a spaced review of finished chapters on fixed gaps (`REVIEW_GAPS_DAYS = [3, 7, 21, 60, 180]` in `lib/storage.ts`), but the learner grades themselves ("Not yet, keep it due"). The recommendations below build on these pieces rather than replacing them.

---

## 1. Placement and diagnostic quizzes

### 1.1 How the reference products decide where a learner starts

| Product | Mechanism | Length | Adaptive? | How the result maps to a start point | Override |
|---|---|---|---|---|---|
| **Duolingo** (course placement) | On first run: "Start from scratch" or "Find my level" | Short, in-app | **Yes.** The skill estimate updates after every answer and picks the next question; it starts easy | "We consider the difficulty of the questions we asked and whether you got them right… then we unlock the skills we think you already know" | After starting at the beginning you can still skip ahead one unit at a time. **But** "you won't be able to 'undo' your placement and start from scratch" |
| **Duolingo English Test** (the high-stakes sibling) | Computer-adaptive test (CAT) | 4 random items, then adaptive, until more than 25 items or 40 minutes | Yes (IRT/CAT) | A score, not a course position | n/a |
| **Brilliant** | A "lightweight" diagnostic at signup | Not published | Presumably | Places by "demonstrated readiness… rather than assigning one overall grade level", so the learner begins "with material they have the prerequisites to understand" | "Jump ahead" is gated by a **level check**. When a learner is "breezing through", Brilliant suggests accelerating and confirms with a level check. The placement is "a starting point, not a permanent track" |
| **Khan Academy** | **Course challenge**: samples skills from the whole course | About 30 questions (per a school's guide) | No, sampled | Correct answers level skills up (Familiar, then Proficient, then Mastered). Advised as "stress-free", 2–3 minutes per question | Anyone can open any unit, and quizzes and unit tests can be taken early |
| **ALEKS** (McGraw Hill) | Knowledge Check built on Knowledge Space Theory | About 20–30 questions | Yes | Works out which topics you know, which you don't, and which you are **"ready to learn"** (the frontier of a prerequisite graph) | Has an **"I Don't Know"** button so guessing doesn't pollute the result |
| **AlgoMonster** | No quiz. You choose **Foundation** ("new to data structures") or **Core Patterns** ("can already solve easy problems with relative ease") | 0 | No | You pick the track | Free navigation |
| **NeetCode** | No quiz. Two courses (Beginners, Advanced), a roadmap tree and the NeetCode 150 list | 0 | No | You pick | Free |
| **takeUforward / Striver** | No quiz. You choose a sheet by the time you have: A2Z (about 495 topics, "no prior DSA knowledge"), SDE sheet, or Striver-79 for last-minute revision | 0 | No | The sheet you pick | Free |
| **Grind 75** | No quiz. You enter weeks, hours per week, difficulty and topics; it generates a schedule from 169 prioritised questions | 0 | No | A schedule | Fully configurable |
| **LeetCode Explore / AlgoExpert** | No placement. Topic cards (Explore) or difficulty-sorted questions plus 4 curated assessments (AlgoExpert) | n/a | n/a | n/a | Free |
| **Coursera / edX** | Mostly linear. Open edX has a *proposed* "Diagnostics" content type that would let learners skip what they have already mastered. A HarvardX adaptive experiment found learners got through faster, attempting fewer problems | n/a | Experimental | n/a | n/a |

Sources: [Duolingo partial credit](https://blog.duolingo.com/partial-credit-improvements-to-duolingos-placement-test/), [Duolingo 101](https://blog.duolingo.com/duolingo-101-how-to-learn-a-language-on-duolingo), [DET CAT](https://venturebeat.com/ai/duolingos-english-test-ai-serve-and-score-questions), [Brilliant placement guide](https://brilliant.org/help/parents-and-families/course-placement-guide/), [Khan course/unit mastery](https://support.khanacademy.org/hc/en-us/articles/115002552631), [Khan course challenge guide (school)](https://www.webster.k12.mo.us/learning/summer-learning/summer-math/khan-academy-helpful-hints), [ALEKS knowledge check](https://www.mheducation.com/support/aleks-support-center/knowledge/what-is-a-knowledge-check.html), [ALEKS (Wikipedia)](https://en.wikipedia.org/wiki/ALEKS), [AlgoMonster roadmap](https://algo.monster/problems/roadmap), [NeetCode courses](https://neetcode.io/courses), [takeUforward A2Z](https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/), [Grind 75 about](https://techinterviewhandbook.org/grind75/about), [AlgoExpert review](https://learntocodewith.me/reviews/algoexpert/), [Open edX Diagnostics proposal](https://openedx.atlassian.net/wiki/spaces/COMM/pages/5044240422), [HarvardX adaptive experiment](https://www.vpal.harvard.edu/publications/adaptive-assessment-experiment-harvardx-mooc).

**What this shows.** The DSA interview-prep products (NeetCode, AlgoMonster, Striver, Grind 75) all place learners by **self-selection**. The adaptive placement tests come from maths and language learning (Duolingo, ALEKS, Khan, Brilliant). A short, forgiving placement quiz for DSA would be unusual in this niche and a real differentiator, provided it avoids the pitfalls below.

### 1.2 Length, adaptivity and mapping

- **Adaptive tests need fewer items.** CAT reaches a target precision with roughly 40–60% fewer items than a fixed test. Stopping rules are either a fixed maximum length (the PROMIS CATs stop at 12 items) or a standard-error threshold ([MetricGate stopping rules](https://metricgate.com/docs/adaptive-test-stopping-rule/)). Full item-level CAT needs item parameters calibrated on real data, which a new site with no backend doesn't have.
- **Multistage testing (MST)** is the practical middle ground. Learners take a short routing module, and their score sends them to an easier or harder next module. It adapts per module rather than per item, allows skipping and reviewing items, and gives the author more control over content balance ([assess.com MST](https://assess.com/multistage-testing/)). Hand-authored modules and score cut-offs are enough, so it suits a static site.
- **Map to a prerequisite graph, not a single level.** ALEKS's "ready to learn" frontier and Brilliant's "prerequisites to understand" both place a learner at the edge of what they know in a prerequisite graph, not at one overall grade.
- **Offer "I don't know" / "not sure yet".** ALEKS does this, and certainty-based marking research (Gardner-Medwin) shows that separating confident answers from guesses improves reliability ([Physiological Society on CBM](https://www.physoc.org/?p=64978)). With 4-option multiple choice a blind guess is right 25% of the time. Crediting a chapter only after two correct answers cuts the chance of a lucky placement to about 6%.

### 1.3 Pitfalls

1. **Confidence crushing.** In HarvardX CS50x, learners who attempted the *final* problem set at the start and failed it "finished the fewest number of milestones, even fewer than those who never attempted" it. Weaker students were more likely both to try it early and to fail. The authors call it "the disconcerting phenomenon that many students dropped out… because their confidence was crushed" ([Chen, Sonnert, Sadler & Malan 2020](https://cs.harvard.edu/malan/publications/3_31_2020_Foreseeing.pdf)). **So start easy, stop early when the learner is clearly below the bar, and never show a raw fail score.**
2. **Wrong placement from noise.** Duolingo's own blog describes the same person taking the test twice, getting slightly different results and ending up with dramatically different unlocks ([Duolingo](https://blog.duolingo.com/partial-credit-improvements-to-duolingos-placement-test/)). The fix is conservative crediting, the ability to retake, and later correction (Brilliant's level checks, Khan's level-down).
3. **Placements that can't be undone.** Duolingo's "can't undo" rule is exactly what the site should avoid. It is simple in localStorage: keep the placement result separate from completion data.
4. **Self-assessment is unreliable.** Low performers overestimate and high performers underestimate. In one study only 18.5% of 426 people rated themselves accurately ([BMC Med Educ 2024](https://link.springer.com/article/10.1186/s12909-024-06121-7)). This argues for a short test over the current self-selected level, while keeping self-selection available as the override.
5. **Skipping fundamentals.** Learners who "test out" of arrays or complexity often have gaps (see §4.3, where only 12% of students correctly analysed BST insertion cost). Mitigation: a tested-out chapter enters the spaced-review queue, so gaps surface cheaply without forcing a re-read.
6. **Test anxiety.** Low-stakes retrieval practice reduces it: 72% of 1,408 students said classroom quizzing made them *less* nervous for exams ([Agarwal et al. 2014](https://profiles.wustl.edu/en/publications/classroom-based-programs-of-retrieval-practice-reduce-middle-scho/)). Khan frames the course challenge as "stress-free… not graded". Use no timer and describe the result as "where you'll start", not a grade.
7. **Expertise reversal cuts the other way.** Scaffolding that helps novices *hurts* experts ([Kalyuga et al. 2003 / expertise reversal](https://faculty.engineering.asu.edu/mre/wp-content/uploads/sites/31/2020/02/Exp_Rev_LI06.pdf)). Making experienced learners sit through beginner chapters is a real cost, which justifies placement at all.

---

## 2. Mastery gating: a quiz before a chapter counts as done

### 2.1 Thresholds, retries and cooldowns in the wild

| Product | Pass bar | Retries / cooldown | Anti-memorisation |
|---|---|---|---|
| **Khan Academy** | Familiar at 70–99% on practice; Proficient at 100%; Mastered = Proficient plus all correct on the unit test or course challenge. Skills **level down** after a wrong answer on a quiz or unit test | Unlimited | Questions drawn from generated or large pools |
| **Khan Mastery Challenges** (spaced review) | 3 skills × 2 questions. Both right: level up. Both wrong: level down. One of each: no change | Offered as skills fall due | Chosen by time since last review and current level |
| **Codecademy** quizzes | 70% | Unlimited retakes. The more formal "assessments" can be retaken within 24 h and don't show which answers were wrong | "Quiz assessments are randomized when presented to learners"; every item is tied to a learning standard |
| **Coursera** graded quizzes | Set per course | Learners report 3 attempts per 8 hours (community-reported, not official documentation) | Question banks vary by course |
| **OpenDSA** proficiency exercises | Usually **90%** of step-points | Unlimited, new random instance each time | Randomised data per attempt |
| **VisuAlgo** online quiz | n/a | Unlimited | "Questions are randomly generated based on specific rules" with an automatic answer verifier |
| **AlgoMonster** | Every concept article ends with a quiz, then a "Speedrun" of multiple-choice questions on pattern recognition | Unlimited | Large problem pool |
| **Bloom's mastery learning** | Typically 80–90% on the formative test; analysis of the original studies suggests 90% beat 80% | Correctives, then a *parallel* formative test | Parallel forms |

Sources: [Khan mastery levels](https://support.khanacademy.org/hc/bg/articles/5548760867853), [Khan Mastery Challenges](https://support.khanacademy.org/hc/en-us/articles/360037127892), [Codecademy quizzes vs assessments](https://help.codecademy.com/hc/en-us/articles/15373426748187-Quizzes-Assessments-and-Exams-What-s-the-Difference), [Codecademy quiz standards](https://curriculum-documentation.codecademy.com/quizzes/quiz-standards/), [Coursera attempts (community)](https://community.deeplearning.ai/t/i-not-able-to-sumbit-my-quiz-after-3-attempts/751797), [OpenDSA intro](https://opendsax.cs.vt.edu/ODSA/RST/en/Intro.rst), [JSAV paper](https://people.cs.vt.edu/~shaffer/Papers/p159-karavirta.pdf), [VisuAlgo](https://visualgo.net/), [AlgoMonster roadmap](https://algo.monster/problems/roadmap), [Speedrun](https://www.algo.monster/problems/speedrun), [Bloom 2 sigma](https://en.wikipedia.org/wiki/Bloom%27s_2_sigma_problem).

### 2.2 Learning-science evidence

- **Retrieval practice (the testing effect).** After one week, students who practised recall retained **61%** of a passage against **40%** for re-readers, even though re-readers did better at 5 minutes (83% vs 71%) ([Roediger & Karpicke 2006](https://psychology.ecu.edu/wp-content/pv-uploads/sites/216/2019/03/Roediger-Karpicke-2006.pdf)). A chapter quiz is a learning event, not only a gate.
- **Feedback matters with multiple choice.** Multiple-choice tests can teach the wrong answer (the lure), but immediate or delayed feedback cancels that negative effect ([Butler & Roediger 2008](https://pubmed.ncbi.nlm.nih.gov/18491500/)). Always explain why each wrong option is wrong.
- **Mastery learning works, most of all for weaker learners.** A meta-analysis of 108 studies found an average **+0.52 SD** on exams, with stronger effects for weaker students ([Kulik, Kulik & Bangert-Drowns 1990](https://www.academia.edu/81783373/Effectiveness_of_Mastery_Learning_Programs_A_Meta_Analysis)). Bloom's group-mastery condition gave about +1 SD, and tutoring plus mastery about +2 SD ([Bloom 1984](https://www.gwern.net/doc/psychology/1984-bloom.pdf)). Bloom's figures come from small dissertation studies, so treat +1 SD as an upper bound.
- **Spacing.** A meta-analysis of 839 assessments found distributed practice beats massed practice, and the best gap grows with how long the learner needs to remember ([Cepeda et al. 2006](https://pubmed.ncbi.nlm.nih.gov/16719566/)). Duolingo's half-life regression model raised practice-session retention by 9.5% in an A/B test ([Settles & Meeder 2016](https://preview.aclanthology.org/landing_page/P16-1174)). The site's fixed expanding gaps (3/7/21/60/180 days) are a sound, simple, SM-2-like choice ([SM-2](https://supermemo.guru/wiki/SuperMemo_2)).
- **Interleaving teaches choosing the pattern.** Blocked practice scored **89%** during practice but only **20%** on a test a week later. Mixed practice scored 60% during practice but **63%** on the test. The blocked group's failure was "their inability to pair each kind of problem with the appropriate procedure" ([Rohrer & Taylor 2007](https://www.gwern.net/doc/psychology/spaced-repetition/2007-rohrer.pdf)). This is exactly the "which pattern?" skill in DSA interviews, and why AlgoMonster's Speedrun exists.
- **Desirable difficulties.** Spacing, interleaving, varied presentation and tests-as-learning all slow down practice but improve retention and transfer ([Bjork](https://bjorklab.psych.ucla.edu/wp-content/uploads/sites/13/2016/07/EBjork_2004.pdf)). Expect learners to *feel* slower. Explain this once in the UI.
- **Productive failure.** Across 53 studies, problem-solving before instruction beat instruction-first for conceptual understanding ([Sinha & Kapur 2021, via WEF](https://www.weforum.org/stories/2021/09/students-who-productively-fail-learn-more/)). This supports predict-then-reveal in play mode and "try it first" prompts.

### 2.3 Question types that test understanding of algorithms (all auto-gradable, no LLM)

| Type | What it tests | Evidence / precedent | Auto-grading without a backend |
|---|---|---|---|
| **Predict the output** | Code reading | Lister et al. 2004 (7 countries, 500+ students): many novices were "weak at these tasks" ([Lister 2004](https://opus.cloud1.lib.uts.edu.au/handle/10453/4126)) | Multiple choice or exact value |
| **Trace the state after step k** | The algorithm's mechanics | Tracing and "explain in plain English" questions together explained **46%** of the variance in code-writing scores ([Lopez et al. 2008](https://opus.lib.uts.edu.au/bitstream/10453/10806/1/2008001530.pdf); replicated by [Venables et al. 2009](https://opus.lib.uts.edu.au/handle/10453/11384)) | Generate a random input, run the trace engine, compare arrays |
| **Simulate the algorithm** (click the next swap, visit or insert) | Procedural fluency | OpenDSA proficiency exercises (per-step points, 90% bar); TRAKLA2 visual algorithm simulation ([TRAKLA2 pubs](https://cse.tkk.fi/en/research/TRAKLA2/publications.shtml)) | Compare against the trace step by step, with partial credit |
| **Pick the complexity** | Analysis, worst vs average case | 45% of students didn't see that BST insertion can be O(N); only 12% got the item fully right ([Zingaro et al. 2018](https://www.cs.swarthmore.edu/~kwebb/papers/DataStructuresDifficulties.pdf)). Efficiency misconceptions are "strongly-held… despite their frequent errors" ([Krishnamurthi et al. 2022](https://world.cs.brown.edu/~sk/Publications/Papers/Published/kbls-prob-persist-perf-precon/paper.pdf)) | Multiple choice |
| **Spot the bug** (click the line) | Invariants and edge cases | Lister's "select the correct completion" format | Line id |
| **Choose the pattern** for a problem statement | Transfer and recognition | AlgoMonster Speedrun; Rohrer & Taylor interleaving | Multiple choice |
| **Order the steps** (Parsons problem) | Structure without syntax cost | Same learning gains as writing code, done **significantly faster** ([Ericson](https://hg.gatech.edu/node/603172); [multi-institutional](https://pureportal.strath.ac.uk/en/publications/multi-institutional-multi-national-studies-of-parsons-problems/)) | Compare the order. Partial credit for the longest correct subsequence |
| **Fill the invariant** | "Why it works" | Arguing correctness was what "many students claimed that they did not learn anywhere" ([Enström, DP](https://www.csc.kth.se/~emmaen/FIE13.pdf)) | Multiple choice among candidate invariants |
| **Choose the data structure** | Trade-offs | Zingaro Q2/Q6 (fast index access, undo stack) | Multiple choice |
| **Construct an input** (e.g. an insertion order that gives a balanced BST; an input that makes quicksort hit its worst case) | Deep understanding (Naps' "changing" level) | Only **44%** gave a correct balanced-BST insertion order (Zingaro 2018) | Run the learner's input through the engine and check a property |

### 2.4 The risk that gating frustrates people, and fixes

- **Evidence of frustration.** Keller's PSI (mastery units that must be passed to move on) beat lectures in 57 of 61 studies, but "several investigators report higher-than-average withdrawal rates" and procrastination ([Keller Plan](https://en.wikipedia.org/wiki/Keller_Plan), [PSI data](https://psych.athabascau.ca/open/keller/data.php)). Khan's forum has threads titled "Losing Mastery" and "Khan academy encourages you to be perfect, not to 'master'" ([thread](https://support.khanacademy.org/hc/en-us/community/posts/360038662451-Khan-academy-encourages-you-to-be-perfect-not-to-master)), which suggests the one-slip level-down rule annoys learners (anecdotal).
- **Fixes seen in practice:**
  - **Soft gate:** "Mark done anyway". Record it as *read* rather than *checked*, show a different badge, and schedule a quiz-based review sooner. The site already distinguishes "read" from "kept".
  - **Unlimited retries with fresh items** (Codecademy, OpenDSA, VisuAlgo). No cooldown is needed when nothing is at stake and questions are regenerated.
  - **Partial credit** for multi-step items (Duolingo's weighted placement scoring, OpenDSA step-points).
  - **Two-question rule before changing a level** (Khan Mastery Challenges), rather than dropping a level on a single miss.
  - **Correctives, then a parallel test** (Bloom). After a failed check, link each missed item to the section of the chapter it came from.

---

## 3. Algorithm visualisation ("play" mode)

### 3.1 What the research says

- **The engagement taxonomy** ([Naps et al. 2002](https://scholars.duke.edu/publication/796177)) has six levels: *no viewing, viewing, responding* (answering questions about the visualisation, including "predictions of the next steps"), *changing* (e.g. supplying input), *constructing* and *presenting*. The hypothesis is that learning rises with the level. Key line: visualisation "no matter how well it is designed, is of little educational value unless it engages learners in an active learning activity."
- **Meta-study.** Across 24 experiments, 11 found significant effects. What students *do* with a visualisation matters more than what it *shows*, and cognitive-constructivist designs predicted results best ([Hundhausen, Douglas & Stasko 2002](https://www.academia.edu/15636659/A_Meta_Study_of_Algorithm_Visualization_Effectiveness)). Later surveys support the taxonomy ([Urquiza-Fuentes & Velázquez-Iturbide 2009](https://burjcdigital.urjc.es/handle/10115/5593); [Myller et al. 2009](https://cs.uef.fi/pub/Dissertations/myller.pdf)).
- **Pace control is the most important single feature.** Letting the learner control the pace, rather than watch an animation, "had the single greatest impact on AV effectiveness". A good data set and a logical breakdown of steps "also showed promise". **Adding pseudocode did not appear to improve understanding**, despite more time spent ([Saraiya et al. 2004, summarised in Shaffer et al. 2010](https://people.cs.vt.edu/~shaffer/Papers/ShafferTOCE11.pdf)).
- **Prediction may be the active ingredient.** Prediction helped with both animations and static diagrams, but one study (Jarc et al.) found no benefit from interactive prediction ([Byrne, Catrambone & Stasko](https://repository.gatech.edu/items/ed609ce9-014c-45b0-8ed3-b0eded8d8472)). Keep prediction short, occasional and optional.
- **Coverage is badly skewed.** In more than 500 visualisations catalogued, over 25% were of sorting (mostly "bars being swapped"), and many were low quality. DP had only 9 and recursion/backtracking only 10 ([Shaffer et al. 2010](https://people.cs.vt.edu/~shaffer/Papers/ShafferTOCE11.pdf)). **So build visualisations where learners struggle (recursion, DP, trees, graphs, pointers), not another sorting-bars demo.**
- **Constructing costs time.** Students building their own visualisations "might be distracted by the creation process" (Hundhausen & Douglas 2000, in Shaffer 2010). Prefer lightweight "change the input" and "simulate the step" tasks over asking learners to author a visualisation.

### 3.2 Patterns from the reference tools

| Tool | What's worth copying |
|---|---|
| **VisuAlgo** ([sorting](https://visualgo.net/en/sorting)) | Controls for start, back, play/pause, forward and end, plus a speed setting. **Keyboard: Space for play/pause, ←/→ to step, −/+ for speed.** Preset inputs (random, sorted, nearly sorted, many duplicates) plus custom input. A pseudocode panel with line highlighting, a status/explanation panel, e-Lecture slides with PageUp/PageDown, and a **generated online quiz with an automatic answer verifier** |
| **Python Tutor** ([Guo 2013](https://pg.ucsd.edu/publications/Online-Python-Tutor-web-based-program-visualization_SIGCSE-2013.pdf)) | **Trace architecture.** Execution is recorded once as "an ordered list of execution points", each holding the line, the frames/variables, the heap and output so far. After load, "stepping forwards and backwards refresh the display instantaneously" with no server calls. **Two arrows** mark "the line that has just executed" and "the next line to be executed". A slider shows "step 11 of 21". The URL encodes the step. New objects are appended so nothing "jiggles". It is embedded in textbooks with one line of JS. Limit: several hundred steps |
| **USFCA (Galles)** ([index](https://www.cs.usfca.edu/~galles/visualization/Algorithms.html)) | About 60 visualisations with broad coverage, including recursion, DP tables (Fibonacci, coin change, LCS), heaps, B-trees and disjoint sets. VCR-style controls and user-typed operations (insert or delete a value) |
| **Algorithm Visualizer** ([repo](https://github.com/algorithm-visualizer/algorithm-visualizer)) | "Tracers" inside real code emit visualisation commands, and a React app replays them. It is the same trace idea, driven by code instrumentation |
| **Red Blob Games** ([A* intro](https://www.redblobgames.com/pathfinding/a-star/introduction.html)) | Draggable start and goal, a step-through slider, frontier and came-from shown on the map, and a progressive build-up from BFS to Dijkstra to A* on the same map with code beside each stage. This is the best model for the graph chapters |
| **Pathfinding visualisers** (Clément Mihailescu-style; [many React clones](https://github.com/topics/pathfinding-algorithms?l=typescript)) | Draw walls and weights on a grid and compare BFS, DFS, Dijkstra and A*. Very engaging, but mostly *viewing*; they rarely ask the learner a question |
| **CS Academy** ([graph editor](https://codeforces.net/blog/entry/45758)) | Paste an edge list and get a force-laid-out graph of up to about 30 nodes. Good for letting learners paste their own test graphs |
| **OpenDSA / JSAV** ([JSAV](https://people.cs.vt.edu/~shaffer/Papers/p159-karavirta.pdf)) | Slideshows plus **proficiency exercises** where the learner performs each step, graded per step (usually a 90% bar), and pop-up multiple-choice questions |

### 3.3 Accessibility for animations

- **WCAG 2.2.2 Pause, Stop, Hide (Level A).** Anything that moves automatically for more than 5 s needs a pause control. `prefers-reduced-motion` alone arguably conforms, but discoverability is poor, so **still show a visible pause** ([Hidde de Vries](https://hidde.blog/meeting-2-22-pause-stop-hide-with-prefers-reduced-motion/)).
- **WCAG 2.3.3 Animation from Interactions (Level AAA).** Motion triggered by interaction should be possible to disable ([Deque](https://dequeuniversity.com/resources/wcag2.1/2.3.3-animations-from-interactions)). With reduced motion, jump between steps instantly (no tweening) and never autoplay.
- **Screen-reader narration.** Use one `role="status"` live region that already exists in the DOM before updates, is polite, re-reads its whole content and must be concise. Don't move focus to it ([MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/status_role)). Narrate one sentence per step, e.g. "Step 5 of 12: compare 7 and 3; swap; i = 2."
- **Structure and navigation for non-visual users.** Blind readers did better with navigable structure and adjustable detail than with a single alt text ([Zong et al., MIT](https://vis.mit.edu/pubs/rich-screen-reader-vis-experiences)). **Offer a "table view" of the same trace: one row per step, with variables as columns.** It is the accessible alternative and also the dry-run table (see §5).
- **Keyboard.** Space for play/pause, ←/→ to step, Home/End for first/last, with visible focus. Don't take over arrow keys while focus is in an input.
- **Colour.** Pair every colour cue with a label or shape. On this site, use theme tokens (`--c-*`) so all nine themes and the contrast test keep passing, per AGENTS.md.

---

## 4. Curriculum structure, beginner to advanced

### 4.1 Common orderings

| Source | Order (abridged) |
|---|---|
| **NeetCode roadmap / courses** | Arrays & Hashing → Two Pointers → Sliding Window / Stack → Binary Search → Linked List → Trees → Tries, Heap, Backtracking → Graphs → Advanced Graphs, 1-D DP → 2-D DP, Greedy, Intervals → Math & Geometry, Bit Manipulation ([courses](https://neetcode.io/courses), [roadmap](https://neetcode.io/roadmap)) |
| **Striver A2Z** | Basics → Sorting → Arrays → Binary Search → Strings → Linked List → Recursion → Bit Manipulation → Stack & Queue → Sliding Window & Two Pointer → Heaps → Greedy → Binary Trees → BST → Graphs → DP → Tries → (Advanced Strings) |
| **AlgoMonster** | Getting Started → Binary Search → Two Pointers → DFS → Backtracking → BFS → Graph → Heap → DP → Advanced DS (Union-Find, Trie) → Misc (Intervals, Monotonic Stack, Greedy…) |
| **Tech Interview Handbook** | High priority (Arrays, Strings, Sorting/Searching, Matrix, Trees, Graphs) → Hash Tables, Recursion, Linked Lists, Stacks/Queues, Heaps → Intervals, DP, Binary, Math, Geometry. Practice problems run Easy (weeks 5–6) → Medium → Hard (week 12) ([study plan](https://www.techinterviewhandbook.org/coding-interview-study-plan/)) |
| **Blind 75 / Grind 75** | A curated set rather than an order. Blind 75 (2018) is "static, non-personalized and questions do not have a priority", so Grind 75 re-ranks 169 questions and schedules them by the time available ([Grind 75 about](https://techinterviewhandbook.org/grind75/about), [Blind 75 origin](https://educative.io/blog/where-did-blind-75-come-from)) |

**What they agree on.** These are the edges a prerequisite graph should encode:

- complexity → everything
- arrays → hashing → two pointers → sliding window
- sorted arrays → binary search
- stack → monotonic stack
- linked list (pointers) → trees
- **recursion → trees → backtracking**
- trees → heaps and tries
- **BFS/DFS → topological sort, shortest paths, union-find/MST**
- **recursion + memoisation → 1-D DP → 2-D DP → advanced DP**
- greedy after sorting and heaps
- intervals after sorting

Where the sources disagree (tries, bit manipulation, greedy), keep chapters optional or parallel rather than forcing an order.

**Note on the site's current tags.** Tries is tagged *advanced* here, while NeetCode places it with trees and heaps (intermediate). Monotonic stack is *advanced*, where most sources put it just after stacks. Encoding explicit `requires: [...]` edges per chapter would express this better than a three-bucket level.

### 4.2 Pattern-based learning

NeetCode 150, Blind/Grind 75 and AlgoMonster all organise practice by **pattern**, because interviews reward recognising which pattern applies. AlgoMonster says half the interview goes on "identifying the algorithm". Pattern-first chapters (two pointers, sliding window, monotonic stack, top-k with a heap, BFS layering, backtracking template, DP state/transition) should end with an **interleaved "which pattern?" drill** mixing patterns from earlier chapters. Blocked practice only builds the illusion of fluency (Rohrer & Taylor: 89% during practice, 20% a week later).

### 4.3 What beginners struggle with most (evidence)

- **Tracing and reading code at all.** A large share of novices can't reliably predict output ([Lister 2004](https://opus.cloud1.lib.uts.edu.au/handle/10453/4126)). Those who **sketch a complete trace** do better, and incomplete traces do about as badly as none ([Cunningham et al. 2017](https://gvu.gatech.edu/sites/default/files/related_project_files/p164-cunningham.pdf)).
- **Recursion.** Base-case significance, "backward flow" and infinite recursion ([basic recursion concept inventory](https://www.academia.edu/110135342/A_basic_recursion_concept_inventory)). Recursion has few real-world analogies, which makes it harder to build a mental model.
- **Pointer updates in linked lists.** 16% forgot to update the tail, 12% mis-attached the new node, and 10% looped needlessly to find the tail ([Zingaro et al. 2018](https://www.cs.swarthmore.edu/~kwebb/papers/DataStructuresDifficulties.pdf)).
- **BSTs.** Many assume trees are "default balanced" or that the root stays the median. Only 12% fully answered the insertion-cost item, and only 44% could give a balancing insertion order (Zingaro 2018).
- **Complexity.** Misconceptions are durable and resist refutation texts ([Krishnamurthi et al. 2022](https://world.cs.brown.edu/~sk/Publications/Papers/Published/kbls-prob-persist-perf-precon/paper.pdf)). Worst-case reasoning is weak (Zingaro).
- **Dynamic programming.** It is rated hardest in algorithms courses. After instruction, the lowest self-efficacy was for "determining the evaluation order" and "solving a problem with dynamic programming with no hints". Enström split DP into three teachable subtasks: **solution structure, then recurrence, then evaluation order with a correctness argument** ([Enström & Kann](https://www.csc.kth.se/~emmaen/FIE13.pdf)).

---

## 5. Other features that help understanding

| Feature | Evidence / precedent | Verdict for this site |
|---|---|---|
| **Pattern-recognition drills** (Speedrun) | AlgoMonster Speedrun; Rohrer & Taylor interleaving (63% vs 20%) | **Build.** Cheap multiple choice; bank each problem statement with its pattern tag |
| **Complexity cheat sheet** | Complexity misconceptions are common and durable (Zingaro; Krishnamurthi) | **Build as a reference**, but pair it with "pick the complexity" retrieval items. A cheat sheet alone is re-reading |
| **"Why this works" (invariant / correctness) boxes** | Correctness arguments were "not learned anywhere" (Enström) | **Build.** One invariant per algorithm, reused as a fill-the-invariant item |
| **Dry-run tables** | Complete traces predict success (Cunningham 2017); worked examples help novices and fade with expertise ([worked-example effect](https://en.wikipedia.org/wiki/Worked-example_effect)) | **Build from the trace engine.** Start fully worked, then **fade** (blank cells to fill in) |
| **Spaced review of chapters** | Cepeda 2006; Khan Mastery Challenges; Duolingo HLR | **Upgrade what exists.** Replace the self-rating with 2 generated questions per due chapter, interleaved |
| **Streaks** | 7-day streakers were 3.6× more likely to finish a course, and streak freezes raised daily actives by 0.38%. But "if you… break your streak… it can have the opposite effect, and actually feel quite demotivating" ([Duolingo](https://blog.duolingo.com/how-duolingo-streak-builds-habit)) | **Optional and gentle.** Count weeks, not days, with a built-in freeze and no guilt copy. Without notifications its pull is weak anyway |
| **Hint ladders** | Help abuse ("clicking through hints") happened on 14–36% of actions; "overusing help is associated with lower learning gains" ([help abuse](https://learnlab.org/research/wiki/index.php/Help_abuse)) | **Build with friction.** Nudge → approach → pseudocode → solution, with each rung unlocked by an attempt or a short delay |
| **Common-mistake callouts** | Knowing students' likely wrong answers correlated with learning gains (cited in Zingaro 2018); refutation alone has limited effect (Krishnamurthi) | **Build, and turn each callout into a distractor** in the quiz bank so it is retrieved, not just read |
| **Company / interview tags** | LeetCode's are data-driven and paywalled. No learning evidence, and they go stale without a backend | **Avoid** (or use a single "classic interview problem" flag) |
| **Progress map / skill tree** | NeetCode roadmap; ALEKS "ready to learn" frontier | **Build.** The prerequisite DAG with a highlighted frontier doubles as the placement result screen |
| **Leaderboards / social** | Needs accounts | **Avoid** (no backend) |

---

## 6. Ranked recommendations for groundwork

The ranking follows dependency and payoff: foundations that several features reuse come first.

1. **Model the curriculum as data first: a prerequisite DAG and a tagged question bank.** Add `requires: string[]` to each DSA chapter. Store questions as typed JSON: `{ chapter, type, difficulty, misconception?, section anchor, explanation per option }`. *Why:* ALEKS and Brilliant place learners on a prerequisite graph; Codecademy ties every item to a standard; correctives need a link back to the relevant section (Bloom). Everything below reuses this.

2. **Build one pure-TypeScript trace engine per algorithm.** Each takes an input and returns `Step[]` of `{ line, vars, structure, highlight, narration }`. *Why:* this is Python Tutor's architecture (instant back/forward, no server, step in the URL), and it gives, for free:
   - play mode;
   - the accessible table view;
   - faded dry-run tables;
   - generated "state after step k" and "simulate the step" questions, like VisuAlgo's generator and answer verifier.

   Start where learners struggle and existing visualisations are thin (Shaffer 2010): recursion call tree, binary search, two pointers / sliding window, linked-list pointer surgery, BST insert/delete, heap sift, BFS/DFS on a grid, DP table fill, union-find. Leave sorting-bars for last.

3. **Play mode, designed for engagement rather than spectacle.**
   - **Controls:** step back/forward, a scrubber and speed, with Space and ←/→ keys (pace control is the top factor, per Saraiya).
   - **Presets and custom input:** curated presets first (a good data set matters), then custom input, then "find an input that…" challenges (the *changing* level).
   - **Code and state:** two-arrow code highlighting plus a **variables/invariant panel**. Don't rely on pseudocode highlighting alone (Saraiya found no gain from it).
   - **Prediction:** an optional **predict-then-reveal** prompt every few steps (the *responding* level; Byrne; Naps).
   - **Accessibility:** reduced motion means instant steps and no autoplay; a visible pause; one concise `role="status"` narration; a table view.

4. **A "chapter check" to mark a chapter done, as a soft gate.**
   - **Format:** 5 items drawn from a pool of 12 or more (with generated trace items the pool is effectively unlimited), shuffled, with at least one *trace/simulate* or *construct* item and one *pattern/complexity* item.
   - **Pass bar:** 4 of 5 (80%). This sits between Codecademy's 70% and OpenDSA's 90%, and inside Bloom's 80–90% range.
   - **Feedback and retries:** explanations on every wrong option (Butler & Roediger) and unlimited immediate retries with fresh items. **"Mark done anyway"** is always available, recorded as *read, not checked* and brought forward in review. *Why:* mastery learning gives about +0.5 SD (Kulik), but hard locks increase withdrawal (PSI) and resentment (Khan forum).

5. **Placement on first visit to `/dsa`, with three doors:** "Start from the beginning", "Find my level (about 10 min)" and "I'll choose" (Duolingo's scratch-or-find split plus the self-selection used by NeetCode, AlgoMonster and Striver).
   - **Format:** multistage with about 12–18 items. A 6-item routing module on beginner fundamentals, then either more beginner items or an intermediate module, then an advanced module only for learners who clear intermediate.
   - **Crediting:** a **"Not sure yet"** option (ALEKS, CBM). Credit a chapter only on **2 correct answers** with no failed prerequisite (Khan's two-question rule; guessing risk about 6%).
   - **Early stop:** end a stage after 3 misses or "not sure" answers in a row (CS50x confidence crushing).
   - **Results:** no timer and no raw score. Show the DAG with *tested out* (distinct from *checked*) and the "ready to learn" frontier. Tested-out chapters go into spaced review.
   - **Override:** retake and "reset to the beginning" are always available (the opposite of Duolingo's no-undo rule).

   This ranks after chapter checks because it draws on the same question bank.

6. **Turn `/review` into retrieval.** For each due chapter, ask 2 generated or banked questions, interleaved across chapters. Both right: advance to the next gap. Both wrong: step back. One of each: stay put (Khan Mastery Challenges; Cepeda; Rohrer & Taylor). Keep `REVIEW_GAPS_DAYS`.

7. **Add an interleaved "which pattern?" drill** over problem statements from all completed chapters (AlgoMonster Speedrun; Rohrer & Taylor). It is the highest-leverage interview skill and the cheapest to build.

8. **Enrich chapters:**
   - a "why it works" invariant box;
   - common-mistake callouts that come from real misconception data (Zingaro, the recursion inventory, Enström's three DP subtasks) and double as distractors;
   - faded dry-run tables;
   - hint ladders with friction on the runnable exercises.

**Avoid:**
- hard locks on chapters;
- timed or high-stakes placement;
- showing raw failing scores;
- dropping a level on a single wrong answer;
- daily-streak guilt;
- autoplaying animations;
- sorting-bar-first visualisations;
- free-text answers in any gate (they can't be graded without an LLM or backend);
- company tags and leaderboards (stale or needing accounts);
- pseudocode highlighting as the only form of engagement.

---

## Source list

Products: [Duolingo placement](https://blog.duolingo.com/partial-credit-improvements-to-duolingos-placement-test/) · [Duolingo 101](https://blog.duolingo.com/duolingo-101-how-to-learn-a-language-on-duolingo) · [Duolingo streaks](https://blog.duolingo.com/how-duolingo-streak-builds-habit) · [DET CAT](https://venturebeat.com/ai/duolingos-english-test-ai-serve-and-score-questions) · [Brilliant placement](https://brilliant.org/help/parents-and-families/course-placement-guide/) · [Khan mastery levels](https://support.khanacademy.org/hc/bg/articles/5548760867853) · [Khan course/unit mastery](https://support.khanacademy.org/hc/en-us/articles/115002552631) · [Khan Mastery Challenges](https://support.khanacademy.org/hc/en-us/articles/360037127892) · [Khan efficacy](https://blog.khanacademy.org/?p=18194) · [ALEKS knowledge check](https://www.mheducation.com/support/aleks-support-center/knowledge/what-is-a-knowledge-check.html) · [Codecademy quizzes](https://help.codecademy.com/hc/en-us/articles/15373426748187-Quizzes-Assessments-and-Exams-What-s-the-Difference) · [Codecademy quiz standards](https://curriculum-documentation.codecademy.com/quizzes/quiz-standards/) · [AlgoMonster roadmap](https://algo.monster/problems/roadmap) · [AlgoMonster Speedrun](https://www.algo.monster/problems/speedrun) · [NeetCode courses](https://neetcode.io/courses) · [Grind 75 about](https://techinterviewhandbook.org/grind75/about) · [TIH study plan](https://www.techinterviewhandbook.org/coding-interview-study-plan/) · [Blind 75 origin](https://educative.io/blog/where-did-blind-75-come-from) · [Striver A2Z](https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/) · [AlgoExpert](https://learntocodewith.me/reviews/algoexpert/) · [Open edX diagnostics](https://openedx.atlassian.net/wiki/spaces/COMM/pages/5044240422) · [HarvardX adaptive](https://www.vpal.harvard.edu/publications/adaptive-assessment-experiment-harvardx-mooc)

Visualisation: [VisuAlgo](https://visualgo.net/en/sorting) · [Python Tutor paper](https://pg.ucsd.edu/publications/Online-Python-Tutor-web-based-program-visualization_SIGCSE-2013.pdf) · [USFCA](https://www.cs.usfca.edu/~galles/visualization/Algorithms.html) · [Algorithm Visualizer](https://github.com/algorithm-visualizer/algorithm-visualizer) · [Red Blob Games A*](https://www.redblobgames.com/pathfinding/a-star/introduction.html) · [CS Academy graph editor](https://codeforces.net/blog/entry/45758) · [JSAV/OpenDSA](https://people.cs.vt.edu/~shaffer/Papers/p159-karavirta.pdf) · [Naps et al. 2002](https://scholars.duke.edu/publication/796177) · [Hundhausen et al. 2002](https://www.academia.edu/15636659/A_Meta_Study_of_Algorithm_Visualization_Effectiveness) · [Shaffer et al. 2010](https://people.cs.vt.edu/~shaffer/Papers/ShafferTOCE11.pdf) · [Urquiza-Fuentes 2009](https://burjcdigital.urjc.es/handle/10115/5593) · [Byrne et al.](https://repository.gatech.edu/items/ed609ce9-014c-45b0-8ed3-b0eded8d8472) · [WCAG 2.3.3](https://dequeuniversity.com/resources/wcag2.1/2.3.3-animations-from-interactions) · [2.2.2 and reduced motion](https://hidde.blog/meeting-2-22-pause-stop-hide-with-prefers-reduced-motion/) · [MDN status role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/status_role) · [Screen-reader vis](https://vis.mit.edu/pubs/rich-screen-reader-vis-experiences)

Learning science and CS education: [Roediger & Karpicke 2006](https://psychology.ecu.edu/wp-content/pv-uploads/sites/216/2019/03/Roediger-Karpicke-2006.pdf) · [Butler & Roediger 2008](https://pubmed.ncbi.nlm.nih.gov/18491500/) · [Agarwal et al. 2014](https://profiles.wustl.edu/en/publications/classroom-based-programs-of-retrieval-practice-reduce-middle-scho/) · [Cepeda et al. 2006](https://pubmed.ncbi.nlm.nih.gov/16719566/) · [Rohrer & Taylor 2007](https://www.gwern.net/doc/psychology/spaced-repetition/2007-rohrer.pdf) · [Bjork](https://bjorklab.psych.ucla.edu/wp-content/uploads/sites/13/2016/07/EBjork_2004.pdf) · [Kulik et al. 1990](https://www.academia.edu/81783373/Effectiveness_of_Mastery_Learning_Programs_A_Meta_Analysis) · [Bloom 1984](https://www.gwern.net/doc/psychology/1984-bloom.pdf) · [Keller Plan](https://en.wikipedia.org/wiki/Keller_Plan) · [Sinha & Kapur 2021](https://www.weforum.org/stories/2021/09/students-who-productively-fail-learn-more/) · [Expertise reversal](https://faculty.engineering.asu.edu/mre/wp-content/uploads/sites/31/2020/02/Exp_Rev_LI06.pdf) · [Help abuse](https://learnlab.org/research/wiki/index.php/Help_abuse) · [Settles & Meeder 2016](https://preview.aclanthology.org/landing_page/P16-1174) · [SM-2](https://supermemo.guru/wiki/SuperMemo_2) · [CAT stopping rules](https://metricgate.com/docs/adaptive-test-stopping-rule/) · [MST](https://assess.com/multistage-testing/) · [CBM](https://www.physoc.org/?p=64978) · [Self-assessment accuracy](https://link.springer.com/article/10.1186/s12909-024-06121-7) · [CS50x early final](https://cs.harvard.edu/malan/publications/3_31_2020_Foreseeing.pdf) · [Lister 2004](https://opus.cloud1.lib.uts.edu.au/handle/10453/4126) · [Lopez et al. 2008](https://opus.lib.uts.edu.au/bitstream/10453/10806/1/2008001530.pdf) · [Venables et al. 2009](https://opus.lib.uts.edu.au/handle/10453/11384) · [Cunningham et al. 2017](https://gvu.gatech.edu/sites/default/files/related_project_files/p164-cunningham.pdf) · [Parsons (Ericson)](https://hg.gatech.edu/node/603172) · [Zingaro et al. 2018](https://www.cs.swarthmore.edu/~kwebb/papers/DataStructuresDifficulties.pdf) · [Enström DP](https://www.csc.kth.se/~emmaen/FIE13.pdf) · [Krishnamurthi et al. 2022](https://world.cs.brown.edu/~sk/Publications/Papers/Published/kbls-prob-persist-perf-precon/paper.pdf) · [Recursion concept inventory](https://www.academia.edu/110135342/A_basic_recursion_concept_inventory)

**Caveats.** The Coursera attempt limits and Khan's figure of 30 course-challenge questions come from community or school sources, not official documentation. Bloom's effect sizes come from small studies. Evidence for prediction prompts is mixed. Several paywalled papers (Hundhausen, Saraiya, Naps) are cited through abstracts or secondary summaries (Shaffer et al. 2010).
