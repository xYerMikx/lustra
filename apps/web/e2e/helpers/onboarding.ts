import type { Page } from '@playwright/test'

import { expect } from '../fixtures'
import { loginDraftMaster } from './auth'
import {
  TEST_ID,
  onboardingPresetTestId,
  onboardingStepTestId,
  onboardingTemplateTestId,
} from '../test-id'

const MANICURE_TEMPLATE = 'Маникюр комбинированный'

export async function openOnboarding(page: Page) {
  await loginDraftMaster(page)
  await expect(page.getByTestId(onboardingStepTestId('profile'))).toBeVisible()
}

export async function saveProfileStep(page: Page) {
  await page.getByTestId(TEST_ID.onboardingDisplayName).fill('Студия Нового')
  await page.getByTestId(TEST_ID.onboardingHeadline).fill('Мастер маникюра, 5 лет опыта')
  await page.getByTestId(TEST_ID.onboardingSubmit).click()
  await expect(page.getByTestId(onboardingStepTestId('services'))).toBeVisible()
}

export async function saveFirstServiceFromTemplate(page: Page) {
  await expect(
    page.getByTestId(onboardingTemplateTestId(MANICURE_TEMPLATE)),
  ).toBeVisible()
  await page.getByTestId(onboardingTemplateTestId(MANICURE_TEMPLATE)).click()
  await page.getByTestId(TEST_ID.onboardingSubmit).click()
  await expect(page.getByTestId(onboardingStepTestId('schedule'))).toBeVisible()
}

export async function saveWeekdaySchedule(page: Page) {
  await page.getByTestId(onboardingPresetTestId('weekdays-10-20')).click()
  await page.getByTestId(TEST_ID.onboardingSubmit).click()
  await expect(page.getByTestId(onboardingStepTestId('portfolio'))).toBeVisible()
}
