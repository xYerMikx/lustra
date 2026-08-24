import type { MasterClientView } from '@lustra/contracts'

export function clientSuggestMeta(client: MasterClientView): string {
  const parts: string[] = []

  if (client.phone) {
    parts.push(client.phone)
  }

  if (client.socialHandle) {
    parts.push(`@${client.socialHandle}`)
  }

  return parts.join(' · ')
}
