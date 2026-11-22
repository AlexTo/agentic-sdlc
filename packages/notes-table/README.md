# notes-table

The notes app's DynamoDB table and its ElectroDB entities. Locally,
`serve-local` runs it in DynamoDB local (Docker); `pnpm dev` starts it.

Run the unit tests once with `pnpm nx test @agentic-sdlc/notes-table`.

## Rules that span records

Some rules hold across several records, or across the code that writes them,
and no schema can enforce them. Each is a check in
`src/helpers/invariants/`: a pure function that reads a snapshot of the table
and returns every record that breaks the rule. The e2e suite runs every check
after each scenario, and fails the scenario if it left a new violation.

To add one:

1. If the rule reads an entity the snapshot doesn't hold yet, add it to
   `TableSnapshot` and `SNAPSHOT_ENTITIES` in `snapshot.ts`.
2. Write the check in a topic file (like `notes.ts`), with a unit test that
   breaks it, and list it in `index.ts`.
3. Keep the write behind a helper in this package that every writer calls,
   so the rule holds in one place.

`entity-writers.json` maps each entity to the files that write it. The
`Invariant coverage` PR check compares it with the base branch's: a pull
request that gives an entity a second writing package, adds a direct write to
an entity several packages write, or adds an entity, must also change
`src/helpers/invariants/` and name that entity there. A maintainer waives it
with the `no-new-invariant` label. The pre-push hook regenerates the map
(`pnpm nx run @agentic-sdlc/tooling-agent:entity-writers`) and stops the push
if it changed, so commit it and push again.
