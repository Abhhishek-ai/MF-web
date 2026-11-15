import { publicClient, isSupabaseConfigured } from '@/lib/supabase/public'
import { getSettings } from '@/lib/settings'
import { getLocalCatalog } from './local-data'
import type {
  ProductGroup,
  Category,
  Brand,
  Product,
} from './types'

export async function getGroups(): Promise<ProductGroup[]> {
  if (!isSupabaseConfigured()) {
    return getLocalCatalog().groups
  }
  try {
    const supabase = publicClient()
    const { data, error } = await supabase
      .from('product_groups')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
    if (error || !data || data.length === 0) {
      return getLocalCatalog().groups
    }
    return data
  } catch {
    return getLocalCatalog().groups
  }
}

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) {
    return getLocalCatalog().categories
  }
  try {
    const supabase = publicClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*, group:product_groups(*)')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
    if (error || !data || data.length === 0) {
      return getLocalCatalog().categories
    }
    return data
  } catch {
    return getLocalCatalog().categories
  }
}

export async function getBrands(): Promise<Brand[]> {
  const localBrands = getLocalCatalog().brands
  if (!isSupabaseConfigured()) {
    return localBrands
  }
  try {
    const settings = await getSettings()
    const supabase = publicClient()
    let query = supabase
      .from('brands')
      .select('*')
      .order('sort_order', { ascending: true })

    if (settings.features.show_partner_brands) {
      query = query.or('is_public.eq.true,is_megh.eq.true')
    } else {
      query = query.eq('is_megh', true)
    }

    const { data, error } = await query
    if (error || !data || data.length === 0) {
      return settings.features.show_partner_brands
        ? localBrands
        : localBrands.filter((b) => b.is_megh)
    }
    return data
  } catch {
    return localBrands
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const local = getLocalCatalog().products.find((p) => p.slug === slug && p.is_active)
  if (!isSupabaseConfigured()) {
    return local || null
  }
  try {
    const supabase = publicClient()
    const { data, error } = await supabase
      .from('products')
      .select(
        '*, brand:brands(*), category:categories(*), group:product_groups(*), packs:product_packs(*)'
      )
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return local || null
    }

    if (data.brand && !data.brand.is_public && !data.brand.is_megh) {
      data.brand = null
    }

    if (data.packs) {
      data.packs = data.packs
        .filter((p: { is_active: boolean }) => p.is_active)
        .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
    }

    return data as Product
  } catch {
    return local || null
  }
}

export async function getFeaturedProducts(limit = 12): Promise<Product[]> {
  const localFeatured = getLocalCatalog()
    .products.filter((p) => p.is_active && p.is_featured)
    .slice(0, limit)
  if (!isSupabaseConfigured()) {
    return localFeatured
  }
  try {
    const supabase = publicClient()
    const { data, error } = await supabase
      .from('products')
      .select(
        '*, brand:brands(*), category:categories(*), group:product_groups(*), packs:product_packs(*)'
      )
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error || !data || data.length === 0) {
      return localFeatured
    }

    return (data ?? []) as Product[]
  } catch {
    return localFeatured
  }
}

export async function getAllProducts(): Promise<Product[]> {
  const localActive = getLocalCatalog().products.filter((p) => p.is_active)
  if (!isSupabaseConfigured()) {
    return localActive
  }
  try {
    const supabase = publicClient()
    const { data, error } = await supabase
      .from('products')
      .select(
        '*, brand:brands(*), category:categories(*), group:product_groups(*), packs:product_packs(*)'
      )
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error || !data || data.length === 0) {
      return localActive
    }
    return data as Product[]
  } catch {
    return localActive
  }
}

export async function getProductCount(): Promise<number> {
  const localCount = getLocalCatalog().products.filter((p) => p.is_active).length
  if (!isSupabaseConfigured()) {
    return localCount
  }
  try {
    const supabase = publicClient()
    const { count, error } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)

    if (error || count === null || count === 0) {
      return localCount
    }
    return count
  } catch {
    return localCount
  }
}

export async function getRecentProductSlugs(limit = 200): Promise<string[]> {
  const localSlugs = getLocalCatalog()
    .products.filter((p) => p.is_active)
    .slice(0, limit)
    .map((p) => p.slug)
  if (!isSupabaseConfigured()) {
    return localSlugs
  }
  try {
    const supabase = publicClient()
    const { data, error } = await supabase
      .from('products')
      .select('slug')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (error || !data || data.length === 0) {
      return localSlugs
    }

    return (data ?? []).map((row) => row.slug)
  } catch {
    return localSlugs
  }
}

export async function getRelated(product: Product, limit = 4): Promise<Product[]> {
  const localRelated = getLocalCatalog()
    .products.filter(
      (p) =>
        p.is_active &&
        p.id !== product.id &&
        (p.category_id === product.category_id || p.group_id === product.group_id)
    )
    .slice(0, limit)
  if (!isSupabaseConfigured()) {
    return localRelated
  }
  try {
    const supabase = publicClient()
    let query = supabase
      .from('products')
      .select(
        '*, brand:brands(*), category:categories(*), group:product_groups(*), packs:product_packs(*)'
      )
      .eq('is_active', true)
      .neq('id', product.id)

    if (product.category_id) {
      query = query.eq('category_id', product.category_id)
    } else if (product.group_id) {
      query = query.eq('group_id', product.group_id)
    }

    const { data, error } = await query.limit(limit)
    if (error || !data || data.length === 0) {
      return localRelated
    }
    return (data ?? []) as Product[]
  } catch {
    return localRelated
  }
}

export async function getGroupBySlug(slug: string): Promise<ProductGroup | undefined> {
  const local = getLocalCatalog().groups.find((g) => g.slug === slug)
  if (!isSupabaseConfigured()) {
    return local
  }
  try {
    const supabase = publicClient()
    const { data, error } = await supabase
      .from('product_groups')
      .select('*')
      .eq('slug', slug)
      .single()
    if (error || !data) return local
    return data as ProductGroup
  } catch {
    return local
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const local = getLocalCatalog().categories.find((c) => c.slug === slug)
  if (!isSupabaseConfigured()) {
    return local
  }
  try {
    const supabase = publicClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*, group:product_groups(*)')
      .eq('slug', slug)
      .single()
    if (error || !data) return local
    return data as Category
  } catch {
    return local
  }
}

export async function getBrandBySlug(slug: string): Promise<Brand | undefined> {
  const local = getLocalCatalog().brands.find((b) => b.slug === slug)
  if (!isSupabaseConfigured()) {
    return local
  }
  try {
    const supabase = publicClient()
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('slug', slug)
      .single()
    if (error || !data) return local
    return data as Brand
  } catch {
    return local
  }
}

export async function getCategoriesByGroup(groupId: string): Promise<Category[]> {
  const local = getLocalCatalog().categories.filter((c) => c.group_id === groupId)
  if (!isSupabaseConfigured()) {
    return local
  }
  try {
    const supabase = publicClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('group_id', groupId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
    if (error || !data || data.length === 0) return local
    return data as Category[]
  } catch {
    return local
  }
}

export async function getProductsByGroup(groupId: string, limit = 36): Promise<Product[]> {
  const local = getLocalCatalog().products.filter((p) => p.group_id === groupId).slice(0, limit)
  if (!isSupabaseConfigured()) {
    return local
  }
  try {
    const supabase = publicClient()
    const { data, error } = await supabase
      .from('products')
      .select(
        '*, brand:brands(*), category:categories(*), group:product_groups(*), packs:product_packs(*)'
      )
      .eq('group_id', groupId)
      .eq('is_active', true)
      .order('name', { ascending: true })
      .limit(limit)
    if (error || !data || data.length === 0) return local
    return data as Product[]
  } catch {
    return local
  }
}

export async function getProductsByCategory(categoryId: string, limit = 48): Promise<Product[]> {
  const local = getLocalCatalog().products.filter((p) => p.category_id === categoryId).slice(0, limit)
  if (!isSupabaseConfigured()) {
    return local
  }
  try {
    const supabase = publicClient()
    const { data, error } = await supabase
      .from('products')
      .select(
        '*, brand:brands(*), category:categories(*), group:product_groups(*), packs:product_packs(*)'
      )
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('name', { ascending: true })
      .limit(limit)
    if (error || !data || data.length === 0) return local
    return data as Product[]
  } catch {
    return local
  }
}

export async function getProductsByBrand(brandId: string, limit = 48): Promise<Product[]> {
  const local = getLocalCatalog().products.filter((p) => p.brand_id === brandId).slice(0, limit)
  if (!isSupabaseConfigured()) {
    return local
  }
  try {
    const supabase = publicClient()
    const { data, error } = await supabase
      .from('products')
      .select(
        '*, brand:brands(*), category:categories(*), group:product_groups(*), packs:product_packs(*)'
      )
      .eq('brand_id', brandId)
      .eq('is_active', true)
      .order('name', { ascending: true })
      .limit(limit)
    if (error || !data || data.length === 0) return local
    return data as Product[]
  } catch {
    return local
  }
}

export async function getMeghBrandProducts(limit = 32): Promise<Product[]> {
  const local = getLocalCatalog().products.filter((p) => p.is_megh_brand).slice(0, limit)
  if (!isSupabaseConfigured()) {
    return local
  }
  try {
    const supabase = publicClient()
    const { data, error } = await supabase
      .from('products')
      .select(
        '*, brand:brands(*), category:categories(*), group:product_groups(*), packs:product_packs(*)'
      )
      .eq('is_megh_brand', true)
      .eq('is_active', true)
      .order('name', { ascending: true })
      .limit(limit)
    if (error || !data || data.length === 0) return local
    return data as Product[]
  } catch {
    return local
  }
}
