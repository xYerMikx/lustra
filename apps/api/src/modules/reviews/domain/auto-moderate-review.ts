const URL_RE = /\bhttps?:\/\/|\bwww\./i
const EMAIL_RE = /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i
const PHONE_RE = /(?:\+?375|8\s?0)\s?\d[\d\s()-]{7,}/
const MESSENGER_RE = /\b(?:t\.me|telegram|instagram|whatsapp|vk\.com)\b/i
const HANDLE_RE = /(^|\s)@[a-z0-9._]{3,}/i

const STOP_WORDS = [
  'промокод',
  'подписывайтесь',
  'переходи по ссылке',
  'перейдите по ссылке',
]

export type AutoModerateDecision = 'published' | 'pending_review'

export function autoModerateReview(text: string | null | undefined): AutoModerateDecision {
  const value = text?.trim() ?? ''

  if (!value) {
    return 'published'
  }

  if (
    URL_RE.test(value) ||
    EMAIL_RE.test(value) ||
    PHONE_RE.test(value) ||
    MESSENGER_RE.test(value) ||
    HANDLE_RE.test(value)
  ) {
    return 'pending_review'
  }

  const lowered = value.toLowerCase()

  for (const word of STOP_WORDS) {
    if (lowered.includes(word)) {
      return 'pending_review'
    }
  }

  return 'published'
}
