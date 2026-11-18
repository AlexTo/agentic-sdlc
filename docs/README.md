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

Translated so far: `vi`.

### Finding pages that are out of date

Git is the record. A translated page is stale when its English page was committed after it. This
lists them for one locale (here `vi`), including pages not translated yet:

```bash
cd docs/src/content/docs
for f in $(cd en && git ls-files '*.md' '*.mdx'); do
  en=$(git log -1 --format=%ct -- "en/$f"); tr=$(git log -1 --format=%ct -- "vi/$f")
  { [ -z "$tr" ] || [ "$en" -gt "$tr" ]; } && echo "$f"
done
```

To see what changed in one English page since its translation:

```bash
git diff "$(git log -1 --format=%H -- vi/<page>)" -- en/<page>
```

Because it works per page and per locale, locales can be translated at different times.

### Translating

Ask Claude Code, for example: "translate the stale `vi` pages, using the check in `docs/README.md`".
Keep frontmatter keys, code blocks, commands, label, file and UI names, and quotes from real GitHub
artifacts as they are. Translate titles, descriptions, prose, table text and diagram labels. Change
`/agentic-sdlc/en/` links to the locale, and update `#anchor` links to the translated heading's
slug. Build the docs to check links, then commit with `docs: update <locale> translations`.
