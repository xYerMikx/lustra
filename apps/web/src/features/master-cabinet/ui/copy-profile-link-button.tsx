'use client'

import { useState } from 'react'

import { buildPublicProfileUrl } from '@/features/master-cabinet/model/public-profile-url'
import { Button } from '@/shared/ui/button'
import styles from '@/features/master-cabinet/ui/master-cabinet.module.css'

type CopyProfileLinkButtonProps = {
  slug: string
}

export function CopyProfileLinkButton({ slug }: CopyProfileLinkButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const url = buildPublicProfileUrl(slug, window.location.origin)

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Button type="button" variant="ghost" onClick={handleCopy}>
      {copied ? 'Скопировано' : 'Скопировать ссылку'}
    </Button>
  )
}
