import { PLATFORM_OPERATOR } from '@/lib/operator'

export const SITE_NAME = 'Lumira'
export const SITE_ORIGIN = 'https://lumira.by'
export const DEFAULT_DESCRIPTION =
  'Lumira — агрегатор бьюти-мастеров в Минске. Выбирайте по услуге и району, смотрите свободные окна и записывайтесь онлайн.'

export const OG_IMAGE = {
  path: '/og.png',
  width: 1200,
  height: 630,
  alt: 'Lumira — бьюти-мастера Минска',
  type: 'image/png',
} as const

export function absoluteUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  const normalized = path.startsWith('/') ? path : `/${path}`

  if (normalized === '/') {
    return `${SITE_ORIGIN}/`
  }

  return `${SITE_ORIGIN}${normalized.replace(/\/$/, '')}`
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_ORIGIN,
    logo: absoluteUrl('/email-mark.png'),
    email: PLATFORM_OPERATOR.supportEmail,
    address: {
      '@type': 'PostalAddress',
      addressLocality: PLATFORM_OPERATOR.city,
      addressCountry: 'BY',
      streetAddress: PLATFORM_OPERATOR.postalAddress,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: PLATFORM_OPERATOR.supportEmail,
      availableLanguage: ['ru'],
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        description: PLATFORM_OPERATOR.hours,
      },
    },
  }
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_ORIGIN,
    description: DEFAULT_DESCRIPTION,
    inLanguage: 'ru-BY',
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_ORIGIN,
    },
  }
}

export function webPageJsonLd(input: {
  title: string
  description: string
  path: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_ORIGIN,
    },
    inLanguage: 'ru-BY',
  }
}
