import type { Page } from '@playwright/test'

import { expect } from '../fixtures'
import { TEST_ID } from '../test-id'

export async function openMasterFinances(page: Page) {
  await expect(async () => {
    if (!page.url().includes('/app/master/ledger')) {
      await page.goto('/app/master/ledger')
    }

    await expect(page.getByTestId(TEST_ID.pageMasterLedger)).toBeVisible({
      timeout: 4_000,
    })
  }).toPass({ timeout: 25_000 })
}
