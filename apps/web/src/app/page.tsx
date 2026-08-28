import { AppHomeShell } from '@/features/app-home'
import { SiteChrome } from '@/shared/ui/site-chrome'

export default function HomePage() {
  return (
    <main>
      <SiteChrome>
        <AppHomeShell />
      </SiteChrome>
    </main>
  )
}
