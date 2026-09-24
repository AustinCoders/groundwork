const TOKEN = process.env.VERCEL_TOKEN;
const TEAM_ID = process.env.VERCEL_TEAM_ID;
const PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const KEEP_PRODUCTION = Number(process.env.KEEP_PRODUCTION || 5);
const KEEP_PREVIEW = Number(process.env.KEEP_PREVIEW || 5);
const MIN_AGE_HOURS = Number(process.env.MIN_AGE_HOURS || 24);
const EXECUTE = process.argv.includes("--execute");

if (!TOKEN || !TEAM_ID || !PROJECT_ID) {
  throw new Error("vercel-cleanup: VERCEL_TOKEN, VERCEL_TEAM_ID and VERCEL_PROJECT_ID are all required");
}

async function vercelFetch(path, options = {}) {
  const url = `https://api.vercel.com${path}${path.includes("?") ? "&" : "?"}teamId=${TEAM_ID}`;
  const res = await fetch(url, {
    ...options,
    headers: { Authorization: `Bearer ${TOKEN}`, ...(options.headers || {}) },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`vercel-cleanup: ${options.method || "GET"} ${path} -> ${res.status} ${body}`);
  }
  return res.status === 204 ? null : res.json();
}

async function fetchAllDeployments() {
  const all = [];
  let until;
  for (;;) {
    const qs = until ? `&until=${until}` : "";
    const page = await vercelFetch(`/v6/deployments?projectId=${PROJECT_ID}&limit=100${qs}`);
    all.push(...page.deployments);
    until = page.pagination?.next;
    if (!until) break;
  }
  return all;
}

async function currentProductionId() {
  const project = await vercelFetch(`/v9/projects/${PROJECT_ID}`);
  return project.targets?.production?.id || null;
}

function pickToDelete(deployments, liveId) {
  const now = Date.now();
  const cutoff = now - MIN_AGE_HOURS * 60 * 60 * 1000;

  const production = deployments.filter((d) => d.target === "production").sort((a, b) => b.created - a.created);
  const preview = deployments.filter((d) => d.target !== "production").sort((a, b) => b.created - a.created);

  const keepIds = new Set([
    liveId,
    ...production.slice(0, KEEP_PRODUCTION).map((d) => d.uid),
    ...preview.slice(0, KEEP_PREVIEW).map((d) => d.uid),
  ]);

  return deployments.filter((d) => !keepIds.has(d.uid) && d.created < cutoff);
}

async function main() {
  const [deployments, liveId] = await Promise.all([fetchAllDeployments(), currentProductionId()]);
  const toDelete = pickToDelete(deployments, liveId);

  console.log(`Total deployments: ${deployments.length}`);
  console.log(`Live production (never deleted): ${liveId}`);
  console.log(
    `Keeping ${KEEP_PRODUCTION} most recent production + ${KEEP_PREVIEW} most recent preview + anything under ${MIN_AGE_HOURS}h old`
  );
  console.log(`Candidates for deletion: ${toDelete.length}`);

  for (const d of toDelete) {
    console.log(
      `  ${EXECUTE ? "deleting" : "would delete"}  ${d.target || "preview"}  ${new Date(d.created).toISOString()}  ${d.url}`
    );
    if (EXECUTE) {
      await vercelFetch(`/v13/deployments/${d.uid}`, { method: "DELETE" });
    }
  }

  if (!EXECUTE) {
    console.log("\nDry run only — nothing was deleted. Re-run with --execute to actually delete these.");
  } else {
    console.log(`\nDeleted ${toDelete.length} deployment(s).`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
