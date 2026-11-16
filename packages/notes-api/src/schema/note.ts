import { z } from 'zod';

export const NoteSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type INote = z.TypeOf<typeof NoteSchema>;

export const CreateNoteInputSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().max(10000).default(''),
});

export const UpdateNoteInputSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  body: z.string().max(10000),
});

export const NoteIdInputSchema = z.object({ id: z.string() });
