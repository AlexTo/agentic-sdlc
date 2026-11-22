# AGENTS.md: packages/tooling/agent

The repository-wide rules are in the root [AGENTS.md](../../../AGENTS.md).

The glue the workflows in `.github/workflows/` run. Each piece is an Nx target
(`project.json` lists them), and its rules are in its folder under `src/`:

- `agent-issues`: `agent-issue` (opens the next implementation issue),
  `validate-tasks`, `archive-specs`
- `agent-ci`: `agent-ci-status`
- `agent-review`: `agent-review-status`
- `helpers/conversation-lock.ts` locks the issues Agent Issues and Post-merge
  Verify open, before the label that hands them to an agent goes on
- `post-merge-test`: `post-merge-test` (opens an `openhands-test` issue for
  each pull request a Deploy put on the test stage)
- `ui-screenshots`: `ui-screenshots`, `screenshots-comment`
- `invariant-coverage`: `entity-writers` and `invariant-coverage`;
  `WRITER_PACKAGES` in `src/invariant-coverage/scan.ts` lists the packages it
  scans

The workflows name these targets, so renaming one means editing
`.github/workflows/`, which an agent may not do.
