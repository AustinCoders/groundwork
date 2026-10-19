import type { Diagram } from "../diagram-types";
import { diagrams as d1 } from "./d1";
import { diagrams as d2 } from "./d2";
import { diagrams as d3 } from "./d3";
import { diagrams as d4 } from "./d4";
import { diagrams as d5 } from "./d5";
import { diagrams as d6 } from "./d6";
import { diagrams as d7 } from "./d7";
import { diagrams as d8 } from "./d8";

export const DIAGRAMS: Readonly<Record<string, readonly Diagram[]>> = {
  ...d1,
  ...d2,
  ...d3,
  ...d4,
  ...d5,
  ...d6,
  ...d7,
  ...d8,
};
