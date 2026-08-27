import { MASTER_EMAIL } from '../accounts'
import { PENDING_BOOKING_ID } from '../ids'
import { expect, test } from '../fixtures'
import { loginAs } from '../helpers/auth'
import { TEST_ID, bookingStatusTestId } from '../test-id'

test.describe('master manage booking', () => {
  test('confirms and completes a pending visit', async ({ page }) => {
    await loginAs(page, MASTER_EMAIL)
    await page.goto(`/app/master/bookings/${PENDING_BOOKING_ID}`)
    await expect(page.getByTestId(bookingStatusTestId('pending'))).toBeVisible()
    await expect(page.getByTestId(TEST_ID.masterBookingComment)).toBeVisible()

    await page.getByTestId(TEST_ID.masterBookingConfirm).click()
    await expect(page.getByTestId(bookingStatusTestId('confirmed'))).toBeVisible()

    await page.getByTestId(TEST_ID.masterBookingComplete).click()
    await expect(page.getByTestId(bookingStatusTestId('completed'))).toBeVisible()
    await expect(page.getByTestId(TEST_ID.bookingAddTip)).toBeVisible()
  })

  test('cancels a pending booking with a required reason', async ({ page }) => {
    await loginAs(page, MASTER_EMAIL)
    await page.goto(`/app/master/bookings/${PENDING_BOOKING_ID}`)
    await page.getByTestId(TEST_ID.masterBookingCancelReason).fill('заболела')
    await page.getByTestId(TEST_ID.masterBookingCancelSubmit).click()
    await expect(page.getByTestId(bookingStatusTestId('cancelled_by_master'))).toBeVisible()
  })

  test('reschedules a pending booking', async ({ page }) => {
    await loginAs(page, MASTER_EMAIL)
    await page.goto(`/app/master/bookings/${PENDING_BOOKING_ID}`)
    await page.getByTestId(TEST_ID.masterRescheduleReason).fill('клиент попросил позже')
    await page.getByTestId(TEST_ID.masterRescheduleSubmit).click()
    await expect(page.getByTestId(bookingStatusTestId('pending'))).toBeVisible()
  })
})
