import type { TableSnapshot } from './snapshot.js';

// What every topic file builds on. The rules the notes table must keep that
// span several records, or several writers, and that no schema enforces, are
// checks: each reads a snapshot of the table and returns every record that
// breaks its rule. Nothing here writes.

export interface Violation {
  invariant: string;
  message: string;
  // The record's key, enough to find it in the table.
  record: Record<string, string>;
}

// A topic file lists its checks as `{ name, check }`, in `index.ts`'s order.
export interface Check {
  name: string;
  check: (snapshot: TableSnapshot) => Violation[];
}

export const violation = (
  invariant: string,
  record: Record<string, string>,
  message: string,
): Violation => ({ invariant, record, message });
