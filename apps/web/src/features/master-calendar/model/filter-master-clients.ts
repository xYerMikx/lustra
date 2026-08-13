import type { MasterClientView } from '@lustra/contracts'

export function filterMasterClients(
  query: string,
  clients: MasterClientView[],
): MasterClientView[] {
  const needle = query.trim().toLowerCase()

  if (!needle) {
    return []
  }

  return clients.filter((client) => {
    const name = client.name.trim().toLowerCase()
    const phone = (client.phone ?? '').replace(/[^\d+]/g, '')
    const phoneNeedle = needle.replace(/[^\d+]/g, '')

    if (name.includes(needle)) {
      return true
    }

    return phoneNeedle.length > 0 && phone.includes(phoneNeedle)
  })
}
