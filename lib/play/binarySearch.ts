import type { Cell, CellMark, CellState, Frame, ParseResult, Tracer, TracerLine, Variable } from "./types";

export type BinarySearchInput = { array: number[]; target: number };

const LIMIT = 16;

const lines: TracerLine[] = [
  { id: "signature", text: "function binarySearch(sorted, target) {" },
  { id: "init", text: "  let lo = 0, hi = sorted.length - 1;" },
  { id: "loop", text: "  while (lo <= hi) {              // note: <=, not <" },
  { id: "mid", text: "    const mid = lo + Math.floor((hi - lo) / 2); // avoids overflow, same as (lo+hi)>>1 in JS" },
  { id: "equal", text: "    if (sorted[mid] === target) return mid;" },
  { id: "smaller", text: "    if (sorted[mid] < target) lo = mid + 1;" },
  { id: "larger", text: "    else hi = mid - 1;" },
  { id: "end-loop", text: "  }" },
  { id: "not-found", text: "  return -1; // not found" },
  { id: "close", text: "}" },
];

const defaultInput: BinarySearchInput = { array: [1, 4, 9, 13, 20, 27, 31, 38, 45, 50], target: 31 };

const presets: Tracer<BinarySearchInput>["presets"] = [
  { name: "Found in the middle", input: { array: [3, 8, 12, 17, 24, 31, 40, 52, 65], target: 24 } },
  { name: "Not in the array", input: { array: [1, 4, 9, 13, 20, 27, 31, 38, 45, 50], target: 30 } },
  { name: "Smallest element", input: { array: [1, 4, 9, 13, 20, 27, 31, 38, 45, 50], target: 1 } },
  { name: "Single element", input: { array: [7], target: 7 } },
];

type Position = { lo: number | null; hi: number | null; mid: number | null; focus: boolean; found: boolean };

const elements = (count: number) => (count === 1 ? "1 element is" : `${count} elements are`);
const comparisonsText = (count: number) => `${count} ${count === 1 ? "comparison" : "comparisons"}`;

function cellState(index: number, { lo, hi, mid, focus, found }: Position): CellState {
  if (lo === null || hi === null) return "none";
  if (index === mid && found) return "found";
  if (index === mid && focus) return "mid";
  return index >= lo && index <= hi ? "in" : "out";
}

function cellMarks(index: number, { lo, hi, mid }: Position): CellMark[] {
  const marks: CellMark[] = [];
  if (index === lo) marks.push("lo");
  if (index === hi) marks.push("hi");
  if (index === mid) marks.push("mid");
  return marks;
}

function run({ array, target }: BinarySearchInput): Frame[] {
  const frames: Frame[] = [];
  let comparisons = 0;

  const record = (line: string, next: string | null, narration: string, position: Position) => {
    const { lo, hi, mid } = position;
    const vars: Variable[] = [
      ["lo", lo],
      ["hi", hi],
      ["mid", mid],
      ["sorted[mid]", mid === null ? null : array[mid]],
      ["target", target],
    ];
    const cells: Cell[] = array.map((value, index) => ({
      value,
      state: cellState(index, position),
      marks: cellMarks(index, position),
    }));
    frames.push({ line, next, narration, vars, cells });
  };

  const unset: Position = { lo: null, hi: null, mid: null, focus: false, found: false };
  record(
    "signature",
    "init",
    `Search for ${target} in a sorted array of ${array.length} ${array.length === 1 ? "number" : "numbers"}.`,
    unset
  );

  let lo = 0;
  let hi = array.length - 1;
  record("init", "loop", `lo is 0 and hi is ${hi}, so ${elements(array.length)} still in play.`, { ...unset, lo, hi });

  while (lo <= hi) {
    record("loop", "mid", `lo (${lo}) has not passed hi (${hi}), so ${elements(hi - lo + 1)} still in play.`, {
      ...unset,
      lo,
      hi,
    });

    const mid = lo + Math.floor((hi - lo) / 2);
    const value = array[mid];
    comparisons += 1;
    record("mid", "equal", `mid is ${mid}, the middle of the range, and sorted[${mid}] is ${value}.`, {
      lo,
      hi,
      mid,
      focus: true,
      found: false,
    });

    if (value === target) {
      record(
        "equal",
        null,
        `sorted[${mid}] = ${value} equals the target, so the search returns index ${mid} after ${comparisonsText(comparisons)}.`,
        { lo, hi, mid, focus: true, found: true }
      );
      return frames;
    }
    record("equal", "smaller", `sorted[${mid}] = ${value} is not the target ${target}, so the search goes on.`, {
      lo,
      hi,
      mid,
      focus: true,
      found: false,
    });

    if (value < target) {
      lo = mid + 1;
      record(
        "smaller",
        "loop",
        `sorted[${mid}] = ${value} is smaller than ${target}, so the answer is to the right and lo becomes ${lo}.`,
        { lo, hi, mid, focus: false, found: false }
      );
    } else {
      record("smaller", "larger", `sorted[${mid}] = ${value} is not smaller than ${target}, so the else branch runs.`, {
        lo,
        hi,
        mid,
        focus: true,
        found: false,
      });
      hi = mid - 1;
      record(
        "larger",
        "loop",
        `sorted[${mid}] = ${value} is larger than ${target}, so the answer is to the left and hi becomes ${hi}.`,
        { lo, hi, mid, focus: false, found: false }
      );
    }
  }

  record("loop", "not-found", `lo (${lo}) has passed hi (${hi}), so no element is left to check.`, {
    ...unset,
    lo,
    hi,
  });
  record(
    "not-found",
    null,
    `Not found: ${target} is not in the array, so the search returns -1 after ${comparisonsText(comparisons)}.`,
    { ...unset, lo, hi }
  );
  return frames;
}

const whole = (text: string) => (/^[+-]?\d+$/.test(text) && Number.isSafeInteger(Number(text)) ? Number(text) : null);

const refuse = (message: string): ParseResult<BinarySearchInput> => ({ ok: false, message });

function parse(text: string): ParseResult<BinarySearchInput> {
  const parts = text.split("|");
  if (parts.length !== 2) return refuse("Write the sorted numbers, then a | and the target, like 1, 4, 9, 13 | 9.");

  const items = parts[0]
    .replace(/[[\]]/g, " ")
    .split(/[\s,]+/)
    .filter(Boolean);
  if (items.length === 0) return refuse("Add at least one number before the |.");
  if (items.length > LIMIT) return refuse(`Use at most ${LIMIT} numbers; this has ${items.length}.`);

  const array: number[] = [];
  for (const item of items) {
    const value = whole(item);
    if (value === null) return refuse(`"${item}" is not a whole number.`);
    array.push(value);
  }
  for (let at = 1; at < array.length; at++) {
    if (array[at] < array[at - 1]) {
      return refuse(
        `The numbers must be sorted from smallest to largest, but ${array[at]} comes after ${array[at - 1]}.`
      );
    }
  }

  const targetText = parts[1].trim();
  if (targetText === "") return refuse("Add the target after the |.");
  const target = whole(targetText);
  if (target === null) return refuse(`The target "${targetText}" is not a whole number.`);

  return { ok: true, input: { array, target } };
}

export const tracer: Tracer<BinarySearchInput> = {
  id: "binary-search",
  title: "Binary search",
  mirrors: "binary-search-classic",
  lines,
  defaultInput,
  presets,
  limit: LIMIT,
  parse,
  run,
};
