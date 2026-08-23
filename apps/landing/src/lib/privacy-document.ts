import { PLATFORM_OPERATOR } from '@/lib/operator'
import type { PrivacyDocumentData } from '@/lib/privacy-policy'
import { privacySections } from '@/lib/privacy-sections'

const operator = PLATFORM_OPERATOR

export const privacyDocument: PrivacyDocumentData = {
  title: 'Политика конфиденциальности',
  description:
    'Как Lustra обрабатывает персональные данные посетителей лендинга, листа ожидания и пользователей платформы в Республике Беларусь.',
  updatedLabel: 'Редакция от 23 августа 2026 г.',
  operatorLine: `Оператор: ${operator.fullName}, ${operator.legalStatus}, УНП ${operator.unp}`,
  lead: 'Политика для лендинга, листа ожидания и платформы записи к бьюти-мастерам в Минске. Текст написан под Закон Республики Беларусь № 99-З; это рабочая редакция до юридической вычитки.',
  notice:
    'Согласие на обработку даётся отдельно (чекбокс при регистрации или заявке). Продолжение просмотра лендинга само по себе не заменяет согласие на рассылку.',
  sections: privacySections,
}
