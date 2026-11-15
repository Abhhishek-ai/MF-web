import * as React from 'react'
import type { Metadata } from 'next'
import { CatalogClient } from '@/components/public/catalog-client'
import {
  getAllProducts,
  getGroups,
  getCategories,
  getBrands,
} from '@/lib/data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'B2B Export Catalogue (2,000+ Indian Products)',
  description:
    'Explore our complete 2,140+ SKU export catalogue: Megh brand flours, pulses, rice, papad, fasting items, partner FMCG brands, and pooja goods for mixed container shipments.',
  alternates: {
    canonical: '/products',
  },
  openGraph: {
    title: 'B2B Export Catalogue (2,000+ Indian Products) | Megh Foods',
    description:
      'Explore our complete 2,140+ SKU export catalogue: Megh brand flours, pulses, rice, papad, fasting items, partner FMCG brands, and pooja goods for mixed container shipments.',
    url: '/products',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'B2B Export Catalogue (2,000+ Indian Products) | Megh Foods',
    description:
      'Explore our complete 2,140+ SKU export catalogue: Megh brand flours, pulses, rice, papad, fasting items, partner FMCG brands, and pooja goods.',
  },
}

export default async function ProductsCataloguePage() {
  const [products, groups, categories, brands] = await Promise.all([
    getAllProducts(),
    getGroups(),
    getCategories(),
    getBrands(),
  ])

  // Pass initial 24 products for immediate server-side rendering & SEO
  return (
    <CatalogClient
      initialProducts={products.slice(0, 24)}
      groups={groups}
      categories={categories}
      brands={brands}
    />
  )
}
