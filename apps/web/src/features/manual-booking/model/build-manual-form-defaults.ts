import { splitInstantLocal } from '@/features/master-calendar/model/split-instant-local'

export type ManualFormValues = {
  date: string
  startTime: string
  serviceId: string
  clientName: string
  phone: string
  channel: 'instagram' | 'telegram' | 'phone' | 'walk_in' | 'other'
  identityNetwork: 'instagram' | 'telegram'
  socialHandle: string
  note: string
}

export function buildManualFormDefaults(
  defaultDate: string,
  defaultStartsAt: string | null,
  services: Array<{ id: string }>,
): ManualFormValues {
  const fromSlot =
    defaultStartsAt == null
      ? { date: defaultDate, time: '10:00' }
      : splitInstantLocal(new Date(defaultStartsAt))

  return {
    date: fromSlot.date,
    startTime: fromSlot.time,
    serviceId: services[0]?.id ?? '',
    clientName: '',
    phone: '',
    channel: 'instagram',
    identityNetwork: 'instagram',
    socialHandle: '',
    note: '',
  }
}
