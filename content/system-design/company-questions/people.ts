import type { PeopleSet } from "./people-types";
import { people as a } from "./people-a";
import { people as b } from "./people-b";
import { people as c } from "./people-c";

export const PEOPLE: readonly PeopleSet[] = [...a, ...b, ...c];
