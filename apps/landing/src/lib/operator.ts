/**
 * Legal identity of the landing operator (Belarus individual + UNP).
 * Shared by homepage, /contacts, /payment and footer — keep a single source of truth.
 *
 * Street, mobile and tax-registration date: fill from the UNP certificate
 * before sending the site to the acquirer. Do not invent them here.
 */
export const PLATFORM_OPERATOR = {
  fullName: 'Ермолаев Ян Николаевич',
  legalStatus: 'физическое лицо',
  unp: 'CE8134257',
  country: 'Республика Беларусь',
  city: 'Минск',
  postalAddress: 'г. Минск, Республика Беларусь',
  registeredOn: 'дата постановки на учёт — в свидетельстве УНП',
  registeredBy:
    'Инспекция Министерства по налогам и сборам Республики Беларусь',
  hours: 'Пн–Вс 10:00–20:00 (переписка, ответ в течение рабочего дня)',
  phone: 'по запросу на support@lumira.by',
  phoneHref: 'mailto:support@lumira.by',
  supportEmail: 'support@lumira.by',
} as const

export const LEGAL_NOTICES = {
  tradeRegistry:
    'Регистрация в Торговом реестре не требуется: Оператор оказывает услуги, а не розничную продажу товаров.',
  householdRegistry:
    'Регистрация в Реестре бытовых услуг не требуется: Оператор не оказывает услуги красоты. Платформа — информационный сервис и продвижение профилей независимых мастеров.',
  licenses: 'Лицензии на деятельность Оператора не требуются.',
  belgie:
    'Сайт размещён на хостинге в Республике Беларусь (hoster.by). Регистрация интернет-ресурса в РУП «БелГИЭ» оформляется через хостинг-провайдера.',
  domainOwner:
    'Домен lumira.by принадлежит Оператору. Интернет-ресурс не размещён на бесплатном хостинге.',
} as const

export const OPERATOR_FACTS = [
  { label: 'Официальное наименование', value: PLATFORM_OPERATOR.fullName },
  { label: 'Правовой статус', value: PLATFORM_OPERATOR.legalStatus },
  { label: 'УНП', value: PLATFORM_OPERATOR.unp },
  { label: 'Дата государственной регистрации', value: PLATFORM_OPERATOR.registeredOn },
  { label: 'Орган государственной регистрации', value: PLATFORM_OPERATOR.registeredBy },
  { label: 'Почтовый адрес', value: PLATFORM_OPERATOR.postalAddress },
  { label: 'Режим работы', value: PLATFORM_OPERATOR.hours },
  { label: 'Телефон', value: PLATFORM_OPERATOR.phone },
  { label: 'E-mail', value: PLATFORM_OPERATOR.supportEmail },
] as const
