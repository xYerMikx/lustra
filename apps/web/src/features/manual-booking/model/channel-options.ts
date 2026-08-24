import type { ManualBookingChannel } from '@lustra/contracts'

export const MANUAL_CHANNEL_OPTIONS: Array<{
  value: ManualBookingChannel
  label: string
}> = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'phone', label: 'Телефон' },
  { value: 'walk_in', label: 'Walk-in' },
  { value: 'other', label: 'Другое' },
]

export const IDENTITY_NETWORK_OPTIONS: Array<{
  value: 'instagram' | 'telegram'
  label: string
}> = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'telegram', label: 'Telegram' },
]
