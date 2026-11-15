import type { Metadata } from 'next'
import type { Product, SiteSettingsMap } from './types'

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.meghfoods.com'

export function constructMetadata({
  title,
  description,
  path = '',
  image = '/images/og-megh.jpg',
  noIndex = false,
}: {
  title?: string
  description?: string
  path?: string
  image?: string
  noIndex?: boolean
} = {}): Metadata {
  const fullTitle = title ? `${title} | Megh Foods` : 'Megh Foods | Indian Grocery Exporter & Consolidator'
  const fullDescription =
    description ||
    'Leading Indian food, grocery and general-goods exporter from Ahmedabad, India. Mix Megh-brand staples, partner brands, pooja and handicraft items in a single container.'

  return {
    title: fullTitle,
    description: fullDescription,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      url: path,
      siteName: 'Megh Foods',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDescription,
      images: [image],
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
  }
}

export function buildOrganizationJsonLd(settings: SiteSettingsMap) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings.company.name,
    alternateName: settings.company.brand,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    email: settings.company.email,
    telephone: settings.company.phones[0] || '+91 989 825 5500',
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.company.registered_office,
      addressLocality: 'Ahmedabad',
      addressRegion: 'Gujarat',
      postalCode: '380059',
      addressCountry: 'IN',
    },
    sameAs: [settings.company.website],
  }
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  }
}

export function buildProductJsonLd(product: Product) {
  const brandName =
    product.is_megh_brand
      ? 'Megh'
      : product.brand?.is_public || product.brand?.is_megh
      ? product.brand.name
      : undefined

  const skus = product.packs?.map((p) => p.sku).filter(Boolean) || []

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description:
      product.short_description ||
      `${product.name} exported by Megh Foods from Ahmedabad, India. Available in export carton packaging for container consolidation.`,
    image: product.images.length > 0 ? product.images : undefined,
    sku: skus[0] || undefined,
    category: product.category?.name || undefined,
    ...(brandName
      ? {
          brand: {
            '@type': 'Brand',
            name: brandName,
          },
        }
      : {}),
  }
}

export {
  buildOrganizationJsonLd as generateOrganizationSchema,
  buildProductJsonLd as generateProductSchema,
}
