import type { Database, SqlJsStatic } from "sql.js";
import type { RunnerDonePayload, RunnerOutputEntry } from "@/lib/runner";

export interface SqlRunOptions {
  code: string;
  onConsole?: (entry: RunnerOutputEntry) => void;
  onDone?: (payload: RunnerDonePayload) => void;
}

// Lazy — sql.js's WASM glue only loads once SQL is actually selected and
// run, not bundled into every practice page's initial JS.
let sqlJsPromise: Promise<SqlJsStatic> | null = null;

function loadSqlJs(): Promise<SqlJsStatic> {
  if (!sqlJsPromise) {
    sqlJsPromise = import("sql.js").then((mod) => {
      const initSqlJs = (mod as unknown as { default?: typeof mod }).default ?? mod;
      return (initSqlJs as unknown as (config: { locateFile: (file: string) => string }) => Promise<SqlJsStatic>)({
        locateFile: (file: string) => `/wasm/sql-js/${file}`,
      });
    });
  }
  return sqlJsPromise;
}

// SQL queries run synchronously once sql.js is loaded, on the main thread —
// fast enough for anything a learner writes here, and simpler than routing
// through a worker. A genuinely pathological recursive query can still hang
// the tab; that's an accepted tradeoff for keeping this path simple.
export function runSQL(options: SqlRunOptions): { stop: () => void } {
  const onConsole = options.onConsole || (() => {});
  const onDone = options.onDone || (() => {});
  let stopped = false;
  let db: Database | null = null;

  (async () => {
    try {
      const SQL = await loadSqlJs();
      if (stopped) return;
      db = new SQL.Database();
      const results = db.exec(options.code);
      if (stopped) return;

      if (!results.length) {
        onConsole({ kind: "system", text: "Query ran with no result set (e.g. a CREATE/INSERT/UPDATE succeeded)." });
      } else {
        for (const result of results) {
          onConsole({ kind: "table", columns: result.columns, rows: result.values as (string | number | null)[][] });
        }
      }
      onDone({ results: [] });
    } catch (err) {
      if (stopped) return;
      const text = err instanceof Error ? err.message : String(err);
      onConsole({ kind: "error", text });
      onDone({ results: [], crashed: true });
    } finally {
      db?.close();
      db = null;
    }
  })();

  return {
    stop: () => {
      stopped = true;
    },
  };
}
