# Benchmark brief: is Groundwork's content as good as the big players' (Groundwork repo /Users/akshat/Desktop/groundwork, live site https://groundwork.austincoders.com)

You are a skeptical, independent benchmarker. The owner wants an honest answer to: "Is Groundwork's data top notch, is it better than the big companies' data, and if not, what must be done?" Do NOT flatter the site and do NOT trash it: measure. Do NOT edit any repo file. Your output is a markdown report written to the path named in your task, plus a summary under 200 words.

## What you can read

- Groundwork content is in the repo: `content/` (chapters as TypeScript files with HTML bodies, exercises in `content/practice/*.ts`, interview rounds in `content/interview-data.ts`, company data in `content/system-design/company-questions/`), the topic list in `content/topics.ts`, the content rules in `docs/content-standard.md`, earlier audits in `docs/content-audit/*.md` and `docs/competitor-audit-2026-10.md` (feature comparison only, do not repeat it). Facts: 235 of 593 chapter slots are written (about 804,000 words): js 41 chapters, react 57, architecture 26, interview book 27 rounds, dsa 48 (about 8,300 words each), system-design 36 (about 3,900 words each); HTML, CSS, Next.js, NestJS, TypeScript, Node, Docker, databases, testing, security, cloud, GraphQL, Redis and Kubernetes are listed but unwritten stubs; Python, Java, C++, Rust, Ruby, Go, Git, MongoDB, DBMS, networks, OS and AI have no chapters yet. 955 exercises with tests. 135 company answers (38 system design, 66 coding, 26 machine coding and LLD, 5 CS and SQL sets with 93 questions) plus 22 company process pages with people-round sections. Use `npx tsx` scripts or grep to measure; chapters are exported through `lib/content.ts` (`chapters(topicId)`, `exercises()`).
- Competitors: public pages only. No logins, no paywall bypass, no scraping of terms-forbidden sites beyond reading a handful of pages in a normal fetch; respect robots and terms. Never copy their text into your report beyond short paraphrase; never quote more than a few words. Cite the URL you read for every competitor claim. If a page is blocked (403, login), say so and do not guess.

## Method (do all of these)

1. Define the checklist. For your area, list the topics a strong learner needs (take the union of the competitors' public syllabi / tables of contents, with URLs) and mark for each whether Groundwork has it written, stubbed or absent, and whether each competitor has it.
2. Sample head to head. Pick 6 to 10 specific topics or problems that exist in both (choose a spread: foundational, intermediate, advanced). For each, read Groundwork's version in the repo AND the competitor's public version, and compare on: correctness (note every factual error you can verify, in either), depth, clarity and teaching order, worked examples and diagrams, edge cases and pitfalls, interview framing, exercises and tests, freshness (dates, versions, deprecated advice), and sourcing or citations. Be specific: quote nothing, but name what one has that the other lacks.
3. Score. For each dimension in the rubric below give Groundwork a score 1 to 5 and each named competitor a score 1 to 5, with one line of evidence each (URL or file path). 1 = weak or missing, 3 = adequate, 5 = best in class.
   Rubric: coverage (breadth of topics), depth, accuracy, freshness, practice material (exercises, solutions, tests, volume), interactivity (run code, diagrams, whiteboard, visualisations), learning design (order, hints, review, progress), trust (sources, honesty labels, author credibility), scale of data (counts), polish and speed.
4. Verdict per dimension: "ahead", "on par", "behind" or "not comparable", with the reason in one sentence. Say clearly where Groundwork is genuinely better and where it is not.
5. Gap list: the specific things Groundwork would have to build or fix to match or beat the leaders in your area, each with: what, why it matters, rough effort (hours or days of agent-assisted work, and rough token cost class: small under 0.5M, medium 0.5M to 3M, large over 3M), and priority (P0 must, P1 should, P2 later).
6. Hard truths section: anything the owner may not want to hear (scale limits, solo-author risk, no community, no real candidate data, claims on the site that are not backed by the repo).

## Rules

- Separate OBSERVED (you read it) from INFERRED (you concluded it) in every table row.
- Numbers must come from a command you ran or a page you read; show the command or URL.
- Do not use marketing pages as proof of quality.
- Report format: markdown with these headings: Summary verdict, Scope and method, Checklist coverage, Head-to-head samples, Scorecard, Where Groundwork is ahead, Where it is behind, Gap list, Hard truths, What I could not verify.
