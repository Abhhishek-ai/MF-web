'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Check, ShoppingBag, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductPlaceholder } from '@/components/public/product-placeholder'
import { useBasket } from '@/lib/basket/store'
import { toast } from 'sonner'
import type { Product } from '@/lib/types'

interface ProductCardProps {
  product: Product
  priority?: boolean
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [selectedPackIndex, setSelectedPackIndex] = React.useState(0)
  const [justAdded, setJustAdded] = React.useState(false)
  const [imgError, setImgError] = React.useState(false)

  const addLine = useBasket((s) => s.add)
  const coverImage = product.images?.[0]
  const packs = (product.packs || []).filter((p) => p.is_active)
  const activePack = packs[selectedPackIndex] || packs[0]

  const handleAddToBasket = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!activePack) {
      toast.error('No carton pack available for this item')
      return
    }

    addLine(
      {
        sku: activePack.sku,
        productSlug: product.slug,
        productName: product.name,
        brand: product.brand?.name || (product.is_megh_brand ? 'Megh' : null),
        packSize: activePack.pack_size || null,
        unitsPerCarton: activePack.units_per_carton || null,
      },
      1
    )

    setJustAdded(true)
    toast.success(`Added ${product.name} (${activePack.sku}) to enquiry basket!`)
    setTimeout(() => setJustAdded(false), 1500)
  }

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-megh-primary/40 hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden">
      <Link href={`/products/${product.slug}`} className="block relative">
        {/* Cover Thumbnail / Designed Placeholder */}
        <div
          style={{ position: 'relative', width: '100%', aspectRatio: '4/3', overflow: 'hidden' }}
          className="aspect-[4/3] w-full overflow-hidden bg-slate-50 relative"
        >
          {coverImage && !imgError ? (
            <Image
              src={coverImage}
              alt={product.name}
              fill
              priority={priority}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImgError(true)}
            />
          ) : (
            <ProductPlaceholder
              name={product.name}
              categoryName={product.category?.name}
              brandName={product.brand?.name}
              isMeghBrand={product.is_megh_brand}
            />
          )}

          {/* Badges on top */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
            {product.is_megh_brand && (
              <Badge variant="primary" className="text-[10px] shadow-sm font-semibold">
                Megh Brand
              </Badge>
            )}
            {product.is_new && (
              <Badge variant="accent" className="text-[10px] shadow-sm">
                New
              </Badge>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="p-4 space-y-2">
          {/* Brand & Category row */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span className="truncate max-w-[130px] font-semibold text-slate-700">
              {product.brand?.name || (product.is_megh_brand ? 'Megh' : 'Indian FMCG')}
            </span>
            {product.category?.name && (
              <span className="text-slate-400 truncate max-w-[110px]">
                {product.category.name}
              </span>
            )}
          </div>

          {/* Product Title */}
          <h3 className="font-montserrat font-bold text-sm text-slate-900 group-hover:text-megh-primary transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>

          {/* Short description */}
          {product.short_description ? (
            <p className="text-xs text-slate-500 line-clamp-1">{product.short_description}</p>
          ) : (
            <p className="text-[11px] text-slate-400 font-mono">
              Export standard carton packaging
            </p>
          )}
        </div>
      </Link>

      {/* Pack Selection & Quick Add Section */}
      <div className="p-4 pt-0 space-y-3">
        {/* Pack Chips */}
        {packs.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-100">
            {packs.slice(0, 3).map((pack, idx) => (
              <button
                key={pack.sku}
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setSelectedPackIndex(idx)
                }}
                className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                  selectedPackIndex === idx
                    ? 'bg-megh-navy text-white border-megh-navy font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {pack.pack_size || pack.sku}
                {pack.units_per_carton ? ` (${pack.units_per_carton}/ctn)` : ''}
              </button>
            ))}
            {packs.length > 3 && (
              <Link
                href={`/products/${product.slug}`}
                className="text-[10px] text-megh-primary font-semibold hover:underline self-center ml-1"
              >
                +{packs.length - 3} more
              </Link>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleAddToBasket}
            className={`w-full text-xs font-semibold h-9 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-megh-primary hover:bg-megh-primary/90 text-white'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added to Basket
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" /> Add to Enquiry
              </>
            )}
          </Button>

          <Link href={`/products/${product.slug}`}>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-2.5 rounded-xl border-slate-200 hover:border-megh-primary"
              title="View full product & carton specs"
            >
              <Eye className="w-4 h-4 text-slate-600" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
