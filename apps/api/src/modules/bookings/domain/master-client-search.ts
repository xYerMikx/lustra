export function nickFromQuery(query: string): string {
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
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return true
  }

  const normalizedNick = nickFromQuery(query).toLowerCase()
  const name = client.name.toLowerCase()
  const phone = (client.phone ?? '').toLowerCase()
  const note = (client.note ?? '').toLowerCase()
  const instagram = (client.instagramHandle ?? '').toLowerCase()
  const telegram = (client.telegramHandle ?? '').toLowerCase()

  return (
    name.includes(normalizedQuery) ||
    phone.includes(normalizedQuery) ||
    note.includes(normalizedQuery) ||
    instagram.includes(normalizedNick) ||
    telegram.includes(normalizedNick)
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
