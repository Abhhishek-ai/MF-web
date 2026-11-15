'use server'

import { z } from 'zod'
import { requireAdmin, revalidateCatalog } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseConfigured } from '@/lib/supabase/public'
import { slugify } from '@/lib/slug'

// ===== PRODUCT GROUPS =====
const groupSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'Group name is required'),
  slug: z.string().trim().optional(),
  description: z.string().default(''),
  image_url: z.string().nullable().optional(),
  sort_order: z.coerce.number().default(0),
  is_active: z.boolean().default(true),
})

export async function saveGroup(input: z.infer<typeof groupSchema>) {
  await requireAdmin()
  const parsed = groupSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join('; ') }
  }

  if (!isSupabaseConfigured()) {
    revalidateCatalog()
    return { ok: true }
  }

  const { id, name, description, image_url, sort_order, is_active } = parsed.data
  const slug = parsed.data.slug ? slugify(parsed.data.slug) : slugify(name)
  const db = createAdminClient()

  if (id) {
    const { error } = await db
      .from('product_groups')
      .update({ name, slug, description, image_url, sort_order, is_active })
      .eq('id', id)
    if (error) return { ok: false, error: error.message }
  } else {
    const { error } = await db
      .from('product_groups')
      .insert({ name, slug, description, image_url, sort_order, is_active })
    if (error) return { ok: false, error: error.message }
  }

  revalidateCatalog()
  return { ok: true }
}

export async function deleteGroup(id: string) {
  await requireAdmin()
  if (!isSupabaseConfigured()) {
    revalidateCatalog()
    return { ok: true }
  }
  const db = createAdminClient()
  const { error } = await db.from('product_groups').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidateCatalog()
  return { ok: true }
}

// ===== CATEGORIES =====
const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'Category name is required'),
  slug: z.string().trim().optional(),
  group_id: z.string().nullable().optional(),
  description: z.string().default(''),
  image_url: z.string().nullable().optional(),
  sort_order: z.coerce.number().default(0),
  is_active: z.boolean().default(true),
})

export async function saveCategory(input: z.infer<typeof categorySchema>) {
  await requireAdmin()
  const parsed = categorySchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join('; ') }
  }

  if (!isSupabaseConfigured()) {
    revalidateCatalog()
    return { ok: true }
  }

  const { id, name, group_id, description, image_url, sort_order, is_active } = parsed.data
  const slug = parsed.data.slug ? slugify(parsed.data.slug) : slugify(name)
  const db = createAdminClient()

  if (id) {
    const { error } = await db
      .from('categories')
      .update({ name, slug, group_id, description, image_url, sort_order, is_active })
      .eq('id', id)
    if (error) return { ok: false, error: error.message }
  } else {
    const { error } = await db
      .from('categories')
      .insert({ name, slug, group_id, description, image_url, sort_order, is_active })
    if (error) return { ok: false, error: error.message }
  }

  revalidateCatalog()
  return { ok: true }
}

export async function mergeCategory(sourceCategoryId: string, targetCategoryId: string) {
  await requireAdmin()
  if (sourceCategoryId === targetCategoryId) {
    return { ok: false, error: 'Cannot merge a category into itself' }
  }

  if (!isSupabaseConfigured()) {
    revalidateCatalog()
    return { ok: true }
  }

  const db = createAdminClient()

  // 1. Move all products from source category to target category
  const { error: updateError } = await db
    .from('products')
    .update({ category_id: targetCategoryId, updated_at: new Date().toISOString() })
    .eq('category_id', sourceCategoryId)

  if (updateError) return { ok: false, error: updateError.message }

  // 2. Delete source category
  const { error: deleteError } = await db.from('categories').delete().eq('id', sourceCategoryId)
  if (deleteError) return { ok: false, error: deleteError.message }

  revalidateCatalog()
  return { ok: true }
}

export async function deleteCategory(id: string) {
  await requireAdmin()
  if (!isSupabaseConfigured()) {
    revalidateCatalog()
    return { ok: true }
  }
  const db = createAdminClient()
  const { error } = await db.from('categories').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidateCatalog()
  return { ok: true }
}

// ===== BRANDS =====
const brandSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'Brand name is required'),
  slug: z.string().trim().optional(),
  is_megh: z.boolean().default(false),
  is_public: z.boolean().default(true),
  logo_url: z.string().nullable().optional(),
  sort_order: z.coerce.number().default(0),
})

export async function saveBrand(input: z.infer<typeof brandSchema>) {
  await requireAdmin()
  const parsed = brandSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join('; ') }
  }

  if (!isSupabaseConfigured()) {
    revalidateCatalog()
    return { ok: true }
  }

  const { id, name, is_megh, is_public, logo_url, sort_order } = parsed.data
  const slug = parsed.data.slug ? slugify(parsed.data.slug) : slugify(name)
  const db = createAdminClient()

  if (id) {
    const { error } = await db
      .from('brands')
      .update({ name, slug, is_megh, is_public, logo_url, sort_order })
      .eq('id', id)
    if (error) return { ok: false, error: error.message }
  } else {
    const { error } = await db
      .from('brands')
      .insert({ name, slug, is_megh, is_public, logo_url, sort_order })
    if (error) return { ok: false, error: error.message }
  }

  revalidateCatalog()
  return { ok: true }
}

export async function toggleBrandPublic(brandId: string, isPublic: boolean) {
  await requireAdmin()
  if (!isSupabaseConfigured()) {
    revalidateCatalog()
    return { ok: true }
  }
  const db = createAdminClient()
  const { error } = await db.from('brands').update({ is_public: isPublic }).eq('id', brandId)
  if (error) return { ok: false, error: error.message }
  revalidateCatalog()
  return { ok: true }
}

export async function toggleBrandMegh(brandId: string, isMegh: boolean) {
  await requireAdmin()
  if (!isSupabaseConfigured()) {
    revalidateCatalog()
    return { ok: true }
  }
  const db = createAdminClient()
  const { error } = await db.from('brands').update({ is_megh: isMegh }).eq('id', brandId)
  if (error) return { ok: false, error: error.message }
  revalidateCatalog()
  return { ok: true }
}

export async function deleteBrand(id: string) {
  await requireAdmin()
  if (!isSupabaseConfigured()) {
    revalidateCatalog()
    return { ok: true }
  }
  const db = createAdminClient()
  const { error } = await db.from('brands').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidateCatalog()
  return { ok: true }
}
