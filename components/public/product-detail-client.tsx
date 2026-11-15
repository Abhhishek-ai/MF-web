'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import {
  ShoppingBag,
  MessageCircle,
  FileDown,
  Check,
  ChevronRight,
  Package,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { ProductPlaceholder } from '@/components/public/product-placeholder'
import { ProductCard } from '@/components/public/product-card'
import { useBasket } from '@/lib/basket/store'
import { toast } from 'sonner'
import type { Product } from '@/lib/types'

interface ProductDetailClientProps {
  product: Product
  relatedProducts: Product[]
  pdfUrl?: string | null
  whatsappNumber?: string
}

export function ProductDetailClient({
  product,
  relatedProducts,
  pdfUrl,
  whatsappNumber = '+91 98250 00000',
}: ProductDetailClientProps) {
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0)
  const [packQuantities, setPackQuantities] = React.useState<Record<string, number>>({})
  const [justAddedSku, setJustAddedSku] = React.useState<string | null>(null)
  const [addedAll, setAddedAll] = React.useState(false)

  const addLine = useBasket((s) => s.add)

  const activePacks = (product.packs || []).filter((p) => p.is_active)
  const images = product.images || []
  const currentImage = images[selectedImageIndex] || images[0]

  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '')
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hello Megh Foods, I would like an indicative quote for ${product.name} (SKU: ${
      activePacks[0]?.sku || 'Product Enquiry'
    }) for container export.`
  )}`

  const handleQtyChange = (sku: string, val: number) => {
    const safeVal = Math.max(1, Math.min(10000, isNaN(val) ? 1 : val))
    setPackQuantities((prev) => ({ ...prev, [sku]: safeVal }))
  }

  const handleAddSinglePack = (pack: (typeof activePacks)[0]) => {
    const qty = packQuantities[pack.sku] || 1
    addLine(
      {
        sku: pack.sku,
        productSlug: product.slug,
        productName: product.name,
        brand: product.brand?.name || (product.is_megh_brand ? 'Megh' : null),
        packSize: pack.pack_size || null,
        unitsPerCarton: pack.units_per_carton || null,
      },
      qty
    )

    setJustAddedSku(pack.sku)
    toast.success(`Added ${qty} carton(s) of ${pack.sku} to Enquiry Basket!`)
    setTimeout(() => setJustAddedSku(null), 1500)
  }

  const handleAddAllPacks = () => {
    activePacks.forEach((pack) => {
      const qty = packQuantities[pack.sku] || 1
      addLine(
        {
          sku: pack.sku,
          productSlug: product.slug,
          productName: product.name,
          brand: product.brand?.name || (product.is_megh_brand ? 'Megh' : null),
          packSize: pack.pack_size || null,
          unitsPerCarton: pack.units_per_carton || null,
        },
        qty
      )
    })

    setAddedAll(true)
    toast.success(`Added all ${activePacks.length} pack variants to Enquiry Basket!`)
    setTimeout(() => setAddedAll(false), 1500)
  }

  // Factual default description if empty
  const factualDescription =
    product.description_md ||
    product.short_description ||
    `${product.name} is processed, cleaned, and packed under rigorous Indian food export standards for international retail distributors and supermarkets abroad. Orderable by the carton for mixed FCL/LCL container consolidation directly from our Changodar manufacturing and export consolidation hub in Ahmedabad, Gujarat, India.`

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-12">
      {/* Breadcrumbs Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto pb-1">
        <Link href="/" className="hover:text-megh-primary transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/products" className="hover:text-megh-primary transition-colors">
          Catalogue
        </Link>
        {product.group && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link
              href={`/range/${product.group.slug}`}
              className="hover:text-megh-primary transition-colors"
            >
              {product.group.name}
            </Link>
          </>
        )}
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link
              href={`/category/${product.category.slug}`}
              className="hover:text-megh-primary transition-colors"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-slate-800 truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      {/* Main 2-Column Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Gallery & Placeholders (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Display Image */}
          <div
            style={{ position: 'relative', width: '100%', aspectRatio: '4/3', overflow: 'hidden' }}
            className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shadow-xs relative"
          >
            {currentImage ? (
              <Image
                src={currentImage}
                alt={product.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 500px"
              />
            ) : (
              <ProductPlaceholder
                name={product.name}
                categoryName={product.category?.name}
                brandName={product.brand?.name}
                isMeghBrand={product.is_megh_brand}
              />
            )}

            {product.is_megh_brand && (
              <div className="absolute top-3 left-3 z-10">
                <Badge variant="primary" className="text-xs font-bold px-2.5 py-1 shadow-sm">
                  Megh Own Brand
                </Badge>
              </div>
            )}
          </div>

          {/* Thumbnails Strip if multiple images */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden relative border-2 flex-shrink-0 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-megh-primary ring-2 ring-megh-primary/20'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}

          {/* Carton Packaging Guidance Box */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 text-xs text-blue-950 space-y-1.5 shadow-2xs">
            <div className="font-bold flex items-center gap-1.5">
              <Package className="w-4 h-4 text-megh-primary" /> B2B Carton Specification Note
            </div>
            <p className="text-[11px] text-blue-900/80 leading-relaxed">
              Standard Indian export outer cartons with moisture barrier lining. Quantities are
              specified in cartons (e.g. <code>2LB x 20</code> = 20 retail pouches per outer carton).
            </p>
          </div>
        </div>

        {/* Center / Right Column: Product Info & Pack Table (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Brand & Category badges */}
          <div className="flex flex-wrap items-center gap-2">
            {product.brand && (
              <Link href={`/brand/${product.brand.slug}`}>
                <Badge variant="secondary" className="text-xs font-semibold hover:bg-slate-200">
                  Brand: {product.brand.name}
                </Badge>
              </Link>
            )}
            {product.category && (
              <Link href={`/category/${product.category.slug}`}>
                <Badge variant="outline" className="text-xs hover:border-megh-primary">
                  {product.category.name}
                </Badge>
              </Link>
            )}
            <span className="text-xs text-slate-400 font-mono">Origin: India</span>
          </div>

          {/* Product Headline Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold font-montserrat text-megh-navy leading-tight">
            {product.name}
          </h1>

          {/* Short summary */}
          <p className="text-sm text-slate-600 leading-relaxed">
            {product.short_description || factualDescription.substring(0, 180) + '...'}
          </p>

          {/* PACKS TABLE & CARTONS ORDERING */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-montserrat font-bold text-sm text-slate-900">
                  Carton Packaging Configurations
                </h3>
                <p className="text-[11px] text-slate-500">
                  Select carton quantities for your mixed container shipment.
                </p>
              </div>

              {activePacks.length > 1 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddAllPacks}
                  className="h-8 text-xs font-semibold border-slate-300 hover:border-megh-primary text-slate-700"
                >
                  {addedAll ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" /> Added All
                    </>
                  ) : (
                    'Add All Variants'
                  )}
                </Button>
              )}
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Pack Size</TableHead>
                  <TableHead className="text-center">Units / Carton</TableHead>
                  <TableHead className="w-24 text-center">Cartons</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activePacks.map((pack) => {
                  const qty = packQuantities[pack.sku] || 1
                  const isAdded = justAddedSku === pack.sku

                  return (
                    <TableRow key={pack.sku}>
                      <TableCell className="font-mono text-xs font-bold text-megh-navy">
                        {pack.sku}
                      </TableCell>

                      <TableCell className="text-xs font-semibold text-slate-800">
                        {pack.pack_size || 'Standard Pack'}
                        {pack.carton_spec_raw && (
                          <span className="block text-[10px] text-slate-400 font-mono">
                            {pack.carton_spec_raw}
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="text-center text-xs font-mono">
                        {pack.units_per_carton ?? '—'}
                      </TableCell>

                      <TableCell className="text-center">
                        <Input
                          type="number"
                          min={1}
                          max={10000}
                          value={qty}
                          onChange={(e) =>
                            handleQtyChange(pack.sku, parseInt(e.target.value, 10))
                          }
                          className="h-8 w-18 text-center text-xs font-mono font-bold mx-auto"
                        />
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleAddSinglePack(pack)}
                          className={`h-8 text-xs font-semibold px-3 rounded-lg transition-colors ${
                            isAdded
                              ? 'bg-emerald-600 text-white'
                              : 'bg-megh-primary hover:bg-megh-primary/90 text-white'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5 mr-1" /> Added
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5 mr-1" /> Add
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 min-w-[200px]"
            >
              <Button
                variant="outline"
                className="w-full h-11 text-xs font-bold bg-[#25D366]/10 text-emerald-800 border-emerald-300 hover:bg-[#25D366]/20 flex items-center justify-center gap-2 rounded-xl"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" /> Chat on WhatsApp for Quote
              </Button>
            </a>

            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex"
              >
                <Button
                  variant="outline"
                  className="h-11 text-xs font-semibold text-slate-700 border-slate-300 hover:border-megh-primary flex items-center gap-1.5 rounded-xl"
                >
                  <FileDown className="w-4 h-4 text-megh-primary" /> Full Catalogue PDF
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Section: Description, Trade Details, Packaging */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="mb-6 grid grid-cols-3 max-w-md">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="trade">Trade Specs</TabsTrigger>
            <TabsTrigger value="packaging">Packaging</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="space-y-4 text-sm text-slate-700 leading-relaxed">
            <div className="prose prose-sm max-w-none text-slate-700">
              <ReactMarkdown>{factualDescription}</ReactMarkdown>
            </div>

            {product.ingredients && (
              <div className="pt-4 border-t border-slate-100 text-xs">
                <span className="font-bold text-slate-900 block mb-1">Ingredients:</span>
                <p className="text-slate-600">{product.ingredients}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="trade" className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 font-medium block">Country of Origin</span>
                <span className="font-bold text-slate-900 text-sm">{product.origin || 'India'}</span>
              </div>

              {product.hs_code && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-medium block">HS Code (Harmonized)</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{product.hs_code}</span>
                </div>
              )}

              {product.shelf_life && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-medium block">Shelf Life / Expiry</span>
                  <span className="font-semibold text-slate-900 text-sm">{product.shelf_life}</span>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 font-medium block">Export Port of Loading</span>
                <span className="font-semibold text-slate-900 text-sm">Mundra / Nhava Sheva (JNPT)</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 font-medium block">Processing Facility</span>
                <span className="font-semibold text-slate-900 text-sm">Changodar, Ahmedabad, Gujarat</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 font-medium block">Quality Certifications</span>
                <span className="font-semibold text-emerald-700 text-sm">FSSAI / APEDA / ISO 22000</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="packaging" className="space-y-4 text-xs text-slate-600 leading-relaxed">
            <h4 className="font-bold font-montserrat text-sm text-slate-900">
              Understanding Carton Notation & Container Stuffing
            </h4>
            <p>
              In our B2B export catalogue, cartons are designated in units per outer carton. For
              example, <code>2LB x 20</code> designates twenty 2-pound pouches per master corrugated
              box (total carton gross weight approximately 40 lbs / 18.1 kg).
            </p>
            <p>
              Master cartons are heavy-duty 5-ply or 7-ply export grade with strapping, moisture
              barrier liner, and barcode identification conforming to international receiving dock
              standards in the United States, United Kingdom, European Union, and Middle East.
            </p>
          </TabsContent>
        </Tabs>
      </div>

      {/* Partner Brand Trademark Disclaimer */}
      {!product.is_megh_brand && (
        <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200 text-[11px] text-slate-500 italic">
          <strong>Notice:</strong> Brand names, trademarks, and carton designs are the property of
          their respective manufacturers and are shown strictly for export sourcing and container
          consolidation reference.
        </div>
      )}

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-montserrat text-megh-navy">
              Related Products in this Category
            </h3>
            <Link
              href="/products"
              className="text-xs font-bold text-megh-primary hover:underline"
            >
              View More Products →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
