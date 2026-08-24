import type { LocalInterval } from '@/modules/scheduling/domain/generate-slot-starts'

export function parseScheduleIntervals(value: unknown): LocalInterval[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null
  }

  const intervals: LocalInterval[] = []

  for (const item of value) {
    if (!item || typeof item !== 'object') {
      continue
    }

    const record = item as { startMin?: unknown; endMin?: unknown }
    const startMin = Number(record.startMin)
    const endMin = Number(record.endMin)

    if (
      !Number.isInteger(startMin) ||
      !Number.isInteger(endMin) ||
      endMin <= startMin
    ) {
      continue
    }

    intervals.push({ startMin, endMin })
  }

  if (intervals.length === 0) {
    return null
  }

  return intervals.sort((left, right) => left.startMin - right.startMin)
}
