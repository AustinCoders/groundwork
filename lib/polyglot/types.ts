/**
 * A problem described without JavaScript in it, so any language can be handed
 * a starter and graded against the same cases. Built at build time by running
 * the reference solution against its own tests and recording each call.
 */

export type Json = null | boolean | number | string | Json[];

export type ValueType =
  | { k: "int" }
  | { k: "float" }
  | { k: "bool" }
  | { k: "string" }
  | { k: "list"; of: ValueType }
  /** Never observed with a value (only empty lists): the harness guesses int. */
  | { k: "unknown" };

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
  /** `skipped`: tests that check a property of the answer rather than the
   *  answer itself, which only run in JavaScript. */
  { ok: true; signature: Signature; tests: CaseTest[]; skipped: number } | { ok: false; reason: string };
