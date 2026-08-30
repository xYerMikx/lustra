import { expect, test } from '../fixtures'
import { hideNextErrorOverlay } from '../helpers/hide-next-overlay'
import { TEST_ID } from '../test-id'

const E2E_CRASH_TRACE_ID = 'e2e-trace-afb65fbeb305b436'

test.describe('status pages', () => {
  test('shows a branded 404 and returns home', async ({ page }) => {
    await page.goto('/no-such-page')
    await expect(page.getByTestId(TEST_ID.pageNotFound)).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Страница не найдена' }),
    ).toBeVisible()

    await page.getByTestId(TEST_ID.appErrorHome).click()
    await expect(page).toHaveURL('/')
  })

  test('opens catalog from the 404 screen', async ({ page }) => {
    await page.goto('/no-such-page')
    await page.getByTestId(TEST_ID.notFoundCatalog).click()
    await expect(page.getByTestId(TEST_ID.pageCatalog)).toBeVisible()
  })

  test('shows a branded error screen with a home button', async ({ page }) => {
    await page.goto('/e2e/crash')
    await hideNextErrorOverlay(page)
    await expect(page.getByTestId(TEST_ID.pageAppError)).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Сервис временно недоступен' }),
    ).toBeVisible()

    if (process.env.CI) {
      await expect(page.getByTestId(TEST_ID.appErrorTrace)).toHaveCount(0)
    } else {
      await expect(page.getByTestId(TEST_ID.appErrorTrace)).toContainText(
        E2E_CRASH_TRACE_ID,
      )
    }

    await page.getByTestId(TEST_ID.appErrorHome).click()
    await expect(page).toHaveURL('/')
  })
})
