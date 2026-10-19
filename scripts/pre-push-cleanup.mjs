import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const WORKFLOW = "vercel-cleanup.yml";
const TAG = "[vercel-cleanup]";
const FRESH_MINUTES = Number(process.env.VERCEL_CLEANUP_FRESH_MINUTES || 20);
const MIN_AGE_HOURS = process.env.VERCEL_CLEANUP_MIN_AGE_HOURS || "1";
const WAIT_SECONDS = Number(process.env.VERCEL_CLEANUP_WAIT_SECONDS || 120);
const POLL_MS = 3000;
const ZERO_SHA = /^0+$/;

export function pushesSomething(stdin) {
  const refs = stdin
    .split("\n")
    .map((line) => line.trim().split(/\s+/))
    .filter((parts) => parts.length >= 4);
  return refs.some((parts) => !ZERO_SHA.test(parts[1]));
}

export function cleanedRecently(runs, now, minutes = FRESH_MINUTES) {
  const limit = now - minutes * 60 * 1000;
  return runs.some(
    (run) =>
      run.status === "completed" &&
      run.conclusion === "success" &&
      !/dry run/i.test(run.displayTitle || "") &&
      Date.parse(run.createdAt) >= limit
  );
}

export function runIdFrom(output) {
  const match = /\/actions\/runs\/(\d+)/.exec(output);
  return match ? match[1] : null;
}

function gh(args) {
  const result = spawnSync("gh", args, { encoding: "utf8", timeout: 30000 });
  return {
    ok: result.status === 0,
    out: `${result.stdout || ""}${result.stderr || ""}`,
    missing: result.error?.code === "ENOENT",
  };
}

function say(message) {
  console.log(`${TAG} ${message}`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitFor(runId) {
  const deadline = Date.now() + WAIT_SECONDS * 1000;
  while (Date.now() < deadline) {
    const view = gh(["run", "view", runId, "--json", "status,conclusion"]);
    if (view.ok) {
      const state = JSON.parse(view.out);
      if (state.status === "completed") return state.conclusion;
    }
    await sleep(POLL_MS);
  }
  return "timed out";
}

export async function main(stdin = readFileSync(0, "utf8")) {
  if (process.env.SKIP_VERCEL_CLEANUP === "1" || process.env.CI) return;
  if (!pushesSomething(stdin)) return;

  const auth = gh(["auth", "status"]);
  if (auth.missing)
    return say("the GitHub CLI (gh) is not installed, so the cleanup is skipped and the push goes ahead");
  if (!auth.ok)
    return say("gh is not logged in (run `gh auth login`), so the cleanup is skipped and the push goes ahead");

  const recent = gh([
    "run",
    "list",
    "--workflow",
    WORKFLOW,
    "--limit",
    "5",
    "--json",
    "status,conclusion,createdAt,displayTitle",
  ]);
  if (recent.ok && cleanedRecently(JSON.parse(recent.out), Date.now())) {
    return say(`already cleaned in the last ${FRESH_MINUTES} minutes, pushing`);
  }

  say("pruning old Vercel deployments before this push goes out");
  let started = gh(["workflow", "run", WORKFLOW, "-f", "dry_run=false", "-f", `min_age_hours=${MIN_AGE_HOURS}`]);
  if (!started.ok && /unexpected inputs/i.test(started.out)) {
    started = gh(["workflow", "run", WORKFLOW, "-f", "dry_run=false"]);
  }
  if (!started.ok) return say(`could not start the cleanup (${started.out.trim().split("\n")[0]}); pushing anyway`);

  const runId = runIdFrom(started.out);
  if (!runId) return say("the cleanup started, but its run could not be followed; pushing anyway");

  const outcome = await waitFor(runId);
  if (outcome === "success") say("done, pushing");
  else say(`the cleanup ended with "${outcome}"; pushing anyway (see the Actions tab)`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    say(`unexpected problem (${error instanceof Error ? error.message : String(error)}); pushing anyway`);
  });
}
