import type { OkResponse, TelegramLinkStartResponse } from '@lustra/contracts'

import { apiFetch } from './http'

export function startTelegramLink() {
  return apiFetch<TelegramLinkStartResponse>('/telegram/link/start', {
    method: 'POST',
  })
}

export function unlinkTelegram() {
  return apiFetch<OkResponse>('/telegram/link', {
    method: 'DELETE',
  })
}
