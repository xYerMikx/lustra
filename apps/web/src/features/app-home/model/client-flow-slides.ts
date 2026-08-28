import type { PreviewCarouselItem } from '@/shared/ui/preview-carousel/preview-carousel-item'

export type ClientFlowRow = {
  name: string
  meta: string
  tone?: 'ok' | 'free' | 'hold'
}

export type ClientFlowSlide = PreviewCarouselItem & {
  kicker: string
  title: string
  rows: ClientFlowRow[]
}

export const CLIENT_FLOW_SLIDES: ClientFlowSlide[] = [
  {
    id: 'catalog',
    label: 'Каталог',
    caption: 'Мастера рядом, с ценой и городом',
    kicker: 'Беларусь · поиск',
    title: 'Каталог',
    rows: [
      { name: 'Анна · ногти', meta: 'Минск · от 70 р', tone: 'ok' },
      { name: 'Мария · брови', meta: 'Гродно · от 45 р' },
      { name: 'Оля · волосы', meta: 'Брест · от 90 р' },
    ],
  },
  {
    id: 'slots',
    label: 'Окна',
    caption: 'Свободное время видно сразу',
    kicker: 'Завтра · суббота',
    title: 'Окна Анны',
    rows: [
      { name: '11:00 · маникюр', meta: '90 мин', tone: 'ok' },
      { name: '13:00 · свободно', meta: 'окно 90 мин', tone: 'free' },
      { name: '16:00 · гель', meta: 'занято' },
    ],
  },
  {
    id: 'hold',
    label: 'Бронь',
    caption: 'Слот не уйдёт, пока подтверждаете',
    kicker: 'Запись',
    title: 'Держим окно',
    rows: [
      { name: '13:00 · маникюр', meta: 'клиент подтверждает', tone: 'hold' },
      { name: 'Имя', meta: 'Катя' },
      { name: 'Напоминание', meta: 'Telegram за 2 часа', tone: 'ok' },
    ],
  },
  {
    id: 'visit',
    label: 'Визит',
    caption: 'Напомним вам и мастеру',
    kicker: 'Кабинет клиента',
    title: 'Завтра в 13:00',
    rows: [
      { name: 'Анна · ногти', meta: 'Минск', tone: 'ok' },
      { name: 'Маникюр', meta: '90 мин · 70 р' },
      { name: 'Статус', meta: 'Подтверждена', tone: 'ok' },
    ],
  },
]
