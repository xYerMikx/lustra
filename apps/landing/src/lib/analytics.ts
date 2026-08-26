export const ANALYTICS_CONSENT_STORAGE_KEY = 'lumira-analytics-consent'

export type AnalyticsConsent = 'granted' | 'denied'

export type PublicAnalyticsConfig = {
  metrikaId: string | null
  gaId: string | null
  webvisor: boolean
  enabled: boolean
}

export function parseAnalyticsConsent(
  value: string | null,
): AnalyticsConsent | null {
  if (value === 'granted' || value === 'denied') {
    return value
  }

  return null
}

export function parseMetrikaCounterId(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? ''

  if (!/^\d{6,15}$/.test(trimmed)) {
    return null
  }

  return trimmed
}

export function parseGaMeasurementId(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? ''

  if (!/^G-[A-Z0-9]+$/.test(trimmed)) {
    return null
  }

  return trimmed
}

export function parseSiteVerificationToken(
  value: string | undefined,
): string | null {
  const trimmed = value?.trim() ?? ''

  if (!/^[A-Za-z0-9_-]{8,200}$/.test(trimmed)) {
    return null
  }

  return trimmed
}

export function parseWebvisorFlag(value: string | undefined): boolean {
  if (!value) {
    return false
  }

  const normalized = value.trim().toLowerCase()

  return normalized === '1' || normalized === 'true' || normalized === 'yes'
}

export function getLandingAnalyticsConfig(): PublicAnalyticsConfig {
  const metrikaId = parseMetrikaCounterId(
    import.meta.env.PUBLIC_YANDEX_METRIKA_ID,
  )
  const gaId = parseGaMeasurementId(import.meta.env.PUBLIC_GA_MEASUREMENT_ID)
  const webvisor = parseWebvisorFlag(
    import.meta.env.PUBLIC_YANDEX_METRIKA_WEBVISOR,
  )

  return {
    metrikaId,
    gaId,
    webvisor,
    enabled: Boolean(metrikaId || gaId),
  }
}

export function getLandingGoogleSiteVerification(): string | null {
  return parseSiteVerificationToken(
    import.meta.env.PUBLIC_GOOGLE_SITE_VERIFICATION,
  )
}
