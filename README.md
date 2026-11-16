<div align="center">
  <h1>Agentic SDLC</h1>
  <h3>A worked example of a software lifecycle driven by AI agents</h3>
</div>

---

This repository illustrates the **Agentic SDLC** adopted in [Discava](https://github.com/AlexTo/discava):
work is written up as specs, turned into issues, implemented by agents as pull requests, verified by CI
(with bounded automatic fix-ups) and gated by human review.

It is an Nx workspace scaffolded with the [Nx Plugin for AWS](https://awslabs.github.io/nx-plugin-for-aws),
using the same layout as Discava, with a small notes app for the lifecycle to act on.

## Layout

| Path | What |
| --- | --- |
| `docs/` | Astro + Starlight documentation site (`ts#astro-docs`) |
| `packages/notes-table` | DynamoDB table and ElectroDB `note` entity (`ts#dynamodb`) |
| `packages/notes-api` | tRPC API: list, create, update, delete notes (`ts#trpc-api`) |
| `packages/notes-website` | React + shadcn/ui website (`ts#react-website`) |
| `packages/common/*` | Generated shared code (shadcn components, local-dev scripts, constructs) |

There is no infrastructure project: the app runs locally only.

## Getting started

```sh
pnpm install
pnpm dev                          # local DynamoDB (needs Docker), API and website
pnpm nx build @agentic-sdlc/docs  # build the docs site
pnpm nx dev @agentic-sdlc/docs    # run the docs site
```

Use the `nx-plugin-for-aws` MCP server (configured in `.mcp.json`) or `pnpm nx g @aws/nx-plugin:<generator>`
to add projects rather than hand-scaffolding.

## Documentation

See [`docs/`](docs). Topics: specs, issue to PR, CI feedback, and human gates.
