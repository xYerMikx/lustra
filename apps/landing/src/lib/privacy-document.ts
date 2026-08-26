import { PLATFORM_OPERATOR } from '@/lib/operator'
import type { PrivacyDocumentData } from '@/lib/privacy-policy'
import { privacySections } from '@/lib/privacy-sections'

const operator = PLATFORM_OPERATOR

export const privacyDocument: PrivacyDocumentData = {
  title: 'Политика конфиденциальности',
  description:
    'Как Lumira обрабатывает персональные данные посетителей сайта и пользователей платформы в Республике Беларусь по закону № 99-З.',
  updatedLabel: 'Редакция от 26 августа 2026 г.',
  operatorLine: `Оператор: ${operator.fullName}, ${operator.legalStatus}, УНП ${operator.unp}`,
  lead: 'Настоящая Политика определяет порядок обработки персональных данных сервиса Lumira — информационной платформы для поиска бьюти-мастеров в Минске и онлайн-записи. Документ составлен в соответствии с Законом Республики Беларусь от 07.05.2021 № 99-З «О защите персональных данных».',
  notice:
    'Согласие на обработку персональных данных даётся отдельно — при регистрации, записи к мастеру, обращении в поддержку или принятии счётчиков аналитики. Просмотр сайта без вашего действия в баннере не включает Яндекс.Метрику и Google Analytics и не означает согласие на рассылку.',
  sections: privacySections,
}
