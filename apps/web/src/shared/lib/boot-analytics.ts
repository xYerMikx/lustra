import type { PublicAnalyticsConfig } from '@/shared/lib/analytics'

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

export function startPublicAnalytics(config: PublicAnalyticsConfig) {
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
