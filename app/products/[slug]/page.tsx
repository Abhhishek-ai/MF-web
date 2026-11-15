import * as React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getProductBySlug,
  getRelated,
  getRecentProductSlugs,
} from '@/lib/data'
import { getSettings } from '@/lib/settings'
import { ProductDetailClient } from '@/components/public/product-detail-client'
import { generateProductSchema, buildBreadcrumbJsonLd } from '@/lib/seo'
import { JsonLd } from '@/components/public/json-ld'

export const dynamicParams = true
export const revalidate = 3600

export async function generateStaticParams() {
  const slugs = await getRecentProductSlugs(200)
  return slugs.map((slug) => ({ slug }))
}

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  const title = `${product.name} | Wholesale & Export | Megh Foods`
  const description =
    product.seo_description ||
    product.short_description ||
    `Order ${product.name} in bulk carton packaging for mixed container export from Ahmedabad, India.`

  const images = product.images?.[0] ? [{ url: product.images[0] }] : undefined

  return {
    title,
    description,
    alternates: {
      canonical: `/products/${product.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/products/${product.slug}`,
      images,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: product.images?.[0] ? [product.images[0]] : undefined,
    },
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params
  const [product, settings] = await Promise.all([
    getProductBySlug(slug),
    getSettings(),
  ])

  if (!product) {
    notFound()
  }

  const related = await getRelated(product, 4)
  const productSchema = generateProductSchema(product)
  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
    ...(product.group ? [{ name: product.group.name, url: `/range/${product.group.slug}` }] : []),
    ...(product.category ? [{ name: product.category.name, url: `/category/${product.category.slug}` }] : []),
    { name: product.name, url: `/products/${product.slug}` },
  ])

  return (
    <>
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ProductDetailClient
        product={product}
        relatedProducts={related}
        pdfUrl={settings.catalogue?.pdf_url}
        whatsappNumber={settings.whatsapp?.number}
      />
    </>
  )
}
