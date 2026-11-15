'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Edit2,
  Trash2,
  GitMerge,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  saveCategory,
  deleteCategory,
  mergeCategory,
  saveGroup,
  deleteGroup,
} from '@/app/admin/actions/taxonomy'
import { toast } from 'sonner'
import { slugify } from '@/lib/slug'

export interface CategoryRow {
  id: string
  name: string
  slug: string
  group_id: string | null
  description: string
  image_url: string | null
  sort_order: number
  is_active: boolean
  product_group?: { id: string; name: string } | null
}

export interface GroupRow {
  id: string
  name: string
  slug: string
  description: string
  image_url: string | null
  sort_order: number
  is_active: boolean
}

interface CategoriesClientProps {
  categories: CategoryRow[]
  groups: GroupRow[]
}

export function CategoriesClient({ categories, groups }: CategoriesClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = React.useState('categories')

  // Category Modal State
  const [categoryModalOpen, setCategoryModalOpen] = React.useState(false)
  const [catId, setCatId] = React.useState<string | null>(null)
  const [catName, setCatName] = React.useState('')
  const [catSlug, setCatSlug] = React.useState('')
  const [catGroupId, setCatGroupId] = React.useState('')
  const [catDesc, setCatDesc] = React.useState('')
  const [catImg, setCatImg] = React.useState('')
  const [catSort, setCatSort] = React.useState(0)
  const [catActive, setCatActive] = React.useState(true)

  // Merge Category Modal State
  const [mergeModalOpen, setMergeModalOpen] = React.useState(false)
  const [sourceCatId, setSourceCatId] = React.useState('')
  const [targetCatId, setTargetCatId] = React.useState('')

  // Group Modal State
  const [groupModalOpen, setGroupModalOpen] = React.useState(false)
  const [grpId, setGrpId] = React.useState<string | null>(null)
  const [grpName, setGrpName] = React.useState('')
  const [grpSlug, setGrpSlug] = React.useState('')
  const [grpDesc, setGrpDesc] = React.useState('')
  const [grpImg, setGrpImg] = React.useState('')
  const [grpSort, setGrpSort] = React.useState(0)
  const [grpActive, setGrpActive] = React.useState(true)

  const [submitting, setSubmitting] = React.useState(false)

  // Handlers for Category
  const openCreateCategory = () => {
    setCatId(null)
    setCatName('')
    setCatSlug('')
    setCatGroupId(groups[0]?.id || '')
    setCatDesc('')
    setCatImg('')
    setCatSort(0)
    setCatActive(true)
    setCategoryModalOpen(true)
  }

  const openEditCategory = (c: CategoryRow) => {
    setCatId(c.id)
    setCatName(c.name)
    setCatSlug(c.slug)
    setCatGroupId(c.group_id || '')
    setCatDesc(c.description || '')
    setCatImg(c.image_url || '')
    setCatSort(c.sort_order || 0)
    setCatActive(c.is_active !== undefined ? c.is_active : true)
    setCategoryModalOpen(true)
  }

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!catName.trim()) {
      toast.error('Category name is required')
      return
    }
    setSubmitting(true)
    const toastId = toast.loading('Saving category...')
    try {
      const res = await saveCategory({
        id: catId || undefined,
        name: catName.trim(),
        slug: catSlug.trim() || slugify(catName),
        group_id: catGroupId || null,
        description: catDesc,
        image_url: catImg.trim() || null,
        sort_order: catSort,
        is_active: catActive,
      })
      if (res.ok) {
        toast.success('Category saved', { id: toastId })
        setCategoryModalOpen(false)
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to save', { id: toastId })
      }
    } catch {
      toast.error('Network error', { id: toastId })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? Products inside will become uncategorised.`)) return
    const toastId = toast.loading('Deleting...')
    try {
      const res = await deleteCategory(id)
      if (res.ok) {
        toast.success('Category deleted', { id: toastId })
        router.refresh()
      } else {
        toast.error(res.error || 'Delete failed', { id: toastId })
      }
    } catch {
      toast.error('Network error', { id: toastId })
    }
  }

  const handleMergeCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sourceCatId || !targetCatId) {
      toast.error('Please select both source and destination categories')
      return
    }
    if (sourceCatId === targetCatId) {
      toast.error('Source and destination cannot be identical')
      return
    }

    const sourceName = categories.find((c) => c.id === sourceCatId)?.name || 'source'
    const targetName = categories.find((c) => c.id === targetCatId)?.name || 'target'

    if (
      !confirm(
        `Are you sure you want to merge "${sourceName}" into "${targetName}"?\nAll products from "${sourceName}" will be reassigned to "${targetName}", and "${sourceName}" will be deleted.`
      )
    ) {
      return
    }

    setSubmitting(true)
    const toastId = toast.loading('Merging categories...')
    try {
      const res = await mergeCategory(sourceCatId, targetCatId)
      if (res.ok) {
        toast.success('Categories merged successfully', { id: toastId })
        setMergeModalOpen(false)
        setSourceCatId('')
        setTargetCatId('')
        router.refresh()
      } else {
        toast.error(res.error || 'Merge failed', { id: toastId })
      }
    } catch {
      toast.error('Network error', { id: toastId })
    } finally {
      setSubmitting(false)
    }
  }

  // Handlers for Groups
  const openCreateGroup = () => {
    setGrpId(null)
    setGrpName('')
    setGrpSlug('')
    setGrpDesc('')
    setGrpImg('')
    setGrpSort(0)
    setGrpActive(true)
    setGroupModalOpen(true)
  }

  const openEditGroup = (g: GroupRow) => {
    setGrpId(g.id)
    setGrpName(g.name)
    setGrpSlug(g.slug)
    setGrpDesc(g.description || '')
    setGrpImg(g.image_url || '')
    setGrpSort(g.sort_order || 0)
    setGrpActive(g.is_active !== undefined ? g.is_active : true)
    setGroupModalOpen(true)
  }

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!grpName.trim()) {
      toast.error('Group name is required')
      return
    }
    setSubmitting(true)
    const toastId = toast.loading('Saving group...')
    try {
      const res = await saveGroup({
        id: grpId || undefined,
        name: grpName.trim(),
        slug: grpSlug.trim() || slugify(grpName),
        description: grpDesc,
        image_url: grpImg.trim() || null,
        sort_order: grpSort,
        is_active: grpActive,
      })
      if (res.ok) {
        toast.success('Group saved', { id: toastId })
        setGroupModalOpen(false)
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to save', { id: toastId })
      }
    } catch {
      toast.error('Network error', { id: toastId })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteGroup = async (id: string, name: string) => {
    if (!confirm(`Delete product group "${name}"? Associated categories will remain.`)) return
    const toastId = toast.loading('Deleting...')
    try {
      const res = await deleteGroup(id)
      if (res.ok) {
        toast.success('Group deleted', { id: toastId })
        router.refresh()
      } else {
        toast.error(res.error || 'Delete failed', { id: toastId })
      }
    } catch {
      toast.error('Network error', { id: toastId })
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-montserrat text-megh-navy">
            Taxonomy: Categories & Groups
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize products into high-level groups (Megh staples, partner FMCG, pooja) and
            specific categories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setMergeModalOpen(true)}
            className="flex items-center gap-1.5 text-xs h-9"
          >
            <GitMerge className="w-4 h-4 text-megh-primary" /> Merge Categories
          </Button>

          {activeTab === 'categories' ? (
            <Button
              onClick={openCreateCategory}
              className="bg-megh-primary hover:bg-megh-primary/90 text-white flex items-center gap-2 text-xs h-9"
            >
              <Plus className="w-4 h-4" /> Add Category
            </Button>
          ) : (
            <Button
              onClick={openCreateGroup}
              className="bg-megh-primary hover:bg-megh-primary/90 text-white flex items-center gap-2 text-xs h-9"
            >
              <Plus className="w-4 h-4" /> Add Product Group
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="categories">Categories ({categories.length})</TabsTrigger>
          <TabsTrigger value="groups">Product Groups ({groups.length})</TabsTrigger>
        </TabsList>

        {/* CATEGORIES TAB */}
        <TabsContent value="categories" className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Assigned Group</TableHead>
                  <TableHead className="text-center">Sort Order</TableHead>
                  <TableHead className="text-center">Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length > 0 ? (
                  categories.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="font-semibold text-slate-900 text-sm">{c.name}</div>
                        {c.description && (
                          <div className="text-xs text-slate-500 line-clamp-1">
                            {c.description}
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <span className="font-mono text-xs text-slate-500">{c.slug}</span>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-xs font-normal">
                          {c.product_group?.name || 'Unassigned'}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-center font-mono text-xs text-slate-600">
                        {c.sort_order}
                      </TableCell>

                      <TableCell className="text-center">
                        <span
                          className={`inline-block w-2.5 h-2.5 rounded-full ${
                            c.is_active ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                        />
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditCategory(c)}
                            className="p-1.5 text-slate-500 hover:text-megh-primary rounded hover:bg-slate-100"
                            title="Edit category"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(c.id, c.name)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100"
                            title="Delete category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-slate-500 text-sm">
                      No categories defined yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* PRODUCT GROUPS TAB */}
        <TabsContent value="groups" className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Sort Order</TableHead>
                  <TableHead className="text-center">Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.length > 0 ? (
                  groups.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell>
                        <div className="font-semibold text-slate-900 text-sm">{g.name}</div>
                      </TableCell>

                      <TableCell>
                        <span className="font-mono text-xs text-slate-500">{g.slug}</span>
                      </TableCell>

                      <TableCell>
                        <span className="text-xs text-slate-500 line-clamp-1">
                          {g.description || '—'}
                        </span>
                      </TableCell>

                      <TableCell className="text-center font-mono text-xs text-slate-600">
                        {g.sort_order}
                      </TableCell>

                      <TableCell className="text-center">
                        <span
                          className={`inline-block w-2.5 h-2.5 rounded-full ${
                            g.is_active ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                        />
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditGroup(g)}
                            className="p-1.5 text-slate-500 hover:text-megh-primary rounded hover:bg-slate-100"
                            title="Edit group"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteGroup(g.id, g.name)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100"
                            title="Delete group"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-slate-500 text-sm">
                      No product groups found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Category Create/Edit Dialog */}
      <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-montserrat">
              {catId ? 'Edit Category' : 'Create Category'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveCategory} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Category Name *
              </label>
              <Input
                value={catName}
                onChange={(e) => {
                  setCatName(e.target.value)
                  if (!catId) setCatSlug(slugify(e.target.value))
                }}
                placeholder="e.g. Flours & Grains"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Slug</label>
              <Input
                value={catSlug}
                onChange={(e) => setCatSlug(e.target.value)}
                placeholder="flours-and-grains"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Assigned Product Group
              </label>
              <select
                value={catGroupId}
                onChange={(e) => setCatGroupId(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm"
              >
                <option value="">-- No Group Assigned --</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Description</label>
              <Textarea
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
                rows={2}
                placeholder="Short summary for catalogue..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Sort Order
                </label>
                <Input
                  type="number"
                  value={catSort}
                  onChange={(e) => setCatSort(parseInt(e.target.value || '0', 10))}
                />
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg border border-slate-200 mt-5">
                <span className="text-xs font-medium text-slate-800">Active</span>
                <Switch checked={catActive} onCheckedChange={setCatActive} />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCategoryModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-megh-primary hover:bg-megh-primary/90 text-white min-w-[100px]"
              >
                {submitting ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </span>
                ) : (
                  'Save Category'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Merge Category Dialog */}
      <Dialog open={mergeModalOpen} onOpenChange={setMergeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-montserrat flex items-center gap-2">
              <GitMerge className="w-5 h-5 text-megh-primary" /> Merge Two Categories
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleMergeCategory} className="space-y-4 pt-2">
            <p className="text-xs text-slate-600">
              Move all products from a source category into a target category, then delete the
              source category. This is useful for deduplicating or consolidating taxonomy.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Source Category (Will be deleted)
              </label>
              <select
                value={sourceCatId}
                onChange={(e) => setSourceCatId(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm"
                required
              >
                <option value="">-- Select Source Category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center text-slate-400">
              <ArrowRight className="w-5 h-5 rotate-90 sm:rotate-0" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Destination Category (Products move here)
              </label>
              <select
                value={targetCatId}
                onChange={(e) => setTargetCatId(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm"
                required
              >
                <option value="">-- Select Destination Category --</option>
                {categories
                  .filter((c) => c.id !== sourceCatId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMergeModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || !sourceCatId || !targetCatId}
                className="bg-red-600 hover:bg-red-700 text-white min-w-[120px]"
              >
                {submitting ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-4 h-4 animate-spin" /> Merging...
                  </span>
                ) : (
                  'Confirm & Merge'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Product Group Create/Edit Dialog */}
      <Dialog open={groupModalOpen} onOpenChange={setGroupModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-montserrat">
              {grpId ? 'Edit Product Group' : 'Create Product Group'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveGroup} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Group Name *
              </label>
              <Input
                value={grpName}
                onChange={(e) => {
                  setGrpName(e.target.value)
                  if (!grpId) setGrpSlug(slugify(e.target.value))
                }}
                placeholder="e.g. Megh Brand, Partner Brands, Handicraft & Pooja"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Slug</label>
              <Input
                value={grpSlug}
                onChange={(e) => setGrpSlug(e.target.value)}
                placeholder="megh-brand"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Description</label>
              <Textarea
                value={grpDesc}
                onChange={(e) => setGrpDesc(e.target.value)}
                rows={2}
                placeholder="Pillar description..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Sort Order
                </label>
                <Input
                  type="number"
                  value={grpSort}
                  onChange={(e) => setGrpSort(parseInt(e.target.value || '0', 10))}
                />
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg border border-slate-200 mt-5">
                <span className="text-xs font-medium text-slate-800">Active</span>
                <Switch checked={grpActive} onCheckedChange={setGrpActive} />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setGroupModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-megh-primary hover:bg-megh-primary/90 text-white min-w-[100px]"
              >
                {submitting ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </span>
                ) : (
                  'Save Group'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
