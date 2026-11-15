import type { MetadataRoute } from 'next'
import { publicClient, isSupabaseConfigured } from '@/lib/supabase/public'
import { getLocalCatalog } from '@/lib/local-data'
import { SITE_URL } from '@/lib/seo'

export const revalidate = 86400

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/megh-brand`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/mixed-container`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/private-label`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/basket`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  const localCatalog = getLocalCatalog()

  let groups = localCatalog.groups.map((g) => ({ slug: g.slug }))
  let categories = localCatalog.categories.map((c) => ({ slug: c.slug }))
  let brands = localCatalog.brands.filter((b) => b.is_public || b.is_megh).map((b) => ({ slug: b.slug }))
  let products = localCatalog.products.map((p) => ({ slug: p.slug, updated_at: p.updated_at }))

  if (isSupabaseConfigured()) {
    try {
      const db = publicClient()

      const [groupsRes, catsRes, brandsRes, productsRes] = await Promise.all([
        db.from('product_groups').select('slug').eq('is_active', true),
        db.from('categories').select('slug').eq('is_active', true),
        db.from('brands').select('slug').or('is_public.eq.true,is_megh.eq.true'),
        db.from('products').select('slug, updated_at').eq('is_active', true).limit(5000),
      ])

      if (groupsRes.data && groupsRes.data.length > 0) groups = groupsRes.data
      if (catsRes.data && catsRes.data.length > 0) categories = catsRes.data
      if (brandsRes.data && brandsRes.data.length > 0) brands = brandsRes.data
      if (productsRes.data && productsRes.data.length > 0) products = productsRes.data
    } catch {
      // Fallback already assigned to localCatalog
    }
  }

    const groupRoutes: MetadataRoute.Sitemap = groups.map((g) => ({
      url: `${SITE_URL}/range/${g.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    const catRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${SITE_URL}/category/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    const brandRoutes: MetadataRoute.Sitemap = brands.map((b) => ({
      url: `${SITE_URL}/brand/${b.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${SITE_URL}/products/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    return [...staticRoutes, ...groupRoutes, ...catRoutes, ...brandRoutes, ...productRoutes]
}
