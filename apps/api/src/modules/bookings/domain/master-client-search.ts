export function handleNeedleFromQuery(query: string): string {
  return query.trim().replace(/^@+/u, '')
}

export type SearchableMasterClient = {
  masterId: string
  name: string
  phone: string | null
  note: string | null
  instagramHandle: string | null
  telegramHandle: string | null
}

export function clientMatchesQuery(
  client: SearchableMasterClient,
  query: string,
): boolean {
  const needle = query.trim().toLowerCase()

  if (!needle) {
    return true
  }

  const handleNeedle = handleNeedleFromQuery(query).toLowerCase()
  const name = client.name.toLowerCase()
  const phone = (client.phone ?? '').toLowerCase()
  const note = (client.note ?? '').toLowerCase()
  const instagram = (client.instagramHandle ?? '').toLowerCase()
  const telegram = (client.telegramHandle ?? '').toLowerCase()

  return (
    name.includes(needle) ||
    phone.includes(needle) ||
    note.includes(needle) ||
    instagram.includes(handleNeedle) ||
    telegram.includes(handleNeedle)
  )
}

export function clientsVisibleToMaster(
  clients: SearchableMasterClient[],
  masterId: string,
  query: string,
): SearchableMasterClient[] {
  return clients.filter(
    (client) =>
      client.masterId === masterId && clientMatchesQuery(client, query),
  )
}
