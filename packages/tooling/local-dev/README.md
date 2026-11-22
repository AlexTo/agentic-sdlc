# tooling-local-dev

Scripts that start the example app's local stand-ins: DynamoDB local in Docker,
with the notes table created in it. `packages/notes-table`'s `serve-local`
target runs them, so `pnpm dev` needs no cloud account.
