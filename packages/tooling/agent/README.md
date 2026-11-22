# tooling-agent

The glue between Speckit, GitHub and the coding agents: the rules that decide
which issue opens next, when an agent is sent back to fix its pull request,
when to stop, which specs to archive, and what the Tester agent tests after a
deploy. Every rule is a pure function with unit tests; the workflows in
`.github/workflows/` only call these Nx targets.

| Target | Run by |
| --- | --- |
| `agent-issue` | Agent Issues |
| `archive-specs` | Archive Specs |
| `agent-ci-status` | Agent CI Status (via Agent Status) |
| `agent-review-status` | Agent Review Status (via Agent Status) |
| `validate-tasks` | PR Checks, `Tasks format` |
| `ui-screenshots` | UI Screenshots |
| `screenshots-comment` | PR Checks, `E2E screenshots` |
| `invariant-coverage` | PR Checks, `Invariant coverage` |
| `entity-writers` | the pre-push hook, to refresh `packages/notes-table/entity-writers.json` |
| `post-merge-test` | Post-merge Verify |

Run the tests once with `pnpm nx test @agentic-sdlc/tooling-agent`.
