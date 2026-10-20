import type { Diagram } from "./diagram-types";
import { diagrams as d1 } from "./lld-diagrams1";
import { diagrams as d2 } from "./lld-diagrams2";
import { diagrams as d3 } from "./lld-diagrams3";
import { diagrams as d4 } from "./lld-diagrams4";
import { diagrams as d5 } from "./lld-diagrams5";

export const LLD_DIAGRAMS: Readonly<Record<string, readonly Diagram[]>> = { ...d1, ...d2, ...d3, ...d4, ...d5 };
