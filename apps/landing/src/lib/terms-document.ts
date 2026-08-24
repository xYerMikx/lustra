import { PLATFORM_OPERATOR } from '@/lib/operator'

export type TermsInline = string | { href: string; label: string }

export type TermsBlock =
  | { type: 'p'; text: string }
  | { type: 'p'; parts: TermsInline[] }
  | { type: 'ul'; items: string[] }

export type TermsSection = {
  id: string
  title: string
  blocks: TermsBlock[]
}

/** Identity from the shared operator record used on /contacts. */
export const TERMS_META = {
  title: 'Условия пользования',
  edition: '24 августа 2026 г.',
  lead:
    'Правила информационной платформы Lumira для клиентов и мастеров красоты в Минске. Регистрируясь или пользуясь сайтом, вы принимаете эту редакцию.',
  operatorName: PLATFORM_OPERATOR.fullName,
  operatorStatus: PLATFORM_OPERATOR.legalStatus,
  unp: PLATFORM_OPERATOR.unp,
  country: PLATFORM_OPERATOR.country,
  city: PLATFORM_OPERATOR.city,
  email: PLATFORM_OPERATOR.supportEmail,
} as const
