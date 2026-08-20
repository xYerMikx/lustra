'use client'

import { useState } from 'react'

import { buildShareStoryText } from '@/features/master-cabinet/model/build-share-story-text'
import { buildPublicProfileUrl } from '@/features/master-cabinet/model/public-profile-url'
import { Button } from '@/shared/ui/button'
import { CheckIcon, CopyIcon } from '@/shared/ui/icon-pack'

type CopyStoryTextButtonProps = {
  slug: string
  displayName: string
}

export function CopyStoryTextButton({
  slug,
  displayName,
}: CopyStoryTextButtonProps) {
  const [copied, setCopied] = useState(false)

  const copyStory = async () => {
    const url = buildPublicProfileUrl(slug, window.location.origin)
    const text = buildShareStoryText(displayName, url)

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Button
      type="button"
      variant="icon"
      aria-label={copied ? 'Текст сторис скопирован' : 'Текст для сторис'}
      title={copied ? 'Скопировано' : 'Текст для сторис'}
      onClick={copyStory}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  )
}
