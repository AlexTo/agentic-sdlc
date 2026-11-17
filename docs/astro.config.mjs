// @ts-check
import { defineConfig } from 'astro/config';

import starlight from '@astrojs/starlight';
import astroD2 from 'astro-d2';

const basePath = process.env.DOCS_BASE_PATH || '/agentic-sdlc';

// https://astro.build/config
export default defineConfig({
  site: 'https://alexto.github.io',
  base: basePath,
  outDir: './dist',
  // Redirect the root URL to the default locale so visitors land on localised content.
  redirects: {
    '/': `${basePath}/en`,
  },
  integrations: [
    starlight({
      title: 'Agentic SDLC',
      social: [],
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 4,
      },
      defaultLocale: 'en',
      locales: {
        en: {
          label: 'English',
        },
      },
      sidebar: [
        { label: 'Start here', items: [{ autogenerate: { directory: 'guides' } }] },
        { label: 'Principles', items: [{ autogenerate: { directory: 'principles' } }] },
        { label: 'Tutorial: add a feature', items: [{ autogenerate: { directory: 'tutorial' } }] },
        { label: 'Reference: the lifecycle', items: [{ autogenerate: { directory: 'lifecycle' } }] },
      ],
      customCss: ['./src/styles/custom.css'],
      plugins: [],
    }),
    // Renders ```d2 code blocks to static SVG at build time (D2 runs as WASM).
    astroD2({ sketch: true, experimental: { useD2js: true } }),
  ],
});
