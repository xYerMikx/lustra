import { ADMIN_EMAIL, CLIENT_EMAIL, DRAFT_MASTER_EMAIL, MASTER_EMAIL } from '../accounts'
import { expect, test } from '../fixtures'
import { loginAs } from '../helpers/auth'
import { TEST_ID } from '../test-id'

test.describe('auth register and login', () => {
  test('shows client validation before calling the API', async ({ page }) => {
    await page.goto('/app/register')
    await page.getByTestId(TEST_ID.authRegisterName).fill('Оля')
    await page.getByTestId(TEST_ID.authRegisterEmail).fill('olya@example.com')
    await page.getByTestId(TEST_ID.authRegisterPassword).fill('short')
    await page.getByTestId(TEST_ID.authRegisterTerms).check()
    await page.getByTestId(TEST_ID.authRegisterSubmit).click()

    await expect(page.getByTestId(TEST_ID.authRegisterPasswordError)).toBeVisible()
  })

  test('registers a client and opens the cabinet', async ({ page }) => {
    await page.goto('/app/register')
    await page.getByTestId(TEST_ID.authRegisterName).fill('Оля')
    await page.getByTestId(TEST_ID.authRegisterEmail).fill('client.smoke.e2e-new@example.com')
    await page.getByTestId(TEST_ID.authRegisterPassword).fill('Password1!')
    await page.getByTestId(TEST_ID.authRegisterTerms).check()
    await page.getByTestId(TEST_ID.authRegisterSubmit).click()

    await expect(page.getByTestId(TEST_ID.pageClientCabinet)).toBeVisible()
  })

  test('selects the master chip from the landing query', async ({ page }) => {
    await page.goto('/app/register?role=master&utm_source=landing')

    await expect(page.getByTestId(TEST_ID.authRoleMaster)).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  test('sends a signed-in user from landing register to the cabinet', async ({
    page,
  }) => {
    await loginAs(page, CLIENT_EMAIL)
    await expect(page.getByTestId(TEST_ID.pageClientCabinet)).toBeVisible()

    await page.goto('/app/register?role=master&utm_source=landing')

    await expect(page.getByTestId(TEST_ID.pageClientCabinet)).toBeVisible()
  })

  test('registers a master and starts onboarding', async ({ page }) => {
    await page.goto('/app/register')
    await page.getByTestId(TEST_ID.authRoleMaster).click()
    await page.getByTestId(TEST_ID.authRegisterName).fill('Инна')
    await page.getByTestId(TEST_ID.authRegisterEmail).fill('master.smoke.e2e-new@example.com')
    await page.getByTestId(TEST_ID.authRegisterPassword).fill('Password1!')
    await page.getByTestId(TEST_ID.authRegisterTerms).check()
    await page.getByTestId(TEST_ID.authRegisterSubmit).click()

    await expect(page.getByTestId(TEST_ID.pageOnboarding)).toBeVisible()
  })

  test('logs a client in and out', async ({ page }) => {
    await loginAs(page, CLIENT_EMAIL)
    await expect(page.getByTestId(TEST_ID.pageClientCabinet)).toBeVisible()

    await page.getByTestId(TEST_ID.appLogout).click()
    await expect(page.getByTestId(TEST_ID.pageLogin)).toBeVisible()
  })

  test('rejects a wrong password', async ({ page }) => {
    await loginAs(page, CLIENT_EMAIL, 'WrongPass1')
    await expect(page.getByTestId(TEST_ID.authFormError)).toBeVisible()
  })

  test('sends a published master to the cabinet', async ({ page }) => {
    await loginAs(page, MASTER_EMAIL)
    await expect(page.getByTestId(TEST_ID.pageMasterCabinet)).toBeVisible()
  })

  test('sends a draft master to onboarding', async ({ page }) => {
    await loginAs(page, DRAFT_MASTER_EMAIL)
    await expect(page.getByTestId(TEST_ID.pageOnboarding)).toBeVisible()
  })

  test('sends an admin to the moderation queue', async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL)
    await expect(page.getByTestId(TEST_ID.pageAdminModeration)).toBeVisible()
  })
})
