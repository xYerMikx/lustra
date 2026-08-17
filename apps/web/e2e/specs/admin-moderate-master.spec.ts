import { ADMIN_EMAIL, KATYA_SLUG } from '../accounts'
import { expect, test } from '../fixtures'
import { loginAs } from '../helpers/auth'
import { TEST_ID, adminMasterCardTestId, masterCardTestId } from '../test-id'

test.describe('admin moderate master', () => {
  test('approves a pending profile and clears the queue', async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL)
    await expect(page.getByTestId(TEST_ID.pageAdminModeration)).toBeVisible()
    await expect(page.getByTestId(adminMasterCardTestId(KATYA_SLUG))).toBeVisible()

    await page.getByTestId(TEST_ID.adminApprove).click()
    await expect(page.getByTestId(TEST_ID.adminQueueEmpty)).toBeVisible()

    await page.goto('/catalog')
    await expect(page.getByTestId(masterCardTestId(KATYA_SLUG))).toBeVisible()
  })
})
