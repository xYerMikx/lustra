import type {
  MasterScheduleView,
  PutMasterScheduleInput,
  PutScheduleExceptionInput,
  ScheduleExceptionListResponse,
  ScheduleExceptionView,
} from '@lustra/contracts'

import { apiFetch } from '@/shared/api/http'

export function getMasterSchedule() {
  return apiFetch<MasterScheduleView>('/master/schedule', { method: 'GET' })
}

export function putMasterScheduleRules(input: PutMasterScheduleInput) {
  return apiFetch<MasterScheduleView>('/master/schedule/rules', {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function listScheduleExceptions(from: string, to: string) {
  const params = new URLSearchParams({ from, to })

  return apiFetch<ScheduleExceptionListResponse>(
    `/master/schedule/exceptions?${params.toString()}`,
    { method: 'GET' },
  )
}

export function putScheduleException(
  date: string,
  input: PutScheduleExceptionInput,
) {
  return apiFetch<ScheduleExceptionView>(
    `/master/schedule/exceptions/${date}`,
    {
      method: 'PUT',
      body: JSON.stringify(input),
    },
  )
}

export function deleteScheduleException(date: string) {
  return apiFetch(`/master/schedule/exceptions/${date}`, {
    method: 'DELETE',
  })
}
