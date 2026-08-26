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
    'lustra-ym-tag',
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
    'lustra-ga-tag',
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

function hideBanner(banner: HTMLElement) {
  banner.hidden = true
}

function persistConsent(next: AnalyticsConsent) {
  window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, next)
}

export function bootLandingAnalytics() {
  const config = getLandingAnalyticsConfig()
  const banner = document.getElementById('lumira-analytics-banner')

  if (!config.enabled || !banner) {
    return
  }

  const stored = parseAnalyticsConsent(
    window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY),
  )

  if (stored === 'granted') {
    startPublicAnalytics(config)
    hideBanner(banner)

    return
  }

  if (stored === 'denied') {
    hideBanner(banner)

    return
  }

  banner.hidden = false

  const accept = document.getElementById('lumira-analytics-accept')
  const deny = document.getElementById('lumira-analytics-deny')

  accept?.addEventListener('click', () => {
    persistConsent('granted')
    startPublicAnalytics(config)
    hideBanner(banner)
  })

  deny?.addEventListener('click', () => {
    persistConsent('denied')
    hideBanner(banner)
  })
}
