import fs from 'fs'
import path from 'path'
import type { Product, ProductGroup, Category, Brand, ProductPack } from './types'
import type { IndexProduct } from './catalog/filter'
import { slugify } from './slug'

interface CsvRow {
  sku: string
  product_slug: string
  product_name: string
  brand: string
  is_megh_brand: string
  product_group: string
  category: string
  pack_size: string
  units_per_carton: string
  carton_spec_raw: string
  pack_size_grams: string
  pack_size_ml: string
  india_mrp_pack: string
  catalogue_sections: string
  catalogue_pages: string
  original_listing: string
  review_flags: string
}

const OVERRIDES_FILE = path.join(process.cwd(), 'data', 'local-overrides.json')

interface ProductOverrides {
  flags: Record<string, { is_active?: boolean; is_featured?: boolean; is_new?: boolean; needs_review?: boolean }>
  deleted: string[]
  duplicated: Product[]
  saved: Record<string, Product>
}

let cachedProducts: Product[] | null = null
let cachedIndex: IndexProduct[] | null = null
let lastLoadedMtime = -1

function loadOverrides(): ProductOverrides {
  try {
    if (fs.existsSync(OVERRIDES_FILE)) {
      const text = fs.readFileSync(OVERRIDES_FILE, 'utf8')
      const data = JSON.parse(text)
      return {
        flags: data.flags || {},
        deleted: Array.isArray(data.deleted) ? data.deleted : [],
        duplicated: Array.isArray(data.duplicated) ? data.duplicated : [],
        saved: data.saved || {},
      }
    }
  } catch (err) {
    console.error('Failed to load local overrides', err)
  }
  return { flags: {}, deleted: [], duplicated: [], saved: {} }
}

function saveOverrides(data: ProductOverrides) {
  try {
    const dir = path.dirname(OVERRIDES_FILE)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(OVERRIDES_FILE, JSON.stringify(data, null, 2), 'utf8')
  } catch (err) {
    console.error('Failed to save local overrides', err)
  }
}

function parseCsv(text: string): CsvRow[] {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  const header = lines[0].split(',')

  const rows: CsvRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    const cols = line.split(',')
    if (cols.length >= header.length) {
      rows.push({
        sku: cols[0],
        product_slug: cols[1],
        product_name: cols[2],
        brand: cols[3],
        is_megh_brand: cols[4],
        product_group: cols[5],
        category: cols[6],
        pack_size: cols[7],
        units_per_carton: cols[8],
        carton_spec_raw: cols[9],
        pack_size_grams: cols[10],
        pack_size_ml: cols[11],
        india_mrp_pack: cols[12],
        catalogue_sections: cols[13],
        catalogue_pages: cols[14],
        original_listing: cols[15],
        review_flags: cols[16] || '',
      })
    }
  }
  return rows
}

function loadCsvData(): CsvRow[] {
  try {
    const csvPath = path.join(process.cwd(), 'data', 'megh_products_clean.csv')
    if (fs.existsSync(csvPath)) {
      const content = fs.readFileSync(csvPath, 'utf8')
      return parseCsv(content)
    }
  } catch (err) {
    console.error('Failed to read CSV', err)
  }
  return []
}

export function getLocalCatalog(): {
  products: Product[]
  indexProducts: IndexProduct[]
  groups: ProductGroup[]
  categories: Category[]
  brands: Brand[]
} {
  const currentMtime = fs.existsSync(OVERRIDES_FILE) ? fs.statSync(OVERRIDES_FILE).mtimeMs : 0
  if (cachedProducts && cachedIndex && currentMtime === lastLoadedMtime) {
    const groupsMap = new Map<string, ProductGroup>()
    const categoriesMap = new Map<string, Category>()
    const brandsMap = new Map<string, Brand>()
    for (const p of cachedProducts) {
      if (p.group) groupsMap.set(p.group.slug, p.group)
      if (p.category) categoriesMap.set(p.category.slug, p.category)
      if (p.brand) brandsMap.set(p.brand.slug, p.brand)
    }
    return {
      products: cachedProducts,
      indexProducts: cachedIndex,
      groups: Array.from(groupsMap.values()),
      categories: Array.from(categoriesMap.values()),
      brands: Array.from(brandsMap.values()),
    }
  }

  const rows = loadCsvData()
  const productMap = new Map<string, Product>()
  const groupsMap = new Map<string, ProductGroup>()
  const categoriesMap = new Map<string, Category>()
  const brandsMap = new Map<string, Brand>()

  const categoryImages: Record<string, string> = {
    'pulses-dals': '/images/categories/pulses-dals.svg',
    'spices-seasonings': '/images/categories/spices-seasonings.svg',
    'flours-grains': '/images/categories/flours-grains.svg',
    'roasted-snacks-farsan': '/images/categories/roasted-snacks-farsan.svg',
    'namkeen-sev': '/images/categories/namkeen-sev.svg',
    'brassware-diyas': '/images/categories/brassware-diyas.svg',
    'incense-dhoop': '/images/categories/incense-dhoop.svg',
    'wooden-temples-decor': '/images/categories/wooden-temples-decor.svg',
    'metal-handicrafts': '/images/categories/metal-handicrafts.svg',
    'beverages': '/images/categories/beverages.svg',
    'biscuits-cookies': '/images/categories/biscuits-cookies.svg',
  }

  function resolveCategoryImage(slug: string): string {
    if (categoryImages[slug]) return categoryImages[slug]
    const s = slug.toLowerCase()
    if (s.includes('spice') || s.includes('seasoning') || s.includes('masala')) return '/images/categories/spices-seasonings.svg'
    if (s.includes('flour') || s.includes('grain') || s.includes('aata') || s.includes('rice') || s.includes('vermicelli') || s.includes('poha') || s.includes('mamra') || s.includes('oats')) return '/images/categories/flours-grains.svg'
    if (s.includes('snack') || s.includes('farsan') || s.includes('papad') || s.includes('wafer') || s.includes('bhakhri')) return '/images/categories/roasted-snacks-farsan.svg'
    if (s.includes('namkeen') || s.includes('sev') || s.includes('mukhvas')) return '/images/categories/namkeen-sev.svg'
    if (s.includes('biscuit') || s.includes('cookie') || s.includes('chocolate') || s.includes('sweet') || s.includes('mithai')) return '/images/categories/biscuits-cookies.svg'
    if (s.includes('beverage') || s.includes('tea') || s.includes('coffee') || s.includes('syrup') || s.includes('sarbat') || s.includes('energy') || s.includes('health')) return '/images/categories/beverages.svg'
    if (s.includes('pooja') || s.includes('incense') || s.includes('dhoop') || s.includes('festival')) return '/images/categories/incense-dhoop.svg'
    if (s.includes('temple') || s.includes('wooden') || s.includes('decor')) return '/images/categories/wooden-temples-decor.svg'
    if (s.includes('brass') || s.includes('diya')) return '/images/categories/brassware-diyas.svg'
    if (s.includes('handicraft') || s.includes('metal') || s.includes('kitchen') || s.includes('cradle') || s.includes('carrom') || s.includes('sports')) return '/images/categories/metal-handicrafts.svg'
    return '/images/categories/pulses-dals.svg'
  }

  const now = new Date().toISOString()

  for (const r of rows) {
    const groupSlug = slugify(r.product_group)
    const categorySlug = slugify(r.category)
    const brandSlug = slugify(r.brand)
    const isMegh = r.is_megh_brand.toUpperCase() === 'TRUE'

    if (!groupsMap.has(groupSlug)) {
      groupsMap.set(groupSlug, {
        id: groupSlug,
        name: r.product_group,
        slug: groupSlug,
        description: `Export quality ${r.product_group}`,
        image_url: null,
        sort_order: groupsMap.size + 1,
        is_active: true,
      })
    }

    if (!categoriesMap.has(categorySlug)) {
      categoriesMap.set(categorySlug, {
        id: categorySlug,
        name: r.category,
        slug: categorySlug,
        group_id: groupSlug,
        description: `Premium Indian ${r.category} for global export`,
        image_url: resolveCategoryImage(categorySlug),
        sort_order: categoriesMap.size + 1,
        is_active: true,
      })
    }

    if (!brandsMap.has(brandSlug)) {
      brandsMap.set(brandSlug, {
        id: brandSlug,
        name: r.brand,
        slug: brandSlug,
        is_megh: isMegh,
        is_public: true,
        logo_url: null,
        sort_order: brandsMap.size + 1,
      })
    }

    const pack: ProductPack = {
      id: r.sku,
      product_id: r.product_slug,
      sku: r.sku,
      pack_size: r.pack_size || null,
      units_per_carton: r.units_per_carton ? parseInt(r.units_per_carton, 10) : null,
      carton_spec_raw: r.carton_spec_raw || null,
      pack_size_grams: r.pack_size_grams ? parseFloat(r.pack_size_grams) : null,
      pack_size_ml: r.pack_size_ml ? parseFloat(r.pack_size_ml) : null,
      india_mrp_pack: r.india_mrp_pack.toUpperCase() === 'TRUE',
      original_listing: r.original_listing || null,
      review_flags: r.review_flags ? [r.review_flags] : [],
      is_active: true,
      sort_order: 1,
    }

    if (productMap.has(r.product_slug)) {
      const existing = productMap.get(r.product_slug)!
      existing.packs = existing.packs || []
      existing.packs.push(pack)
    } else {
      const coverImage = resolveCategoryImage(categorySlug)
      productMap.set(r.product_slug, {
        id: r.product_slug,
        slug: r.product_slug,
        name: r.product_name,
        brand_id: brandSlug,
        category_id: categorySlug,
        group_id: groupSlug,
        is_megh_brand: isMegh,
        short_description: `Export-grade ${r.product_name} packed for international sea transit.`,
        description_md: `High quality ${r.product_name}. Sourced from certified facilities in Gujarat, India. Full export documentation, barcode support, and container consolidation available.`,
        ingredients: null,
        shelf_life: '12 - 24 Months',
        hs_code: '0910.30',
        origin: 'India',
        dietary_tags: ['Vegetarian', 'Export Quality'],
        images: [coverImage],
        catalogue_pages: r.catalogue_pages || null,
        is_active: true,
        is_featured: isMegh || r.sku === 'MF-0020' || r.sku === 'MF-0021',
        is_new: false,
        needs_review: false,
        seo_title: `${r.product_name} | Megh Foods B2B Exporter`,
        seo_description: `Wholesale ${r.product_name} for container consolidation from Ahmedabad, India.`,
        created_at: now,
        updated_at: now,
        brand: brandsMap.get(brandSlug),
        category: categoriesMap.get(categorySlug),
        group: groupsMap.get(groupSlug),
        packs: [pack],
      })
    }
  }

  const overrides = loadOverrides()

  // 1. Apply saved products (custom edits)
  for (const [key, savedProd] of Object.entries(overrides.saved)) {
    productMap.set(key, savedProd)
  }

  // 2. Apply flag overrides (is_active, is_featured, is_new, needs_review)
  for (const [id, flags] of Object.entries(overrides.flags)) {
    for (const p of productMap.values()) {
      if (
        p.id === id ||
        p.slug === id ||
        p.packs?.some((pk) => pk.sku === id || pk.id === id)
      ) {
        Object.assign(p, flags)
      }
    }
  }

  // 3. Apply deletions
  for (const delId of overrides.deleted) {
    for (const [key, p] of productMap.entries()) {
      if (
        p.id === delId ||
        p.slug === delId ||
        p.packs?.some((pk) => pk.sku === delId || pk.id === delId)
      ) {
        productMap.delete(key)
      }
    }
  }

  // 4. Include duplicated products at top
  const duplicatedProds = (overrides.duplicated || []).filter(
    (dp) => !overrides.deleted.includes(dp.id) && !overrides.deleted.includes(dp.slug)
  )

  const products = [...duplicatedProds, ...Array.from(productMap.values())]
  const activeProducts = products.filter((p) => p.is_active)
  const indexProducts: IndexProduct[] = activeProducts.map((p) => ({
    slug: p.slug,
    name: p.name,
    is_megh_brand: p.is_megh_brand,
    is_featured: p.is_featured,
    images: p.images,
    created_at: p.created_at,
    brand: p.brand ? { name: p.brand.name, slug: p.brand.slug } : null,
    category: p.category ? { name: p.category.name, slug: p.category.slug } : null,
    group: p.group ? { name: p.group.name, slug: p.group.slug } : null,
    packs: (p.packs || []).map((pk) => ({
      sku: pk.sku,
      pack_size: pk.pack_size,
      units_per_carton: pk.units_per_carton,
      is_active: pk.is_active,
    })),
  }))

  cachedProducts = products
  cachedIndex = indexProducts
  lastLoadedMtime = currentMtime

  for (const p of products) {
    if (p.group) groupsMap.set(p.group.slug, p.group)
    if (p.category) categoriesMap.set(p.category.slug, p.category)
    if (p.brand) brandsMap.set(p.brand.slug, p.brand)
  }

  return {
    products,
    indexProducts,
    groups: Array.from(groupsMap.values()),
    categories: Array.from(categoriesMap.values()),
    brands: Array.from(brandsMap.values()),
  }
}

export function updateLocalProductFlag(id: string, flag: string, value: boolean): boolean {
  const overrides = loadOverrides()
  overrides.flags[id] = { ...(overrides.flags[id] || {}), [flag]: value }
  saveOverrides(overrides)

  cachedProducts = null
  cachedIndex = null
  lastLoadedMtime = -1
  return true
}

export function duplicateLocalProduct(id: string): { ok: boolean; newProductId?: string; error?: string } {
  const catalog = getLocalCatalog()
  const prod = catalog.products.find(
    (p) => p.id === id || p.slug === id || p.packs?.some((pk) => pk.sku === id)
  )
  if (!prod) return { ok: false, error: 'Product not found' }
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  const newSlug = `${prod.slug}-copy-${randomSuffix}`
  const newId = `local-${Date.now()}`

  const newPacks: ProductPack[] = (prod.packs || []).map((pk, idx) => ({
    ...pk,
    id: `${newId}-pack-${idx + 1}`,
    product_id: newId,
    sku: `${pk.sku}-CP${randomSuffix}-${idx + 1}`,
  }))

  const newProd: Product = {
    ...prod,
    id: newId,
    slug: newSlug,
    name: `${prod.name} (Copy)`,
    packs: newPacks,
    is_active: false,
    is_new: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const overrides = loadOverrides()
  overrides.duplicated.unshift(newProd)
  saveOverrides(overrides)

  cachedProducts = null
  cachedIndex = null
  lastLoadedMtime = -1
  return { ok: true, newProductId: newId }
}

export function deleteLocalProduct(id: string): { ok: boolean; error?: string } {
  const overrides = loadOverrides()
  if (!overrides.deleted.includes(id)) {
    overrides.deleted.push(id)
  }
  overrides.duplicated = overrides.duplicated.filter((p) => p.id !== id && p.slug !== id)
  delete overrides.saved[id]
  saveOverrides(overrides)

  cachedProducts = null
  cachedIndex = null
  lastLoadedMtime = -1
  return { ok: true }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function saveLocalProduct(data: any, packs: any[]): { ok: boolean; productId?: string; error?: string } {
  const catalog = getLocalCatalog()
  const slug = slugify(data.slug || data.name)
  const productPacks: ProductPack[] = packs.map((pk, i) => ({
    id: pk.id || `${slug}-${i + 1}`,
    product_id: slug,
    sku: pk.sku,
    pack_size: pk.pack_size || null,
    units_per_carton: pk.units_per_carton ? Number(pk.units_per_carton) : null,
    carton_spec_raw: pk.carton_spec_raw || null,
    pack_size_grams: pk.pack_size_grams ? Number(pk.pack_size_grams) : null,
    pack_size_ml: pk.pack_size_ml ? Number(pk.pack_size_ml) : null,
    india_mrp_pack: Boolean(pk.india_mrp_pack),
    original_listing: pk.original_listing || null,
    review_flags: Array.isArray(pk.review_flags) ? pk.review_flags : [],
    is_active: pk.is_active ?? true,
    sort_order: i,
  }))

  const brand = catalog.brands.find((b) => b.id === data.brand_id)
  const category = catalog.categories.find((c) => c.id === data.category_id)
  const group = catalog.groups.find((g) => g.id === data.group_id)

  const productObj: Product = {
    id: data.id || slug,
    slug,
    name: data.name,
    brand_id: data.brand_id || null,
    category_id: data.category_id || null,
    group_id: data.group_id || null,
    is_megh_brand: data.is_megh_brand ?? false,
    short_description: data.short_description || '',
    description_md: data.description_md || '',
    ingredients: data.ingredients || null,
    shelf_life: data.shelf_life || null,
    hs_code: data.hs_code || null,
    origin: data.origin || 'India',
    dietary_tags: data.dietary_tags || [],
    images: data.images || [],
    catalogue_pages: data.catalogue_pages || null,
    is_active: data.is_active ?? true,
    is_featured: data.is_featured ?? false,
    is_new: data.is_new ?? false,
    needs_review: data.needs_review ?? false,
    seo_title: data.seo_title || null,
    seo_description: data.seo_description || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    brand,
    category,
    group,
    packs: productPacks,
  }

  const overrides = loadOverrides()
  overrides.saved[productObj.slug] = productObj
  if (productObj.id && productObj.id !== productObj.slug) {
    overrides.saved[productObj.id] = productObj
  }
  saveOverrides(overrides)

  cachedProducts = null
  cachedIndex = null
  lastLoadedMtime = -1
  return { ok: true, productId: productObj.id }
}
