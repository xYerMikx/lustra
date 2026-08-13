import {
  addDaysToYmdDate,
  formatYmdDateInTimeZone,
} from '@/shared/lib/tz'

export function catalogAvailableOnOptions(
  now: Date,
  selected?: string,
): Array<{ value: string; label: string }> {
  const today = formatYmdDateInTimeZone(now)
  const tomorrow = addDaysToYmdDate(today, 1)
  const options = [
    { value: '', label: 'Любой день' },
    { value: today, label: 'Сегодня' },
    { value: tomorrow, label: 'Завтра' },
  ]

  if (selected && selected !== today && selected !== tomorrow) {
    options.push({ value: selected, label: selected })
  }

  return options
}
