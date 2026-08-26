'use client'

import { useEffect, useState } from 'react'

import {
  ANALYTICS_CONSENT_STORAGE_KEY,
  getWebAnalyticsConfig,
  parseAnalyticsConsent,
  type AnalyticsConsent,
} from '@/shared/lib/analytics'
import { startPublicAnalytics } from '@/shared/lib/boot-analytics'
import { publicSiteUrl } from '@/shared/lib/public-site-url'
import { Button } from '@/shared/ui/button'
import styles from '@/shared/ui/analytics-consent/analytics-consent.module.css'

const ANALYTICS_CONFIG = getWebAnalyticsConfig()

export function AnalyticsConsent() {
  const [consent, setConsent] = useState<AnalyticsConsent | null | 'pending'>(
    'pending',
  )

  useEffect(() => {
    if (!ANALYTICS_CONFIG.enabled) {
      return
    }

    let stored: AnalyticsConsent | null = null

    try {
      stored = parseAnalyticsConsent(
        window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY),
      )
    } catch {
      stored = null
    }

    setConsent(stored)

    if (stored === 'granted') {
      startPublicAnalytics(ANALYTICS_CONFIG)
    }
  }, [])

  if (!ANALYTICS_CONFIG.enabled || consent === 'pending' || consent !== null) {
    return null
  }

  const privacyHref = `${publicSiteUrl()}/privacy/#cookies`

  const persist = (next: AnalyticsConsent) => {
    try {
      window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, next)
    } catch {
      // Private mode can block storage; still close the banner.
    }

    setConsent(next)

    if (next === 'granted') {
      startPublicAnalytics(ANALYTICS_CONFIG)
    }
  }

  return (
    <div
      className={styles.banner}
      role="dialog"
      aria-labelledby="lumira-analytics-title"
      aria-describedby="lumira-analytics-text"
    >
      <div className={styles.copy}>
        <p className={styles.title} id="lumira-analytics-title">
          Счётчики посещений
        </p>
        <p className={styles.text} id="lumira-analytics-text">
          Чтобы понимать, откуда приходят гости, мы можем включить Яндекс.Метрику
          и Google Analytics. Они ставят cookie и передают технические данные
          визита обработчикам, в том числе Google в США.{' '}
          <a className={styles.link} href={privacyHref}>
            Подробнее в политике
          </a>
          . Можно отказаться: для просмотра сайта это не обязательно.
        </p>
      </div>
      <div className={styles.actions}>
        <Button variant="ghost" onClick={() => persist('denied')}>
          Только необходимые
        </Button>
        <Button variant="primary" onClick={() => persist('granted')}>
          Принять
        </Button>
      </div>
    </div>
  )
}
