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
`fr`, `it`, `zh`, `vi`) are generated from it by an agent on Amazon Bedrock. Until a page is
translated, its locale shows the English page with a "not translated yet" notice.

With AWS credentials that can call Bedrock (model and region in `scripts/translate.config.json`):

```bash
pnpm nx run @agentic-sdlc/docs:translate -- --dry-run   # list what would be translated
pnpm nx run @agentic-sdlc/docs:translate                # files changed since the last translation commit
pnpm nx run @agentic-sdlc/docs:translate -- --all       # everything
pnpm nx run @agentic-sdlc/docs:translate -- --languages jp,zh
```

Commit the result with the message `docs: update translations`. The next run only translates
files changed since that commit.
