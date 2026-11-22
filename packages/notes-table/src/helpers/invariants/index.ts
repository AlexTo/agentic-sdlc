import type { Violation } from './common.js';
import { NOTES_CHECKS } from './notes.js';
import type { TableSnapshot } from './snapshot.js';

// Every check, by topic. A check is `{ name, check }`; its name is the
// invariant it reports. Add a topic file's checks here.
const CHECKS = [...NOTES_CHECKS] as const;

export type InvariantName = (typeof CHECKS)[number]['name'];

export const INVARIANTS: readonly InvariantName[] = CHECKS.map(
  ({ name }) => name,
);

export interface InvariantViolation extends Violation {
  invariant: InvariantName;
}

// A stable identity for a violation, to compare two checks of the same
// table (e.g. before and after an e2e scenario).
export const violationId = ({ invariant, record }: InvariantViolation) =>
  `${invariant} ${JSON.stringify(record)}`;

// Every violation in the snapshot, by every check.
export const checkTableInvariants = (
  snapshot: TableSnapshot,
): InvariantViolation[] =>
  CHECKS.flatMap(({ check }) => check(snapshot) as InvariantViolation[]);

export {
  emptyTableSnapshot,
  loadTableSnapshot,
  type TableSnapshot,
} from './snapshot.js';
