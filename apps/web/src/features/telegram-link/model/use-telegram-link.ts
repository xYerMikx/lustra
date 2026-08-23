import { useEffect, useState } from 'react'

import { getMe } from '@/shared/api/auth-client'
import { startTelegramLink, unlinkTelegram } from '@/shared/api/telegram-client'
import { ApiError } from '@/shared/api/http'

const POLL_MS = 2500
const WATCH_MS = 5 * 60 * 1000

export function useTelegramLink(initialLinked: boolean) {
  const [linked, setLinked] = useState(initialLinked)
  const [busy, setBusy] = useState(false)
  const [watching, setWatching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    if (params.get('telegram') !== 'linked') {
      return
    }

    let cancelled = false

    const sync = async () => {
      try {
        const me = await getMe()

        if (!cancelled) {
          setLinked(me.telegramLinked)
        }
      } catch {
        return
      }

      params.delete('telegram')
      const query = params.toString()
      const next = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
      window.history.replaceState(null, '', next)
    }

    void sync()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (linked || !watching) {
      return
    }

    let cancelled = false

    const refresh = async () => {
      try {
        const me = await getMe()

        if (cancelled || !me.telegramLinked) {
          return
        }

        setLinked(true)
        setWatching(false)
      } catch {
        return
      }
    }

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        void refresh()
      }
    }

    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    const interval = window.setInterval(() => {
      void refresh()
    }, POLL_MS)
    const timeout = window.setTimeout(() => {
      setWatching(false)
    }, WATCH_MS)

    void refresh()

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
      window.clearInterval(interval)
      window.clearTimeout(timeout)
    }
  }, [linked, watching])

  const connect = async () => {
    setBusy(true)
    setError(null)

    try {
      const result = await startTelegramLink()
      window.open(result.deepLink, '_blank', 'noopener,noreferrer')
      setWatching(true)
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

  const disconnect = async () => {
    setBusy(true)
    setError(null)

    try {
      await unlinkTelegram()
      setLinked(false)
      setWatching(false)
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Не удалось отключить Telegram',
      )
    } finally {
      setBusy(false)
    }
  }

  return { linked, busy, error, connect, disconnect }
}
