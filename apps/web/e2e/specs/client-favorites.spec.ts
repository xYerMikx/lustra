import { ANNA_SLUG, CLIENT_EMAIL } from '../accounts'
import { expect, test } from '../fixtures'
import { loginAs } from '../helpers/auth'
import { TEST_ID, masterCardTestId } from '../test-id'

test.describe('client favorites', () => {
  test('adds a master to favorites from the public page', async ({ page }) => {
    await loginAs(page, CLIENT_EMAIL)
    await page.goto(`/m/${ANNA_SLUG}`)
    await page.getByTestId(TEST_ID.favoritesToggle).click()
    await expect(page.getByTestId(TEST_ID.favoritesToggle)).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    await page.goto('/app/client/favorites')
    await expect(page.getByTestId(TEST_ID.pageFavorites)).toBeVisible()
    await expect(page.getByTestId(masterCardTestId(ANNA_SLUG))).toBeVisible()
  })
})
