import { defineConfig } from 'vitest/config';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../../node_modules/.vite/packages/tooling/local-dev',
  test: {
    passWithNoTests: true,
    name: '@agentic-sdlc/tooling-local-dev',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory:
        '../../../dist/packages/tooling/local-dev/test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}));
