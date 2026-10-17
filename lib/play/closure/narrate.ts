import type { Cell, HeapView, Remark, ScopeView, Snapshot } from "./types";

const code = (text: string) => `\`${text}\``;

function cellText(cell: Cell, heap: HeapView[], depth = 0): string {
  if (cell.kind !== "ref") return cell.text;
  const target = heap.find((entry) => entry.id === cell.id);
  if (!target) return "…";
  if (target.kind === "function") return `ƒ ${target.name}`;
  if (depth > 0) return target.kind === "array" ? "[…]" : "{…}";
  if (target.kind === "array") return `[${target.items.map((item) => cellText(item, heap, depth + 1)).join(", ")}]`;
  return `{${target.entries.map((entry) => `${entry.key}: ${cellText(entry.value, heap, depth + 1)}`).join(", ")}}`;
}

const scopeName = (scope: ScopeView) => (scope.kind === "function" ? `${scope.label}()` : scope.label);

type Compared = { name: string; cell: Cell; returned: boolean };

function changes(
  where: string,
  scopeLabel: string,
  before: Compared[] | null,
  after: Compared[],
  beforeHeap: HeapView[],
  afterHeap: HeapView[]
): Remark[] {
  const remarks: Remark[] = [];
  for (const entry of after) {
    const old = before?.find((candidate) => candidate.name === entry.name);
    const now = cellText(entry.cell, afterHeap);
    if (entry.returned) {
      remarks.push({ text: `${code(scopeLabel)} (${where}) returns ${code(now)}.`, closure: false });
    } else if (before && !old) {
      remarks.push({ text: `${code(entry.name)} is created in ${where} and set to ${code(now)}.`, closure: false });
    } else if (old && JSON.stringify(old.cell) !== JSON.stringify(entry.cell)) {
      remarks.push({
        text: `${code(entry.name)} in ${where} changes from ${code(cellText(old.cell, beforeHeap))} to ${code(now)}.`,
        closure: false,
      });
    }
  }
  return remarks;
}

export function narrate(previous: Snapshot | null, current: Snapshot, last: boolean): Remark[] {
  if (!previous) {
    const hasFunctions = current.heap.some((entry) => entry.kind === "function");
    return [
      {
        text: hasFunctions
          ? `Nothing has run yet. Functions written with ${code("function")} already exist in memory: JavaScript sets them up before the first line runs.`
          : "Nothing has run yet.",
        closure: false,
      },
    ];
  }

  const remarks: Remark[] = [];
  const before = new Map(previous.scopes.map((scope) => [scope.id, scope]));
  const after = new Map(current.scopes.map((scope) => [scope.id, scope]));

  for (const scope of current.scopes) {
    if (before.has(scope.id)) continue;
    if (scope.kind === "block") {
      remarks.push({ text: `A new scope (#${scope.id}) opens for this ${scope.label}.`, closure: false });
      continue;
    }
    const params = scope.bindings.filter((binding) => !binding.returned);
    const list = params.length
      ? ` (${params.map((binding) => `${code(binding.name)} = ${code(cellText(binding.value, current.heap))}`).join(", ")})`
      : "";
    remarks.push({
      text: `Calling ${code(scopeName(scope))} opens frame #${scope.id}, a fresh workspace for this one call${list}.`,
      closure: false,
    });
    if (scope.enclosedBy !== null) {
      remarks.push({
        text: `It was created inside frame #${scope.enclosedBy}, so it can still see that frame's variables.`,
        closure: true,
      });
    }
  }

  const compare = (bindings: { name: string; value: Cell; returned: boolean }[]) =>
    bindings.map((binding) => ({ name: binding.name, cell: binding.value, returned: binding.returned }));

  remarks.push(
    ...changes("the global scope", "", compare(previous.globals), compare(current.globals), previous.heap, current.heap)
  );
  for (const scope of current.scopes) {
    const old = before.get(scope.id);
    const where = `frame #${scope.id}`;
    if (!old) {
      const returned = compare(scope.bindings).filter((entry) => entry.returned);
      remarks.push(...changes(where, scopeName(scope), [], returned, previous.heap, current.heap));
    } else {
      remarks.push(
        ...changes(where, scopeName(scope), compare(old.bindings), compare(scope.bindings), previous.heap, current.heap)
      );
    }
  }

  for (const scope of previous.scopes) {
    const now = after.get(scope.id);
    if (!now) {
      remarks.push({
        text: `Frame #${scope.id} (${code(scopeName(scope))}) is thrown away, because nothing refers to it any more.`,
        closure: false,
      });
    } else if (scope.running && !now.running) {
      const names = now.bindings.filter((binding) => !binding.returned).map((binding) => code(binding.name));
      const holder = now.keptBy.length ? "A function still points to it" : "Something still points to it";
      const subject =
        scope.kind === "function" ? `${code(scopeName(scope))} has returned` : `The ${scope.label} has ended`;
      remarks.push({
        text: `${subject}, but frame #${scope.id} is NOT thrown away. ${holder}, so ${
          names.length ? `its variables (${names.join(", ")}) stay alive` : "it stays alive"
        }. That is a closure.`,
        closure: true,
      });
    }
  }

  for (const entry of current.heap) {
    if (previous.heap.some((old) => old.id === entry.id)) continue;
    if (entry.kind === "function") {
      remarks.push({
        text: `A function object ${code(entry.name)} is created${
          entry.closesOver !== null
            ? ` inside frame #${entry.closesOver}. It remembers that frame (the amber link).`
            : "."
        }`,
        closure: entry.closesOver !== null,
      });
    } else {
      remarks.push({ text: `A new ${entry.kind === "array" ? "array" : "object"} is created.`, closure: false });
    }
  }

  if (current.output !== previous.output) {
    remarks.push({
      text: `${code("console.log")} prints ${code(current.output.slice(previous.output.length).trim())}.`,
      closure: false,
    });
  }
  if (current.failure) remarks.push({ text: current.failure, closure: false });
  if (last && !current.failure) remarks.push({ text: "The program is finished.", closure: false });
  if (!remarks.length) {
    remarks.push({
      text: current.scopeLabel
        ? `Now running inside ${code(`${current.scopeLabel}()`)}.`
        : "Moving on to the next line.",
      closure: false,
    });
  }
  return remarks;
}
