export const CLIENT_BOOK_STEP_TITLE = {
  service: 'Выберите услугу',
  master: 'Выберите мастера',
  slot: 'Выберите время',
} as const

export const CLIENT_BOOK_COPY = {
  serviceLoading: 'Загружаем услуги…',
  masterLoading: 'Ищем мастеров…',
  masterEmpty:
    'Пока нет мастеров с этой услугой. Выберите другую или откройте каталог.',
  masterMissingService: 'Сначала выберите услугу.',
  slotMissingMaster: 'Не удалось открыть профиль мастера. Вернитесь назад.',
} as const
