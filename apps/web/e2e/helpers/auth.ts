import type { Page } from '@playwright/test'

import {
  CLIENT_EMAIL,
  CLIENT_OTHER_EMAIL,
  DRAFT_MASTER_EMAIL,
  MASTER_EMAIL,
  PASSWORD,
} from '../accounts'
import { expect } from '../fixtures'
import { TEST_ID } from '../test-id'

export async function loginAs(page: Page, email: string, password = PASSWORD) {
  await page.goto('/app/login')
  await page.getByTestId(TEST_ID.authLoginEmail).fill(email)
  await page.getByTestId(TEST_ID.authLoginPassword).fill(password)
  await page.getByTestId(TEST_ID.authLoginSubmit).click()
}

export async function loginClient(page: Page) {
  await loginAs(page, CLIENT_EMAIL)
  await expect(page.getByTestId(TEST_ID.pageClientCabinet)).toBeVisible()
}

export async function loginOtherClient(page: Page) {
  await loginAs(page, CLIENT_OTHER_EMAIL)
  await expect(page.getByTestId(TEST_ID.pageClientCabinet)).toBeVisible()
}

export async function loginMaster(page: Page) {
  await loginAs(page, MASTER_EMAIL)
  await expect(page.getByTestId(TEST_ID.pageMasterCabinet)).toBeVisible()
}

export async function loginDraftMaster(page: Page) {
  await loginAs(page, DRAFT_MASTER_EMAIL)
  await expect(page.getByTestId(TEST_ID.pageOnboarding)).toBeVisible()
}

export async function expectLoggedOut(page: Page) {
  await expect(page.getByTestId(TEST_ID.pageLogin)).toBeVisible()
}
