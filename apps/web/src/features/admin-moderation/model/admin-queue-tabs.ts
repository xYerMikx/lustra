export type AdminQueueTab = 'masters' | 'portfolio' | 'reviews'

export const ADMIN_QUEUE_TABS: Array<{
  id: AdminQueueTab
  href: string
  label: string
}> = [
  { id: 'masters', href: '/admin', label: 'Мастера' },
  { id: 'portfolio', href: '/admin/portfolio', label: 'Фото' },
  { id: 'reviews', href: '/admin/reviews', label: 'Отзывы' },
]
