import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.argv[2] ?? "content/system-design";
const LINK = /(?:href="|\burl:\s*")(https?:\/\/[^"#]+)/g;
const CONCURRENCY = 6;
const TIMEOUT_MS = 20000;
const BLOCKED = new Set([401, 403, 405, 406, 429, 999]);

function files(dir) {
  return readdirSync(dir, { recursive: true, encoding: "utf8" })
    .filter((entry) => entry.endsWith(".ts"))
    .map((entry) => join(dir, entry));
}

function collect() {
  const where = new Map();
  for (const file of files(ROOT)) {
    for (const match of readFileSync(file, "utf8").matchAll(LINK)) {
      const url = match[1].replace(/&amp;/g, "&");
      where.set(url, (where.get(url) ?? new Set()).add(file));
    }
  }
  return where;
}

async function probe(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "groundwork-source-check/1.0 (+https://groundwork.austincoders.com)" },
    });
    await response.body?.cancel();
    return { status: response.status, final: response.url };
  } catch (error) {
    return { status: 0, error: error instanceof Error ? error.message : String(error) };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const where = collect();
  const urls = [...where.keys()];
  const results = new Map();
  let next = 0;
  async function worker() {
    while (next < urls.length) {
      const url = urls[next++];
      results.set(url, await probe(url));
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const broken = [];
  const blocked = [];
  for (const url of urls) {
    const result = results.get(url);
    if (result.status >= 200 && result.status < 400) continue;
    (BLOCKED.has(result.status) ? blocked : broken).push({ url, ...result });
  }

  console.log(`${urls.length} distinct links in ${ROOT}`);
  for (const item of blocked) {
    console.log(`  needs a manual look (${item.status}): ${item.url}`);
  }
  for (const item of broken) {
    console.log(`  BROKEN (${item.status || item.error}): ${item.url}`);
    for (const file of where.get(item.url)) console.log(`      in ${file}`);
  }
  if (broken.length) process.exit(1);
  console.log("every link answers");
}

await main();
