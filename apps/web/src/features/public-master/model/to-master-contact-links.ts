import {
  instagramProfileUrl,
  telegramProfileUrl,
} from '@lustra/contracts'

export type MasterContactLink = {
  label: string
  href: string
  openInNewTab: boolean
}

export type MasterContactInput = {
  publicPhone: string | null
  instagram: string | null
  telegramUsername: string | null
  website: string | null
} | null

export function toMasterContactLinks(
  contact: MasterContactInput,
): MasterContactLink[] {
  if (!contact) {
    return []
  }

  const links: MasterContactLink[] = []

  if (contact.instagram) {
    links.push({
      label: 'Instagram',
      href: instagramProfileUrl(contact.instagram),
      openInNewTab: true,
    })
  }

  if (contact.telegramUsername) {
    links.push({
      label: 'Telegram',
      href: telegramProfileUrl(contact.telegramUsername),
      openInNewTab: true,
    })
  }

  if (contact.publicPhone) {
    links.push({
      label: contact.publicPhone,
      href: `tel:${contact.publicPhone}`,
      openInNewTab: false,
    })
  }

  if (contact.website) {
    links.push({
      label: 'Сайт',
      href: contact.website,
      openInNewTab: true,
    })
  }

  return links
}

export function contactLinkTargetProps(openInNewTab: boolean): {
  target?: '_blank'
  rel?: string
} {
  if (!openInNewTab) {
    return {}
  }

  return { target: '_blank', rel: 'noreferrer noopener' }
}
