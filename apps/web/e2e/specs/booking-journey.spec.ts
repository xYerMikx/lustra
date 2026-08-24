import { CLIENT_EMAIL } from '../accounts'
import { expect, test } from '../fixtures'
import { loginAs, loginClient, loginMaster } from '../helpers/auth'
import { bookOpenSlot } from '../helpers/booking'
import { openIsolatedPage } from '../helpers/second-page'
import {
  TEST_ID,
  bookingRowTestId,
  bookingStatusTestId,
  reviewStarTestId,
} from '../test-id'

test.describe('client and master booking journey', () => {
  test('client books, master confirms and completes, client leaves a review', async ({
    page,
    browser,
  }) => {
    const master = await openIsolatedPage(browser)

    try {
      await loginClient(page)
      const bookingId = await bookOpenSlot(page, '14:00', 'хочу короткую длину')

      await expect(page.getByTestId(TEST_ID.slotPickerSuccess)).toBeVisible()
      await page.goto('/app/client/bookings')
      await expect(page.getByTestId(bookingRowTestId(bookingId))).toBeVisible()
      await expect(
        page.getByTestId(bookingRowTestId(bookingId)).getByTestId(bookingStatusTestId('pending')),
      ).toBeVisible()

      await page.goto(`/app/client/bookings/${bookingId}`)
      await expect(page.getByTestId(TEST_ID.pageClientBookingDetail)).toBeVisible()
      await expect(page.getByTestId(bookingStatusTestId('pending'))).toBeVisible()

      await loginMaster(master.page)
      await master.page.goto('/app/master/bookings')
      await master.page.getByTestId(TEST_ID.bookingsTabPending).click()
      await expect(master.page.getByTestId(bookingRowTestId(bookingId))).toBeVisible()

      await master.page.goto(`/app/master/bookings/${bookingId}`)
      await expect(master.page.getByTestId(TEST_ID.pageMasterBookingDetail)).toBeVisible()
      await expect(master.page.getByTestId(bookingStatusTestId('pending'))).toBeVisible()
      await expect(master.page.getByTestId(TEST_ID.masterBookingComment)).toBeVisible()

      await master.page.getByTestId(TEST_ID.masterBookingConfirm).click()
      await expect(master.page.getByTestId(bookingStatusTestId('confirmed'))).toBeVisible()

      await page.reload()
      await expect(page.getByTestId(bookingStatusTestId('confirmed'))).toBeVisible()

      await master.page.getByTestId(TEST_ID.masterBookingComplete).click()
      await expect(master.page.getByTestId(bookingStatusTestId('completed'))).toBeVisible()
      await expect(master.page.getByTestId(TEST_ID.masterReviewPrompt)).toBeVisible()
      await master.page.getByTestId(reviewStarTestId(5)).click()
      await master.page.getByTestId(TEST_ID.masterReviewText).fill('Пунктуальная клиентка')
      await master.page.getByTestId(TEST_ID.masterReviewSubmit).click()
      await expect(master.page.getByTestId(TEST_ID.masterReviewThanks)).toBeVisible()

      await page.reload()
      await expect(page.getByTestId(bookingStatusTestId('completed'))).toBeVisible()
      await expect(page.getByTestId(TEST_ID.reviewPrompt)).toBeVisible()
      await page.getByTestId(reviewStarTestId(5)).click()
      await page.getByTestId(TEST_ID.reviewText).fill('Всё отлично')
      await page.getByTestId(TEST_ID.reviewSubmit).click()
      await expect(page.getByTestId(TEST_ID.reviewThanks)).toBeVisible()
    } finally {
      await master.context.close()
    }
  })

  test('master cancel is visible to the client as cancelled_by_master', async ({
    page,
    browser,
  }) => {
    const master = await openIsolatedPage(browser)

    try {
      await loginClient(page)
      const bookingId = await bookOpenSlot(page, '11:00')

      await loginMaster(master.page)
      await master.page.goto(`/app/master/bookings/${bookingId}`)
      await master.page.getByTestId(TEST_ID.masterBookingCancelReason).fill('заболела')
      await master.page.getByTestId(TEST_ID.masterBookingCancelSubmit).click()
      await expect(
        master.page.getByTestId(bookingStatusTestId('cancelled_by_master')),
      ).toBeVisible()

      await page.goto(`/app/client/bookings/${bookingId}`)
      await expect(page.getByTestId(bookingStatusTestId('cancelled_by_master'))).toBeVisible()
    } finally {
      await master.context.close()
    }
  })

  test('client cancel after confirm is visible to the master as cancelled_by_client', async ({
    page,
    browser,
  }) => {
    const master = await openIsolatedPage(browser)

    try {
      await loginAs(page, CLIENT_EMAIL)
      await expect(page.getByTestId(TEST_ID.pageClientCabinet)).toBeVisible()
      const bookingId = await bookOpenSlot(page, '10:00')

      await loginMaster(master.page)
      await master.page.goto(`/app/master/bookings/${bookingId}`)
      await master.page.getByTestId(TEST_ID.masterBookingConfirm).click()
      await expect(master.page.getByTestId(bookingStatusTestId('confirmed'))).toBeVisible()

      await page.goto(`/app/client/bookings/${bookingId}`)
      await page.getByTestId(TEST_ID.clientCancelReason).fill('планы изменились')
      await page.getByTestId(TEST_ID.clientCancelSubmit).click()
      await expect(page.getByTestId(bookingStatusTestId('cancelled_by_client'))).toBeVisible()

      await master.page.reload()
      await expect(
        master.page.getByTestId(bookingStatusTestId('cancelled_by_client')),
      ).toBeVisible()
    } finally {
      await master.context.close()
    }
  })
})
