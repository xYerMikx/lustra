import {
  instagramProfileUrl,
  normalizeSocialHandle,
  telegramProfileUrl,
  type ContactChannel,
} from '@lustra/contracts'

export type ClientSocialNetwork = 'instagram' | 'telegram'

export type ClientSocialLink = {
  network: ClientSocialNetwork
  handle: string
  href: string
  label: string
}

function socialNetwork(
  source: ContactChannel | null | undefined,
  channel: ContactChannel | null | undefined,
): ClientSocialNetwork | null {
  if (source === 'instagram' || source === 'telegram') {
    return source
  }

  if (channel === 'instagram' || channel === 'telegram') {
    return channel
  }

  return null
}

export function toClientSocialLink(input: {
  socialHandle: string | null
  source?: ContactChannel | null
  channel?: ContactChannel | null
}): ClientSocialLink | null {
  if (!input.socialHandle) {
    return null
  }

  const handle = normalizeSocialHandle(input.socialHandle)

  if (!handle) {
    return null
  }

  const network = socialNetwork(input.source, input.channel)

  if (network === 'telegram') {
    return {
      network,
      handle,
      href: telegramProfileUrl(handle),
      label: `@${handle}`,
    }
  }

  if (network === 'instagram') {
    return {
      network,
      handle,
      href: instagramProfileUrl(handle),
      label: `@${handle}`,
    }
  }

  return null
}
