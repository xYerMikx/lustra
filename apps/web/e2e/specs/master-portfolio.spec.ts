import { expect, test } from '../fixtures'
import { openMasterPortfolio, uploadStubPhoto } from '../helpers/portfolio'
import {
  TEST_ID,
  portfolioCardTestId,
  portfolioRemoveTestId,
  portfolioSetCoverTestId,
} from '../test-id'

test.describe('master portfolio', () => {
  test('shows an empty cabinet before any photos', async ({ page }) => {
    await openMasterPortfolio(page)
    await expect(page.getByTestId(TEST_ID.portfolioEmpty)).toBeVisible()
  })

  test('uploads a stub photo and marks it as the cover', async ({ page }) => {
    await openMasterPortfolio(page)
    const itemId = await uploadStubPhoto(page, 'manicure.png')

    await expect(page.getByTestId(TEST_ID.portfolioEmpty)).toHaveCount(0)
    await expect(
      page.getByTestId(portfolioCardTestId(itemId)).getByTestId(TEST_ID.portfolioCoverBadge),
    ).toBeVisible()
  })

  test('lets the master change the cover to a later photo', async ({ page }) => {
    await openMasterPortfolio(page)
    const firstId = await uploadStubPhoto(page, 'work-1.png')
    const secondId = await uploadStubPhoto(page, 'work-2.png')

    await page.getByTestId(portfolioSetCoverTestId(secondId)).click()
    await expect(
      page.getByTestId(portfolioCardTestId(secondId)).getByTestId(TEST_ID.portfolioCoverBadge),
    ).toBeVisible()
    await expect(
      page.getByTestId(portfolioCardTestId(firstId)).getByTestId(TEST_ID.portfolioCoverBadge),
    ).toHaveCount(0)
  })

  test('deletes a stub photo and returns to the empty state', async ({ page }) => {
    await openMasterPortfolio(page)
    const itemId = await uploadStubPhoto(page, 'tmp.png')

    await page.getByTestId(portfolioRemoveTestId(itemId)).click()
    await page.getByTestId(TEST_ID.confirmPopoverConfirm).click()
    await expect(page.getByTestId(TEST_ID.portfolioEmpty)).toBeVisible()
    await expect(page.getByTestId(portfolioCardTestId(itemId))).toHaveCount(0)
  })
})
