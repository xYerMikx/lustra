import { test as base, expect } from '@playwright/test'

const MOCK_URL = `http://127.0.0.1:${process.env.E2E_MOCK_API_PORT ?? 3337}`

export const test = base.extend<{ mockApi: { reset: () => Promise<void> } }>({
  mockApi: [
    async ({}, use) => {
      const reset = async () => {
        const response = await fetch(`${MOCK_URL}/__e2e/reset`, {
          method: 'POST',
        })

        if (!response.ok && response.status !== 204) {
          throw new Error(`Mock API reset failed: ${response.status}`)
        }
      }

      await reset()
      await use({ reset })
    },
    { auto: true },
  ],
})

export { expect }
