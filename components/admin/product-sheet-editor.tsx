'use client'

import * as React from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import ReactMarkdown from 'react-markdown'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { ImageUploader } from '@/components/admin/image-uploader'
import { saveProduct, getNextSkuNumber, ProductFormValues } from '@/app/admin/actions/products'
import { toast } from 'sonner'
import { Plus, Trash2, Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { slugify } from '@/lib/slug'

const packSchema = z.object({
  id: z.string().optional(),
  sku: z.string().trim().min(2, 'SKU is required'),
  pack_size: z.string().nullable().optional(),
  units_per_carton: z.coerce.number().int().positive().nullable().optional(),
  carton_spec_raw: z.string().nullable().optional(),
  pack_size_grams: z.coerce.number().nullable().optional(),
  pack_size_ml: z.coerce.number().nullable().optional(),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().default(0),
})

const formSchema = z.object({
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

export interface ProductEditData {
  id?: string
  name?: string
  slug?: string
  brand_id?: string | null
  category_id?: string | null
  group_id?: string | null
  is_megh_brand?: boolean
  short_description?: string
  description_md?: string
  ingredients?: string | null
  shelf_life?: string | null
  hs_code?: string | null
  origin?: string
  dietary_tags?: string[]
  images?: string[]
  catalogue_pages?: string | null
  is_active?: boolean
  is_featured?: boolean
  is_new?: boolean
  needs_review?: boolean
  seo_title?: string | null
  seo_description?: string | null
  product_packs?: Array<{
    id?: string
    sku: string
    pack_size?: string | null
    units_per_carton?: number | null
    carton_spec_raw?: string | null
    pack_size_grams?: number | null
    pack_size_ml?: number | null
    is_active?: boolean
    sort_order?: number
  }>
}

interface ProductSheetEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: ProductEditData | null
  brands: Array<{ id: string; name: string; is_megh: boolean }>
  categories: Array<{ id: string; name: string; group_id: string | null }>
  groups: Array<{ id: string; name: string }>
  onSaved?: () => void
}

export function ProductSheetEditor({
  open,
  onOpenChange,
  initialData,
  brands,
  categories,
  groups,
  onSaved,
}: ProductSheetEditorProps) {
  const [submitting, setSubmitting] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState('general')
  const [previewMd, setPreviewMd] = React.useState(false)

  const defaultValues: ProductFormValues = React.useMemo(() => {
    if (!initialData) {
      return {
        name: '',
        slug: '',
        brand_id: null,
        category_id: null,
        group_id: null,
        is_megh_brand: false,
        short_description: '',
        description_md: '',
        ingredients: '',
        shelf_life: '',
        hs_code: '',
        origin: 'India',
        dietary_tags: [],
        images: [],
        catalogue_pages: '',
        is_active: true,
        is_featured: false,
        is_new: false,
        needs_review: false,
        seo_title: '',
        seo_description: '',
        packs: [
          {
            sku: 'MF-0001',
            pack_size: '1KG',
            units_per_carton: 20,
            carton_spec_raw: '',
            pack_size_grams: 1000,
            pack_size_ml: null,
            is_active: true,
            sort_order: 0,
          },
        ],
      }
    }

    return {
      id: initialData.id,
      name: initialData.name || '',
      slug: initialData.slug || '',
      brand_id: initialData.brand_id || null,
      category_id: initialData.category_id || null,
      group_id: initialData.group_id || null,
      is_megh_brand: !!initialData.is_megh_brand,
      short_description: initialData.short_description || '',
      description_md: initialData.description_md || '',
      ingredients: initialData.ingredients || '',
      shelf_life: initialData.shelf_life || '',
      hs_code: initialData.hs_code || '',
      origin: initialData.origin || 'India',
      dietary_tags: initialData.dietary_tags || [],
      images: initialData.images || [],
      catalogue_pages: initialData.catalogue_pages || '',
      is_active: initialData.is_active !== undefined ? initialData.is_active : true,
      is_featured: !!initialData.is_featured,
      is_new: !!initialData.is_new,
      needs_review: !!initialData.needs_review,
      seo_title: initialData.seo_title || '',
      seo_description: initialData.seo_description || '',
      packs:
        initialData.product_packs && initialData.product_packs.length > 0
          ? initialData.product_packs.map((p, idx: number) => ({
              id: p.id,
              sku: p.sku,
              pack_size: p.pack_size || '',
              units_per_carton: p.units_per_carton || null,
              carton_spec_raw: p.carton_spec_raw || '',
              pack_size_grams: p.pack_size_grams || null,
              pack_size_ml: p.pack_size_ml || null,
              is_active: p.is_active !== undefined ? p.is_active : true,
              sort_order: p.sort_order ?? idx,
            }))
          : [
              {
                sku: 'MF-0001',
                pack_size: '',
                units_per_carton: null,
                carton_spec_raw: '',
                pack_size_grams: null,
                pack_size_ml: null,
                is_active: true,
                sort_order: 0,
              },
            ],
    }
  }, [initialData])

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  React.useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'packs',
  })

  const watchName = watch('name')
  const watchDescription = watch('description_md')

  const handleAutoSlug = () => {
    if (watchName) {
      setValue('slug', slugify(watchName), { shouldValidate: true })
    }
  }

  const handleAddPack = async () => {
    try {
      const nextSku = await getNextSkuNumber()
      append({
        sku: nextSku,
        pack_size: '',
        units_per_carton: null,
        carton_spec_raw: '',
        pack_size_grams: null,
        pack_size_ml: null,
        is_active: true,
        sort_order: fields.length,
      })
    } catch {
      append({
        sku: `MF-${Math.floor(1000 + Math.random() * 9000)}`,
        pack_size: '',
        units_per_carton: null,
        carton_spec_raw: '',
        pack_size_grams: null,
        pack_size_ml: null,
        is_active: true,
        sort_order: fields.length,
      })
    }
  }

  const onSubmit = async (data: ProductFormValues) => {
    setSubmitting(true)
    const toastId = toast.loading('Saving product...')
    try {
      const res = await saveProduct(data)
      if (res.ok) {
        toast.success('Product saved successfully', { id: toastId })
        onOpenChange(false)
        if (onSaved) onSaved()
      } else {
        toast.error(res.error || 'Failed to save product', { id: toastId })
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error saving product'
      toast.error(message, { id: toastId })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-3xl overflow-y-auto p-0 flex flex-col"
      >
        <SheetHeader className="p-6 border-b border-slate-200 bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-xl font-bold font-montserrat text-megh-navy">
                {initialData ? `Edit: ${initialData.name}` : 'New Catalogue Product'}
              </SheetTitle>
              <SheetDescription className="text-xs text-slate-500 mt-1">
                Configure carton specs, packs, ingredients, and catalogue visibility.
              </SheetDescription>
            </div>
            {watch('needs_review') && (
              <Badge variant="warning" className="flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Needs Review
              </Badge>
            )}
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
          <div className="p-6 flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-5 mb-6">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="packs">
                  Packs ({fields.length})
                </TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="trade">Trade Specs</TabsTrigger>
                <TabsTrigger value="seo">SEO & Status</TabsTrigger>
              </TabsList>

              {/* TAB 1: GENERAL */}
              <TabsContent value="general" className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Product Name *
                  </label>
                  <Input
                    {...register('name')}
                    placeholder="e.g. Megh Toor Dal Premium Unpolished"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">URL Slug *</label>
                      <button
                        type="button"
                        onClick={handleAutoSlug}
                        className="text-[11px] text-megh-primary hover:underline flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" /> Auto-generate
                      </button>
                    </div>
                    <Input {...register('slug')} placeholder="megh-toor-dal-premium" />
                    {errors.slug && (
                      <p className="text-xs text-red-600 mt-1">{errors.slug.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Brand</label>
                    <select
                      {...register('brand_id')}
                      className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm"
                    >
                      <option value="">-- Select Brand --</option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} {b.is_megh ? '(Megh Brand)' : '(Partner)'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Product Group
                    </label>
                    <select
                      {...register('group_id')}
                      className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm"
                    >
                      <option value="">-- Select Group --</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Category
                    </label>
                    <select
                      {...register('category_id')}
                      className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm"
                    >
                      <option value="">-- Select Category --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Short Summary (Catalogue subtitle)
                  </label>
                  <Input
                    {...register('short_description')}
                    placeholder="Premium export-grade Indian pulses cleaned and sorted in Changodar"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Product Description (Markdown supported)
                    </label>
                    <button
                      type="button"
                      onClick={() => setPreviewMd(!previewMd)}
                      className="text-[11px] text-megh-primary hover:underline"
                    >
                      {previewMd ? 'Switch to Edit' : 'Preview Markdown'}
                    </button>
                  </div>
                  {previewMd ? (
                    <div className="p-4 rounded-md border border-slate-200 bg-slate-50 min-h-[140px] prose prose-sm max-w-none">
                      <ReactMarkdown>
                        {watchDescription || '*No description written yet.*'}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <Textarea
                      {...register('description_md')}
                      rows={5}
                      placeholder="Detailed product information for foreign importers..."
                    />
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Catalogue Physical Pages (reference)
                  </label>
                  <Input
                    {...register('catalogue_pages')}
                    placeholder="e.g. 4, 12, 13"
                    className="max-w-xs"
                  />
                </div>
              </TabsContent>

              {/* TAB 2: PACKS (One per SKU / carton spec) */}
              <TabsContent value="packs" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Carton Configurations & SKUs
                    </h3>
                    <p className="text-xs text-slate-500">
                      Each row represents an orderable pack size or carton specification.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddPack}
                    className="flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Pack SKU
                  </Button>
                </div>

                <div className="space-y-3">
                  {fields.map((field, idx) => (
                    <div
                      key={field.id}
                      className="p-3.5 rounded-lg border border-slate-200 bg-white shadow-xs space-y-3"
                    >
                      <div className="grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-3">
                          <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                            SKU *
                          </label>
                          <Input
                            {...register(`packs.${idx}.sku` as const)}
                            placeholder="MF-0123"
                            className="font-mono text-xs uppercase"
                          />
                        </div>

                        <div className="col-span-3">
                          <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                            Pack Size
                          </label>
                          <Input
                            {...register(`packs.${idx}.pack_size` as const)}
                            placeholder="2LB / 1KG / 750ML"
                            className="text-xs"
                          />
                        </div>

                        <div className="col-span-3">
                          <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                            Units / Carton
                          </label>
                          <Input
                            type="number"
                            {...register(`packs.${idx}.units_per_carton` as const)}
                            placeholder="20"
                            className="text-xs"
                          />
                        </div>

                        <div className="col-span-2 flex items-center gap-2 pt-4">
                          <Controller
                            control={control}
                            name={`packs.${idx}.is_active` as const}
                            render={({ field: switchField }) => (
                              <div className="flex items-center gap-1.5">
                                <Switch
                                  checked={switchField.value}
                                  onCheckedChange={switchField.onChange}
                                />
                                <span className="text-[11px] text-slate-600">Active</span>
                              </div>
                            )}
                          />
                        </div>

                        <div className="col-span-1 pt-4 flex justify-end">
                          <button
                            type="button"
                            disabled={fields.length === 1}
                            onClick={() => remove(idx)}
                            className="text-slate-400 hover:text-red-600 p-1 disabled:opacity-30"
                            title="Delete pack"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 pt-1 border-t border-slate-100">
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">
                            Raw Carton Spec
                          </label>
                          <Input
                            {...register(`packs.${idx}.carton_spec_raw` as const)}
                            placeholder="2LB x 20 / 40LB CTN"
                            className="text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">
                            Weight (Grams)
                          </label>
                          <Input
                            type="number"
                            {...register(`packs.${idx}.pack_size_grams` as const)}
                            placeholder="908"
                            className="text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">
                            Volume (ML)
                          </label>
                          <Input
                            type="number"
                            {...register(`packs.${idx}.pack_size_ml` as const)}
                            placeholder="750"
                            className="text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* TAB 3: IMAGES */}
              <TabsContent value="images" className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Product Photography</h3>
                  <p className="text-xs text-slate-500">
                    The first image acts as the cover thumbnail on the catalogue. Missing images
                    automatically render the styled Megh placeholder artwork.
                  </p>
                </div>

                <Controller
                  control={control}
                  name="images"
                  render={({ field }) => (
                    <ImageUploader value={field.value || []} onChange={field.onChange} />
                  )}
                />
              </TabsContent>

              {/* TAB 4: TRADE SPECS */}
              <TabsContent value="trade" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Country of Origin
                    </label>
                    <Input {...register('origin')} placeholder="India" />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      HS Code (Harmonized System)
                    </label>
                    <Input {...register('hs_code')} placeholder="e.g. 0713.60.00" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Shelf Life / Expiry
                    </label>
                    <Input {...register('shelf_life')} placeholder="e.g. 24 Months from packaging" />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Megh Own Brand Flag
                    </label>
                    <div className="pt-2">
                      <Controller
                        control={control}
                        name="is_megh_brand"
                        render={({ field }) => (
                          <div className="flex items-center gap-2">
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                            <span className="text-xs text-slate-700 font-medium">
                              Megh In-House Manufacturing Brand
                            </span>
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Ingredients List
                  </label>
                  <Textarea
                    {...register('ingredients')}
                    rows={3}
                    placeholder="100% Indian Pigeon Peas (Toor Dal), sortex cleaned."
                  />
                </div>
              </TabsContent>

              {/* TAB 5: SEO & STATUS */}
              <TabsContent value="seo" className="space-y-5">
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Product Visibility & Flags
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Controller
                      control={control}
                      name="is_active"
                      render={({ field }) => (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                          <span className="text-xs font-medium text-slate-800">
                            Active in Catalogue
                          </span>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </div>
                      )}
                    />

                    <Controller
                      control={control}
                      name="is_featured"
                      render={({ field }) => (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                          <span className="text-xs font-medium text-slate-800">
                            Featured on Homepage
                          </span>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </div>
                      )}
                    />

                    <Controller
                      control={control}
                      name="is_new"
                      render={({ field }) => (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                          <span className="text-xs font-medium text-slate-800">
                            Show &ldquo;New&rdquo; Badge
                          </span>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </div>
                      )}
                    />

                    <Controller
                      control={control}
                      name="needs_review"
                      render={({ field }) => (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                          <span className="text-xs font-medium text-slate-800">
                            Flag for Data Review
                          </span>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </div>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Search Engine Optimization (SEO)
                  </h4>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      SEO Meta Title
                    </label>
                    <Input
                      {...register('seo_title')}
                      placeholder="Buy Megh Toor Dal in Bulk | Indian Food Exporter"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      SEO Meta Description
                    </label>
                    <Textarea
                      {...register('seo_description')}
                      rows={2}
                      placeholder="Export-quality Indian pulses in carton packaging for international distributors and importers."
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <SheetFooter className="p-6 border-t border-slate-200 bg-white sticky bottom-0 z-10 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-megh-primary hover:bg-megh-primary/90 text-white min-w-[130px]"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </span>
              ) : (
                'Save Product'
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
