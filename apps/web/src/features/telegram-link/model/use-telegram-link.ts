import { useState } from 'react'

import { getMe } from '@/shared/api/auth-client'
import { startTelegramLink } from '@/shared/api/telegram-client'
import { ApiError } from '@/shared/api/http'

export function useTelegramLink(initialLinked: boolean) {
  const [linked, setLinked] = useState(initialLinked)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connect = async () => {
    setBusy(true)
    setError(null)

    try {
      const result = await startTelegramLink()
      window.open(result.deepLink, '_blank', 'noopener,noreferrer')
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Не удалось открыть ссылку Telegram',
      )
    } finally {
      setBusy(false)
    }
  }

  const refresh = async () => {
    setBusy(true)
    setError(null)

    try {
      const me = await getMe()
      setLinked(me.telegramLinked)
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Не удалось проверить привязку',
      )
    } finally {
      setBusy(false)
    }
  }

  return { linked, busy, error, connect, refresh }
}
