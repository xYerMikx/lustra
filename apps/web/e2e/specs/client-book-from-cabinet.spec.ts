import { ANNA_SLUG } from '../accounts'
import { expect, test } from '../fixtures'
import { loginClient } from '../helpers/auth'
import {
  TEST_ID,
  bookMasterOptionTestId,
} from '../test-id'

test.describe('client book from cabinet', () => {
  test('reaches the slot step from Мои записи without recommendations', async ({
    page,
  }) => {
    await loginClient(page)
    await page.goto('/app/client/bookings')
    await expect(page.getByTestId(TEST_ID.pageClientBookings)).toBeVisible()

    await page.getByTestId(TEST_ID.clientBookCta).click()
    await expect(page.getByTestId(TEST_ID.pageClientBook)).toBeVisible()
    await expect(page.getByTestId(TEST_ID.clientBookServiceStep)).toBeVisible()

    await page.getByRole('button', { name: /Маникюр комбинированный/ }).click()
    await expect(page.getByTestId(TEST_ID.clientBookMasterStep)).toBeVisible()

    await page.getByTestId(bookMasterOptionTestId(ANNA_SLUG)).click()
    await expect(page.getByTestId(TEST_ID.clientBookSlotStep)).toBeVisible()
    await expect(page.getByTestId(TEST_ID.slotPicker)).toBeVisible()
  })

  test('opens the same flow from cabinet home', async ({ page }) => {
    await loginClient(page)
    await page.getByTestId(TEST_ID.clientBookCta).click()
    await expect(page.getByTestId(TEST_ID.clientBookServiceStep)).toBeVisible()
  })
})
