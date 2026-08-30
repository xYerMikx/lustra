import type { ServiceTemplateView } from '@lumira/contracts'

type TemplateSeed = {
  categoryName: string
  categorySlug: string
  templates: Array<{
    title: string
    durationMin: number
    price: number
  }>
}

/**
 * Onboarding shortcuts — not persisted. Slugs match `packages/db` seed
 * (`slugify` of category names).
 */
const TEMPLATE_SEEDS: TemplateSeed[] = [
  {
    categoryName: 'Ногти',
    categorySlug: 'nogti',
    templates: [
      { title: 'Маникюр классический', durationMin: 60, price: 35 },
      { title: 'Маникюр комбинированный', durationMin: 90, price: 60 },
      { title: 'Маникюр с покрытием гель-лак', durationMin: 90, price: 50 },
      { title: 'Педикюр классический', durationMin: 75, price: 45 },
      { title: 'Педикюр аппаратный', durationMin: 90, price: 55 },
      { title: 'Наращивание ногтей (гель)', durationMin: 150, price: 70 },
      { title: 'Снятие покрытия', durationMin: 30, price: 15 },
    ],
  },
  {
    categoryName: 'Брови и ресницы',
    categorySlug: 'brovi-i-resnitsy',
    templates: [
      { title: 'Коррекция и окрашивание бровей', durationMin: 45, price: 25 },
      { title: 'Ламинирование бровей', durationMin: 60, price: 35 },
      { title: 'Наращивание ресниц классика', durationMin: 90, price: 40 },
      { title: 'Наращивание ресниц 2D-3D', durationMin: 120, price: 55 },
      { title: 'Ламинирование ресниц', durationMin: 60, price: 35 },
    ],
  },
  {
    categoryName: 'Волосы',
    categorySlug: 'volosy',
    templates: [
      { title: 'Женская стрижка', durationMin: 60, price: 30 },
      { title: 'Мужская стрижка', durationMin: 45, price: 20 },
      { title: 'Окрашивание в один тон', durationMin: 120, price: 70 },
      { title: 'Окрашивание сложное (балаяж)', durationMin: 240, price: 150 },
      { title: 'Укладка', durationMin: 45, price: 25 },
      { title: 'Кератиновое выпрямление', durationMin: 180, price: 120 },
    ],
  },
  {
    categoryName: 'Макияж',
    categorySlug: 'makiyazh',
    templates: [
      { title: 'Дневной макияж', durationMin: 60, price: 40 },
      { title: 'Вечерний макияж', durationMin: 90, price: 60 },
      { title: 'Свадебный макияж', durationMin: 120, price: 100 },
    ],
  },
  {
    categoryName: 'Косметология',
    categorySlug: 'kosmetologiya',
    templates: [
      { title: 'Чистка лица', durationMin: 90, price: 50 },
      { title: 'Пилинг', durationMin: 60, price: 45 },
      { title: 'Массаж лица', durationMin: 45, price: 35 },
    ],
  },
  {
    categoryName: 'Депиляция',
    categorySlug: 'depilyatsiya',
    templates: [
      { title: 'Шугаринг голени', durationMin: 30, price: 20 },
      { title: 'Шугаринг бикини', durationMin: 30, price: 25 },
      { title: 'Восковая депиляция рук', durationMin: 30, price: 18 },
    ],
  },
  {
    categoryName: 'Массаж',
    categorySlug: 'massazh',
    templates: [
      { title: 'Классический массаж спины', durationMin: 45, price: 35 },
      { title: 'Общий массаж тела', durationMin: 90, price: 65 },
      { title: 'Антицеллюлитный массаж', durationMin: 60, price: 50 },
    ],
  },
  {
    categoryName: 'Тату и пирсинг',
    categorySlug: 'tatu-i-pirsing',
    templates: [
      { title: 'Пирсинг мочки уха', durationMin: 30, price: 25 },
      { title: 'Татуаж бровей', durationMin: 120, price: 90 },
      { title: 'Перманентный макияж губ', durationMin: 120, price: 100 },
    ],
  },
]

export function listServiceTemplates(
  categorySlug?: string,
): ServiceTemplateView[] {
  const seeds = categorySlug
    ? TEMPLATE_SEEDS.filter((seed) => seed.categorySlug === categorySlug)
    : TEMPLATE_SEEDS

  return seeds.flatMap((seed) =>
    seed.templates.map((template) => ({
      categorySlug: seed.categorySlug,
      title: template.title,
      durationMin: template.durationMin,
      price: template.price,
      priceType: 'fixed' as const,
    })),
  )
}
