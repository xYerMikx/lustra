import type { PublicMasterContactView } from '@lumira/contracts'

import {
  contactLinkTargetProps,
  toMasterContactLinks,
} from '@/features/public-master/model/to-master-contact-links'
import styles from '@/app/m/[slug]/master.module.css'

type MasterContactLinksProps = {
  contact: PublicMasterContactView | null
}

export function MasterContactLinks({ contact }: MasterContactLinksProps) {
  const links = toMasterContactLinks(contact)

  if (links.length === 0) {
    return null
  }

  return (
    <ul className={styles.contacts}>
      {links.map((link) => (
        <li key={link.href}>
          <a
            className={styles.contactLink}
            href={link.href}
            {...contactLinkTargetProps(link.openInNewTab)}
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  )
}
