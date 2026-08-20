'use client'

import { useState } from 'react'

import { buildShareStoryText } from '@/features/master-cabinet/model/build-share-story-text'
import { buildPublicProfileUrl } from '@/features/master-cabinet/model/public-profile-url'
import { Button } from '@/shared/ui/button'
import { CheckIcon, ShareIcon } from '@/shared/ui/icon-pack'
import { useToast } from '@/shared/ui/toast'

type ShareProfileButtonProps = {
  slug: string
  displayName: string
}

export function ShareProfileButton({
  slug,
  displayName,
}: ShareProfileButtonProps) {
  const toast = useToast()
  const [copied, setCopied] = useState(false)

  const shareProfile = async () => {
    const url = buildPublicProfileUrl(slug, window.location.origin)
    const text = buildShareStoryText(displayName, url)

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: displayName,
          text,
          url,
        })

        return
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return
        }
      }
    }

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Скопировано в буфер обмена')
      window.setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch {
      setCopied(false)
      toast.error('Не удалось скопировать ссылку')
    }
  }

  return (
    <Button
      type="button"
      variant="icon"
      aria-label={copied ? 'Скопировано' : 'Поделиться'}
      title={copied ? 'Скопировано' : 'Поделиться'}
      onClick={shareProfile}
    >
      {copied ? <CheckIcon /> : <ShareIcon />}
    </Button>
  )
}
