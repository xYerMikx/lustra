import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { E2eCrashClient } from './e2e-crash-client'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function E2eCrashPage() {
  if (process.env.E2E_MOCK_API !== '1') {
    notFound()
  }

  return <E2eCrashClient />
}
