'use client'

import { useTelegramLink } from '@/features/telegram-link/model/use-telegram-link'
import styles from '@/features/telegram-link/ui/telegram-link-card.module.css'
import { Button } from '@/shared/ui/button'
import { TEST_ID } from '@/shared/lib/test-id'

type TelegramLinkCardProps = {
  linked: boolean
}

export function TelegramLinkCard({ linked }: TelegramLinkCardProps) {
  const telegram = useTelegramLink(linked)

  if (telegram.linked) {
    return (
      <div className={styles.card} data-testid={TEST_ID.telegramLinked}>
        <h2 className={styles.title}>Telegram подключён</h2>
        <p className={styles.copy}>
          Напоминания о записях придут в бот. Тихие часы: с 23:00 до 07:00.
        </p>
      </div>
    )
  }

  return (
    <div className={styles.card} data-testid={TEST_ID.telegramConnect}>
      <h2 className={styles.title}>Подключите Telegram</h2>
      <p className={styles.copy}>
        Клиенту — за сутки или сразу, если запись на сегодня. Мастеру — за 2
        часа. Ночью (23:00–07:00) сообщения ждут до утра.
      </p>
      <div className={styles.actions}>
        <Button
          type="button"
          disabled={telegram.busy}
          onClick={() => void telegram.connect()}
        >
          {telegram.busy ? 'Открываем…' : 'Подключить Telegram'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={telegram.busy}
          onClick={() => void telegram.refresh()}
        >
          Я подключил
        </Button>
      </div>
      {telegram.error ? (
        <p className={styles.error} role="alert">
          {telegram.error}
        </p>
      ) : null}
    </div>
  )
}
