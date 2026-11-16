import { Entity } from 'electrodb';
import { getDynamoDBClient, resolveTableName } from '../client.js';

// A note owned by a single (placeholder) user, listed newest first.
export const createNoteEntity = async () =>
  new Entity(
    {
      model: { entity: 'note', version: '1', service: 'NotesTable' },
      attributes: {
        id: { type: 'string', required: true },
        title: { type: 'string', required: true },
        body: { type: 'string', required: true, default: () => '' },
        createdAt: {
          type: 'string',
          required: true,
          default: () => new Date().toISOString(),
          readOnly: true,
        },
        updatedAt: {
          type: 'string',
          required: true,
          default: () => new Date().toISOString(),
          watch: '*',
          set: () => new Date().toISOString(),
        },
      },
      indexes: {
        primary: {
          pk: { field: 'pk', composite: [] },
          sk: { field: 'sk', composite: ['id'] },
        },
      },
    },
    { client: getDynamoDBClient(), table: await resolveTableName() },
  );
