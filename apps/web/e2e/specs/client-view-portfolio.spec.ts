import type { Page } from '@playwright/test'

import { ANNA_SLUG } from '../accounts'
import { expect, test } from '../fixtures'
import { loginClient } from '../helpers/auth'
import { openMasterPortfolio, uploadStubPhoto } from '../helpers/portfolio'
import { openIsolatedPage } from '../helpers/second-page'
import { TEST_ID, publicPortfolioShotTestId } from '../test-id'

async function gotoPublicMaster(page: Page) {
  await expect(async () => {
    await page.goto(`/m/${ANNA_SLUG}`)

    await expect(page.getByTestId(TEST_ID.pageMasterPublic)).toBeVisible()
  }).toPass()
}

test.describe('client view portfolio', () => {
  test('does not show a gallery when the master has no photos', async ({ page }) => {
    await loginClient(page)
    await gotoPublicMaster(page)
    await expect(page.getByTestId(TEST_ID.pageMasterPublic)).toBeVisible()
    await expect(page.getByTestId(TEST_ID.publicPortfolioGallery)).toHaveCount(0)
    await expect(page.getByTestId(TEST_ID.masterPublicCover)).toHaveCount(0)
  })

  test('sees stub photos the master just uploaded and opens a lightbox', async ({
    page,
    browser,
  }) => {
    const client = await openIsolatedPage(browser)

    try {
      await openMasterPortfolio(page)
      const firstId = await uploadStubPhoto(page, 'work-1.png')
      const secondId = await uploadStubPhoto(page, 'work-2.png')

      await loginClient(client.page)
      await gotoPublicMaster(client.page)
      await expect(client.page.getByTestId(TEST_ID.pageMasterPublic)).toBeVisible()
      await expect(client.page.getByTestId(TEST_ID.masterPublicCover)).toBeVisible()
      const gallery = client.page.getByTestId(TEST_ID.publicPortfolioGallery)
      const firstShot = client.page.getByTestId(publicPortfolioShotTestId(firstId))
      const secondShot = client.page.getByTestId(publicPortfolioShotTestId(secondId))

      await expect(gallery).toBeVisible()
      await expect(firstShot).toBeVisible()
      await expect(secondShot).toHaveCount(1)
      await expect(firstShot).toHaveAttribute('aria-current', 'true')

      await gallery.getByTestId(TEST_ID.portfolioCarouselNext).click()
      await expect(secondShot).toHaveAttribute('aria-current', 'true')

      await gallery.getByTestId(TEST_ID.portfolioCarouselPrev).click()
      await expect(firstShot).toHaveAttribute('aria-current', 'true')

      await firstShot.click()
      const lightbox = client.page.getByTestId(TEST_ID.portfolioLightbox)

      await expect(lightbox).toBeVisible()
      await lightbox.getByTestId(TEST_ID.portfolioCarouselNext).click()
      await expect(
        lightbox.getByTestId(publicPortfolioShotTestId(secondId)),
      ).toHaveAttribute('aria-current', 'true')

      await client.page.getByTestId(TEST_ID.portfolioLightboxClose).click()
      await expect(lightbox).toHaveCount(0)
    } finally {
      await client.context.close()
    }
  })
})
