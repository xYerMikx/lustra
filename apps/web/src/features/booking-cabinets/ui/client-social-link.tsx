import type { ClientSocialLink as ClientSocialLinkModel } from '@/features/booking-cabinets/model/to-client-social-link'
import styles from '@/features/booking-cabinets/ui/bookings.module.css'
import { InstagramIcon, TelegramIcon } from '@/shared/ui/icon-pack'

type ClientSocialLinkProps = {
  link: ClientSocialLinkModel
}

export function ClientSocialLink({ link }: ClientSocialLinkProps) {
  const Icon = link.network === 'telegram' ? TelegramIcon : InstagramIcon
  const networkLabel = link.network === 'telegram' ? 'Telegram' : 'Instagram'

  return (
    <a
      className={styles.socialLink}
      href={link.href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`${networkLabel}: ${link.label}`}
    >
      <Icon />
      <span>{link.label}</span>
    </a>
  )
}
