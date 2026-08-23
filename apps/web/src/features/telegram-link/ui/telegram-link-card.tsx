'use client'

import {
  telegramLinkCopy,
  type TelegramLinkAudience,
} from '@/features/telegram-link/model/telegram-link-copy'
import { useTelegramLink } from '@/features/telegram-link/model/use-telegram-link'
import styles from '@/features/telegram-link/ui/telegram-link-card.module.css'
import { Button } from '@/shared/ui/button'
import { TelegramIcon } from '@/shared/ui/icon-pack'
import { TEST_ID } from '@/shared/lib/test-id'

type TelegramLinkCardProps = {
  linked: boolean
  audience: TelegramLinkAudience
}

export function TelegramLinkCard({ linked, audience }: TelegramLinkCardProps) {
  const telegram = useTelegramLink(linked)
  const copy = telegramLinkCopy({
    linked: telegram.linked,
    audience,
  })

  return (
    <div
      className={styles.card}
      data-testid={telegram.linked ? TEST_ID.telegramLinked : TEST_ID.telegramConnect}
    >
      <span className={styles.iconWrap} aria-hidden="true">
        <TelegramIcon className={styles.icon} />
      </span>
      <p className={styles.copy}>{copy}</p>
      {telegram.linked ? (
        <Button
          type="button"
          variant="ghost"
          disabled={telegram.busy}
          onClick={() => void telegram.disconnect()}
        >
          Отключить
        </Button>
      ) : (
        <Button
          type="button"
          disabled={telegram.busy}
          onClick={() => void telegram.connect()}
        >
          {telegram.busy ? 'Открываем…' : 'Подключить'}
        </Button>
      )}
      {telegram.error ? (
        <p className={styles.error} role="alert">
          {telegram.error}
        </p>
      ) : null}
    </div>
  )
}
