/**
 * Legal identity of the landing operator (Belarus individual + UNP).
 * Shared by /contacts and footer fine print — keep a single source of truth.
 */
export const PLATFORM_OPERATOR = {
  fullName: 'Ермолаев Ян Николаевич',
  legalStatus: 'физическое лицо',
  unp: 'CE8134257',
  country: 'Республика Беларусь',
  city: 'Минск',
  supportEmail: 'hello@lumira.by',
} as const

export const OPERATOR_FACTS = [
  { label: 'Владелец сайта', value: PLATFORM_OPERATOR.fullName },
  { label: 'Правовой статус', value: PLATFORM_OPERATOR.legalStatus },
  { label: 'УНП', value: PLATFORM_OPERATOR.unp },
  { label: 'Страна', value: PLATFORM_OPERATOR.country },
  { label: 'Город', value: PLATFORM_OPERATOR.city },
] as const
