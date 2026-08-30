'use client'

import { useState } from 'react'

import {
  createProfileQrPng,
  createProfileQrSvg,
} from '@/features/master-cabinet/model/create-profile-qr'
import {
  downloadBlob,
  downloadDataUrl,
} from '@/features/master-cabinet/model/download-blob'
import { buildQrProfileUrl } from '@/features/master-cabinet/model/public-profile-url'
import styles from '@/features/master-cabinet/ui/master-cabinet.module.css'
import { Button } from '@/shared/ui/button'
import { QrIcon } from '@/shared/ui/icon-pack'

type DownloadQrButtonsProps = {
  slug: string
}

export function DownloadQrButtons({ slug }: DownloadQrButtonsProps) {
  const [busy, setBusy] = useState<'png' | 'svg' | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const qrUrl = () => buildQrProfileUrl(slug, window.location.origin)
  const fileBase = `lumira-${slug}`

  const downloadPng = async () => {
    setBusy('png')
    setErrorMessage(null)

    try {
      const dataUrl = await createProfileQrPng(qrUrl())
      downloadDataUrl(`${fileBase}.png`, dataUrl)
    } catch {
      setErrorMessage('Не удалось скачать PNG')
    } finally {
      setBusy(null)
    }
  }

  const downloadSvg = async () => {
    setBusy('svg')
    setErrorMessage(null)

    try {
      const svg = await createProfileQrSvg(qrUrl())
      downloadBlob(
        `${fileBase}.svg`,
        new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }),
      )
    } catch {
      setErrorMessage('Не удалось скачать SVG')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div>
      <div className={styles.iconActions}>
        <Button
          type="button"
          variant="icon"
          disabled={busy !== null}
          aria-label={busy === 'png' ? 'Готовим PNG' : 'Скачать QR PNG'}
          title="QR PNG"
          onClick={downloadPng}
        >
          <QrIcon />
        </Button>
        <Button
          type="button"
          variant="icon"
          disabled={busy !== null}
          aria-label={busy === 'svg' ? 'Готовим SVG' : 'Скачать QR SVG'}
          title="QR SVG"
          onClick={downloadSvg}
        >
          <QrIcon />
        </Button>
      </div>
      {errorMessage ? (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}
