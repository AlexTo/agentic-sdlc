import { t } from './init.js';
import { echo } from './procedures/echo.js';
import {
  createNote,
  deleteNote,
  listNotes,
  updateNote,
} from './procedures/notes.js';

export const router = t.router;

export const appRouter = router({
  echo,
  listNotes,
  createNote,
  updateNote,
  deleteNote,
});

export type AppRouter = typeof appRouter;
