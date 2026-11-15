import * as React from 'react'
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/admin'
import { ProductsTableClient, ProductTableRow } from '@/components/admin/products-table-client'
import { getLocalCatalog } from '@/lib/local-data'

export const dynamic = 'force-dynamic'

interface ProductsPageProps {
  searchParams: Promise<{
    q?: string
    group?: string
    category?: string
    brand?: string
    filter?: string
    page?: string
  }>
}

interface AdminBrandItem {
  id: string
  name: string
  is_megh: boolean
}

interface AdminCategoryItem {
  id: string
  name: string
  group_id: string | null
}

interface AdminGroupItem {
  id: string
  name: string
}

export default async function AdminProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1', 10))
  const pageSize = 50
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const local = getLocalCatalog()
  let groupsData: AdminGroupItem[] = local.groups.map((g) => ({ id: g.id, name: g.name }))
  let categoriesData: AdminCategoryItem[] = local.categories.map((c) => ({
    id: c.id,
    name: c.name,
    group_id: c.group_id ?? null,
  }))
  let brandsData: AdminBrandItem[] = local.brands.map((b) => ({
    id: b.id,
    name: b.name,
    is_megh: b.is_megh,
  }))
  let normalizedProducts: ProductTableRow[] = []
  let totalCount = local.products.length

  if (isSupabaseConfigured()) {
    try {
      const db = createAdminClient()

      // 1. Fetch Taxonomies for Filters and Editor
      const [
        groupsRes,
        categoriesRes,
        brandsRes,
      ] = await Promise.all([
        db.from('product_groups').select('id, name').order('name'),
        db.from('categories').select('id, name, group_id').order('name'),
        db.from('brands').select('id, name, is_megh').order('name'),
      ])

      if (!groupsRes.error && groupsRes.data?.length) groupsData = groupsRes.data as AdminGroupItem[]
      if (!categoriesRes.error && categoriesRes.data?.length) categoriesData = categoriesRes.data as AdminCategoryItem[]
      if (!brandsRes.error && brandsRes.data?.length) brandsData = brandsRes.data as AdminBrandItem[]

      // 2. Build Product Query
      let query = db
        .from('products')
        .select(
          `
          id,
          name,
          slug,
          is_active,
          is_featured,
          is_new,
          needs_review,
          is_megh_brand,
          images,
          catalogue_pages,
          brand:brands(id, name),
          category:categories(id, name),
          product_group:product_groups(id, name),
          product_packs(id, sku, pack_size, units_per_carton, carton_spec_raw, pack_size_grams, pack_size_ml, is_active, sort_order)
        `,
          { count: 'exact' }
        )

      // Apply Search
      if (params.q?.trim()) {
        query = query.ilike('name', `%${params.q.trim()}%`)
      }

      // Apply Group Filter
      if (params.group) {
        query = query.eq('group_id', params.group)
      }

      // Apply Category Filter
      if (params.category) {
        query = query.eq('category_id', params.category)
      }

      // Apply Brand Filter
      if (params.brand) {
        query = query.eq('brand_id', params.brand)
      }

      // Apply Special Quick Filters
      if (params.filter === 'megh_only') {
        query = query.eq('is_megh_brand', true)
      } else if (params.filter === 'needs_review') {
        query = query.eq('needs_review', true)
      } else if (params.filter === 'inactive') {
        query = query.eq('is_active', false)
      } else if (params.filter === 'featured') {
        query = query.eq('is_featured', true)
      } else if (params.filter === 'no_image') {
        query = query.or('images.is.null,images.eq.{}')
      }

      const { data: products, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to)

      if (!error && products && products.length > 0) {
        totalCount = count || products.length
        normalizedProducts = products.map((p) => {
          const raw = p as Record<string, unknown>
          return {
            ...raw,
            brand: Array.isArray(raw.brand)
              ? raw.brand[0] || null
              : (raw.brand as { id: string; name: string } | null),
            category: Array.isArray(raw.category)
              ? raw.category[0] || null
              : (raw.category as { id: string; name: string } | null),
            product_group: Array.isArray(raw.product_group)
              ? raw.product_group[0] || null
              : (raw.product_group as { id: string; name: string } | null),
          } as ProductTableRow
        })
      }
    } catch {
      // Fallback handled below
    }
  }

  if (normalizedProducts.length === 0) {
    let filtered = local.products
    if (params.q?.trim()) {
      const q = params.q.trim().toLowerCase()
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(q))
    }
    if (params.group) {
      filtered = filtered.filter((p) => p.group_id === params.group)
    }
    if (params.category) {
      filtered = filtered.filter((p) => p.category_id === params.category)
    }
    if (params.brand) {
      filtered = filtered.filter((p) => p.brand_id === params.brand)
    }
    if (params.filter === 'megh_only') {
      filtered = filtered.filter((p) => p.is_megh_brand)
    } else if (params.filter === 'needs_review') {
      filtered = filtered.filter((p) => p.needs_review)
    } else if (params.filter === 'featured') {
      filtered = filtered.filter((p) => p.is_featured)
    } else if (params.filter === 'no_image') {
      filtered = filtered.filter((p) => !p.images || p.images.length === 0)
    }

    totalCount = filtered.length
    normalizedProducts = filtered.slice(from, to + 1).map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      is_active: p.is_active,
      is_featured: p.is_featured,
      is_new: p.is_new,
      needs_review: p.needs_review,
      is_megh_brand: p.is_megh_brand,
      images: p.images,
      catalogue_pages: p.catalogue_pages,
      brand: p.brand ? { id: p.brand.id, name: p.brand.name } : null,
      category: p.category ? { id: p.category.id, name: p.category.name } : null,
      product_group: p.group ? { id: p.group.id, name: p.group.name } : null,
      product_packs: (p.packs || []).map((pk) => ({
        id: pk.id,
        sku: pk.sku,
        pack_size: pk.pack_size,
        units_per_carton: pk.units_per_carton,
        carton_spec_raw: pk.carton_spec_raw,
        pack_size_grams: pk.pack_size_grams,
        pack_size_ml: pk.pack_size_ml,
        is_active: pk.is_active,
        sort_order: pk.sort_order,
      })),
    })) as unknown as ProductTableRow[]
  }

  return (
    <ProductsTableClient
      products={normalizedProducts}
      totalCount={totalCount}
      page={page}
      pageSize={pageSize}
      brands={brandsData}
      categories={categoriesData}
      groups={groupsData}
    />
  )
}
