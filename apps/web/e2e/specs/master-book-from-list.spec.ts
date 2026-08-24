import { MASTER_EMAIL } from '../accounts'
import { expect, test } from '../fixtures'
import { loginAs } from '../helpers/auth'
import { TEST_ID } from '../test-id'

test.describe('master book from list', () => {
  test('opens the manual booking form from the bookings list', async ({
    page,
  }) => {
    await loginAs(page, MASTER_EMAIL)
    await page.goto('/app/master/bookings')
    await expect(page.getByTestId(TEST_ID.pageMasterBookings)).toBeVisible()

    await page.getByTestId(TEST_ID.bookingsManualOpen).click()
    await expect(page.getByTestId(TEST_ID.dialogManual)).toBeVisible()
  })
})
