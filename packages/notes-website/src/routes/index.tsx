import { Button } from '@agentic-sdlc/common-shadcn/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@agentic-sdlc/common-shadcn/components/ui/card';
import { Input } from '@agentic-sdlc/common-shadcn/components/ui/input';
import { Textarea } from '@agentic-sdlc/common-shadcn/components/ui/textarea';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useNotesApi } from '../hooks/useNotesApi';

export const Route = createFileRoute('/')({
  component: NotesPage,
});

function NotesPage() {
  const api = useNotesApi();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const notes = useQuery(api.listNotes.queryOptions());
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: api.listNotes.queryKey() });

  const create = useMutation(
    api.createNote.mutationOptions({
      onSuccess: () => {
        setTitle('');
        setBody('');
        refresh();
      },
    }),
  );
  const remove = useMutation(
    api.deleteNote.mutationOptions({ onSuccess: refresh }),
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <h1 className="text-2xl font-semibold">My Notes</h1>

      <form
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate({ title, body });
        }}
      >
        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Textarea
          placeholder="Write something..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <Button type="submit" disabled={create.isPending || !title}>
          Add note
        </Button>
      </form>

      {notes.isLoading && <p>Loading...</p>}
      {notes.data?.length === 0 && <p>No notes yet.</p>}
      {notes.data?.map((note) => (
        <Card key={note.id}>
          <CardHeader>
            <CardTitle>{note.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="whitespace-pre-wrap">{note.body}</p>
            <Button
              variant="outline"
              className="self-end"
              onClick={() => remove.mutate({ id: note.id })}
            >
              Delete
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
