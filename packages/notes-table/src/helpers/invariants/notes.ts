import { type Check, violation } from './common.js';

// A note is created by `createNote` and changed by `updateNote`, both in
// notes-api. These are the rules no schema enforces across those writes.
export const NOTES_CHECKS = [
  {
    name: 'note-title-present',
    check: (snapshot) =>
      snapshot.notes
        .filter((note) => note.title.trim() === '')
        .map((note) =>
          violation(
            'note-title-present',
            { id: note.id },
            'The note has a blank title',
          ),
        ),
  },
  {
    name: 'note-updated-after-created',
    check: (snapshot) =>
      snapshot.notes
        .filter((note) => note.updatedAt < note.createdAt)
        .map((note) =>
          violation(
            'note-updated-after-created',
            { id: note.id },
            `The note was updated (${note.updatedAt}) before it was created (${note.createdAt})`,
          ),
        ),
  },
] as const satisfies readonly Check[];
