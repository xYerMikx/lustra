import type { MasterClientView } from '@lustra/contracts'

export function matchMasterClient(
  name: string,
  clients: MasterClientView[],
): MasterClientView | null {
  const needle = name.trim().toLowerCase()

  if (!needle) {
    return null
  }

  const exact = clients.filter(
    (client) => client.name.trim().toLowerCase() === needle,
  )

  if (exact.length === 1) {
    const match = exact[0]

    return match ?? null
  }

  const prefixed = clients.filter((client) =>
    client.name.trim().toLowerCase().startsWith(needle),
  )

  if (prefixed.length === 1) {
    const match = prefixed[0]

    return match ?? null
  }

  return null
}
