import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { MasterHero } from '@/app/m/[slug]/master-hero'
import { MasterServicesList } from '@/app/m/[slug]/master-services-list'
import styles from '@/app/m/[slug]/master.module.css'
import { PublicPortfolioGallery } from '@/features/master-portfolio'
import { SlotPicker } from '@/features/slot-picker'
import { ApiError } from '@/shared/api/http'
import { getPublicMasterBySlug } from '@/shared/api/catalog-client'
import { SiteChrome } from '@/shared/ui/site-chrome'

type PageProps = {
  params: Promise<{ slug: string }>
}

async function loadMaster(slug: string) {
  try {
    return await getPublicMasterBySlug(slug)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }

    throw error
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const master = await loadMaster(slug)

  return {
    title: master?.displayName ?? 'Мастер',
  }
}

export default async function MasterPage({ params }: PageProps) {
  const { slug } = await params
  const master = await loadMaster(slug)

  if (!master) {
    notFound()
  }

  return (
    <main className={styles.page}>
      <SiteChrome>
        <MasterHero master={master} />
        <PublicPortfolioGallery items={master.portfolio} />
        <MasterServicesList services={master.services} />
        <SlotPicker
          masterId={master.id}
          masterSlug={master.slug}
          services={master.services}
        />
      </SiteChrome>
    </main>
  )
}
