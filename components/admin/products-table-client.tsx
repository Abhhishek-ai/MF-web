'use client'

import * as React from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Search,
  Plus,
  Edit2,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { ProductSheetEditor, ProductEditData } from '@/components/admin/product-sheet-editor'
import {
  toggleProductFlag,
  duplicateProduct,
  deleteProduct,
  bulkUpdateProducts,
  BulkAction,
} from '@/app/admin/actions/products'
import { toast } from 'sonner'

export interface PackTableRow {
  id: string
  sku: string
  pack_size: string | null
  units_per_carton: number | null
  carton_spec_raw?: string | null
  pack_size_grams?: number | null
  pack_size_ml?: number | null
  is_active: boolean
  sort_order: number
}

export interface ProductTableRow {
  id: string
  name: string
  slug: string
  is_active: boolean
  is_featured: boolean
  is_new: boolean
  needs_review: boolean
  is_megh_brand: boolean
  images: string[]
  catalogue_pages?: string | null
  brand_id?: string | null
  category_id?: string | null
  group_id?: string | null
  short_description?: string
  description_md?: string
  ingredients?: string | null
  shelf_life?: string | null
  hs_code?: string | null
  origin?: string
  dietary_tags?: string[]
  seo_title?: string | null
  seo_description?: string | null
  brand?: { id: string; name: string } | null
  category?: { id: string; name: string } | null
  product_group?: { id: string; name: string } | null
  product_packs?: PackTableRow[]
}

interface ProductsTableClientProps {
  products: ProductTableRow[]
  totalCount: number
  page: number
  pageSize: number
  brands: Array<{ id: string; name: string; is_megh: boolean }>
  categories: Array<{ id: string; name: string; group_id: string | null }>
  groups: Array<{ id: string; name: string }>
}

function TableProductThumbnail({
  src,
  name,
  brandLetter,
}: {
  src?: string
  name: string
  brandLetter: string
}) {
  const [error, setError] = React.useState(false)

  if (!src || error) {
    return (
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-megh-primary">
        {brandLetter}
      </div>
    )
  }

  return (
    <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden relative flex items-center justify-center">
      <Image
        src={src}
        alt={name}
        fill
        className="object-cover"
        sizes="48px"
        onError={() => setError(true)}
      />
    </div>
  )
}

export function ProductsTableClient({
  products,
  totalCount,
  page,
  pageSize,
  brands,
  categories,
  groups,
}: ProductsTableClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [productList, setProductList] = React.useState<ProductTableRow[]>(products)
  React.useEffect(() => {
    setProductList(products)
  }, [products])

  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [editingProduct, setEditingProduct] = React.useState<ProductEditData | null>(null)
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [bulkAction, setBulkAction] = React.useState<string>('')
  const [bulkTargetId, setBulkTargetId] = React.useState<string>('')

  // Current query params
  const currentSearch = searchParams.get('q') || ''
  const currentGroup = searchParams.get('group') || ''
  const currentCategory = searchParams.get('category') || ''
  const currentBrand = searchParams.get('brand') || ''
  const currentFilter = searchParams.get('filter') || ''

  const [searchInput, setSearchInput] = React.useState(currentSearch)

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v)
      else params.delete(k)
    })
    params.set('page', '1') // Reset to page 1 on filter changes
    router.push(`/admin/products?${params.toString()}`)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ q: searchInput.trim() || null })
  }

  const handleToggle = async (
    id: string,
    field: 'is_active' | 'is_featured' | 'is_new' | 'needs_review',
    currentVal: boolean
  ) => {
    const newVal = !currentVal
    // Optimistic immediate UI update
    setProductList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: newVal } : p))
    )

    const toastId = toast.loading('Updating...')
    try {
      const res = await toggleProductFlag(id, field, newVal)
      if (res.ok) {
        toast.success('Updated', { id: toastId })
        router.refresh()
      } else {
        // Rollback on error
        setProductList((prev) =>
          prev.map((p) => (p.id === id ? { ...p, [field]: currentVal } : p))
        )
        toast.error(res.error || 'Failed to update', { id: toastId })
      }
    } catch {
      // Rollback on network error
      setProductList((prev) =>
        prev.map((p) => (p.id === id ? { ...p, [field]: currentVal } : p))
      )
      toast.error('Network error', { id: toastId })
    }
  }

  const handleDuplicate = async (id: string) => {
    const toastId = toast.loading('Duplicating product...')
    try {
      const res = await duplicateProduct(id)
      if (res.ok) {
        toast.success('Product duplicated as copy', { id: toastId })
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to duplicate', { id: toastId })
      }
    } catch {
      toast.error('Error duplicating', { id: toastId })
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return
    // Optimistic immediate removal from list
    setProductList((prev) => prev.filter((p) => p.id !== id))
    const toastId = toast.loading('Deleting...')
    try {
      const res = await deleteProduct(id)
      if (res.ok) {
        toast.success('Product deleted', { id: toastId })
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to delete', { id: toastId })
        router.refresh()
      }
    } catch {
      toast.error('Error deleting', { id: toastId })
      router.refresh()
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(productList.map((p) => p.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id])
    } else {
      setSelectedIds((prev) => prev.filter((x) => x !== id))
    }
  }

  const handleApplyBulkAction = async () => {
    if (!selectedIds.length || !bulkAction) return

    if (bulkAction === 'activate') {
      setProductList((prev) =>
        prev.map((p) => (selectedIds.includes(p.id) ? { ...p, is_active: true } : p))
      )
    } else if (bulkAction === 'deactivate') {
      setProductList((prev) =>
        prev.map((p) => (selectedIds.includes(p.id) ? { ...p, is_active: false } : p))
      )
    }

    const toastId = toast.loading(`Applying bulk action to ${selectedIds.length} products...`)

    let actionObj: BulkAction
    if (bulkAction === 'activate') actionObj = { type: 'activate' }
    else if (bulkAction === 'deactivate') actionObj = { type: 'deactivate' }
    else if (bulkAction === 'set_category') {
      if (!bulkTargetId) {
        toast.error('Please select target category', { id: toastId })
        return
      }
      actionObj = { type: 'set_category', categoryId: bulkTargetId }
    } else if (bulkAction === 'set_group') {
      if (!bulkTargetId) {
        toast.error('Please select target product group', { id: toastId })
        return
      }
      actionObj = { type: 'set_group', groupId: bulkTargetId }
    } else {
      return
    }

    try {
      const res = await bulkUpdateProducts(selectedIds, actionObj)
      if (res.ok) {
        toast.success(`Updated ${res.count} products`, { id: toastId })
        setSelectedIds([])
        setBulkAction('')
        setBulkTargetId('')
        router.refresh()
      } else {
        toast.error(res.error || 'Bulk update failed', { id: toastId })
      }
    } catch {
      toast.error('Bulk update error', { id: toastId })
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize) || 1

  return (
    <div className="space-y-6">
      {/* Top Bar: Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-montserrat text-megh-navy">Product Catalogue</h1>
          <p className="text-xs text-slate-500 mt-1">
            {totalCount.toLocaleString()} total products in database ({pageSize} per page)
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingProduct(null)
            setSheetOpen(true)
          }}
          className="bg-megh-primary hover:bg-megh-primary/90 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search product name or SKU..."
              className="pl-9 h-9 text-xs"
            />
          </form>

          {/* Group Filter */}
          <select
            value={currentGroup}
            onChange={(e) => updateFilters({ group: e.target.value || null })}
            className="h-9 px-2.5 rounded-md border border-slate-200 bg-white text-xs text-slate-700"
          >
            <option value="">All Product Groups</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={currentCategory}
            onChange={(e) => updateFilters({ category: e.target.value || null })}
            className="h-9 px-2.5 rounded-md border border-slate-200 bg-white text-xs text-slate-700"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Brand Filter */}
          <select
            value={currentBrand}
            onChange={(e) => updateFilters({ brand: e.target.value || null })}
            className="h-9 px-2.5 rounded-md border border-slate-200 bg-white text-xs text-slate-700"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Special Quick Filters */}
          <select
            value={currentFilter}
            onChange={(e) => updateFilters({ filter: e.target.value || null })}
            className="h-9 px-2.5 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700"
          >
            <option value="">Filter: All Products</option>
            <option value="megh_only">Megh Own Brand Only</option>
            <option value="needs_review">Needs Review</option>
            <option value="no_image">Missing Photos</option>
            <option value="inactive">Inactive Only</option>
            <option value="featured">Featured Only</option>
          </select>

          {(currentSearch ||
            currentGroup ||
            currentCategory ||
            currentBrand ||
            currentFilter) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchInput('')
                router.push('/admin/products')
              }}
              className="h-9 text-xs"
            >
              Reset Filters
            </Button>
          )}
        </div>

        {/* Bulk Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-blue-50/50 p-2.5 rounded-lg">
            <span className="text-xs font-semibold text-megh-primary">
              {selectedIds.length} products selected
            </span>

            <div className="flex items-center gap-2">
              <select
                value={bulkAction}
                onChange={(e) => {
                  setBulkAction(e.target.value)
                  setBulkTargetId('')
                }}
                className="h-8 px-2 rounded-md border border-slate-300 bg-white text-xs"
              >
                <option value="">Choose bulk action...</option>
                <option value="activate">Activate Selected</option>
                <option value="deactivate">Deactivate Selected</option>
                <option value="set_category">Assign to Category</option>
                <option value="set_group">Assign to Product Group</option>
              </select>

              {bulkAction === 'set_category' && (
                <select
                  value={bulkTargetId}
                  onChange={(e) => setBulkTargetId(e.target.value)}
                  className="h-8 px-2 rounded-md border border-slate-300 bg-white text-xs"
                >
                  <option value="">Select target category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}

              {bulkAction === 'set_group' && (
                <select
                  value={bulkTargetId}
                  onChange={(e) => setBulkTargetId(e.target.value)}
                  className="h-8 px-2 rounded-md border border-slate-300 bg-white text-xs"
                >
                  <option value="">Select target group...</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              )}

              <Button
                size="sm"
                onClick={handleApplyBulkAction}
                disabled={!bulkAction}
                className="h-8 text-xs bg-megh-primary text-white"
              >
                Apply
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedIds([])}
                className="h-8 text-xs"
              >
                Deselect
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  checked={
                    productList.length > 0 && selectedIds.length === productList.length
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-slate-300 text-megh-primary focus:ring-megh-primary"
                />
              </TableHead>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Product & Packs</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Category / Group</TableHead>
              <TableHead className="text-center">Active</TableHead>
              <TableHead className="text-center">Featured</TableHead>
              <TableHead className="text-center">New</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productList.length > 0 ? (
              productList.map((product) => {
                const coverImage = product.images?.[0]
                const packs = product.product_packs || []
                const isSelected = selectedIds.includes(product.id)

                return (
                  <TableRow
                    key={product.id}
                    className={isSelected ? 'bg-blue-50/40' : undefined}
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectOne(product.id, e.target.checked)}
                        className="rounded border-slate-300 text-megh-primary focus:ring-megh-primary"
                      />
                    </TableCell>

                    {/* Image Thumbnail */}
                    <TableCell>
                      <TableProductThumbnail
                        src={coverImage}
                        name={product.name}
                        brandLetter={product.brand?.name?.[0] || 'M'}
                      />
                    </TableCell>

                    {/* Product Name & SKUs */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 text-sm hover:text-megh-primary cursor-pointer"
                            onClick={() => {
                              setEditingProduct(product)
                              setSheetOpen(true)
                            }}
                          >
                            {product.name}
                          </span>
                          {product.needs_review && (
                            <Badge variant="warning" className="text-[10px] py-0 px-1.5">
                              Review
                            </Badge>
                          )}
                          {!coverImage && (
                            <Badge variant="outline" className="text-[10px] py-0 px-1 text-slate-500">
                              No Img
                            </Badge>
                          )}
                        </div>

                        {/* Pack SKUs Pills */}
                        <div className="flex flex-wrap gap-1">
                          {packs.map((pk) => (
                            <span
                              key={pk.id}
                              className="inline-flex items-center gap-1 text-[11px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200"
                            >
                              <span className="font-bold text-megh-navy">{pk.sku}</span>
                              {pk.pack_size && <span>• {pk.pack_size}</span>}
                              {pk.units_per_carton && (
                                <span className="text-slate-500">
                                  ({pk.units_per_carton}/ctn)
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    </TableCell>

                    {/* Brand */}
                    <TableCell>
                      <div className="space-y-0.5">
                        <span className="text-xs font-medium text-slate-800">
                          {product.brand?.name || 'Unbranded'}
                        </span>
                        {product.is_megh_brand && (
                          <div className="text-[10px] text-megh-primary font-semibold">
                            Megh Brand
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Category & Group */}
                    <TableCell>
                      <div className="text-xs space-y-0.5">
                        <div className="font-medium text-slate-800">
                          {product.category?.name || 'Uncategorised'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {product.product_group?.name || '—'}
                        </div>
                      </div>
                    </TableCell>

                    {/* Active Switch */}
                    <TableCell className="text-center">
                      <Switch
                        checked={product.is_active}
                        onCheckedChange={() =>
                          handleToggle(product.id, 'is_active', product.is_active)
                        }
                      />
                    </TableCell>

                    {/* Featured Switch */}
                    <TableCell className="text-center">
                      <Switch
                        checked={product.is_featured}
                        onCheckedChange={() =>
                          handleToggle(product.id, 'is_featured', product.is_featured)
                        }
                      />
                    </TableCell>

                    {/* New Switch */}
                    <TableCell className="text-center">
                      <Switch
                        checked={product.is_new}
                        onCheckedChange={() =>
                          handleToggle(product.id, 'is_new', product.is_new)
                        }
                      />
                    </TableCell>

                    {/* Row Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct(product)
                            setSheetOpen(true)
                          }}
                          className="p-1.5 text-slate-500 hover:text-megh-primary rounded hover:bg-slate-100"
                          title="Edit product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDuplicate(product.id)}
                          className="p-1.5 text-slate-500 hover:text-megh-primary rounded hover:bg-slate-100"
                          title="Duplicate as copy"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100"
                          title="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-slate-500 text-sm">
                  No products matched the filter criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Showing {(page - 1) * pageSize + 1} to{' '}
            {Math.min(page * pageSize, totalCount)} of {totalCount.toLocaleString()} products
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => updateFilters({ page: (page - 1).toString() })}
              className="h-8 text-xs flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </Button>
            <span className="text-xs font-semibold text-slate-700 px-2">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => updateFilters({ page: (page + 1).toString() })}
              className="h-8 text-xs flex items-center gap-1"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Product Edit / Create Sheet */}
      <ProductSheetEditor
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        initialData={editingProduct}
        brands={brands}
        categories={categories}
        groups={groups}
        onSaved={() => router.refresh()}
      />
    </div>
  )
}
