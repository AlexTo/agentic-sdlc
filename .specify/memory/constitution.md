# Notes App Constitution

The rules every plan for this repository's example notes app must keep. Adapted from Discava's
constitution (version 1.2.1): the principles that make agent-written code trustworthy are kept word
for word where they apply, and Discava's product-specific ones (AWS-only hosting, its media and
search stack) are left out.

## Core Principles

### I. Generators First
New projects and components MUST be created with an `@aws/nx-plugin` generator (via the `nx-plugin-for-aws` MCP server) when one fits. Hand-scaffolding is allowed only when no generator applies, and the plan MUST say why.

Rationale: generator-owned structure stays upgradeable with the plugin.

### II. Everything Runs Locally
A feature MUST work under `pnpm dev` with Docker and no cloud account. Any cloud service a feature adds MUST get a local stand-in or a documented, justified exception.

Rationale: contributors and CI exercise the real flows, and the agent never needs cloud credentials.

### III. Layered Tests: Unit, Invariants, End to End
Each layer has its own job; a feature uses every layer it touches.

- **Unit tests.** New business logic (tRPC procedures in `notes-api`, entity access patterns in `notes-table`) MUST ship with unit tests covering its main behavior and the rules it enforces.
- **Invariants.** A rule that spans records or writers (for example a limit on a note's tags that both create and update must keep) MUST be written through a shared `notes-table` helper that every writer calls, and MUST have a check in `notes-table`'s `src/helpers/invariants.ts` (created with the first such rule) plus a test that breaks it.
- **Impact check.** A plan MUST list the records the feature writes, or reads in a new way, and for each name the existing invariants and tests that already cover it. Where the feature changes what a record means, the plan MUST extend those checks, not only add new ones, and `tasks.md` MUST carry a task for each check added or extended and its breaking test. A feature that touches no shared record says so.
- **End to end.** A change to a main user flow (creating, editing, listing or deleting notes) MUST add or extend a scenario in `packages/e2e/src/scenarios/`. Scenarios MUST make their own uniquely named data and MUST NOT reset local data. A new write that two users or tabs could race on SHOULD add a concurrency test.
- **Tests are a specification.** A failing test MUST be resolved by fixing the code, unless the spec or plan changes the behavior it covers. Weakening an existing test (loosening an assertion, deleting a case, adding `skip` or `only`, widening a mock or snapshot) is allowed only when a task names the behavior change that justifies it, and the PR description says so. Never edit a test just to turn it green. Invariants count as tests: a violated invariant means the write is wrong, so don't relax the check.

Rationale: unit tests cover logic, invariants cover data that no schema enforces, and end-to-end scenarios cover whole flows. A feature isn't done until each layer it touches passes.

### IV. One Table via ElectroDB
All application data lives in the one `notes-table` DynamoDB table, defined as ElectroDB entities under `packages/notes-table/src/entities/`. A feature MUST:

- Add a new record type as an entity in that table, not a second table.
- Design its access patterns up front, in the plan, and serve each user-facing request with a key or a declared index, never a scan. A scan is allowed only in tooling outside a user request (tests, invariant checks, local scripts), and the plan MUST say where.
- Add an index only for an access pattern the plan names.
- Reach the table through `notes-table` (which resolves the client and table for local and deployed use alike), never through a raw DynamoDB client in the API.

Rationale: single-table design fits only if access patterns are known and keys are planned. Retrofitting keys or indexes later means migrating data.

### V. Change Freely
This is an example app with no real users, links or data to keep compatible. Routes, APIs and data shapes MUST be changed outright: no redirects, deprecated aliases or fallbacks for old data. Fix local data by hand.

Rationale: compatibility code is dead weight here, and agents add it by default unless told not to.

### VI. Repository Conventions
- Conventional Commits for commit and PR titles.
- Biome (not ESLint or Prettier) formats and lints.
- Code that isn't an entity or a package's setup goes in a `helpers/` folder, one file per entity or topic. No catch-all `utils.ts`.
- A change to what a user sees takes screenshots in its e2e scenario with `screenshot()` (`packages/e2e/src/helpers/screenshots.ts`), which PR CI posts on the pull request (the `UI Screenshots` check enforces it).

## Development Workflow

- Run `pnpm build` (or `pnpm nx affected --target build`) before pushing. CI's PR checks run lint, test, build, the `tasks.md` format check, e2e and the screenshots check on what changed.
- `AGENTS.md` holds the day-to-day commands and architecture notes; this constitution holds only the rules a plan must not break.
- Plans MUST pass the Constitution Check against the principles above, and any violation MUST be recorded in the plan's Complexity Tracking with a justification.
- Features are implemented by autonomous agents, each on its own branch and pull request, so a task list MUST NOT require a local stack, Docker or `pnpm dev`. The agent runs unit and component tests, lint, typecheck and `build` itself. It writes the e2e and concurrency tests, but pull request CI runs them. A task that needs a running local stack or people (manual checks, timing, screen readers) MUST be marked `(human)` in `tasks.md` and is done by a reviewer before merge.
- `tasks.md` MUST keep the format the Agent Issues workflow reads (see `.specify/templates/tasks-template.md`): it decides which tasks each implementation issue hands the agent.
- Pull request CI is the gate. An agent MUST NOT merge, push to `main`, edit CI workflows, or weaken a test to make CI pass.

## Governance

This constitution supersedes other practices where they conflict. Amend it by pull request, with the rationale in the description. Versioning is semantic: MAJOR for removing or redefining a principle, MINOR for adding a principle or materially widening one, PATCH for clarifications. Reviewers MUST check that each PR complies.

**Version**: 1.0.0 | **Ratified**: 2026-11-19 | **Last Amended**: 2026-11-19
