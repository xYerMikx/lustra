import type { Metadata } from 'next'

import { NotFoundScreen } from '@/features/app-error'
import { SiteChrome } from '@/shared/ui/site-chrome'

export const metadata: Metadata = {
  title: 'Страница не найдена',
  robots: { index: false, follow: false },
}

export default function NotFoundPage() {
  return (
    <main>
      <SiteChrome>
        <NotFoundScreen />
      </SiteChrome>
    </main>
  )
}
