import { defineConfig, devices } from '@playwright/test';
import { WEBSITE } from './src/helpers/urls.js';

const CI = !!process.env.CI;

// CI splits the suite over several runners, each with its own stack (the
// `e2e` job's matrix): E2E_SHARD is this runner's "current/total", e.g. "2/3".
const [shardCurrent, shardTotal] = (process.env.E2E_SHARD ?? '')
  .split('/')
  .map(Number);

// End-to-end tests against the whole local stack: the website and notes API
// from `pnpm dev`, with DynamoDB local standing in for AWS. Locally they reuse
// a running `pnpm dev`; in CI they start one.
export default defineConfig({
  testDir: './src',
  testMatch: ['scenarios/**/*.e2e.ts'],
  outputDir: '../../dist/packages/e2e/test-results',
  // Scenarios share one stack, each making its own notes.
  workers: 1,
  fullyParallel: false,
  shard:
    shardCurrent && shardTotal
      ? { current: shardCurrent, total: shardTotal }
      : null,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: CI
    ? [
        ['list'],
        [
          'html',
          { open: 'never', outputFolder: '../../dist/packages/e2e/report' },
        ],
      ]
    : [['list']],
  use: {
    baseURL: WEBSITE,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm dev',
    cwd: '../..',
    url: WEBSITE,
    reuseExistingServer: !CI,
    // A cold start pulls the local DynamoDB image.
    timeout: 5 * 60_000,
    // As Ctrl-C would, so the local container is stopped too.
    gracefulShutdown: { signal: 'SIGINT', timeout: 30_000 },
    stdout: CI ? 'pipe' : 'ignore',
    stderr: 'pipe',
  },
});
