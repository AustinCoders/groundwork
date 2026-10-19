import type { Exercise } from "./types";
import { jsFundamentals } from "./practice/js-fundamentals";
import { dsa } from "./practice/dsa";
import { jsApplied } from "./practice/js-applied";
import { react } from "./practice/react";
import { reactComponents } from "./practice/react-components";
import { company } from "./practice/company";

export const practice: Exercise[] = [...jsFundamentals, ...dsa, ...jsApplied, ...react, ...reactComponents, ...company];
