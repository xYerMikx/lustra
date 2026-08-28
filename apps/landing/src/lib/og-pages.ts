export const OG_IMAGE_WIDTH = 1200
export const OG_IMAGE_HEIGHT = 630
export const OG_IMAGE_TYPE = 'image/png'

export type OgImageSpec = {
  path: string
  alt: string
  tagline: string
}

export const DEFAULT_OG_IMAGE = {
  path: '/og.png',
  alt: 'Lumira — бьюти-мастера Беларуси',
  tagline: 'бьюти-мастера Беларуси',
} as const satisfies OgImageSpec

const OG_PAGES: Record<string, OgImageSpec> = {
  '/': DEFAULT_OG_IMAGE,
  '/for-masters': {
    path: '/og-for-masters.png',
    alt: 'Lumira — календарь записи и витрина для мастеров',
    tagline: 'календарь записи и витрина',
  },
  '/services': {
    path: '/og-services.png',
    alt: 'Lumira — каталог бьюти-услуг в Беларуси',
    tagline: 'каталог бьюти-услуг',
  },
  '/contacts': {
    path: '/og-contacts.png',
    alt: 'Lumira — контакты и поддержка',
    tagline: 'контакты и поддержка',
  },
  '/payment': {
    path: '/og-payment.png',
    alt: 'Lumira — оплата и возврат',
    tagline: 'оплата и возврат',
  },
  '/privacy': {
    path: '/og-privacy.png',
    alt: 'Lumira — политика конфиденциальности',
    tagline: 'политика конфиденциальности',
  },
  '/terms': {
    path: '/og-terms.png',
    alt: 'Lumira — публичная оферта',
    tagline: 'публичная оферта',
  },
}

export function ogImageForPath(pathname: string): OgImageSpec {
  const normalized =
    pathname === '/' || pathname === ''
      ? '/'
      : pathname.replace(/\/$/, '') || '/'

  return OG_PAGES[normalized] ?? DEFAULT_OG_IMAGE
}

export function listOgImageSpecs(): OgImageSpec[] {
  const seen = new Set<string>()
  const specs: OgImageSpec[] = []

  for (const spec of Object.values(OG_PAGES)) {
    if (seen.has(spec.path)) {
      continue
    }

    seen.add(spec.path)
    specs.push(spec)
  }

  return specs
}
