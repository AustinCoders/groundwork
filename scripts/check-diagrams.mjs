import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const { diagramProblems } = await import(pathToFileURL(resolve("app/company-questions/diagramLayout.ts")).href);
const files = process.argv.slice(2);
let failures = 0;
let count = 0;
for (const file of files) {
  const { diagrams } = await import(pathToFileURL(resolve(file)).href);
  for (const [id, list] of Object.entries(diagrams)) {
    if (list.length < 2) {
      console.log(`${id}: needs at least two diagrams (has ${list.length})`);
      failures += 1;
    }
    for (const diagram of list) {
      count += 1;
      for (const problem of diagramProblems(diagram)) {
        console.log(`${id} / ${diagram.title}: ${problem}`);
        failures += 1;
      }
    }
  }
}
console.log(failures === 0 ? `all ${count} diagrams pass` : `${failures} problems in ${count} diagrams`);
process.exit(failures === 0 ? 0 : 1);
