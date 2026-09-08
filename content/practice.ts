import type { Exercise } from "./types";
import { jsFundamentals } from "./practice/js-fundamentals";
import { dsa } from "./practice/dsa";
import { jsApplied } from "./practice/js-applied";
import { react } from "./practice/react";

// The order is load-bearing: the playground's prev/next walks this array,
// so these groups stay in the sequence they were written in.
export const practice: Exercise[] = [...jsFundamentals, ...dsa, ...jsApplied, ...react];
