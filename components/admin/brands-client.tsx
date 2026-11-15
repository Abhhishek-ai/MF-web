'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Info,
  Loader2,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
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
  saveBrand,
  toggleBrandPublic,
  toggleBrandMegh,
  deleteBrand,
} from '@/app/admin/actions/taxonomy'
import { toast } from 'sonner'
import { slugify } from '@/lib/slug'

export interface BrandItem {
  id: string
  name: string
  slug: string
  is_megh: boolean
  is_public: boolean
  logo_url: string | null
  sort_order: number
}

interface BrandsClientProps {
  brands: BrandItem[]
}

export function BrandsClient({ brands }: BrandsClientProps) {
  const router = useRouter()
  const [search, setSearch] = React.useState('')
  const [modalOpen, setModalOpen] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)

  // Edit / Create Form State
  const [editId, setEditId] = React.useState<string | null>(null)
  const [name, setName] = React.useState('')
  const [slug, setSlug] = React.useState('')
  const [isMegh, setIsMegh] = React.useState(false)
  const [isPublic, setIsPublic] = React.useState(true)
  const [logoUrl, setLogoUrl] = React.useState('')
  const [sortOrder, setSortOrder] = React.useState(0)

  const openCreateModal = () => {
    setEditId(null)
    setName('')
    setSlug('')
    setIsMegh(false)
    setIsPublic(true)
    setLogoUrl('')
    setSortOrder(0)
    setModalOpen(true)
  }

  const openEditModal = (b: BrandItem) => {
    setEditId(b.id)
    setName(b.name)
    setSlug(b.slug)
    setIsMegh(!!b.is_megh)
    setIsPublic(!!b.is_public)
    setLogoUrl(b.logo_url || '')
    setSortOrder(b.sort_order || 0)
    setModalOpen(true)
  }

  const handleNameChange = (val: string) => {
    setName(val)
    if (!editId) {
      setSlug(slugify(val))
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Brand name is required')
      return
    }

    setSubmitting(true)
    const toastId = toast.loading('Saving brand...')
    try {
      const res = await saveBrand({
        id: editId || undefined,
        name: name.trim(),
        slug: slug.trim() || slugify(name),
        is_megh: isMegh,
        is_public: isPublic,
        logo_url: logoUrl.trim() || null,
        sort_order: sortOrder,
      })

      if (res.ok) {
        toast.success('Brand saved', { id: toastId })
        setModalOpen(false)
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to save brand', { id: toastId })
      }
    } catch {
      toast.error('Network error saving brand', { id: toastId })
    } finally {
      setSubmitting(false)
    }
  }

  const handleTogglePublic = async (id: string, current: boolean) => {
    const toastId = toast.loading('Updating visibility...')
    try {
      const res = await toggleBrandPublic(id, !current)
      if (res.ok) {
        toast.success(`Brand is now ${!current ? 'public' : 'hidden from public catalogue'}`, {
          id: toastId,
        })
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to update visibility', { id: toastId })
      }
    } catch {
      toast.error('Network error', { id: toastId })
    }
  }

  const handleToggleMegh = async (id: string, current: boolean) => {
    const toastId = toast.loading('Updating brand status...')
    try {
      const res = await toggleBrandMegh(id, !current)
      if (res.ok) {
        toast.success('Brand status updated', { id: toastId })
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to update brand status', { id: toastId })
      }
    } catch {
      toast.error('Network error', { id: toastId })
    }
  }

  const handleDelete = async (id: string, brandName: string) => {
    if (!confirm(`Delete brand "${brandName}"? Any products assigned will become unbranded.`)) {
      return
    }
    const toastId = toast.loading('Deleting...')
    try {
      const res = await deleteBrand(id)
      if (res.ok) {
        toast.success('Brand deleted', { id: toastId })
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to delete brand', { id: toastId })
      }
    } catch {
      toast.error('Network error', { id: toastId })
    }
  }

  const filteredBrands = brands.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.slug.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-montserrat text-megh-navy">Brand Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Control which partner brands appear on the public website and manage own Megh labels.
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="bg-megh-primary hover:bg-megh-primary/90 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Brand
        </Button>
      </div>

      {/* Owner Guidance Note */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200/80 flex items-start gap-3 text-xs text-blue-900 leading-relaxed shadow-xs">
        <Info className="w-5 h-5 text-megh-primary flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Partner Brand Privacy Notice:</span> Hide a partner brand&apos;s
          name from the public website using the <strong>Public switch</strong>. When turned OFF,
          the brand&apos;s products remain searchable by generic category, but the partner brand&apos;s name
          is masked server-side to protect your supplier relationships.
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brands..."
            className="pl-9 h-9 text-xs"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing {filteredBrands.length} of {brands.length} brands
        </div>
      </div>

      {/* Brands Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brand Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-center">Megh Brand</TableHead>
              <TableHead className="text-center">Public Website</TableHead>
              <TableHead className="text-center">Sort Order</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBrands.length > 0 ? (
              filteredBrands.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-600">
                        {b.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-slate-900 text-sm">{b.name}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="font-mono text-xs text-slate-500">{b.slug}</span>
                  </TableCell>

                  {/* Megh Brand Switch */}
                  <TableCell className="text-center">
                    <Switch
                      checked={b.is_megh}
                      onCheckedChange={() => handleToggleMegh(b.id, b.is_megh)}
                    />
                  </TableCell>

                  {/* Public Switch */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Switch
                        checked={b.is_public}
                        onCheckedChange={() => handleTogglePublic(b.id, b.is_public)}
                      />
                      {b.is_public ? (
                        <span title="Visible on public site">
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        </span>
                      ) : (
                        <span title="Hidden from public site">
                          <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-center font-mono text-xs text-slate-600">
                    {b.sort_order}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(b)}
                        className="p-1.5 text-slate-500 hover:text-megh-primary rounded hover:bg-slate-100"
                        title="Edit brand"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(b.id, b.name)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100"
                        title="Delete brand"
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
                  No brands found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Brand Create/Edit Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-montserrat">
              {editId ? 'Edit Brand' : 'Create New Brand'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Brand Name *
              </label>
              <Input
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Haldiram's, Megh, Parle"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Slug</label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="brand-slug"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                <div>
                  <div className="text-xs font-semibold text-slate-800">Megh Brand</div>
                  <div className="text-[10px] text-slate-500">In-house flagship</div>
                </div>
                <Switch checked={isMegh} onCheckedChange={setIsMegh} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                <div>
                  <div className="text-xs font-semibold text-slate-800">Public Site</div>
                  <div className="text-[10px] text-slate-500">Show brand name</div>
                </div>
                <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Logo URL (optional)
              </label>
              <Input
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Sort Order (lower appears first)
              </label>
              <Input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value || '0', 10))}
              />
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
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
                  'Save Brand'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
