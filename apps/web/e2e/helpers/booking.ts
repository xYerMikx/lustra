import type { Page, Response } from '@playwright/test'

import { ANNA_SLUG } from '../accounts'
import { expect } from '../fixtures'
import { TEST_ID, slotChipTestId } from '../test-id'

function isPostPath(response: Response, pathname: string | RegExp): boolean {
  if (response.request().method() !== 'POST') {
    return false
  }

  const path = new URL(response.url()).pathname

  if (typeof pathname === 'string') {
    return path === pathname
  }

  return pathname.test(path)
}

export function waitForHoldResponse(page: Page) {
  return page.waitForResponse((response) => isPostPath(response, '/bookings/holds'))
}

export async function openPublicBooking(page: Page, slug = ANNA_SLUG) {
  await page.goto(`/m/${slug}`)
  await expect(page.getByTestId(TEST_ID.slotPicker)).toBeVisible()
}

export async function selectSlot(page: Page, time: string) {
  await page.getByTestId(slotChipTestId(time)).click()
  await expect(page.getByTestId(TEST_ID.slotSelected)).toBeVisible()
}

export async function holdSelectedSlot(page: Page) {
  await page.getByTestId(TEST_ID.slotHoldSubmit).click()
}

export async function pickAndHold(page: Page, time: string) {
  await selectSlot(page, time)
  await holdSelectedSlot(page)
}

export async function confirmHeldBooking(
  page: Page,
  comment?: string,
): Promise<string> {
  const pending = page.waitForResponse((response) => {
    return isPostPath(response, /\/bookings\/[^/]+\/confirm$/) && response.ok()
  })

  await expect(page.getByTestId(TEST_ID.slotPickerConfirm)).toBeVisible()

  if (comment) {
    await page.getByTestId(TEST_ID.slotComment).fill(comment)
  }

  await page.getByTestId(TEST_ID.slotConfirmSubmit).click()
  const response = await pending
  const payload = (await response.json()) as { booking: { id: string } }

  return payload.booking.id
}

export async function bookOpenSlot(
  page: Page,
  time: string,
  comment?: string,
): Promise<string> {
  await openPublicBooking(page)
  await pickAndHold(page, time)

  return confirmHeldBooking(page, comment)
}
