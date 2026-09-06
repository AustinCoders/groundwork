import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
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
for (const file of ["sql-wasm.js", "sql-wasm.wasm", "sql-wasm-browser.js", "sql-wasm-browser.wasm"]) {
  copy(join(sqlJsSrc, file), join(sqlJsDest, file));
}

const tsLibFiles = JSON.parse(readFileSync(join(root, "lib/tsLibFiles.json"), "utf8"));
const tsLibSrc = join(root, "node_modules/typescript/lib");
const tsLibDest = join(root, "public/wasm/typescript-lib");
for (const file of tsLibFiles) {
  copy(join(tsLibSrc, file), join(tsLibDest, file));
}

if (
  !existsSync(join(root, "public/wasm/pyodide/pyodide.mjs")) ||
  !existsSync(join(root, "public/wasm/sql-js/sql-wasm.wasm")) ||
  !existsSync(join(root, "public/wasm/typescript-lib/lib.es2020.d.ts"))
) {
  throw new Error("copy-wasm-assets: expected output files are missing after copy");
}

console.log("Copied Pyodide + sql.js + TypeScript lib runtime assets into public/wasm/");
