import type { Exercise } from "../types";
import { dsa1 } from "./dsa-1";
import { dsa2 } from "./dsa-2";
import { dsa3 } from "./dsa-3";
import { dsa4 } from "./dsa-4";
import { dsa5 } from "./dsa-5";
import { dsa6 } from "./dsa-6";
import { dsa7 } from "./dsa-7";
import { dsa8 } from "./dsa-8";

// Split only to keep the files openable. The sequence is the one the
// exercises were written in and the playground's prev/next depends on it,
// so the parts concatenate in order and the cuts sit on chapter boundaries.
export const dsa: Exercise[] = [...dsa1, ...dsa2, ...dsa3, ...dsa4, ...dsa5, ...dsa6, ...dsa7, ...dsa8];
