import Link from 'next/link'

import { CopyProfileLinkButton } from '@/features/master-cabinet/ui/copy-profile-link-button'
import { CopyStoryTextButton } from '@/features/master-cabinet/ui/copy-story-text-button'
import { DownloadQrButtons } from '@/features/master-cabinet/ui/download-qr-buttons'
import { ShareProfileButton } from '@/features/master-cabinet/ui/share-profile-button'
import { buildPublicProfilePath } from '@/features/master-cabinet/model/public-profile-url'
import styles from '@/features/master-cabinet/ui/master-cabinet.module.css'

type PublicProfileShareProps = {
  slug: string
  displayName: string
}

export function PublicProfileShare({
  slug,
  displayName,
}: PublicProfileShareProps) {
  const publicPath = buildPublicProfilePath(slug)

  return (
    <div>
      <div className={styles.linkRow}>
        <Link className={styles.publicPath} href={publicPath}>
          {publicPath}
        </Link>
      </div>
      <div className={styles.shareActions}>
        <CopyProfileLinkButton slug={slug} />
        <ShareProfileButton slug={slug} displayName={displayName} />
        <CopyStoryTextButton slug={slug} displayName={displayName} />
        <DownloadQrButtons slug={slug} />
      </div>
    </div>
  )
}
