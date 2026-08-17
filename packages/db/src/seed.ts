import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DISTRICTS = [
  'Центральный',
  'Советский',
  'Первомайский',
  'Партизанский',
  'Заводской',
  'Ленинский',
  'Московский',
  'Октябрьский',
  'Фрунзенский',
] as const

function slugify(input: string): string {
  const map: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
    и: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
    с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
    ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  }
  return input
    .toLowerCase()
    .split('')
    .map((ch) => map[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const CATEGORIES: Array<{
  name: string
  templates: Array<{ title: string; durationMin: number; price: number }>
}> = [
  {
    name: 'Ногти',
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
    name: 'Брови и ресницы',
    templates: [
      { title: 'Коррекция и окрашивание бровей', durationMin: 45, price: 25 },
      { title: 'Ламинирование бровей', durationMin: 60, price: 35 },
      { title: 'Наращивание ресниц классика', durationMin: 90, price: 40 },
      { title: 'Наращивание ресниц 2D-3D', durationMin: 120, price: 55 },
      { title: 'Ламинирование ресниц', durationMin: 60, price: 35 },
    ],
  },
  {
    name: 'Волосы',
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
    name: 'Макияж',
    templates: [
      { title: 'Дневной макияж', durationMin: 60, price: 40 },
      { title: 'Вечерний макияж', durationMin: 90, price: 60 },
      { title: 'Свадебный макияж', durationMin: 120, price: 100 },
    ],
  },
  {
    name: 'Косметология',
    templates: [
      { title: 'Чистка лица', durationMin: 90, price: 50 },
      { title: 'Пилинг', durationMin: 60, price: 45 },
      { title: 'Массаж лица', durationMin: 45, price: 35 },
    ],
  },
  {
    name: 'Депиляция',
    templates: [
      { title: 'Шугаринг голени', durationMin: 30, price: 20 },
      { title: 'Шугаринг бикини', durationMin: 30, price: 25 },
      { title: 'Восковая депиляция рук', durationMin: 30, price: 18 },
    ],
  },
  {
    name: 'Массаж',
    templates: [
      { title: 'Классический массаж спины', durationMin: 45, price: 35 },
      { title: 'Общий массаж тела', durationMin: 90, price: 65 },
      { title: 'Антицеллюлитный массаж', durationMin: 60, price: 50 },
    ],
  },
  {
    name: 'Тату и пирсинг',
    templates: [
      { title: 'Пирсинг мочки уха', durationMin: 30, price: 25 },
      { title: 'Татуаж бровей', durationMin: 120, price: 90 },
      { title: 'Перманентный макияж губ', durationMin: 120, price: 100 },
    ],
  },
]

async function main() {
  console.log('Seeding districts...')
  for (const [index, name] of DISTRICTS.entries()) {
    await prisma.district.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name), city: 'Minsk', sort: index },
    })
  }

  console.log('Seeding service categories + templates...')
  for (const [index, category] of CATEGORIES.entries()) {
    const created = await prisma.serviceCategory.upsert({
      where: { slug: slugify(category.name) },
      update: {},
      create: { name: category.name, slug: slugify(category.name), sort: index },
    })
    // Шаблоны услуг храним как справочные данные для онбординга (не как Service —
    // Service всегда принадлежит конкретному мастеру). Пишем в отдельную JSON-таблицу
    // не заводим ради MVP: шаблоны читаются фронтом из статического файла ниже.
    void created
  }

  console.log('Seed finished.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

export const SERVICE_TEMPLATES = CATEGORIES
