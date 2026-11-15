'use server'

import { z } from 'zod'
import { requireAdmin, revalidateCatalog } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseConfigured } from '@/lib/supabase/public'
import {
  updateLocalProductFlag,
  duplicateLocalProduct,
  deleteLocalProduct,
  saveLocalProduct,
} from '@/lib/local-data'
import { slugify } from '@/lib/slug'

const packSchema = z.object({
  id: z.string().optional(),
  sku: z.string().trim().min(3),
  pack_size: z.string().nullable().optional(),
  units_per_carton: z.coerce.number().int().positive().nullable().optional(),
  carton_spec_raw: z.string().nullable().optional(),
  pack_size_grams: z.coerce.number().nullable().optional(),
  pack_size_ml: z.coerce.number().nullable().optional(),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().default(0),
})

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'Product name is required'),
  slug: z.string().trim().min(1, 'Slug is required'),
  brand_id: z.string().nullable().optional(),
  category_id: z.string().nullable().optional(),
  group_id: z.string().nullable().optional(),
  is_megh_brand: z.boolean().default(false),
  short_description: z.string().default(''),
  description_md: z.string().default(''),
  ingredients: z.string().nullable().optional(),
  shelf_life: z.string().nullable().optional(),
  hs_code: z.string().nullable().optional(),
  origin: z.string().default('India'),
  dietary_tags: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  catalogue_pages: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  is_new: z.boolean().default(false),
  needs_review: z.boolean().default(false),
  seo_title: z.string().nullable().optional(),
  seo_description: z.string().nullable().optional(),
  packs: z.array(packSchema).min(1, 'At least one pack SKU is required'),
})

export type ProductFormValues = z.infer<typeof productSchema>

export async function saveProduct(
  input: ProductFormValues
): Promise<{ ok: boolean; productId?: string; error?: string }> {
  await requireAdmin()
  const parsed = productSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join('; ') }
  }

  const { packs, ...productData } = parsed.data

  if (!isSupabaseConfigured()) {
    const res = saveLocalProduct(productData, packs)
    revalidateCatalog()
    return res
  }

  try {
    const db = createAdminClient()
    let productId = productData.id

    if (productId) {
      // Update existing product
      const { error } = await db
        .from('products')
        .update({
          ...productData,
          slug: slugify(productData.slug),
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId)

      if (error) return { ok: false, error: `Product update failed: ${error.message}` }
    } else {
      // Insert new product
      const { data: newProd, error } = await db
        .from('products')
        .insert({
          ...productData,
          slug: slugify(productData.slug),
        })
        .select('id')
        .single()

      if (error || !newProd) {
        return { ok: false, error: `Product insert failed: ${error?.message || 'Unknown error'}` }
      }
      productId = newProd.id
    }

    // Synchronize packs
    const { data: currentPacks } = await db
      .from('product_packs')
      .select('id')
      .eq('product_id', productId)

    const currentPackIds = new Set((currentPacks || []).map((p) => p.id))
    const incomingPackIds = new Set(packs.map((p) => p.id).filter(Boolean))

    const toDelete = [...currentPackIds].filter((id) => !incomingPackIds.has(id))
    if (toDelete.length > 0) {
      await db.from('product_packs').delete().in('id', toDelete)
    }

    for (let i = 0; i < packs.length; i++) {
      const pack = packs[i]
      const packPayload = {
        product_id: productId,
        sku: pack.sku.trim().toUpperCase(),
        pack_size: pack.pack_size || null,
        units_per_carton: pack.units_per_carton || null,
        carton_spec_raw: pack.carton_spec_raw || null,
        pack_size_grams: pack.pack_size_grams || null,
        pack_size_ml: pack.pack_size_ml || null,
        is_active: pack.is_active,
        sort_order: i,
      }

      if (pack.id && currentPackIds.has(pack.id)) {
        await db.from('product_packs').update(packPayload).eq('id', pack.id)
      } else {
        await db.from('product_packs').insert(packPayload)
      }
    }

    revalidateCatalog()
    return { ok: true, productId }
  } catch {
    const res = saveLocalProduct(productData, packs)
    revalidateCatalog()
    return res
  }
}

const ALLOWED_FLAGS = ['is_active', 'is_featured', 'is_new', 'needs_review'] as const
type AllowedFlag = (typeof ALLOWED_FLAGS)[number]

export async function toggleProductFlag(id: string, flag: AllowedFlag, value: boolean) {
  await requireAdmin()
  if (!ALLOWED_FLAGS.includes(flag)) {
    return { ok: false, error: 'Invalid flag' }
  }

  if (!isSupabaseConfigured()) {
    updateLocalProductFlag(id, flag, value)
    revalidateCatalog()
    return { ok: true }
  }

  try {
    const db = createAdminClient()
    const { error } = await db
      .from('products')
      .update({ [flag]: value, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      updateLocalProductFlag(id, flag, value)
    }
    revalidateCatalog()
    return { ok: true }
  } catch {
    updateLocalProductFlag(id, flag, value)
    revalidateCatalog()
    return { ok: true }
  }
}

export async function duplicateProduct(
  id: string
): Promise<{ ok: boolean; newProductId?: string; error?: string }> {
  await requireAdmin()

  if (!isSupabaseConfigured()) {
    const res = duplicateLocalProduct(id)
    revalidateCatalog()
    return res
  }

  try {
    const db = createAdminClient()
    const { data: prod, error } = await db
      .from('products')
      .select('*, product_packs(*)')
      .eq('id', id)
      .single()

    if (error || !prod) {
      const res = duplicateLocalProduct(id)
      revalidateCatalog()
      return res
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const newSlug = `${prod.slug}-copy-${randomSuffix}`
    const newName = `${prod.name} (Copy)`

    const { data: newProd, error: insertError } = await db
      .from('products')
      .insert({
        name: newName,
        slug: newSlug,
        brand_id: prod.brand_id,
        category_id: prod.category_id,
        group_id: prod.group_id,
        is_megh_brand: prod.is_megh_brand,
        short_description: prod.short_description,
        description_md: prod.description_md,
        ingredients: prod.ingredients,
        shelf_life: prod.shelf_life,
        hs_code: prod.hs_code,
        origin: prod.origin,
        dietary_tags: prod.dietary_tags,
        images: prod.images,
        catalogue_pages: prod.catalogue_pages,
        is_active: false,
        is_featured: false,
        is_new: true,
        needs_review: false,
      })
      .select('id')
      .single()

    if (insertError || !newProd) {
      const res = duplicateLocalProduct(id)
      revalidateCatalog()
      return res
    }

    const packs = (
      (prod.product_packs as Array<{
        sku: string
        pack_size: string | null
        units_per_carton: number | null
        carton_spec_raw: string | null
        pack_size_grams: number | null
        pack_size_ml: number | null
      }>) || []
    ).map((p, idx: number) => ({
      product_id: newProd.id,
      sku: `${p.sku}-CP${randomSuffix}-${idx + 1}`,
      pack_size: p.pack_size,
      units_per_carton: p.units_per_carton,
      carton_spec_raw: p.carton_spec_raw,
      pack_size_grams: p.pack_size_grams,
      pack_size_ml: p.pack_size_ml,
      is_active: true,
      sort_order: idx,
    }))

    if (packs.length > 0) {
      await db.from('product_packs').insert(packs)
    }

    revalidateCatalog()
    return { ok: true, newProductId: newProd.id }
  } catch {
    const res = duplicateLocalProduct(id)
    revalidateCatalog()
    return res
  }
}

export async function deleteProduct(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin()

  if (!isSupabaseConfigured()) {
    deleteLocalProduct(id)
    revalidateCatalog()
    return { ok: true }
  }

  try {
    const db = createAdminClient()
    const { data: prod } = await db.from('products').select('images').eq('id', id).single()

    if (prod?.images && prod.images.length > 0) {
      const paths = prod.images
        .map((url: string) => url.split('/product-images/')[1])
        .filter(Boolean)
      if (paths.length > 0) {
        await db.storage.from('product-images').remove(paths)
      }
    }

    const { error } = await db.from('products').delete().eq('id', id)
    if (error) {
      deleteLocalProduct(id)
    }

    revalidateCatalog()
    return { ok: true }
  } catch {
    deleteLocalProduct(id)
    revalidateCatalog()
    return { ok: true }
  }
}

export type BulkAction =
  | { type: 'activate' }
  | { type: 'deactivate' }
  | { type: 'set_category'; categoryId: string }
  | { type: 'set_group'; groupId: string }

export async function bulkUpdateProducts(
  ids: string[],
  action: BulkAction
): Promise<{ ok: boolean; count: number; error?: string }> {
  await requireAdmin()
  if (!ids.length) return { ok: true, count: 0 }

  if (!isSupabaseConfigured()) {
    for (const id of ids) {
      if (action.type === 'activate') updateLocalProductFlag(id, 'is_active', true)
      if (action.type === 'deactivate') updateLocalProductFlag(id, 'is_active', false)
    }
    revalidateCatalog()
    return { ok: true, count: ids.length }
  }

  try {
    const db = createAdminClient()
    let updatePayload: Record<string, unknown> = {}

    if (action.type === 'activate') {
      updatePayload = { is_active: true }
    } else if (action.type === 'deactivate') {
      updatePayload = { is_active: false }
    } else if (action.type === 'set_category') {
      updatePayload = { category_id: action.categoryId }
    } else if (action.type === 'set_group') {
      updatePayload = { group_id: action.groupId }
    }

    updatePayload.updated_at = new Date().toISOString()

    const { error } = await db.from('products').update(updatePayload).in('id', ids)
    if (error) {
      for (const id of ids) {
        if (action.type === 'activate') updateLocalProductFlag(id, 'is_active', true)
        if (action.type === 'deactivate') updateLocalProductFlag(id, 'is_active', false)
      }
    }

    revalidateCatalog()
    return { ok: true, count: ids.length }
  } catch {
    for (const id of ids) {
      if (action.type === 'activate') updateLocalProductFlag(id, 'is_active', true)
      if (action.type === 'deactivate') updateLocalProductFlag(id, 'is_active', false)
    }
    revalidateCatalog()
    return { ok: true, count: ids.length }
  }
}

export async function getNextSkuNumber(): Promise<string> {
  await requireAdmin()

  if (!isSupabaseConfigured()) {
    return `MF-${Math.floor(1000 + Math.random() * 9000)}`
  }

  try {
    const db = createAdminClient()
    const { data } = await db
      .from('product_packs')
      .select('sku')
      .ilike('sku', 'MF-%')
      .order('sku', { ascending: false })
      .limit(1)

    if (!data || !data.length) return 'MF-0001'
    const match = data[0].sku.match(/MF-(\d+)/i)
    if (!match) return 'MF-0001'
    const next = parseInt(match[1], 10) + 1
    return `MF-${next.toString().padStart(4, '0')}`
  } catch {
    return `MF-${Math.floor(1000 + Math.random() * 9000)}`
  }
}

export async function attachProductImageByIdentifier(identifier: string, imageUrl: string) {
  await requireAdmin()
  const cleanId = identifier.trim()

  if (!isSupabaseConfigured()) {
    return { ok: true, productId: cleanId, productName: cleanId }
  }

  try {
    const db = createAdminClient()

    // 1. Try matching by pack SKU
    const { data: pack } = await db
      .from('product_packs')
      .select('product_id, products(id, name, slug)')
      .ilike('sku', cleanId)
      .maybeSingle()

    let productId = pack?.product_id
    let productName: string | undefined = undefined
    if (pack && typeof pack === 'object' && 'products' in pack) {
      const pRecord = pack.products as { name?: string } | null
      productName = pRecord?.name
    }

    // 2. If not found by SKU, try matching by product slug
    if (!productId) {
      const { data: prod } = await db
        .from('products')
        .select('id, name, slug')
        .ilike('slug', cleanId)
        .maybeSingle()
      if (prod) {
        productId = prod.id
        productName = prod.name
      }
    }

    if (!productId) {
      return { ok: false, error: `No product or SKU found matching "${identifier}"` }
    }

    // 3. Fetch current images of product
    const { data: prodData } = await db
      .from('products')
      .select('images')
      .eq('id', productId)
      .single()

    const currentImages = prodData?.images || []
    if (!currentImages.includes(imageUrl)) {
      const updatedImages = [...currentImages, imageUrl]
      await db.from('products').update({ images: updatedImages }).eq('id', productId)
    }

    revalidateCatalog()
    return { ok: true, productId, productName }
  } catch {
    return { ok: true, productId: cleanId, productName: cleanId }
  }
}
