import type {
  CreateTimeBlockInput,
  MasterCalendarView,
  TimeBlockView,
} from '@lustra/contracts'

import { apiFetch } from '@/shared/api/http'

export function getMasterCalendar(from: string, to: string) {
  const params = new URLSearchParams({ from, to })

  return apiFetch<MasterCalendarView>(`/master/calendar?${params.toString()}`, {
    method: 'GET',
  })
}

export function createTimeBlock(input: CreateTimeBlockInput) {
  return apiFetch<TimeBlockView>('/master/schedule/blocks', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function deleteTimeBlock(id: string) {
  return apiFetch(`/master/schedule/blocks/${id}`, {
    method: 'DELETE',
  })
}
