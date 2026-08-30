import { defineConfig, devices } from '@playwright/test'

const WEB_PORT = Number(process.env.E2E_WEB_PORT ?? 3100)
const MOCK_PORT = Number(process.env.E2E_MOCK_API_PORT ?? 3337)
const BASE_URL = `http://127.0.0.1:${WEB_PORT}`
const MOCK_URL = `http://127.0.0.1:${MOCK_PORT}`
const headed =
  process.env.E2E_HEADED === '1' || process.env.PWDEBUG === '1'

/**
 * Contract UI e2e: Next talks to an in-memory mock API (no Postgres).
 *
 * See the browser:
 *   pnpm --filter @lumira/web test:e2e:headed
 *   pnpm --filter @lumira/web test:e2e:ui
 *   pnpm --filter @lumira/web test:e2e:debug
 *
 * HTML report + traces: apps/web/playwright-report (trace.playwright.dev).
 *
 * Locators use `data-testid` (see `@/shared/lib/test-id`). Production builds
 * strip those attributes via Next `compiler.reactRemoveProperties`.
 */
export default defineConfig({
  testDir: './e2e/specs',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 12_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  use: {
    baseURL: BASE_URL,
    ...devices['Pixel 7'],
    locale: 'ru-BY',
    timezoneId: 'Europe/Minsk',
    testIdAttribute: 'data-testid',
    headless: !headed,
    launchOptions: headed ? { slowMo: 200 } : undefined,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'pnpm exec tsx e2e/mock-api/listen.ts',
      url: `${MOCK_URL}/health`,
      reuseExistingServer: false,
      timeout: 60_000,
      env: {
        ...process.env,
        E2E_MOCK_API_PORT: String(MOCK_PORT),
      },
    },
    {
      command: process.env.CI
        ? `pnpm exec next build && pnpm exec next start -p ${WEB_PORT} --hostname 127.0.0.1`
        : `pnpm exec next dev -p ${WEB_PORT} --hostname 127.0.0.1`,
      url: BASE_URL,
      reuseExistingServer: false,
      timeout: 180_000,
      env: {
        ...process.env,
        NEXT_PUBLIC_API_URL: MOCK_URL,
        E2E_MOCK_API: '1',
        E2E_KEEP_TEST_IDS: '1',
      },
    },
  ],
})
