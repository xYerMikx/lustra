import { ANNA_SLUG } from '../accounts'
import { expect, test } from '../fixtures'
import { loginClient } from '../helpers/auth'
import { bookOpenSlot, openPublicBooking, pickAndHold } from '../helpers/booking'
import { TEST_ID, bookingRowTestId, bookingStatusTestId } from '../test-id'

test.describe('client book slot', () => {
  test('redirects a guest to login when holding a slot', async ({ page }) => {
    await openPublicBooking(page)
    await pickAndHold(page, '14:00')
    await expect(page).toHaveURL(/\/app\/login/)
    await expect(page).toHaveURL(/next=/)
  })

  test('completes hold → confirm and shows the booking in the cabinet', async ({
    page,
  }) => {
    await loginClient(page)
    const bookingId = await bookOpenSlot(page, '14:00', 'хочу короткую длину')

    await expect(page.getByTestId(TEST_ID.slotPickerSuccess)).toBeVisible()
    await expect(page.getByTestId(TEST_ID.slotStatus)).toBeVisible()

    await page.goto('/app/client/bookings')
    await expect(page.getByTestId(TEST_ID.pageClientBookings)).toBeVisible()
    await expect(page.getByTestId(bookingRowTestId(bookingId))).toBeVisible()
    await expect(page.getByTestId(bookingStatusTestId('pending')).first()).toBeVisible()
  })

  test('shows a taken-slot warning when the window is already gone', async ({
    page,
  }) => {
    await loginClient(page)
    await openPublicBooking(page, ANNA_SLUG)
    await pickAndHold(page, '15:00')
    await expect(page.getByTestId(TEST_ID.slotError)).toBeVisible()
  })
})
