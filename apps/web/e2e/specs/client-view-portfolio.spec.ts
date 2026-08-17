import { ANNA_SLUG } from '../accounts'
import { expect, test } from '../fixtures'
import { loginClient } from '../helpers/auth'
import { openMasterPortfolio, uploadStubPhoto } from '../helpers/portfolio'
import { openIsolatedPage } from '../helpers/second-page'
import { TEST_ID, publicPortfolioShotTestId } from '../test-id'

test.describe('client view portfolio', () => {
  test('does not show a gallery when the master has no photos', async ({ page }) => {
    await loginClient(page)
    await page.goto(`/m/${ANNA_SLUG}`)
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
      await client.page.goto(`/m/${ANNA_SLUG}`)
      await expect(client.page.getByTestId(TEST_ID.pageMasterPublic)).toBeVisible()
      await expect(client.page.getByTestId(TEST_ID.masterPublicCover)).toBeVisible()
      await expect(client.page.getByTestId(TEST_ID.publicPortfolioGallery)).toBeVisible()
      await expect(client.page.getByTestId(publicPortfolioShotTestId(firstId))).toBeVisible()
      await expect(client.page.getByTestId(publicPortfolioShotTestId(secondId))).toBeVisible()

      await client.page.getByTestId(publicPortfolioShotTestId(firstId)).click()
      await expect(client.page.getByTestId(TEST_ID.portfolioLightbox)).toBeVisible()
      await client.page.getByTestId(TEST_ID.portfolioLightboxClose).click()
      await expect(client.page.getByTestId(TEST_ID.portfolioLightbox)).toHaveCount(0)
    } finally {
      await client.context.close()
    }
  })
})
