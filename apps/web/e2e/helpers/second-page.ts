import { devices, type Browser, type BrowserContext, type Page } from '@playwright/test'

const WEB_PORT = Number(process.env.E2E_WEB_PORT ?? 3100)

export async function openIsolatedPage(browser: Browser): Promise<{
  context: BrowserContext
  page: Page
}> {
  const context = await browser.newContext({
    ...devices['Pixel 7'],
    baseURL: `http://127.0.0.1:${WEB_PORT}`,
    locale: 'ru-BY',
    timezoneId: 'Europe/Minsk',
  })

  return { context, page: await context.newPage() }
}
