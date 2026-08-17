import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { MasterHero } from '@/app/m/[slug]/master-hero'
import { MasterServicesList } from '@/app/m/[slug]/master-services-list'
import styles from '@/app/m/[slug]/master.module.css'
import { PublicPortfolioGallery } from '@/features/master-portfolio'
import {
  MasterStructuredData,
  PublicReviews,
  buildMasterStructuredData,
} from '@/features/reviews'
import { SlotPicker } from '@/features/slot-picker'
import { ApiError } from '@/shared/api/http'
import {
  getPublicMasterBySlug,
  getPublicMasterReviews,
} from '@/shared/api/catalog-client'
import { SiteChrome } from '@/shared/ui/site-chrome'
import { TEST_ID } from '@/shared/lib/test-id'

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

async function loadReviews(slug: string) {
  try {
    return await getPublicMasterReviews(slug)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { items: [] }
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

  const reviews = await loadReviews(slug)
  const structuredData = buildMasterStructuredData({
    master,
    reviews: reviews.items,
  })

  return (
    <main className={styles.page} data-testid={TEST_ID.pageMasterPublic}>
      <MasterStructuredData data={structuredData} />
      <SiteChrome>
        <MasterHero master={master} />
        <PublicPortfolioGallery items={master.portfolio} />
        <MasterServicesList services={master.services} />
        <PublicReviews items={reviews.items} />
        <SlotPicker
          masterId={master.id}
          masterSlug={master.slug}
          services={master.services}
        />
      </SiteChrome>
    </main>
  )
}
