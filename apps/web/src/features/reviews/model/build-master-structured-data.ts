import type { PublicMasterView, PublicReviewView } from '@lumira/contracts'

export type MasterStructuredData = {
  '@context': 'https://schema.org'
  '@type': 'Person'
  name: string
  aggregateRating?: {
    '@type': 'AggregateRating'
    ratingValue: number
    reviewCount: number
    bestRating: 5
    worstRating: 1
  }
  review?: Array<{
    '@type': 'Review'
    author: { '@type': 'Person'; name: string }
    datePublished: string
    reviewBody?: string
    reviewRating: {
      '@type': 'Rating'
      ratingValue: number
      bestRating: 5
      worstRating: 1
    }
  }>
}

export function buildMasterStructuredData(input: {
  master: Pick<PublicMasterView, 'displayName' | 'ratingAvg' | 'ratingCount'>
  reviews: PublicReviewView[]
}): MasterStructuredData {
  const data: MasterStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: input.master.displayName,
  }

  if (input.master.ratingCount > 0) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: input.master.ratingAvg,
      reviewCount: input.master.ratingCount,
      bestRating: 5,
      worstRating: 1,
    }
  }

  if (input.reviews.length > 0) {
    data.review = input.reviews.map((item) => {
      const body = item.text?.trim()
      const review: NonNullable<MasterStructuredData['review']>[number] = {
        '@type': 'Review',
        author: { '@type': 'Person', name: item.clientFirstName },
        datePublished: item.createdAt,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: item.rating,
          bestRating: 5,
          worstRating: 1,
        },
      }

      if (body) {
        review.reviewBody = body
      }

      return review
    })
  }

  return data
}
