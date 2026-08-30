// Copies the Pyodide and sql.js runtime assets from node_modules into
// public/wasm/ so the playground can load them same-origin (no CDN
// dependency, no extra CSP allowlist entries). Runs before dev/build —
// public/wasm/ itself is gitignored since these are large, versioned
// build outputs, not source.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

function copy(from, to) {
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(from, to);
}

const pyodideSrc = join(root, "node_modules/pyodide");
const pyodideDest = join(root, "public/wasm/pyodide");
const pyodideFiles = ["pyodide.mjs", "pyodide.asm.mjs", "pyodide.asm.wasm", "python_stdlib.zip", "pyodide-lock.json"];
for (const file of pyodideFiles) {
  copy(join(pyodideSrc, file), join(pyodideDest, file));
}

const sqlJsSrc = join(root, "node_modules/sql.js/dist");
const sqlJsDest = join(root, "public/wasm/sql-js");
// Bundlers resolve either the CJS or the "browser" export condition
// depending on target — copy both pairs so whichever one gets picked
// finds its .wasm companion.
for (const file of ["sql-wasm.js", "sql-wasm.wasm", "sql-wasm-browser.js", "sql-wasm-browser.wasm"]) {
  copy(join(sqlJsSrc, file), join(sqlJsDest, file));
}

if (!existsSync(join(root, "public/wasm/pyodide/pyodide.mjs")) || !existsSync(join(root, "public/wasm/sql-js/sql-wasm.wasm"))) {
  throw new Error("copy-wasm-assets: expected output files are missing after copy");
}

console.log("Copied Pyodide + sql.js runtime assets into public/wasm/");
