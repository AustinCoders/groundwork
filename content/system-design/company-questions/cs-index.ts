import type { CsSet } from "./cs-types";
import { set as os } from "./cs-os";
import { set as dbms } from "./cs-dbms";
import { set as networks } from "./cs-networks";
import { set as oop } from "./cs-oop";
import { set as sql } from "./cs-sql";

export const CS_SETS: readonly CsSet[] = [os, dbms, networks, sql, oop];
