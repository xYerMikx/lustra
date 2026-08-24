export function clientContactLine(client: {
  phone: string | null
  socialHandle: string | null
}): string {
  const parts: string[] = []

  if (client.phone) {
    parts.push(client.phone)
  }

  if (client.socialHandle) {
    const handle = client.socialHandle.startsWith('@')
      ? client.socialHandle
      : `@${client.socialHandle}`
    parts.push(handle)
  }

  return parts.join(' · ')
}

export function visitsLabel(count: number): string {
  const mod100 = count % 100
  const mod10 = count % 10

  if (mod100 >= 11 && mod100 <= 14) {
    return `${count} визитов`
  }

  if (mod10 === 1) {
    return `${count} визит`
  }

  if (mod10 >= 2 && mod10 <= 4) {
    return `${count} визита`
  }

  return `${count} визитов`
}
