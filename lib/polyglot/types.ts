export type Json = null | boolean | number | string | Json[];

export type ValueType =
  { k: "int" } | { k: "float" } | { k: "bool" } | { k: "string" } | { k: "list"; of: ValueType } | { k: "unknown" };

export interface Param {
  name: string;
  type: ValueType;
}

export interface Signature {
  name: string;
  params: Param[];
  returns: ValueType;
}

export interface Case {
  args: Json[];
  expected: Json;
}

export interface CaseTest {
  name: string;
  cases: Case[];
}

export type Polyglot =
  { ok: true; signature: Signature; tests: CaseTest[]; skipped: number } | { ok: false; reason: string };
