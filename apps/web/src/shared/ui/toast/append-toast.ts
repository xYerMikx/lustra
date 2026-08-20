export type ToastTone = 'success' | 'warning' | 'error' | 'info'

export type ToastRecord = {
  id: string
  tone: ToastTone
  message: string
  leaving: boolean
}

export const TOAST_STACK_LIMIT = 3

export function appendToast(
  list: ToastRecord[],
  next: ToastRecord,
  limit = TOAST_STACK_LIMIT,
): ToastRecord[] {
  return [...list, next].slice(-limit)
}

export function markToastLeaving(
  list: ToastRecord[],
  id: string,
): ToastRecord[] {
  return list.map((toast) => {
    if (toast.id !== id) {
      return toast
    }

    return { ...toast, leaving: true }
  })
}

export function removeToast(list: ToastRecord[], id: string): ToastRecord[] {
  return list.filter((toast) => toast.id !== id)
}
