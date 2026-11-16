import { randomUUID } from 'node:crypto';
import { createNoteEntity } from '@agentic-sdlc/notes-table';
import { z } from 'zod';
import { publicProcedure } from '../init.js';
import {
  CreateNoteInputSchema,
  NoteIdInputSchema,
  NoteSchema,
  UpdateNoteInputSchema,
} from '../schema/index.js';

export const listNotes = publicProcedure
  .output(z.array(NoteSchema))
  .query(async () => {
    const notes = await createNoteEntity();
    const { data } = await notes.query.primary({}).go({ pages: 'all' });
    return data.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  });

export const createNote = publicProcedure
  .input(CreateNoteInputSchema)
  .output(NoteSchema)
  .mutation(async ({ input }) => {
    const notes = await createNoteEntity();
    const { data } = await notes.create({ id: randomUUID(), ...input }).go();
    return data;
  });

export const updateNote = publicProcedure
  .input(UpdateNoteInputSchema)
  .output(NoteSchema)
  .mutation(async ({ input: { id, ...changes } }) => {
    const notes = await createNoteEntity();
    const { data } = await notes
      .patch({ id })
      .set(changes)
      .go({ response: 'all_new' });
    return data;
  });

export const deleteNote = publicProcedure
  .input(NoteIdInputSchema)
  .output(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    const notes = await createNoteEntity();
    await notes.delete({ id: input.id }).go();
    return { id: input.id };
  });
