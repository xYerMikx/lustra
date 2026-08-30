import {
  ANALYTICS_CONSENT_STORAGE_KEY,
  getLandingAnalyticsConfig,
  parseAnalyticsConsent,
  type AnalyticsConsent,
  type PublicAnalyticsConfig,
} from '@/lib/analytics'

type YmStub = ((...args: unknown[]) => void) & {
  a: unknown[][]
  l: number
}

function loadScript(src: string, id: string) {
  if (document.getElementById(id)) {
    return
  }

  const el = document.createElement('script')
  el.id = id
  el.async = true
  el.src = src
  document.head.appendChild(el)
}

function injectYandexMetrika(counterId: string, webvisor: boolean) {
  const w = window as Window & { ym?: YmStub }

  if (typeof w.ym !== 'function') {
    const stub = ((...args: unknown[]) => {
      stub.a.push(args)
    }) as YmStub
    stub.a = []
    stub.l = Date.now()
    w.ym = stub
  }

  w.ym?.(Number(counterId), 'init', {
    ssr: true,
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor,
  })

  loadScript(
    `https://mc.yandex.ru/metrika/tag.js?id=${counterId}`,
    'lumira-ym-tag',
  )
}

function injectGoogleAnalytics(measurementId: string) {
  const w = window as Window & {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }

  w.dataLayer = w.dataLayer ?? []

  if (typeof w.gtag !== 'function') {
    w.gtag = (...args: unknown[]) => {
      w.dataLayer?.push(args)
    }
  }

  w.gtag('js', new Date())
  w.gtag('config', measurementId)

  loadScript(
    `https://www.googletagmanager.com/gtag/js?id=${measurementId}`,
    'lumira-ga-tag',
  )
}

function startPublicAnalytics(config: PublicAnalyticsConfig) {
  if (!config.enabled) {
    return
  }

  if (config.metrikaId) {
    injectYandexMetrika(config.metrikaId, config.webvisor)
  }

  if (config.gaId) {
    injectGoogleAnalytics(config.gaId)
  }
}

const BANNER_OPEN_CLASS = 'is-open'

function hideBanner(banner: HTMLElement) {
  banner.classList.remove(BANNER_OPEN_CLASS)
  banner.hidden = true
}

function showBanner(banner: HTMLElement) {
  banner.hidden = false
  banner.classList.add(BANNER_OPEN_CLASS)
}

function persistConsent(next: AnalyticsConsent) {
  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, next)
  } catch {
    // Private mode can block storage; the banner is already closed.
  }
}

function readStoredConsent(): AnalyticsConsent | null {
  try {
    return parseAnalyticsConsent(
      window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY),
    )
  } catch {
    return null
  }
}

export function bootLandingAnalytics() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootLandingAnalytics, {
      once: true,
    })

    return
  }

  const config = getLandingAnalyticsConfig()
  const banner = document.getElementById('lumira-analytics-banner')

  if (!config.enabled || !banner) {
    return
  }

  const stored = readStoredConsent()

  if (stored === 'granted') {
    startPublicAnalytics(config)
    hideBanner(banner)

    return
  }

  if (stored === 'denied') {
    hideBanner(banner)

    return
  }

  showBanner(banner)

  banner.addEventListener('click', (event) => {
    const target = event.target

    if (!(target instanceof Element)) {
      return
    }

    if (target.closest('#lumira-analytics-accept')) {
      hideBanner(banner)
      persistConsent('granted')
      startPublicAnalytics(config)

      return
    }

    if (target.closest('#lumira-analytics-deny')) {
      hideBanner(banner)
      persistConsent('denied')
    }
  })
}
