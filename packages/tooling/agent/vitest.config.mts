import { defineConfig } from 'vitest/config';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../../node_modules/.vite/packages/tooling/agent',
  test: {
    passWithNoTests: true,
    name: '@agentic-sdlc/tooling-agent',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory:
        '../../../dist/packages/tooling/agent/test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}));
