import Fuse from 'fuse.js'

export type IndexProduct = {
  slug: string
  name: string
  is_megh_brand: boolean
  is_featured: boolean
  images: string[]
  created_at: string
  brand: { name: string; slug: string } | null
  category: { name: string; slug: string } | null
  group: { name: string; slug: string } | null
  packs: {
    sku: string
    pack_size: string | null
    units_per_carton: number | null
    is_active: boolean
  }[]
}

export type SortKey = 'name' | 'featured' | 'newest'

export type Filters = {
  q: string
  groups: string[]
  categories: string[]
  brands: string[]
  meghOnly: boolean
  sort: SortKey
}

export const emptyFilters: Filters = {
  q: '',
  groups: [],
  categories: [],
  brands: [],
  meghOnly: false,
  sort: 'name',
}

export const buildSearch = (items: IndexProduct[]) =>
  new Fuse(items, {
    keys: [
      { name: 'name', weight: 0.65 },
      { name: 'brand.name', weight: 0.2 },
      { name: 'category.name', weight: 0.15 },
    ],
    threshold: 0.33,
    ignoreLocation: true,
  })

export function applyFilters(
  items: IndexProduct[],
  fuse: Fuse<IndexProduct>,
  f: Filters
): IndexProduct[] {
  let list = f.q.trim() ? fuse.search(f.q.trim()).map((r) => r.item) : [...items]
  if (f.groups.length)
    list = list.filter((p) => p.group && f.groups.includes(p.group.slug))
  if (f.categories.length)
    list = list.filter((p) => p.category && f.categories.includes(p.category.slug))
  if (f.brands.length)
    list = list.filter((p) => p.brand && f.brands.includes(p.brand.slug))
  if (f.meghOnly) list = list.filter((p) => p.is_megh_brand)
  if (!f.q.trim()) {
    if (f.sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name))
    if (f.sort === 'featured')
      list.sort(
        (a, b) =>
          Number(b.is_featured) - Number(a.is_featured) ||
          a.name.localeCompare(b.name)
      )
    if (f.sort === 'newest')
      list.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
  }
  return list
}
