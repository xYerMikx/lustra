'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import {
  appendToast,
  markToastLeaving,
  removeToast,
  type ToastRecord,
  type ToastTone,
} from '@/shared/ui/toast/append-toast'
import { ToastViewport } from '@/shared/ui/toast/toast-viewport'

export type ShowToastInput = {
  tone: ToastTone
  message: string
  durationMs?: number
}

type ToastApi = {
  show: (input: ShowToastInput) => void
  success: (message: string) => void
  warning: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
  dismiss: (id: string) => void
}

const DEFAULT_DURATION_MS = 3000
const LEAVE_DURATION_MS = 250

const ToastContext = createContext<ToastApi | null>(null)

type ToastProviderProps = {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([])
  const timersRef = useRef<Map<string, number>>(new Map())

  const clearTimer = (id: string) => {
    const timer = timersRef.current.get(id)

    if (timer) {
      window.clearTimeout(timer)
      timersRef.current.delete(id)
    }
  }

  const remove = useCallback((id: string) => {
    clearTimer(id)
    setToasts((list) => removeToast(list, id))
  }, [])

  const dismiss = useCallback(
    (id: string) => {
      clearTimer(id)
      setToasts((list) => markToastLeaving(list, id))
      const leaveTimer = window.setTimeout(() => {
        remove(id)
      }, LEAVE_DURATION_MS)
      timersRef.current.set(id, leaveTimer)
    },
    [remove],
  )

  const show = useCallback(
    (input: ShowToastInput) => {
      const id =
        typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `toast-${Date.now()}`
      const next: ToastRecord = {
        id,
        tone: input.tone,
        message: input.message,
        leaving: false,
      }

      setToasts((list) => appendToast(list, next))
      const duration = input.durationMs ?? DEFAULT_DURATION_MS
      const hideTimer = window.setTimeout(() => {
        dismiss(id)
      }, duration)
      timersRef.current.set(id, hideTimer)
    },
    [dismiss],
  )

  useEffect(() => {
    const timers = timersRef.current

    return () => {
      timers.forEach((timer) => {
        window.clearTimeout(timer)
      })
      timers.clear()
    }
  }, [])

  const api = useMemo<ToastApi>(
    () => ({
      show,
      dismiss,
      success: (message: string) => {
        show({ tone: 'success', message })
      },
      warning: (message: string) => {
        show({ tone: 'warning', message })
      },
      error: (message: string) => {
        show({ tone: 'error', message })
      },
      info: (message: string) => {
        show({ tone: 'info', message })
      },
    }),
    [dismiss, show],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const api = useContext(ToastContext)

  if (!api) {
    throw new Error('useToast must be used within ToastProvider')
  }

  return api
}
