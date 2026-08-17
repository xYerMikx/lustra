import type { Page } from '@playwright/test'

import { expect } from '../fixtures'
import { loginMaster } from './auth'
import { stubPhotoFile } from '../stub-png'
import { TEST_ID, portfolioCardTestId } from '../test-id'

export async function openMasterPortfolio(page: Page) {
  await loginMaster(page)
  await page.goto('/app/master/portfolio')
  await expect(page.getByTestId(TEST_ID.pageMasterPortfolio)).toBeVisible()
}

export async function uploadStubPhoto(
  page: Page,
  name = 'work.png',
): Promise<string> {
  const pending = page.waitForResponse((response) => {
    if (response.request().method() !== 'POST' || !response.ok()) {
      return false
    }

    return new URL(response.url()).pathname === '/master/portfolio'
  })

  await page.getByTestId(TEST_ID.portfolioFileInput).setInputFiles(stubPhotoFile(name))
  const response = await pending
  const item = (await response.json()) as { id: string }

  await expect(page.getByTestId(portfolioCardTestId(item.id))).toBeVisible()

  return item.id
}
