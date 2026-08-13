'use client'

import type { ChangeEvent } from 'react'
import { useRef } from 'react'

import styles from '@/features/master-portfolio/ui/master-portfolio.module.css'
import { Button } from '@/shared/ui/button'

type PortfolioUploadControlProps = {
  busy: boolean
  onFiles: (files: FileList) => void
}

export function PortfolioUploadControl({
  busy,
  onFiles,
}: PortfolioUploadControlProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files

    if (!files || files.length === 0) {
      return
    }

    onFiles(files)
    event.target.value = ''
  }

  return (
    <>
      <input
        ref={inputRef}
        className={styles.fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        disabled={busy}
        onChange={handleChange}
      />
      <Button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? 'Загружаем…' : 'Добавить фото'}
      </Button>
    </>
  )
}
