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

export type ManualFormPrefill = {
  name: string
  phone: string | null
  socialHandle: string | null
  source: string | null
}

function channelFromSource(
  source: string | null,
): ManualFormValues['channel'] {
  if (
    source === 'instagram' ||
    source === 'telegram' ||
    source === 'phone' ||
    source === 'walk_in' ||
    source === 'other'
  ) {
    return source
  }

  return 'instagram'
}

export function buildManualFormDefaults(
  defaultDate: string,
  defaultStartsAt: string | null,
  services: Array<{ id: string }>,
  prefill?: ManualFormPrefill | null,
): ManualFormValues {
  const fromSlot =
    defaultStartsAt == null
      ? { date: defaultDate, time: '10:00' }
      : splitInstantLocal(new Date(defaultStartsAt))

  const channel = channelFromSource(prefill?.source ?? null)
  const identityNetwork =
    channel === 'telegram' || channel === 'instagram'
      ? channel
      : 'instagram'

  return {
    date: fromSlot.date,
    startTime: fromSlot.time,
    serviceId: services[0]?.id ?? '',
    clientName: prefill?.name ?? '',
    phone: prefill?.phone ?? '',
    channel,
    identityNetwork,
    socialHandle: prefill?.socialHandle ?? '',
    note: '',
  }
}
