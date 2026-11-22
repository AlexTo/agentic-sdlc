import { describe, expect, it } from 'vitest';
import {
  checkTableInvariants,
  emptyTableSnapshot,
  INVARIANTS,
} from './index.js';

const note = (
  overrides: Partial<
    ReturnType<typeof emptyTableSnapshot>['notes'][number]
  > = {},
) => ({
  id: 'n1',
  title: 'Groceries',
  createdAt: '2026-11-22T00:00:00.000Z',
  updatedAt: '2026-11-22T00:00:00.000Z',
  ...overrides,
});

describe('notes invariants', () => {
  it('passes an empty table and a well-formed note', () => {
    expect(checkTableInvariants(emptyTableSnapshot())).toEqual([]);
    expect(checkTableInvariants({ notes: [note()] })).toEqual([]);
  });

  it('flags a blank title', () => {
    expect(checkTableInvariants({ notes: [note({ title: '  ' })] })).toEqual([
      expect.objectContaining({
        invariant: 'note-title-present',
        record: { id: 'n1' },
      }),
    ]);
  });

  it('flags a note updated before it was created', () => {
    expect(
      checkTableInvariants({
        notes: [note({ updatedAt: '2026-11-21T00:00:00.000Z' })],
      }),
    ).toEqual([
      expect.objectContaining({
        invariant: 'note-updated-after-created',
        record: { id: 'n1' },
      }),
    ]);
  });

  it('names every check', () => {
    expect(INVARIANTS).toEqual([
      'note-title-present',
      'note-updated-after-created',
    ]);
  });
});
