import { MASTER_EMAIL } from '../accounts'
import { expect, test } from '../fixtures'
import { loginAs } from '../helpers/auth'
import { TEST_ID } from '../test-id'

test.describe('master calendar', () => {
  test('blocks a lunch window and shows it on the week grid', async ({ page }) => {
    await loginAs(page, MASTER_EMAIL)
    await page.goto('/app/master/calendar')
    await expect(page.getByTestId(TEST_ID.pageCalendar)).toBeVisible()

    await page.getByTestId(TEST_ID.calendarBlockOpen).click()
    await expect(page.getByTestId(TEST_ID.dialogBlock)).toBeVisible()
    await page.getByTestId(TEST_ID.dialogBlockSubmit).click()
    await expect(page.getByTestId(TEST_ID.calendarBlockChip).first()).toBeVisible()
  })

  test('adds a day-off exception', async ({ page }) => {
    await loginAs(page, MASTER_EMAIL)
    await page.goto('/app/master/calendar')
    await page.getByTestId(TEST_ID.calendarExceptionOpen).click()
    await expect(page.getByTestId(TEST_ID.dialogException)).toBeVisible()
    await page.getByTestId(TEST_ID.dialogExceptionSubmit).click()
    await expect(page.getByTestId(TEST_ID.calendarExceptionChip).first()).toBeVisible()
  })

  test('creates a manual booking from the calendar', async ({ page }) => {
    await loginAs(page, MASTER_EMAIL)
    await page.goto('/app/master/calendar')
    await page.getByTestId(TEST_ID.calendarManualOpen).click()
    await expect(page.getByTestId(TEST_ID.dialogManual)).toBeVisible()

    await page.getByTestId(TEST_ID.dialogManualName).fill('Гость из директа')
    await page.getByTestId(TEST_ID.dialogManualPhone).fill('+375291112233')
    await page.getByTestId(TEST_ID.dialogManualSubmit).click()

    await page.goto('/app/master/bookings')
    await expect(page.getByTestId(TEST_ID.masterBookingsList)).toContainText(
      'Гость из директа',
    )
  })
})
