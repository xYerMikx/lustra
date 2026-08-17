export function minuteOfDayFromHm(time: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(time)

  if (!match) {
    return null
  }

  const hours = Number(match[1])
  const minutes = Number(match[2])

  if (hours > 23 || minutes > 59) {
    return null
  }

  return hours * 60 + minutes
}
