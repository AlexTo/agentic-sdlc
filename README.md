<div align="center">
  <h1>🤖 Agentic SDLC</h1>
  <h3>Stop babysitting the AI. Build an environment you can trust, write the spec, review the PR, and let agents do the rest.</h3>
  <p>
    <img alt="OpenHands" src="https://img.shields.io/badge/agent-OpenHands-22c55e?style=for-the-badge&logo=robotframework&logoColor=white">
    <img alt="Speckit" src="https://img.shields.io/badge/specs-Speckit-6366f1?style=for-the-badge&logo=readthedocs&logoColor=white">
    <img alt="GitHub Actions" src="https://img.shields.io/badge/automation-GitHub_Actions-2088ff?style=for-the-badge&logo=githubactions&logoColor=white">
    <img alt="Nx" src="https://img.shields.io/badge/monorepo-Nx-143055?style=for-the-badge&logo=nx&logoColor=white">
    <img alt="License" src="https://img.shields.io/badge/license-MIT-64748b?style=for-the-badge">
  </p>
</div>

---

This repo guides you step by step through setting up an agentic software lifecycle with
[OpenHands](https://github.com/OpenHands/OpenHands), [Speckit](https://github.com/github/spec-kit) and
opinionated GitHub Actions automation, with a working example you can run. It is the same workflow
used in practice to build [Discava](https://github.com/AlexTo/discava).

## 🐌 The problem: the prompt-wait-fix loop

Using an AI assistant interactively looks fast, but the loop is slow and it needs *you* in it the
whole time:

```mermaid
%%{init: {"theme": "base", "flowchart": {"curve": "basis", "nodeSpacing": 40, "rankSpacing": 50}, "themeVariables": {"fontFamily": "Inter, system-ui, sans-serif", "fontSize": "15px", "lineColor": "#64748b", "background": "#ffffff", "textColor": "#0f172a", "titleColor": "#0f172a", "edgeLabelBackground": "#ffffff", "clusterBkg": "#f8fafc", "clusterBorder": "#e2e8f0"}}}%%
flowchart TB
    subgraph ALL[" "]
    direction TB
    subgraph BUILD["Build"]
        direction LR
        P1("Prompt") --> W1("Wait for AI to build")
        W1 --> R("Read it")
        R --> P2("Prompt again")
        P2 --> W2("Wait")
        W2 -. "not right yet: read it again" .-> R
    end

    subgraph VERIFY["Verify"]
        direction TB
        CI{{"CI"}} -- "passes" --> RV{{"Human review<br/><small>Developer</small>"}}
        RV -- "approves" --> Done(["Merged"])
        CI -- "fails" --> PE("Paste the error")
        PE --> P3("Prompt: fix it")
        P3 --> W3("Wait")
        W3 -. "CI runs again" .-> CI
        RV -- "comments" --> P4("Prompt again")
        P4 --> W4("Wait")
        W4 -. "CI runs again" .-> CI
    end

    BUILD -- "good enough" --> PR("Raise a PR")
    PR --> VERIFY

    end
    style ALL fill:#ffffff,stroke:#ffffff,color:#ffffff

    classDef human fill:#fee2e2,stroke:#ef4444,stroke-width:2px,color:#7f1d1d
    classDef wait fill:#fef3c7,stroke:#f59e0b,stroke-width:2px,color:#78350f,stroke-dasharray:4 3
    classDef gate fill:#e0e7ff,stroke:#6366f1,stroke-width:2px,color:#312e81
    classDef done fill:#dcfce7,stroke:#22c55e,stroke-width:2px,color:#14532d
    class P1,R,P2,PR,PE,P3,P4,RV human
    class W1,W2,W3,W4 wait
    class CI gate
    class Done done
```

Red is the developer, dashed amber is idle waiting, and every loop back runs through the person.

Each cycle is minutes of waiting and a context switch. The developer is the glue: they carry the
spec in their head, paste failures between tools and watch a spinner. The AI is quick, but the
*person* is the bottleneck, and that doesn't scale:

- One developer can only babysit one conversation at a time.
- Every engineer prompts differently, so quality and style vary with whoever drove the chat.
- Work lives in chat histories and local branches, not somewhere the team can review or resume.
- Review becomes the next bottleneck: more code is produced, but the same few people read it.
- Adding people adds coordination cost, not throughput.

## 💡 The idea

Take the developer **out of the loop** and put them at the two ends of it. Humans decide *what* to
build and *whether it's good*. Agents run everything in between, on their own, through the normal
GitHub process: specs, issues, pull requests, CI and review. Every step leaves an artifact
anyone can read, review and re-run.

```mermaid
%%{init: {"theme": "base", "flowchart": {"curve": "basis", "nodeSpacing": 40, "rankSpacing": 50}, "themeVariables": {"fontFamily": "Inter, system-ui, sans-serif", "fontSize": "15px", "lineColor": "#64748b", "background": "#ffffff", "textColor": "#0f172a", "titleColor": "#0f172a", "edgeLabelBackground": "#ffffff", "clusterBkg": "#f8fafc", "clusterBorder": "#e2e8f0"}}}%%
flowchart TB
    subgraph ALL[" "]
    direction TB
    subgraph PLAN["Plan"]
        direction LR
        S("Write the spec<br/><small>Human + Speckit</small>") --> M1("Merge the spec PR")
        M1 --> I("Issue opens<br/><small>Automation</small>")
        I --> IMPL("Agent implements<br/><small>OpenHands</small>")
    end

    subgraph VERIFY["Verify"]
        direction TB
        CI{{"CI"}} -- "passes" --> AR{{"Agent review<br/><small>OpenHands</small>"}}
        AR -- "approves" --> HR{{"Human review<br/><small>Developer</small>"}}
        HR -- "approves" --> Done(["Merged"])
        CI -- "fails" --> FIX("Agent fixes<br/><small>OpenHands, max 3×</small>")
        AR -- "changes requested" --> FIX
        HR -- "changes requested" --> FIX
        FIX -. "CI runs again" .-> CI
    end

    PLAN -- "tests pass locally" --> PR("Agent raises a PR")
    PR --> VERIFY

    end
    style ALL fill:#ffffff,stroke:#ffffff,color:#ffffff

    classDef human fill:#fee2e2,stroke:#ef4444,stroke-width:2px,color:#7f1d1d
    classDef agent fill:#f1f5f9,stroke:#64748b,stroke-width:2px,color:#0f172a
    classDef gate fill:#e0e7ff,stroke:#6366f1,stroke-width:2px,color:#312e81
    classDef done fill:#dcfce7,stroke:#22c55e,stroke-width:2px,color:#14532d
    class S,M1 human
    class I,IMPL,PR,FIX agent
    class CI,AR gate
    class HR human
    class Done done
```

Red is the developer, grey is the agent or automation working on its own, and indigo is an automated
gate: CI, then an OpenHands reviewer. The developer is only at the two ends, writing the spec and giving the
final human review before merge. When a merge lands, the next issue opens by itself, until the spec is done.

| Stage | Who | What happens |
| --- | --- | --- |
| **Spec** | Human + agent, with [Speckit](https://github.com/github/spec-kit) | A feature is written up as `spec.md`, `plan.md` and `tasks.md` under `specs/`, and reviewed as a normal PR. Speckit's `clarify` and `analyze` steps check the spec and plan before any code is written. |
| **Issues** | Automation | Merging a `spec-ready` spec PR opens the next implementation issue from `tasks.md`. |
| **Implement** | [OpenHands](https://github.com/OpenHands/OpenHands), an open source platform for software engineering agents | The agent picks the issue up and opens a pull request, tests first, ticking tasks as it goes. |
| **Verify** | CI | Lint, build, unit and e2e tests run. UI changes must ship screenshots, posted on the PR. |
| **Agent review** | OpenHands reviewer | A second agent reviews the PR once CI is green and either approves or requests changes. |
| **Fix** | OpenHands, bounded | A red CI or a "changes requested" verdict from the agent reviewer sends the agent back by itself, at most **three times** per PR, then it stops and asks for a human. |
| **Human review** | Developer | A person has the final say: they review and merge. Merging opens the next issue, until the spec is done. |

The "fix it" prompts you used to type by hand are now automatic, in two loops:

- **CI fix:** CI fails → status posted → agent revises the same PR. Up to three times, counted with
  `ci-fix-1` to `ci-fix-3`.
- **Review fix:** the agent reviewer requests changes → status posted → agent revises the same PR.
  Up to three times, counted with `review-fix-1` to `review-fix-3`.

Nobody pastes an error message or relays a review comment.

### 🧑‍💼 Where people still spend time

With the loop running by itself, the main human bottleneck moves to the front: **reviewing the
spec**. Code review shrinks to one small, green, agent-approved PR per phase, but every feature
still needs someone to decide that `spec.md` says the right thing.

That review no longer has to wait for a developer. A spec is plain language: user stories,
acceptance scenarios and requirements. A business analyst or product owner can read it, comment on
the spec PR and approve it, alongside an engineer who checks `plan.md`. The people who know *what*
to build review the part that says what to build.

## 🧩 The missing glue

OpenHands and Speckit solve different problems, and neither knows about the other.

- **Speckit** turns an idea into a spec, a plan and a task list.
- **OpenHands** turns an issue into a pull request, and revises it when told something is wrong.

Between them sit the steps nobody gives you. This repo is those steps, built and tested, with a
walkthrough of how to set each one up:

| The gap | The glue here |
| --- | --- |
| Nothing turns a finished spec into work for the agent | A workflow reads `tasks.md` and opens the next implementation issue, one phase at a time |
| The agent doesn't know CI failed | A workflow reports a failing run back to the agent as a status it already watches |
| A reviewer's "changes requested" goes unheard | A workflow does the same for the agent reviewer's verdict |
| Nothing stops a stuck agent looping forever | Both fix-up loops are capped at three tries, then a human takes over |
| `tasks.md` is only a convention, so a malformed one stalls the pipeline silently | A PR check validates its format |
| UI changes reach review without anyone seeing them | A check requires e2e screenshots, posted on the PR |
| Merging the agent's PR doesn't start the next phase | The merge opens the next issue until the spec is done |
| The agent can't run the real stack without cloud access | Local emulators for every service (database, queue, storage, search, login), so it runs the e2e tests before opening a PR, with no credentials |
| Merging doesn't ship anything | A green build on `main` deploys by itself, skips a commit that is no longer the latest, and production waits for a human approval |
| An agent can commit a leaked secret or a vulnerable dependency | A security scan runs on every build, and again before each deploy |

Wire these together and you get the end-to-end loop above.

## 🚀 Why this scales a team

- ⚡ **Parallel, not serial.** Developers no longer babysit a conversation each. Specs split into
  phases, phases run as a chain of small PRs, and several features can be in flight at once while
  people do other work.
- 📜 **The spec is the source of truth, not a prompt.** It says what to build and why, is reviewed like
  code, and every agent run reads the same thing, so quality doesn't depend on who phrased the prompt.
  The plan, tasks and code all derive from it: to change behaviour, change the spec and regenerate
  instead of patching the code by hand.
- 🔍 **Review stays small and focused.** One phase per PR, a scoped task range, screenshots instead of
  "pull the branch and run it". Reviewers judge outcomes instead of hunting for them.
- 🧠 **Nothing lives in someone's head.** Intent is in the spec, scope is in the issue, history is in
  the PR. A new teammate or a new agent can pick up where the last one stopped.
- ✅ **Trust is built into the environment.** Rules, tests and checks are layered
  ([below](#️-automation-you-can-trust)), so mistakes surface and go back to the agent without a
  person reading every line. Time spent on that environment pays off on every change after it.
- 🛡️ **Humans stay in control where it matters.** Agents can't merge, can't edit workflows, can't touch
  credentials, and can't weaken a test to make it pass. Retries are capped, so a stuck agent
  escalates instead of looping.
- 🎯 **Senior time goes to judgment.** Writing a good spec, building the environment agents are checked
  by, and reviewing a PR are the high-leverage jobs. The typing and the waiting in between are delegated.

## 🛡️ Automation you can trust

Automation is only worth it if you can trust what comes out. Every change passes through layers of
checks, and each layer narrows what reaches the next: cheap, automatic checks run first and catch the
most, and only what they can't judge reaches a person. When a check fails, the failure goes straight
back to the agent to fix, with no human in between.

<p align="center">
  <img alt="Inverted triangle of five layers, widest to narrowest: Codebase, Static analysis, Verification, Prose, Human review" src="docs/public/diagrams/automation-trust.svg" width="720">
</p>

| Level | Layer | What it catches |
| --- | --- | --- |
| **Codebase** | Unit tests | Wrong business logic and broken rules |
| | Invariants | Data that breaks a rule spanning records, checked after every e2e test |
| | Concurrency tests | Race conditions when requests hit at the same moment |
| **Static analysis** | Lint, typecheck, build | Style, type and build errors |
| | Tasks format check | A malformed `tasks.md` that would silently stall the pipeline |
| | Generated files check | Lint or build output the agent forgot to commit |
| **Verification** | End-to-end tests | Broken user flows, run in a real browser against the local stack |
| | Screenshots | UI changes nobody has looked at, required on the PR |
| **Prose** | Rules, skills, `AGENTS.md` | Guidance the agent reads before it writes code, so conventions are followed instead of caught later |
| | Agent reviewer | Problems the tests don't cover, read like a code review |
| **Human review** | Final review | Whatever the layers above can't judge; a person always merges |

A red result sends the agent back to fix the same PR, up to **3 times**. After that it stops and
asks a human.

## 🧰 What's in this repo

This is a small, working notes app (DynamoDB, tRPC API, React website, Playwright e2e) wrapped in
the complete pipeline, so you can see the workflow end to end rather than read about it.

| Piece | Where |
| --- | --- |
| Spec tooling (Speckit) | `.specify/`, `.claude/skills/speckit-*`, `specs/` |
| Spec → issue automation | `.github/workflows/agent-issues.yml` |
| Issue template handed to OpenHands | `.github/ISSUE_TEMPLATE/implement-phase.md` |
| CI and PR checks (lint, test, e2e, screenshots) | `.github/workflows/ci.yml`, `pr-checks.yml`, `ui-screenshots.yml` |
| Bounded fix-up loops | `.github/workflows/agent-ci.yml`, `agent-review.yml` |
| The rules behind the automation (unit-tested) | `packages/common/scripts/src/agent-*` |
| Example app | `packages/notes-*`, `packages/e2e` |

## 📚 Learn more

Read the full guide at **[alexto.github.io/agentic-sdlc](https://alexto.github.io/agentic-sdlc/)**:
the concepts behind the workflow, how Discava fills each gap (with a real feature traced from spec
to merge), how to fork this repository and run the same workflow yourself, how to adopt it in
your own repository, a tutorial, and reference pages.
Its source is in [`docs/`](docs).
