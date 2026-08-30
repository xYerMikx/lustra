import type { Page } from '@playwright/test'

export async function hideNextErrorOverlay(page: Page) {
  await page.addStyleTag({
    content: 'nextjs-portal { display: none !important; }',
  })
}
