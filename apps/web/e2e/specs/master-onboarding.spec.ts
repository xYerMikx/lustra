import { expect, test } from '../fixtures'
import { openOnboarding, saveFirstServiceFromTemplate, saveProfileStep, saveWeekdaySchedule } from '../helpers/onboarding'
import {
  TEST_ID,
  onboardingPresetTestId,
  onboardingProgressTestId,
  onboardingStepTestId,
} from '../test-id'

test.describe('master onboarding', () => {
  test('saves the profile step and continues to the first service', async ({
    page,
  }) => {
    await openOnboarding(page)
    await expect(page.getByTestId(TEST_ID.onboardingSlug)).toBeVisible()

    await saveProfileStep(page)
    await expect(page.getByTestId(onboardingProgressTestId('profile'))).toHaveAttribute(
      'data-status',
      'done',
    )
  })

  test('walks profile → service → schedule → portfolio and skip opens the cabinet', async ({
    page,
  }) => {
    await openOnboarding(page)
    await saveProfileStep(page)
    await saveFirstServiceFromTemplate(page)
    await saveWeekdaySchedule(page)

    await expect(page.getByTestId(onboardingProgressTestId('schedule'))).toHaveAttribute(
      'data-status',
      'done',
    )
    await page.getByTestId(TEST_ID.onboardingSkip).click()
    await expect(page.getByTestId(TEST_ID.pageMasterCabinet)).toBeVisible()
  })

  test('skips the profile step and opens the cabinet', async ({ page }) => {
    await openOnboarding(page)
    await page.getByTestId(TEST_ID.onboardingSkip).click()
    await expect(page.getByTestId(TEST_ID.pageMasterCabinet)).toBeVisible()
  })

  test('goes back from services to the profile step', async ({ page }) => {
    await openOnboarding(page)
    await saveProfileStep(page)
    await page.getByTestId(TEST_ID.onboardingBack).click()
    await expect(page.getByTestId(onboardingStepTestId('profile'))).toBeVisible()
    await expect(page.getByTestId(TEST_ID.onboardingDisplayName)).toBeVisible()
  })

  test('keeps the master on services when the title is empty', async ({ page }) => {
    await openOnboarding(page)
    await saveProfileStep(page)
    await page.getByTestId(TEST_ID.onboardingSubmit).click()
    await expect(page.getByTestId(TEST_ID.onboardingServiceTitleError)).toBeVisible()
    await expect(page.getByTestId(onboardingStepTestId('services'))).toBeVisible()
  })

  test('skips the schedule step and lands on portfolio', async ({ page }) => {
    await openOnboarding(page)
    await saveProfileStep(page)
    await saveFirstServiceFromTemplate(page)
    await page.getByTestId(TEST_ID.onboardingSkip).click()
    await expect(page.getByTestId(onboardingStepTestId('portfolio'))).toBeVisible()
  })

  test('shows a form error when the schedule is cleared', async ({ page }) => {
    await openOnboarding(page)
    await saveProfileStep(page)
    await saveFirstServiceFromTemplate(page)
    await page.getByTestId(onboardingPresetTestId('clear')).click()
    await page.getByTestId(TEST_ID.onboardingSubmit).click()
    await expect(page.getByTestId(TEST_ID.onboardingFormError)).toHaveText(
      'Выберите хотя бы один рабочий день',
    )
    await expect(page.getByTestId(onboardingStepTestId('schedule'))).toBeVisible()
  })

  test('opens the portfolio cabinet from the last onboarding step', async ({
    page,
  }) => {
    await openOnboarding(page)
    await saveProfileStep(page)
    await saveFirstServiceFromTemplate(page)
    await saveWeekdaySchedule(page)
    await page.getByTestId(TEST_ID.onboardingPortfolioAdd).click()
    await expect(page.getByTestId(TEST_ID.pageMasterPortfolio)).toBeVisible()
  })
})
