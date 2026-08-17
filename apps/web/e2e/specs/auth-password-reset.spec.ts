import { CLIENT_EMAIL, PASSWORD } from '../accounts'
import { expect, test } from '../fixtures'
import { loginAs } from '../helpers/auth'
import { TEST_ID } from '../test-id'

test.describe('auth password reset', () => {
  test('accepts a forgot-password request without revealing the account', async ({
    page,
  }) => {
    await page.goto('/app/login')
    await page.getByTestId(TEST_ID.authForgotLink).click()
    await expect(page.getByTestId(TEST_ID.pageForgot)).toBeVisible()

    await page.getByTestId(TEST_ID.authForgotEmail).fill(CLIENT_EMAIL)
    await page.getByTestId(TEST_ID.authForgotSubmit).click()

    await expect(page.getByTestId(TEST_ID.authForgotSent)).toBeVisible()
  })

  test('rejects a reset link without a token', async ({ page }) => {
    await page.goto('/app/reset')
    await expect(page.getByTestId(TEST_ID.authResetInvalid)).toBeVisible()
  })

  test('resets the password from a valid token and allows login', async ({
    page,
  }) => {
    await page.goto('/app/forgot')
    await page.getByTestId(TEST_ID.authForgotEmail).fill(CLIENT_EMAIL)
    await page.getByTestId(TEST_ID.authForgotSubmit).click()
    await expect(page.getByTestId(TEST_ID.authForgotSent)).toBeVisible()

    const probe = await page.request.get(
      `http://127.0.0.1:${process.env.E2E_MOCK_API_PORT ?? 3337}/__e2e/reset-token?email=${encodeURIComponent(CLIENT_EMAIL)}`,
    )
    const payload = (await probe.json()) as { token: string | null }

    expect(payload.token).toBeTruthy()

    const nextPassword = 'Password2!'
    await page.goto(`/app/reset?token=${payload.token}`)
    await page.getByTestId(TEST_ID.authResetPassword).fill(nextPassword)
    await page.getByTestId(TEST_ID.authResetSubmit).click()
    await expect(page.getByTestId(TEST_ID.authResetDone)).toBeVisible()

    await page.getByTestId(TEST_ID.authResetLoginLink).click()
    await loginAs(page, CLIENT_EMAIL, nextPassword)
    await expect(page.getByTestId(TEST_ID.pageClientCabinet)).toBeVisible()

    await loginAs(page, CLIENT_EMAIL, PASSWORD)
    await expect(page.getByTestId(TEST_ID.authFormError)).toBeVisible()
  })
})
