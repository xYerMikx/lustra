'use client'

import { useState } from 'react'

import { buildPublicProfileUrl } from '@/features/master-cabinet/model/public-profile-url'
import { Button } from '@/shared/ui/button'
import { CheckIcon, CopyIcon } from '@/shared/ui/icon-pack'
import { useToast } from '@/shared/ui/toast'

type CopyProfileLinkButtonProps = {
  slug: string
}

export function CopyProfileLinkButton({ slug }: CopyProfileLinkButtonProps) {
  const toast = useToast()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const url = buildPublicProfileUrl(slug, window.location.origin)

    try {
      await navigator.clipboard.writeText(url)
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
      aria-label={copied ? 'Ссылка скопирована' : 'Скопировать ссылку'}
      title={copied ? 'Скопировано' : 'Скопировать ссылку'}
      onClick={handleCopy}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  )
}
