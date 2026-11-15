'use server'

import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'
import { z } from 'zod'
import { requireAdmin, revalidateCatalog } from '@/lib/admin-auth'
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/admin'
import { slugify } from '@/lib/slug'

const csvRow = z.object({
  sku: z.string().trim().min(3),
  product_slug: z.string().trim().min(1),
  product_name: z.string().trim().min(1),
  brand: z.string().trim().default(''),
  is_megh_brand: z.string().default('FALSE'),
  product_group: z.string().trim().min(1),
  category: z.string().trim().min(1),
  pack_size: z.string().default(''),
  units_per_carton: z.string().default(''),
  carton_spec_raw: z.string().default(''),
  pack_size_grams: z.string().default(''),
  pack_size_ml: z.string().default(''),
  india_mrp_pack: z.string().default('FALSE'),
  catalogue_sections: z.string().default(''),
  catalogue_pages: z.string().default(''),
  original_listing: z.string().default(''),
  review_flags: z.string().default(''),
})

type Row = z.infer<typeof csvRow>

const isTrue = (v: string) => v.trim().toUpperCase() === 'TRUE'
const toNum = (v: string) => {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : null
}
const chunk = <T,>(a: T[], n = 200) =>
  Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n))

async function fetchAll<T>(
  db: ReturnType<typeof createAdminClient>,
  table: string,
  cols: string
): Promise<T[]> {
  const out: T[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from(table).select(cols).range(from, from + 999)
    if (error) throw error
    out.push(...((data ?? []) as T[]))
    if (!data || data.length < 1000) break
  }
  return out
}

export interface ImportSummary {
  rows: number
  newProducts: number
  existingProducts: number
  newPacks: number
  existingPacks: number
  brands: number
  categories: number
}

export type ImportResult =
  | { ok: true; dryRun: boolean; summary: ImportSummary }
  | { ok: false; errors: { line: number; message: string }[] }

export async function importCatalogue(input: {
  rows: unknown[]
  dryRun: boolean
  overwrite: boolean
  filename: string
}): Promise<ImportResult> {
  const { user } = await requireAdmin()
  const errors: { line: number; message: string }[] = []
  const rows: Row[] = []

  input.rows.forEach((r, i) => {
    const p = csvRow.safeParse(r)
    if (p.success) {
      rows.push(p.data)
    } else {
      errors.push({
        line: i + 2,
        message: p.error.issues.map((x) => `${x.path.join('.')}: ${x.message}`).join('; '),
      })
    }
  })

  const seen = new Set<string>()
  for (const r of rows) {
    if (seen.has(r.sku)) {
      errors.push({ line: 0, message: `Duplicate SKU in file: ${r.sku}` })
    }
    seen.add(r.sku)
  }

  if (errors.length) {
    return { ok: false, errors: errors.slice(0, 100) }
  }

  if (!isSupabaseConfigured()) {
    const productSlugs = [...new Set(rows.map((r) => r.product_slug))]
    const summary: ImportSummary = {
      rows: rows.length,
      newProducts: productSlugs.length,
      existingProducts: 0,
      newPacks: rows.length,
      existingPacks: 0,
      brands: new Set(rows.map((r) => r.brand).filter(Boolean)).size,
      categories: new Set(rows.map((r) => r.category)).size,
    }
    revalidateCatalog()
    return { ok: true, dryRun: input.dryRun, summary }
  }

  const db = createAdminClient()
  const exProducts = new Set(
    (await fetchAll<{ slug: string }>(db, 'products', 'slug')).map((x) => x.slug)
  )
  const exSkus = new Set(
    (await fetchAll<{ sku: string }>(db, 'product_packs', 'sku')).map((x) => x.sku)
  )
  const productSlugs = [...new Set(rows.map((r) => r.product_slug))]

  const summary: ImportSummary = {
    rows: rows.length,
    newProducts: productSlugs.filter((s) => !exProducts.has(s)).length,
    existingProducts: productSlugs.filter((s) => exProducts.has(s)).length,
    newPacks: rows.filter((r) => !exSkus.has(r.sku)).length,
    existingPacks: rows.filter((r) => exSkus.has(r.sku)).length,
    brands: new Set(rows.map((r) => r.brand).filter(Boolean)).size,
    categories: new Set(rows.map((r) => r.category)).size,
  }

  if (input.dryRun) {
    return { ok: true, dryRun: true, summary }
  }

  // 1) Taxonomy (never overwrites owner edits)
  const groupNames = [...new Set(rows.map((r) => r.product_group))]
  const catNames = [...new Set(rows.map((r) => r.category))]
  const brandRows = [...new Map(rows.filter((r) => r.brand).map((r) => [r.brand, r])).values()]

  await db
    .from('product_groups')
    .upsert(
      groupNames.map((n, i) => ({ name: n, slug: slugify(n), sort_order: 50 + i })),
      { onConflict: 'slug', ignoreDuplicates: true }
    )

  await db
    .from('categories')
    .upsert(
      catNames.map((n) => ({ name: n, slug: slugify(n) })),
      { onConflict: 'slug', ignoreDuplicates: true }
    )

  await db
    .from('brands')
    .upsert(
      brandRows.map((r) => ({
        name: r.brand,
        slug: slugify(r.brand),
        is_megh: isTrue(r.is_megh_brand),
      })),
      { onConflict: 'slug', ignoreDuplicates: true }
    )

  const groups = new Map(
    (await fetchAll<{ id: string; name: string }>(db, 'product_groups', 'id,name')).map((x) => [
      x.name,
      x.id,
    ])
  )
  const cats = new Map(
    (await fetchAll<{ id: string; name: string }>(db, 'categories', 'id,name')).map((x) => [
      x.name,
      x.id,
    ])
  )
  const brands = new Map(
    (await fetchAll<{ id: string; name: string }>(db, 'brands', 'id,name')).map((x) => [
      x.name,
      x.id,
    ])
  )

  // 2) Products (one per product_slug)
  const bySlug = new Map<string, Row[]>()
  rows.forEach((r) => bySlug.set(r.product_slug, [...(bySlug.get(r.product_slug) ?? []), r]))

  const productPayload = [...bySlug.entries()].map(([slug, rs]) => ({
    slug,
    name: rs[0].product_name,
    brand_id: rs[0].brand ? brands.get(rs[0].brand) ?? null : null,
    category_id: cats.get(rs[0].category) ?? null,
    group_id: groups.get(rs[0].product_group) ?? null,
    is_megh_brand: isTrue(rs[0].is_megh_brand),
    catalogue_pages: [
      ...new Set(
        rs.flatMap((r) =>
          r.catalogue_pages
            .split(',')
            .map((x) => x.trim())
            .filter(Boolean)
        )
      ),
    ].join(', '),
    needs_review:
      rs.some((r) => r.review_flags.trim() !== '') || rs[0].category === 'Uncategorised',
    is_active: true,
  }))

  for (const part of chunk(productPayload)) {
    const { error } = await db
      .from('products')
      .upsert(part, { onConflict: 'slug', ignoreDuplicates: !input.overwrite })
    if (error) {
      return { ok: false, errors: [{ line: 0, message: `Products: ${error.message}` }] }
    }
  }

  const idBySlug = new Map(
    (await fetchAll<{ id: string; slug: string }>(db, 'products', 'id,slug')).map((x) => [
      x.slug,
      x.id,
    ])
  )

  // 3) Packs (one per SKU)
  const packPayload = rows.map((r, i) => ({
    product_id: idBySlug.get(r.product_slug)!,
    sku: r.sku,
    pack_size: r.pack_size || null,
    units_per_carton:
      toNum(r.units_per_carton) !== null ? Math.round(toNum(r.units_per_carton)!) : null,
    carton_spec_raw: r.carton_spec_raw || null,
    pack_size_grams: toNum(r.pack_size_grams),
    pack_size_ml: toNum(r.pack_size_ml),
    india_mrp_pack: isTrue(r.india_mrp_pack),
    original_listing: r.original_listing || null,
    review_flags: r.review_flags
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean),
    sort_order: i,
  }))

  for (const part of chunk(packPayload)) {
    const { error } = await db
      .from('product_packs')
      .upsert(part, { onConflict: 'sku', ignoreDuplicates: !input.overwrite })
    if (error) {
      return { ok: false, errors: [{ line: 0, message: `Packs: ${error.message}` }] }
    }
  }

  await db.from('import_jobs').insert({
    filename: input.filename,
    total_rows: rows.length,
    created_products: summary.newProducts,
    updated_products: input.overwrite ? summary.existingProducts : 0,
    created_packs: summary.newPacks,
    updated_packs: input.overwrite ? summary.existingPacks : 0,
    errors: [],
    created_by: (user as { id?: string })?.id || 'dev-admin',
  })

  revalidateCatalog()
  return { ok: true, dryRun: false, summary }
}

export async function importFromLocalFile(dryRun = false, overwrite = false) {
  const filePath = path.join(process.cwd(), 'data', 'megh_products_clean.csv')
  if (!fs.existsSync(filePath)) {
    return { ok: false as const, errors: [{ line: 0, message: 'data/megh_products_clean.csv not found' }] }
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const parsed = Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.replace(/^\uFEFF/, '').trim(), // strip UTF-8 BOM
  })

  if (parsed.errors && parsed.errors.length > 0) {
    return {
      ok: false as const,
      errors: parsed.errors.map((e) => ({ line: e.row || 0, message: e.message })),
    }
  }

  return importCatalogue({
    rows: parsed.data,
    dryRun,
    overwrite,
    filename: 'data/megh_products_clean.csv',
  })
}
