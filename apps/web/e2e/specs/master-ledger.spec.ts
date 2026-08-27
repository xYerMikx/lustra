import { COMPLETED_BOOKING_ID } from '../ids'
import { expect, test } from '../fixtures'
import { loginMaster } from '../helpers/auth'
import { openMasterFinances } from '../helpers/open-master-finances'
import { TEST_ID } from '../test-id'

test.describe('master ledger', () => {
  test('puts finances on the mobile tab bar', async ({ page }) => {
    await loginMaster(page)
    await expect(page.getByTestId(TEST_ID.ledgerSnapshot)).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Финансы', exact: true }).last(),
    ).toBeVisible()
  })

  test('adds an expense from the finances sheet', async ({ page }) => {
    await loginMaster(page)
    await openMasterFinances(page)
    await expect(page.getByTestId(TEST_ID.ledgerChart)).toBeVisible()

    await page.getByTestId(TEST_ID.ledgerQuickExpense).click()
    await page.getByTestId(TEST_ID.ledgerAmount).fill('15.50')
    await page.getByTestId(TEST_ID.ledgerEntrySubmit).click()

    await expect(page.getByText('Расход · Материалы')).toBeVisible()
    await expect(
      page.getByRole('listitem').filter({ hasText: 'Расход · Материалы' }),
    ).toContainText('15,5 BYN')
  })

  test('opens tip composer from a completed visit', async ({ page }) => {
    await loginMaster(page)
    await page.goto(`/app/master/bookings/${COMPLETED_BOOKING_ID}`)
    await page.getByTestId(TEST_ID.bookingAddTip).click()
    await expect(page.getByTestId(TEST_ID.pageMasterLedger)).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Чаевые к визиту' })).toBeVisible()
  })
})
