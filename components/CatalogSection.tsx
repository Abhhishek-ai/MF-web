'use client'

import React, { useState, useMemo } from 'react'
import Image from 'next/image'
import { Search, Plus, Minus, Check, ShoppingBag, Filter, Sparkles } from 'lucide-react'
import type { Product, ProductPack } from '@/lib/types'
import { useBasket } from '@/lib/basket/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

interface CatalogSectionProps {
  initialProducts: Product[]
  onOpenBasket: () => void
}

export function CatalogSection({ initialProducts, onOpenBasket }: CatalogSectionProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<string>('all')
  const [meghOnly, setMeghOnly] = useState(false)
  const [selectedPacks, setSelectedPacks] = useState<Record<string, string>>({})
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [addedSku, setAddedSku] = useState<string | null>(null)

  const addLine = useBasket((s) => s.add)

  // Extract unique groups
  const groups = useMemo(() => {
    const list = Array.from(
      new Set(initialProducts.map((p) => p.group?.name || 'Other'))
    )
    return ['All', ...list]
  }, [initialProducts])

  // Filter products
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((p) => {
      // Group filter
      if (selectedGroup !== 'all' && (p.group?.name || 'Other') !== selectedGroup) {
        return false
      }
      // Megh brand toggle
      if (meghOnly && !p.is_megh_brand) {
        return false
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesName = p.name.toLowerCase().includes(q)
        const matchesBrand = p.brand?.name?.toLowerCase().includes(q)
        const matchesCategory = p.category?.name?.toLowerCase().includes(q)
        const matchesSku = p.packs?.some((pk) => pk.sku.toLowerCase().includes(q))
        if (!matchesName && !matchesBrand && !matchesCategory && !matchesSku) {
          return false
        }
      }
      return true
    })
  }, [initialProducts, selectedGroup, meghOnly, searchQuery])

  // Helper to get selected pack for a product
  const getSelectedPack = (p: Product): ProductPack | undefined => {
    if (!p.packs || p.packs.length === 0) return undefined
    const selectedId = selectedPacks[p.slug]
    if (selectedId) {
      const match = p.packs.find((pk) => pk.sku === selectedId)
      if (match) return match
    }
    return p.packs[0]
  }

  const handlePackChange = (productSlug: string, sku: string) => {
    setSelectedPacks((prev) => ({ ...prev, [productSlug]: sku }))
  }

  const handleQtyChange = (productSlug: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[productSlug] || 1
      const next = Math.max(1, Math.min(500, current + delta))
      return { ...prev, [productSlug]: next }
    })
  }

  const handleAddToBasket = (p: Product) => {
    const pack = getSelectedPack(p)
    if (!pack) return

    const qty = quantities[p.slug] || 1

    addLine(
      {
        sku: pack.sku,
        productSlug: p.slug,
        productName: p.name,
        brand: p.brand?.name || (p.is_megh_brand ? 'Megh' : null),
        packSize: pack.pack_size,
        unitsPerCarton: pack.units_per_carton,
      },
      qty
    )

    // Flash added feedback
    setAddedSku(pack.sku)
    setTimeout(() => {
      setAddedSku(null)
    }, 1500)
  }

  return (
    <section id="catalogue" className="py-20 bg-brand-surface border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Title and Intro */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-brand-blue text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full B2B Product Directory</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-navy tracking-tight font-heading">
              Export Product Catalogue
            </h2>
            <p className="text-slate-600 mt-2 max-w-xl text-sm sm:text-base">
              Add master cartons to your enquiry basket. We provide instant container cube calculations and volume quotes.
            </p>
          </div>

          <Button
            onClick={onOpenBasket}
            variant="default"
            size="lg"
            className="gap-2 shadow-sm font-bold shrink-0 self-start md:self-auto"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Review Enquiry Basket</span>
          </Button>
        </div>

        {/* Search and Filters Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Search dal, spices, Frooti, Parle-G, brass thali..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-slate-50 border-slate-200 focus-visible:bg-white text-sm"
              />
            </div>

            {/* Megh Brand Only Filter Toggle */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={meghOnly}
                  onChange={(e) => setMeghOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-brand-blue focus:ring-brand-blue"
                />
                <span>Megh Brand Only</span>
              </label>
            </div>
          </div>

          {/* Group Filter Tabs */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            {groups.map((group) => {
              const active =
                selectedGroup.toLowerCase() === group.toLowerCase() ||
                (selectedGroup === 'all' && group === 'All')
              return (
                <button
                  key={group}
                  onClick={() => setSelectedGroup(group === 'All' ? 'all' : group)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    active
                      ? 'bg-brand-blue text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {group}
                </button>
              )
            })}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-6 px-1">
          <span>
            Showing <strong className="text-brand-navy">{filteredProducts.length}</strong> export products
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-brand-blue hover:underline"
            >
              Clear search filter
            </button>
          )}
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Filter className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-brand-navy">No products match your search</h3>
            <p className="text-sm text-slate-500 mt-1">
              Try adjusting your query or resetting category filters.
            </p>
            <Button
              onClick={() => {
                setSearchQuery('')
                setSelectedGroup('all')
                setMeghOnly(false)
              }}
              variant="outline"
              size="sm"
              className="mt-4"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((p) => {
              const currentPack = getSelectedPack(p)
              const qty = quantities[p.slug] || 1
              const isAdded = currentPack && addedSku === currentPack.sku
              const imageUrl = p.images[0] || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80'

              return (
                <div
                  key={p.slug}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    background: '#ffffff',
                    borderRadius: '1rem',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                  }}
                  className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden flex flex-col justify-between hover:shadow-xl hover:border-brand-blue/40 transition-all duration-300 group"
                >
                  {/* Card Top: Cover Image & Badges */}
                  <div>
                    {/* Fixed container to prevent image blowout */}
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '192px',
                        maxHeight: '192px',
                        overflow: 'hidden',
                        background: '#f1f5f9',
                      }}
                      className="relative h-48 w-full bg-slate-100 overflow-hidden"
                    >
                      <Image
                        src={imageUrl}
                        alt={p.name}
                        width={400}
                        height={192}
                        style={{
                          width: '100%',
                          height: '192px',
                          maxHeight: '192px',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div
                        style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 10 }}
                        className="absolute top-3 left-3 flex flex-wrap gap-1 z-10"
                      >
                        {p.is_megh_brand ? (
                          <Badge variant="megh" className="shadow-sm">
                            Megh Brand
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="shadow-sm font-semibold">
                            {p.brand?.name || 'Partner Brand'}
                          </Badge>
                        )}
                      </div>

                      {p.category && (
                        <div
                          style={{ position: 'absolute', bottom: '12px', left: '12px', zIndex: 10 }}
                          className="absolute bottom-3 left-3 z-10"
                        >
                          <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium">
                            {p.category.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-5">
                      <h3 className="font-bold text-base text-brand-navy leading-snug group-hover:text-brand-blue transition-colors line-clamp-1">
                        {p.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {p.short_description}
                      </p>

                      {/* Pack Options Selector */}
                      {p.packs && p.packs.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-100">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                            Available Pack / Carton
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {p.packs.map((pk) => {
                              const isSelected = currentPack?.sku === pk.sku
                              return (
                                <button
                                  key={pk.sku}
                                  onClick={() => handlePackChange(p.slug, pk.sku)}
                                  className={`text-xs px-2.5 py-1 rounded-md border font-semibold transition-all ${
                                    isSelected
                                      ? 'border-brand-blue bg-blue-50 text-brand-blue shadow-xs'
                                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                  }`}
                                >
                                  {pk.pack_size || pk.sku}
                                  {pk.units_per_carton && (
                                    <span className="text-[10px] text-slate-400 ml-1">
                                      ({pk.units_per_carton}/ctn)
                                    </span>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Carton Spec Box */}
                      {currentPack && (
                        <div className="mt-3 text-xs bg-slate-50 rounded-lg p-2 flex items-center justify-between text-slate-600">
                          <span className="font-medium">SKU: <strong className="text-slate-800">{currentPack.sku}</strong></span>
                          {currentPack.units_per_carton && (
                            <span className="text-slate-500">
                              {currentPack.units_per_carton} units / master carton
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom: Quantity & Add Button */}
                  <div className="p-5 pt-0">
                    <div className="flex items-center gap-2">
                      {/* Quantity stepper */}
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                        <button
                          type="button"
                          onClick={() => handleQtyChange(p.slug, -1)}
                          className="w-8 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-200 rounded-l-lg transition"
                          title="Decrease cartons"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-brand-navy">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQtyChange(p.slug, 1)}
                          className="w-8 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-200 rounded-r-lg transition"
                          title="Increase cartons"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Add Button */}
                      <Button
                        onClick={() => handleAddToBasket(p)}
                        variant={isAdded ? 'accent' : 'default'}
                        className="flex-1 font-bold text-xs gap-1.5 shadow-sm transition-all"
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-700" />
                            <span>Added!</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            <span>Add {qty} ctn</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
