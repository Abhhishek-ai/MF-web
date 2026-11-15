import * as React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import {
  getGroupBySlug,
  getCategoriesByGroup,
  getProductsByGroup,
} from '@/lib/data'
import { ProductCard } from '@/components/public/product-card'

import { buildBreadcrumbJsonLd } from '@/lib/seo'
import { JsonLd } from '@/components/public/json-ld'

export const dynamic = 'force-dynamic'

interface RangePageProps {
  params: Promise<{ group: string }>
}

export async function generateMetadata({ params }: RangePageProps): Promise<Metadata> {
  const { group } = await params
  const name = group
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  const title = `${name} | Indian Grocery Export`
  const description = `Browse ${name} export products, carton configurations, and packaging options from Megh Foods for mixed container consolidation.`

  return {
    title,
    description,
    alternates: {
      canonical: `/range/${group}`,
    },
    openGraph: {
      title: `${title} | Megh Foods`,
      description,
      url: `/range/${group}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Megh Foods`,
      description,
    },
  }
}

export default async function RangeGroupPage({ params }: RangePageProps) {
  const { group: groupSlug } = await params

  // 1. Fetch group safely
  const group = await getGroupBySlug(groupSlug)

  if (!group) {
    notFound()
  }

  // 2. Fetch categories and products in this group safely
  const [categories, products] = await Promise.all([
    getCategoriesByGroup(group.id),
    getProductsByGroup(group.id, 36),
  ])

  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Catalogue', url: '/products' },
    { name: group.name, url: `/range/${group.slug}` },
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
        <span className="font-semibold text-slate-800">{group.name}</span>
      </nav>

      {/* Hero Header */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs space-y-4">
        <div className="inline-block text-xs font-bold uppercase tracking-wider text-megh-primary bg-megh-primary/10 px-3 py-1 rounded-full">
          Product Sourcing Pillar
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-montserrat text-megh-navy">
          {group.name}
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
          {group.description ||
            `Explore our export-ready range of ${group.name.toLowerCase()} available for full and mixed container shipments from Ahmedabad, India.`}
        </p>

        {/* Categories Chips */}
        {categories.length > 0 && (
          <div className="pt-4 flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-megh-primary hover:text-white text-xs font-semibold text-slate-700 transition-colors"
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-montserrat text-slate-900">
            Products in {group.name}
          </h2>
          <Link
            href={`/products?group=${group.slug}`}
            className="text-xs font-bold text-megh-primary hover:underline flex items-center gap-1"
          >
            Open in Catalogue Explorer →
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
            No products listed in this group yet.
          </div>
        )}
      </div>
    </div>
    </>
  )
}
