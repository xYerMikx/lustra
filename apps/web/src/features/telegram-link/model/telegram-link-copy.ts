export type TelegramLinkAudience = 'client' | 'master'

export function telegramLinkCopy(input: {
  linked: boolean
  audience: TelegramLinkAudience
}): string {
  if (!input.linked) {
    return 'Подключите Telegram, чтобы получать уведомления о записях'
  }

  if (input.audience === 'master') {
    return 'Напоминания придут за 2 часа до визита'
  }

  return 'Напоминания придут за 24 часа до визита'
}
