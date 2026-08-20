import {
  ANNA_SLUG,
  BORIS_SLUG,
  CATEGORY_NAILS_SLUG,
  DISTRICT_FRUNZE_SLUG,
} from '../accounts'
import { expect, test } from '../fixtures'
import { SERVICE_ID } from '../ids'
import {
  TEST_ID,
  catalogCategoryTestId,
  catalogDistrictTestId,
  masterCardTestId,
  serviceOptionTestId,
} from '../test-id'

test.describe('catalog browse', () => {
  test('lists published masters on the catalog home', async ({ page }) => {
    await page.goto('/catalog')
    await expect(page.getByTestId(TEST_ID.pageCatalog)).toBeVisible()
    await expect(page.getByTestId(masterCardTestId(ANNA_SLUG))).toBeVisible()
    await expect(page.getByTestId(masterCardTestId(BORIS_SLUG))).toBeVisible()
  })

  test('filters by category chip', async ({ page }) => {
    await page.goto('/catalog')
    await page.getByTestId(catalogCategoryTestId(CATEGORY_NAILS_SLUG)).click()
    await expect(page).toHaveURL(/\/catalog\/nogti/)
    await expect(page.getByTestId(masterCardTestId(ANNA_SLUG))).toBeVisible()
    await expect(page.getByTestId(masterCardTestId(BORIS_SLUG))).toHaveCount(0)
  })

  test('filters by district', async ({ page }) => {
    await page.goto('/catalog')
    await page.getByTestId(TEST_ID.catalogDistricts).click()
    await page.getByTestId(catalogDistrictTestId(DISTRICT_FRUNZE_SLUG)).click()
    await page.keyboard.press('Escape')
    await page.getByTestId(TEST_ID.catalogSubmit).click()
    await expect(page).toHaveURL(/district=frunzenskiy/)
    await expect(page.getByTestId(masterCardTestId(ANNA_SLUG))).toBeVisible()
    await expect(page.getByTestId(masterCardTestId(BORIS_SLUG))).toHaveCount(0)
  })

  test('shows empty copy when filters match nobody', async ({ page }) => {
    await page.goto('/catalog')
    await page.getByTestId(TEST_ID.catalogPriceMax).fill('10')
    await page.getByTestId(TEST_ID.catalogSubmit).click()
    await expect(page.getByTestId(TEST_ID.catalogEmpty)).toBeVisible()
  })

  test('opens a public master page from a card', async ({ page }) => {
    await page.goto('/catalog')
    await page.getByTestId(masterCardTestId(ANNA_SLUG)).click()
    await expect(page.getByTestId(TEST_ID.pageMasterPublic)).toBeVisible()
    await expect(page.getByTestId(TEST_ID.slotPicker)).toBeVisible()
    await expect(page.getByTestId(serviceOptionTestId(SERVICE_ID))).toBeVisible()
  })
})
