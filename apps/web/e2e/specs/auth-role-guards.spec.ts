import { CLIENT_EMAIL } from '../accounts'
import { expect, test } from '../fixtures'
import { loginAs } from '../helpers/auth'
import { TEST_ID } from '../test-id'

test.describe('auth role guards', () => {
  test('sends a guest from the client cabinet to login', async ({ page }) => {
    await page.goto('/app/client/bookings')
    await expect(page.getByTestId(TEST_ID.pageLogin)).toBeVisible()
  })

  test('keeps a client out of the master calendar', async ({ page }) => {
    await loginAs(page, CLIENT_EMAIL)
    await expect(page.getByTestId(TEST_ID.pageClientCabinet)).toBeVisible()

    await page.goto('/app/master/calendar')
    await expect(page.getByTestId(TEST_ID.pageClientCabinet)).toBeVisible()
  })

  test('keeps a client out of admin', async ({ page }) => {
    await loginAs(page, CLIENT_EMAIL)
    await page.goto('/admin')
    await expect(page.getByTestId(TEST_ID.pageClientCabinet)).toBeVisible()
  })
})
