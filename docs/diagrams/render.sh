#!/usr/bin/env bash
# Renders each *.mmd here to docs/public/diagrams/<name>.svg, which the README embeds as an image.
# GitHub's web and mobile apps don't all render ```mermaid blocks, but every client shows an SVG.
# Labels are plain SVG text (no HTML in <foreignObject>), so the files render as <img> everywhere.
#
# Usage: docs/diagrams/render.sh   (needs a Chrome/Chromium; set CHROME_PATH if it isn't found)
set -euo pipefail
cd "$(dirname "$0")"
out=../public/diagrams
chrome="${CHROME_PATH:-$(ls -d ~/.cache/ms-playwright/chromium-*/chrome-linux*/chrome 2>/dev/null | tail -1 || true)}"
chrome="${chrome:-$(command -v chromium || command -v google-chrome || true)}"
puppeteer="$(mktemp)"
trap 'rm -f "$puppeteer"' EXIT
printf '{ "executablePath": "%s", "args": ["--no-sandbox"] }\n' "$chrome" > "$puppeteer"
font="Inter, system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif"
for src in *.mmd; do
  name="${src%.mmd}"
  npx -y @mermaid-js/mermaid-cli@11.4.2 -q -i "$src" -o "$out/$name.svg" -c mermaid.json -p "$puppeteer" -b white
  # Mermaid only sets the font as a CSS variable in SVG-label mode, so set it on the root element.
  sed -i "0,/<svg /s//<svg font-family=\"$font\" /" "$out/$name.svg"
  echo "rendered $out/$name.svg"
done
