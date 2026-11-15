import * as React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import {
  getBrandBySlug,
  getProductsByBrand,
} from '@/lib/data'
import { ProductCard } from '@/components/public/product-card'

import { buildBreadcrumbJsonLd } from '@/lib/seo'
import { JsonLd } from '@/components/public/json-ld'

export const dynamic = 'force-dynamic'

interface BrandPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params
  const name = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  const title = `${name} | Indian Brand Consolidation & Export`
  const description = `Consolidate ${name} Indian food and grocery cartons in your mixed shipment from Megh Foods, Ahmedabad.`

  return {
    title,
    description,
    alternates: {
      canonical: `/brand/${slug}`,
    },
    openGraph: {
      title: `${title} | Megh Foods`,
      description,
      url: `/brand/${slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Megh Foods`,
      description,
    },
  }
}

export default async function BrandArchivePage({ params }: BrandPageProps) {
  const { slug } = await params

  // 1. Fetch brand safely
  const brand = await getBrandBySlug(slug)

  // Enforce privacy rule: non-public partner brands return 404
  if (!brand || (!brand.is_public && !brand.is_megh)) {
    notFound()
  }

  // 2. Fetch products for this brand safely
  const products = await getProductsByBrand(brand.id, 48)

  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Catalogue', url: '/products' },
    { name: brand.name, url: `/brand/${brand.slug}` },
  ])

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-megh-primary transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/products" className="hover:text-megh-primary transition-colors">
          Catalogue
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-slate-800">{brand.name}</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-megh-primary">
          {brand.is_megh ? 'Megh Own Brand Range' : 'Partner Brand Export Consolidation'}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-montserrat text-megh-navy">
          {brand.name}
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
          Order authentic {brand.name} products by the carton for mixed ocean container export.
          All items are inspected and staged at our Changodar consolidation warehouse in Gujarat,
          India.
        </p>

        {!brand.is_megh && (
          <div className="pt-2 text-[11px] text-slate-400 italic">
            Trademark Notice: {brand.name} brand name and associated trademarks belong to their
            respective owners and are presented strictly for trade and export identification.
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-montserrat text-slate-900">
            {products.length} Products Available
          </h2>
          <Link
            href={`/products?brand=${brand.slug}`}
            className="text-xs font-bold text-megh-primary hover:underline flex items-center gap-1"
          >
            Filter & Search in Explorer →
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
            No products found for this brand currently.
          </div>
        )}
      </div>
    </div>
    </>
  )
}
