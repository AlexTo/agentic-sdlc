# AGENTS.md

Guidance for coding agents working in this repository. Read it before you
change anything, together with `.specify/memory/constitution.md` and the
spec folder of the feature you are working on.

## What this is

A small notes app wrapped in the agentic software development lifecycle: specs
written with Speckit, implemented by agents from GitHub issues, checked by PR
CI, and reviewed by people. It is an Nx monorepo (pnpm workspaces) scaffolded
with the Nx Plugin for AWS. The app is a tRPC API on DynamoDB (ElectroDB) and
a React website (Vite, TanStack Router, shadcn/ui). It runs entirely locally.

## Commands

```sh
pnpm install
pnpm build                                           # build everything (lint, compile, test, bundle)
pnpm lint                                            # lint and fix everything
pnpm test                                            # unit tests, everything
pnpm nx run @agentic-sdlc/notes-table:test           # one project's tests, once
pnpm nx run @agentic-sdlc/notes-table:test -- src/helpers/invariants/notes.test.ts   # one file, once
pnpm nx affected --target test                       # only what your change affects
pnpm nx e2e @agentic-sdlc/e2e                        # e2e tests (needs Docker; PR CI runs them)
pnpm dev                                             # the whole app locally (needs Docker)
```

Tests run once, not in watch mode. Don't run `pnpm dev`, Docker or the e2e
runner when you implement an issue: PR CI runs the e2e suite, and its result
is your feedback.

## Architecture

- `packages/notes-table`: the DynamoDB table, its ElectroDB entities
  (`src/entities/`), and the invariants (`src/helpers/invariants/`) the e2e
  suite checks after every scenario. See its README, "Rules that span
  records".
- `packages/notes-api`: the tRPC procedures (`src/procedures/`), their zod
  schemas (`src/schema/`) and middleware. It may import `notes-table`.
- `packages/notes-website`: the React website. Routes are in `src/routes/`.
  It talks to the API only through the generated tRPC client.
- `packages/common/shadcn`: shared UI components. UI goes here when two
  places use it.
- `packages/common/constructs`: CDK constructs for deploying the app.
- `packages/e2e`: Playwright scenarios, one `src/scenarios/*.e2e.ts` per user
  flow. Each makes its own uniquely named data and takes `test` from
  `src/helpers/table-invariants.ts`. Call `screenshot(page, 'name')`
  (`src/helpers/screenshots.ts`) at each state a reviewer should see.
- `packages/tooling/agent`: the glue the workflows run; see its AGENTS.md.
- `packages/tooling/local-dev`: starts the local stand-ins (DynamoDB local).
- `docs`: the documentation site.

## Conventions

- Conventional Commits for every commit and pull request title (commitlint
  enforces it).
- Biome formats and lints; don't add ESLint or Prettier. The pre-commit hook
  runs `git-secrets` and Biome on staged files, and fails if Biome changed
  anything: stage the result and commit again.
- File names are kebab-case. Code that isn't an entity or a package's setup
  goes in a `helpers/` folder, one file per topic; no catch-all `utils.ts`.
- New business logic ships with unit tests. A change to a user flow adds or
  extends an e2e scenario.
- A rule that spans records or writers is a check in
  `packages/notes-table/src/helpers/invariants/`, with a test that breaks it.
  After changing which code writes the table, run
  `pnpm nx run @agentic-sdlc/tooling-agent:entity-writers` and commit
  `packages/notes-table/entity-writers.json` (the pre-push hook does it too).
- Never weaken a test to make it pass, never edit `.github/workflows/`, and
  never merge.
