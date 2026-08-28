import { PLATFORM_OPERATOR } from '@/lib/operator'
import {
  DEFAULT_OG_IMAGE,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_TYPE,
  OG_IMAGE_WIDTH,
} from '@/lib/og-pages'

export const SITE_NAME = 'Lumira'
export const SITE_ORIGIN = 'https://lumira.by'
export const DEFAULT_DESCRIPTION =
  'Lumira — агрегатор бьюти-мастеров в Минске и по Беларуси. Выбирайте по услуге и району, смотрите свободные окна и записывайтесь онлайн.'

export const OG_IMAGE = {
  path: DEFAULT_OG_IMAGE.path,
  width: OG_IMAGE_WIDTH,
  height: OG_IMAGE_HEIGHT,
  alt: DEFAULT_OG_IMAGE.alt,
  type: OG_IMAGE_TYPE,
} as const

export function absoluteUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  const normalized = path.startsWith('/') ? path : `/${path}`

  if (normalized === '/') {
    return `${SITE_ORIGIN}/`
  }

  const withoutSlash = normalized.replace(/\/$/, '')

  const isAsset = /\.[a-z0-9]+$/i.test(withoutSlash)

  if (isAsset) {
    return `${SITE_ORIGIN}${withoutSlash}`
  }

  return `${SITE_ORIGIN}${withoutSlash}/`
}

const areaServed = [
  {
    '@type': 'Country',
    name: 'Belarus',
  },
  {
    '@type': 'City',
    name: 'Minsk',
  },
] as const

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
    areaServed: [...areaServed],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: PLATFORM_OPERATOR.supportEmail,
      areaServed: 'BY',
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
    about: {
      '@type': 'Thing',
      name: 'Запись к бьюти-мастерам в Беларуси',
    },
  }
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}
