import { expect, test } from '../fixtures'
import { loginClient, loginOtherClient } from '../helpers/auth'
import {
  holdSelectedSlot,
  openPublicBooking,
  selectSlot,
  waitForHoldResponse,
} from '../helpers/booking'
import { openIsolatedPage } from '../helpers/second-page'
import { TEST_ID, slotChipTestId } from '../test-id'

test.describe('booking slot races', () => {
  test('lets only one of two clients hold the same open slot', async ({
    page,
    browser,
  }) => {
    const other = await openIsolatedPage(browser)

    try {
      await loginClient(page)
      await loginOtherClient(other.page)
      await openPublicBooking(page)
      await openPublicBooking(other.page)
      await selectSlot(page, '14:00')
      await selectSlot(other.page, '14:00')

      const firstHold = waitForHoldResponse(page)
      const secondHold = waitForHoldResponse(other.page)

      await Promise.all([holdSelectedSlot(page), holdSelectedSlot(other.page)])

      const statuses = [await firstHold, await secondHold].map((response) => response.status())
      const sorted = [...statuses].sort((left, right) => left - right)

      expect(sorted).toEqual([201, 409])

      const winner = statuses[0] === 201 ? page : other.page
      const loser = statuses[0] === 201 ? other.page : page

      await expect(winner.getByTestId(TEST_ID.slotPickerConfirm)).toBeVisible()
      await expect(loser.getByTestId(TEST_ID.slotError)).toBeVisible()
    } finally {
      await other.context.close()
    }
  })

  test('shows SLOT_TAKEN when a second client holds a stale chip', async ({
    page,
    browser,
  }) => {
    const other = await openIsolatedPage(browser)

    try {
      await loginClient(page)
      await loginOtherClient(other.page)
      await openPublicBooking(page)
      await openPublicBooking(other.page)
      await selectSlot(other.page, '14:00')
      await selectSlot(page, '14:00')
      await holdSelectedSlot(page)
      await expect(page.getByTestId(TEST_ID.slotPickerConfirm)).toBeVisible()

      await holdSelectedSlot(other.page)
      await expect(other.page.getByTestId(TEST_ID.slotError)).toBeVisible()
    } finally {
      await other.context.close()
    }
  })

  test('hides the taken chip after the other client reloads availability', async ({
    page,
    browser,
  }) => {
    const other = await openIsolatedPage(browser)

    try {
      await loginClient(page)
      await loginOtherClient(other.page)
      await openPublicBooking(page)
      await openPublicBooking(other.page)
      await selectSlot(page, '14:00')
      await holdSelectedSlot(page)
      await expect(page.getByTestId(TEST_ID.slotPickerConfirm)).toBeVisible()

      await other.page.reload()
      await expect(other.page.getByTestId(TEST_ID.slotPicker)).toBeVisible()
      await expect(other.page.getByTestId(slotChipTestId('14:00'))).toHaveCount(0)
      await expect(other.page.getByTestId(slotChipTestId('10:00'))).toBeVisible()
    } finally {
      await other.context.close()
    }
  })
})
