import { CLIENT_EMAIL, CLIENT_OTHER_EMAIL } from '../accounts'
import {
  COMPLETED_BOOKING_ID,
  CONFIRMED_BOOKING_ID,
  FOREIGN_BOOKING_ID,
} from '../ids'
import { expect, test } from '../fixtures'
import { loginAs } from '../helpers/auth'
import { TEST_ID, bookingStatusTestId, reviewStarTestId } from '../test-id'

test.describe('client cancel and review', () => {
  test('cancels a confirmed booking from the cabinet', async ({ page }) => {
    await loginAs(page, CLIENT_EMAIL)
    await page.goto(`/app/client/bookings/${CONFIRMED_BOOKING_ID}`)
    await expect(page.getByTestId(TEST_ID.pageClientBookingDetail)).toBeVisible()
    await expect(page.getByTestId(bookingStatusTestId('confirmed'))).toBeVisible()

    await page.getByTestId(TEST_ID.clientCancelReason).fill('планы изменились')
    await page.getByTestId(TEST_ID.clientCancelSubmit).click()
    await expect(page.getByTestId(bookingStatusTestId('cancelled_by_client'))).toBeVisible()
  })

  test('leaves a review after a completed visit', async ({ page }) => {
    await loginAs(page, CLIENT_EMAIL)
    await page.goto(`/app/client/bookings/${COMPLETED_BOOKING_ID}`)
    await expect(page.getByTestId(TEST_ID.reviewPrompt)).toBeVisible()

    await page.getByTestId(reviewStarTestId(5)).click()
    await page.getByTestId(TEST_ID.reviewText).fill('Всё отлично')
    await page.getByTestId(TEST_ID.reviewSubmit).click()
    await expect(page.getByTestId(TEST_ID.reviewThanks)).toBeVisible()
  })

  test('hides another client booking (IDOR)', async ({ page }) => {
    await loginAs(page, CLIENT_EMAIL)
    await page.goto(`/app/client/bookings/${FOREIGN_BOOKING_ID}`)
    await expect(page.getByTestId(TEST_ID.bookingNotFound)).toBeVisible()
  })

  test('does not let the other client open a foreign booking', async ({ page }) => {
    await loginAs(page, CLIENT_OTHER_EMAIL)
    await page.goto(`/app/client/bookings/${CONFIRMED_BOOKING_ID}`)
    await expect(page.getByTestId(TEST_ID.bookingNotFound)).toBeVisible()
  })
})
