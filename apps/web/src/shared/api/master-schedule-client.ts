import type {
  MasterScheduleView,
  PutMasterScheduleInput,
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
