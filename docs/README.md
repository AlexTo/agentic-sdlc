# @agentic-sdlc/docs

Documentation site generated with [@aws/nx-plugin](https://github.com/awslabs/nx-plugin-for-aws/),
powered by [Astro](https://astro.build/) and [Starlight](https://starlight.astro.build/).

## Run locally

```bash
pnpm nx start @agentic-sdlc/docs
```

## Build for production

```bash
pnpm nx build @agentic-sdlc/docs
```

## Preview the production build

```bash
pnpm nx preview @agentic-sdlc/docs
```

## Translations

Author English only, under `src/content/docs/en/`. The other locales (`jp`, `ko`, `es`, `pt`,
`fr`, `it`, `zh`, `vi`) live in sibling folders with the same paths, and are translated with
Claude Code. Until a page is translated, its locale shows the English page with a "not
translated yet" notice.

To translate, ask Claude Code, for example: "translate the pages under `docs/src/content/docs/en/`
changed since the last `docs: update translations` commit into every locale". Keep frontmatter
keys, code, commands, label and file names, and links as they are; translate titles, descriptions
and prose. Commit the result with the message `docs: update translations`.
