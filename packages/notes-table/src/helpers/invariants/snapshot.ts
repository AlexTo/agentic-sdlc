import type { EntityItem } from 'electrodb';
import { createNoteEntity } from '../../entities/note.js';

type Item<F extends () => Promise<any>> = EntityItem<Awaited<ReturnType<F>>>;

// The records the checks read, holding only the attributes they use, so
// tests can build them by hand. The `Invariant coverage` PR check reads this
// file to learn each entity's key here (`notes` for `note`), so keep one
// `key: Pick<Item<typeof create<Entity>Entity>, …>[]` line per entity.
export interface TableSnapshot {
  notes: Pick<
    Item<typeof createNoteEntity>,
    'id' | 'title' | 'createdAt' | 'updatedAt'
  >[];
}

// Each snapshot key and the factory of the entity whose records it holds.
// Adding an entity to the snapshot is its `TableSnapshot` field above and a
// line here.
const SNAPSHOT_ENTITIES = {
  notes: createNoteEntity,
} as const satisfies Record<keyof TableSnapshot, () => Promise<unknown>>;

export const emptyTableSnapshot = (): TableSnapshot =>
  Object.fromEntries(
    Object.keys(SNAPSHOT_ENTITIES).map((key) => [key, []]),
  ) as unknown as TableSnapshot;

// Reads every record the checks need. Scans the whole table, so it's for
// local and test tables, not a deployed one.
export const loadTableSnapshot = async (): Promise<TableSnapshot> => {
  const keys = Object.keys(SNAPSHOT_ENTITIES) as (keyof TableSnapshot)[];
  const scans = await Promise.all(
    keys.map(async (key) => {
      const entity = (await SNAPSHOT_ENTITIES[key]()) as {
        scan: {
          go: (options: { pages: 'all' }) => Promise<{ data: unknown[] }>;
        };
      };
      return entity.scan.go({ pages: 'all' });
    }),
  );
  return Object.fromEntries(
    keys.map((key, i) => [key, scans[i].data]),
  ) as unknown as TableSnapshot;
};
