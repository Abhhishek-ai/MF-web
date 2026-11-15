import * as React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import {
  getCategoryBySlug,
  getProductsByCategory,
} from '@/lib/data'
import { ProductCard } from '@/components/public/product-card'

import { buildBreadcrumbJsonLd } from '@/lib/seo'
import { JsonLd } from '@/components/public/json-ld'

export const dynamic = 'force-dynamic'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const name = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  const title = `${name} | Indian Food Wholesale & Export`
  const description = `Order ${name} in master export carton packaging for mixed container export from Ahmedabad, India. Direct manufacturer and consolidation rates.`

  return {
    title,
    description,
    alternates: {
      canonical: `/category/${slug}`,
    },
    openGraph: {
      title: `${title} | Megh Foods`,
      description,
      url: `/category/${slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Megh Foods`,
      description,
    },
  }
}

export default async function CategoryArchivePage({ params }: CategoryPageProps) {
  const { slug } = await params

  // 1. Fetch category safely
  const category = await getCategoryBySlug(slug)

  if (!category) {
    notFound()
  }

  // 2. Fetch products in this category safely
  const products = await getProductsByCategory(category.id, 48)

  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Catalogue', url: '/products' },
    ...(category.group ? [{ name: category.group.name, url: `/range/${category.group.slug}` }] : []),
    { name: category.name, url: `/category/${category.slug}` },
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
        {category.group && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link
              href={`/range/${category.group.slug}`}
              className="hover:text-megh-primary transition-colors"
            >
              {category.group.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-slate-800">{category.name}</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-megh-primary">
          Category Sourcing
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-montserrat text-megh-navy">
          {category.name}
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
          {category.description ||
            `Explore export carton configurations, weights, and packaging specifications for ${category.name.toLowerCase()}. Ready for mixed container staging at our Changodar warehouse.`}
        </p>
      </div>

      {/* Products Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-montserrat text-slate-900">
            {products.length} Products Available
          </h2>
          <Link
            href={`/products?cat=${category.slug}`}
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
            No products in this category currently.
          </div>
        )}
      </div>
    </div>
    </>
  )
}
