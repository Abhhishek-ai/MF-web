'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  RotateCcw,
  Boxes,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { ProductCard } from '@/components/public/product-card'
import {
  IndexProduct,
  Filters,
  buildSearch,
  applyFilters,
  SortKey,
} from '@/lib/catalog/filter'
import { toast } from 'sonner'
import type { ProductGroup, Category, Brand, Product } from '@/lib/types'

interface CatalogClientProps {
  initialProducts: Product[]
  groups: ProductGroup[]
  categories: Category[]
  brands: Brand[]
}

export function CatalogClient({
  initialProducts,
  groups,
  categories,
  brands,
}: CatalogClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [mobileFilterOpen, setMobileFilterOpen] = React.useState(false)
  const [rfqModalOpen, setRfqModalOpen] = React.useState(false)
  const [rfqNote, setRfqNote] = React.useState('')
  const [rfqSubmitted, setRfqSubmitted] = React.useState(false)

  // Full in-memory index loaded via client fetch
  const [allProducts, setAllProducts] = React.useState<IndexProduct[]>(() =>
    initialProducts.map((p) => ({
      slug: p.slug,
      name: p.name,
      is_megh_brand: p.is_megh_brand,
      is_featured: p.is_featured,
      images: p.images || [],
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
  )
  const [indexLoaded, setIndexLoaded] = React.useState(false)

  // Fetch full index once
  React.useEffect(() => {
    fetch('/api/catalog-index', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: IndexProduct[]) => {
        if (data && data.length > 0) {
          setAllProducts(data)
          setIndexLoaded(true)
        }
      })
      .catch(() => {})
  }, [])

  // Parse filters from URL search params
  const filters: Filters = React.useMemo(() => {
    return {
      q: searchParams.get('q') || '',
      groups: searchParams.getAll('group'),
      categories: searchParams.getAll('cat'),
      brands: searchParams.getAll('brand'),
      meghOnly: searchParams.get('megh') === 'true',
      sort: (searchParams.get('sort') as SortKey) || 'name',
    }
  }, [searchParams])

  const [searchInput, setSearchInput] = React.useState(filters.q)
  const [brandSearch, setBrandSearch] = React.useState('')
  const [displayCount, setDisplayCount] = React.useState(24)

  // URL sync helper
  const updateFilterUrl = React.useCallback(
    (updates: {
      q?: string | null
      groups?: string[]
      categories?: string[]
      brands?: string[]
      meghOnly?: boolean | null
      sort?: SortKey
    }) => {
      const params = new URLSearchParams()

      const q = updates.q !== undefined ? updates.q : filters.q
      if (q) params.set('q', q)

      const g = updates.groups !== undefined ? updates.groups : filters.groups
      g.forEach((val) => params.append('group', val))

      const c = updates.categories !== undefined ? updates.categories : filters.categories
      c.forEach((val) => params.append('cat', val))

      const b = updates.brands !== undefined ? updates.brands : filters.brands
      b.forEach((val) => params.append('brand', val))

      const m = updates.meghOnly !== undefined ? updates.meghOnly : filters.meghOnly
      if (m) params.set('megh', 'true')

      const s = updates.sort !== undefined ? updates.sort : filters.sort
      if (s && s !== 'name') params.set('sort', s)

      const queryStr = params.toString()
      router.replace(`/products${queryStr ? `?${queryStr}` : ''}`, { scroll: false })
      setDisplayCount(24) // Reset pagination
    },
    [filters, router]
  )

  // Sync search input if URL changes externally
  React.useEffect(() => {
    setSearchInput(filters.q)
  }, [filters.q])

  // Debounced URL update for search
  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== filters.q) {
        updateFilterUrl({ q: searchInput.trim() || null })
      }
    }, 200)
    return () => clearTimeout(handler)
  }, [searchInput, filters.q, updateFilterUrl])

  // Build Fuse search index
  const fuse = React.useMemo(() => buildSearch(allProducts), [allProducts])

  // Apply filters and sorting
  const filteredProducts = React.useMemo(() => {
    return applyFilters(allProducts, fuse, filters)
  }, [allProducts, fuse, filters])

  // Toggle filter item helper
  const toggleArrayFilter = (
    key: 'groups' | 'categories' | 'brands',
    itemSlug: string
  ) => {
    const current = [...filters[key]]
    const idx = current.indexOf(itemSlug)
    if (idx >= 0) {
      current.splice(idx, 1)
    } else {
      current.push(itemSlug)
    }
    updateFilterUrl({ [key]: current })
  }

  const clearAllFilters = () => {
    setSearchInput('')
    router.replace('/products', { scroll: false })
    setDisplayCount(24)
  }

  // Map IndexProduct to Product structure expected by ProductCard
  const displayedCards = filteredProducts.slice(0, displayCount).map((p) => {
    return {
      id: p.slug,
      slug: p.slug,
      name: p.name,
      is_megh_brand: p.is_megh_brand,
      is_featured: p.is_featured,
      is_new: false,
      is_active: true,
      needs_review: false,
      images: p.images,
      short_description: '',
      description_md: '',
      origin: 'India',
      dietary_tags: [],
      created_at: p.created_at,
      updated_at: p.created_at,
      brand: p.brand ? { id: p.brand.slug, name: p.brand.name, slug: p.brand.slug, is_megh: false, is_public: true, sort_order: 0 } : null,
      category: p.category ? { id: p.category.slug, name: p.category.name, slug: p.category.slug, description: '', sort_order: 0, is_active: true } : null,
      group: p.group ? { id: p.group.slug, name: p.group.name, slug: p.group.slug, description: '', sort_order: 0, is_active: true } : null,
      packs: p.packs.map((pk, idx) => ({
        id: `${p.slug}-${pk.sku}`,
        product_id: p.slug,
        sku: pk.sku,
        pack_size: pk.pack_size,
        units_per_carton: pk.units_per_carton,
        is_active: pk.is_active,
        sort_order: idx,
      })),
    } as unknown as Product
  })

  // Filter Sidebar Content (shared between desktop and mobile sheet)
  const renderFilterControls = () => (
    <div className="space-y-6 text-xs">
      {/* Megh Brand Only Switch */}
      <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between">
        <div>
          <div className="font-bold text-megh-navy">Megh Brand Only</div>
          <div className="text-[11px] text-slate-500">In-house manufactured staples</div>
        </div>
        <Switch
          checked={filters.meghOnly}
          onCheckedChange={(checked) => updateFilterUrl({ meghOnly: checked })}
        />
      </div>

      {/* Product Groups */}
      <div className="space-y-2">
        <h4 className="font-montserrat font-bold text-xs uppercase tracking-wider text-slate-700">
          Product Groups
        </h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {groups.map((group) => {
            const isChecked = filters.groups.includes(group.slug)
            return (
              <label
                key={group.id}
                className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleArrayFilter('groups', group.slug)}
                  className="rounded border-slate-300 text-megh-primary focus:ring-megh-primary"
                />
                <span className={isChecked ? 'font-bold text-megh-primary' : ''}>
                  {group.name}
                </span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <h4 className="font-montserrat font-bold text-xs uppercase tracking-wider text-slate-700">
          Categories
        </h4>
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {categories.map((cat) => {
            const isChecked = filters.categories.includes(cat.slug)
            return (
              <label
                key={cat.id}
                className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleArrayFilter('categories', cat.slug)}
                  className="rounded border-slate-300 text-megh-primary focus:ring-megh-primary"
                />
                <span className={isChecked ? 'font-bold text-megh-primary' : ''}>
                  {cat.name}
                </span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Brands (Searchable) */}
      <div className="space-y-2">
        <h4 className="font-montserrat font-bold text-xs uppercase tracking-wider text-slate-700">
          Brands
        </h4>
        <Input
          value={brandSearch}
          onChange={(e) => setBrandSearch(e.target.value)}
          placeholder="Filter brands..."
          className="h-8 text-xs mb-2"
        />
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {brands
            .filter((b) => b.name.toLowerCase().includes(brandSearch.toLowerCase()))
            .map((brand) => {
              const isChecked = filters.brands.includes(brand.slug)
              return (
                <label
                  key={brand.id}
                  className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleArrayFilter('brands', brand.slug)}
                    className="rounded border-slate-300 text-megh-primary focus:ring-megh-primary"
                  />
                  <span className={isChecked ? 'font-bold text-megh-primary' : ''}>
                    {brand.name}
                  </span>
                </label>
              )
            })}
        </div>
      </div>

      {/* Clear Filters Button */}
      {(filters.q ||
        filters.groups.length > 0 ||
        filters.categories.length > 0 ||
        filters.brands.length > 0 ||
        filters.meghOnly) && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearAllFilters}
          className="w-full text-xs text-slate-600 flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset All Filters
        </Button>
      )}
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold font-montserrat text-megh-navy">
            Export Product Catalogue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse carton configurations across ~2,140 SKUs and assemble your mixed container shortlist.
          </p>
        </div>

        {/* Search Input & Mobile Filter Trigger */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by product name, brand, or SKU..."
              className="pl-9 h-10 text-xs bg-white rounded-xl shadow-xs"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <Button
            variant="outline"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden h-10 px-3 flex items-center gap-1.5 text-xs rounded-xl"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </Button>
        </div>
      </div>

      {/* Main Explorer Layout: Left Sidebar + Right Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sticky Sidebar */}
        <aside className="hidden lg:block lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs sticky top-28">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h3 className="font-montserrat font-bold text-sm text-slate-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-megh-primary" /> Filter Catalogue
            </h3>
            <span className="text-[11px] text-slate-400">
              {filteredProducts.length} items
            </span>
          </div>

          {renderFilterControls()}
        </aside>

        {/* Right Content Area */}
        <main className="lg:col-span-3 space-y-6">
          {/* Top Results & Sort Toolbar */}
          <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs text-xs">
            <div className="text-slate-600 font-medium">
              Showing <strong className="text-slate-900">{Math.min(displayCount, filteredProducts.length)}</strong> of{' '}
              <strong className="text-slate-900">{filteredProducts.length.toLocaleString()}</strong> products
              {indexLoaded && (
                <span className="text-[10px] text-slate-400 ml-1.5 font-mono">
                  (Index live)
                </span>
              )}
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 hidden sm:inline">Sort:</span>
              <select
                value={filters.sort}
                onChange={(e) => updateFilterUrl({ sort: e.target.value as SortKey })}
                className="h-8 px-2.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800"
              >
                <option value="name">Name (A to Z)</option>
                <option value="featured">Featured First</option>
                <option value="newest">Recently Added</option>
              </select>
            </div>
          </div>

          {/* Product Cards Grid */}
          {displayedCards.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {displayedCards.map((product, idx) => (
                <ProductCard key={product.id} product={product} priority={idx < 6} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Boxes className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold font-montserrat text-slate-900">
                  No products match your current filters
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try clearing some filter tags or search for a generic category name like flours,
                  dal, spices, or snacks.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <Button variant="outline" size="sm" onClick={clearAllFilters} className="text-xs">
                  Reset All Filters
                </Button>
                <Button
                  size="sm"
                  onClick={() => setRfqModalOpen(true)}
                  className="bg-megh-primary hover:bg-megh-primary/90 text-white text-xs"
                >
                  Can&apos;t find it? Tell us what you need
                </Button>
              </div>
            </div>
          )}

          {/* Load More Pagination */}
          {displayCount < filteredProducts.length && (
            <div className="text-center pt-6">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setDisplayCount((prev) => prev + 24)}
                className="px-8 text-xs font-semibold h-11 border-slate-300 hover:border-megh-primary hover:text-megh-primary rounded-xl"
              >
                Load Next 24 Products ({filteredProducts.length - displayCount} remaining)
              </Button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Sheet Drawer */}
      <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
        <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="font-montserrat text-lg text-megh-navy flex items-center gap-2">
              <Filter className="w-4 h-4 text-megh-primary" /> Filter Catalogue
            </SheetTitle>
          </SheetHeader>
          {renderFilterControls()}
        </SheetContent>
      </Sheet>

      {/* "Can't Find It" Request Modal */}
      <Dialog open={rfqModalOpen} onOpenChange={setRfqModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-montserrat">
              Request Unlisted Product or Custom Brand
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Megh Overseas consolidates thousands of items from across India. Tell us what SKU or
              brand you require for your container.
            </DialogDescription>
          </DialogHeader>

          {rfqSubmitted ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Request Noted!</h4>
              <p className="text-xs text-slate-600">
                Our Changodar sourcing desk will verify availability and contact you with carton
                specifications.
              </p>
              <Button size="sm" onClick={() => setRfqModalOpen(false)} className="text-xs">
                Close
              </Button>
            </div>
          ) : (
            <div className="space-y-4 pt-2 text-xs">
              <textarea
                value={rfqNote}
                onChange={(e) => setRfqNote(e.target.value)}
                rows={4}
                placeholder="Specify product name, brand, preferred pack size, and estimated cartons..."
                className="w-full rounded-lg border border-slate-200 p-3 text-xs focus:ring-megh-primary"
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRfqModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={!rfqNote.trim()}
                  onClick={() => {
                    toast.success('Your sourcing inquiry has been noted')
                    setRfqSubmitted(true)
                  }}
                  className="bg-megh-primary text-white"
                >
                  Submit Sourcing Request
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
