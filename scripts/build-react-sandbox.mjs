import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outfile = join(root, "public/wasm/react-sandbox.js");
mkdirSync(dirname(outfile), { recursive: true });

// React and ReactDOM for the sandbox iframe, plus its test helpers, as one classic script.
await build({
  entryPoints: [join(root, "lib/reactSandbox/runtime.ts")],
  outfile,
  bundle: true,
  format: "iife",
  platform: "browser",
  target: "es2020",
  minify: true,
  legalComments: "none",
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "warning",
});
