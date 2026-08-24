export type ServiceCategory = {
  name: string
  slug: string
}

export type ServiceTemplate = {
  title: string
  categorySlug: string
}

export type ServiceGroup = {
  name: string
  slug: string
  services: Array<{ title: string }>
}

/**
 * Onboarding / catalog templates. Slugs match `browse.json` and
 * `packages/db` seed (`slugify` of category names).
 */
export const SERVICE_TEMPLATES: ServiceTemplate[] = [
  { categorySlug: 'nogti', title: 'Маникюр классический' },
  { categorySlug: 'nogti', title: 'Маникюр комбинированный' },
  { categorySlug: 'nogti', title: 'Маникюр с покрытием гель-лак' },
  { categorySlug: 'nogti', title: 'Педикюр классический' },
  { categorySlug: 'nogti', title: 'Педикюр аппаратный' },
  { categorySlug: 'nogti', title: 'Наращивание ногтей (гель)' },
  { categorySlug: 'nogti', title: 'Снятие покрытия' },
  { categorySlug: 'brovi-i-resnitsy', title: 'Коррекция и окрашивание бровей' },
  { categorySlug: 'brovi-i-resnitsy', title: 'Ламинирование бровей' },
  { categorySlug: 'brovi-i-resnitsy', title: 'Наращивание ресниц классика' },
  { categorySlug: 'brovi-i-resnitsy', title: 'Наращивание ресниц 2D-3D' },
  { categorySlug: 'brovi-i-resnitsy', title: 'Ламинирование ресниц' },
  { categorySlug: 'volosy', title: 'Женская стрижка' },
  { categorySlug: 'volosy', title: 'Мужская стрижка' },
  { categorySlug: 'volosy', title: 'Окрашивание в один тон' },
  { categorySlug: 'volosy', title: 'Окрашивание сложное (балаяж)' },
  { categorySlug: 'volosy', title: 'Укладка' },
  { categorySlug: 'volosy', title: 'Кератиновое выпрямление' },
  { categorySlug: 'makiyazh', title: 'Дневной макияж' },
  { categorySlug: 'makiyazh', title: 'Вечерний макияж' },
  { categorySlug: 'makiyazh', title: 'Свадебный макияж' },
  { categorySlug: 'kosmetologiya', title: 'Чистка лица' },
  { categorySlug: 'kosmetologiya', title: 'Пилинг' },
  { categorySlug: 'kosmetologiya', title: 'Массаж лица' },
  { categorySlug: 'depilyatsiya', title: 'Шугаринг голени' },
  { categorySlug: 'depilyatsiya', title: 'Шугаринг бикини' },
  { categorySlug: 'depilyatsiya', title: 'Восковая депиляция рук' },
  { categorySlug: 'massazh', title: 'Классический массаж спины' },
  { categorySlug: 'massazh', title: 'Общий массаж тела' },
  { categorySlug: 'massazh', title: 'Антицеллюлитный массаж' },
  { categorySlug: 'tatu-i-pirsing', title: 'Пирсинг мочки уха' },
  { categorySlug: 'tatu-i-pirsing', title: 'Татуаж бровей' },
  { categorySlug: 'tatu-i-pirsing', title: 'Перманентный макияж губ' },
]

export function groupServicesByCategory(
  categories: ServiceCategory[],
  templates: ServiceTemplate[] = SERVICE_TEMPLATES,
): ServiceGroup[] {
  const titlesBySlug = new Map<string, string[]>()

  for (const template of templates) {
    const titles = titlesBySlug.get(template.categorySlug) ?? []
    titles.push(template.title)
    titlesBySlug.set(template.categorySlug, titles)
  }

  return categories.map((category) => ({
    name: category.name,
    slug: category.slug,
    services: (titlesBySlug.get(category.slug) ?? []).map((title) => ({
      title,
    })),
  }))
}

export function catalogHrefForService(
  getAppUrl: (path: string) => string,
  categorySlug: string,
  serviceTitle: string,
): string {
  const query = new URLSearchParams({ service: serviceTitle })

  return getAppUrl(`/catalog/${categorySlug}?${query.toString()}`)
}