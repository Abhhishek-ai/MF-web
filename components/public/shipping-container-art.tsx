'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle2 } from 'lucide-react'

export function ShippingContainerArt() {
  const cargoTiles = [
    {
      title: 'Megh Flours',
      spec: '20kg & 2lb packs',
      color: 'bg-amber-500/10 border-amber-300 text-amber-900',
      image: '/images/categories/flours-grains.svg',
      slug: 'flours-grains',
    },
    {
      title: 'Sortex Pulses & Dal',
      spec: 'Toor, Moong, Chana',
      color: 'bg-emerald-500/10 border-emerald-300 text-emerald-900',
      image: '/images/categories/pulses-dals.svg',
      slug: 'pulses-dals',
    },
    {
      title: 'Whole & Ground Spices',
      spec: 'Export grade',
      color: 'bg-orange-500/10 border-orange-300 text-orange-900',
      image: '/images/categories/spices-seasonings.svg',
      slug: 'spices-seasonings',
    },
    {
      title: 'Indian Snacks & Namkeen',
      spec: 'Partner brands',
      color: 'bg-yellow-500/10 border-yellow-300 text-yellow-900',
      image: '/images/categories/namkeen-sev.svg',
      slug: 'namkeen-sev',
    },
    {
      title: 'Beverages & Syrups',
      spec: 'Tea, Juices, Sharbat',
      color: 'bg-sky-500/10 border-sky-300 text-sky-900',
      image: '/images/categories/beverages.svg',
      slug: 'beverages',
    },
    {
      title: 'Biscuits & Confectionery',
      spec: 'Carton packs',
      color: 'bg-rose-500/10 border-rose-300 text-rose-900',
      image: '/images/categories/biscuits-cookies.svg',
      slug: 'biscuits-cookies',
    },
    {
      title: 'Papad & Farsan',
      spec: 'Megh handmade',
      color: 'bg-lime-500/10 border-lime-300 text-lime-900',
      image: '/images/categories/roasted-snacks-farsan.svg',
      slug: 'roasted-snacks-farsan',
    },
    {
      title: 'Brass & Pooja Goods',
      spec: 'Traditional wares',
      color: 'bg-indigo-500/10 border-indigo-300 text-indigo-900',
      image: '/images/categories/brassware-diyas.svg',
      slug: 'brassware-diyas',
    },
  ]

  return (
    <div className="relative w-full max-w-lg mx-auto lg:max-w-none">
      {/* Container Outer Steel Frame */}
      <div className="relative bg-megh-navy rounded-3xl p-4 sm:p-5 border-4 border-slate-800 shadow-2xl shadow-megh-navy/30 overflow-hidden">
        {/* Container Top Ribs & Corner Castings */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-xs bg-slate-600 border border-slate-500 inline-block" />
            <span className="font-bold tracking-wider text-white">MEGH-IND-40HC</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-megh-accent font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> MIXED FCL READY
            </span>
            <span className="w-3 h-3 rounded-xs bg-slate-600 border border-slate-500 inline-block" />
          </div>
        </div>

        {/* Cargo Bay: Grid of 8 Category Tiles simulating container cargo */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 bg-slate-900/60 p-2.5 sm:p-3 rounded-2xl border border-white/5">
          {cargoTiles.map((tile, idx) => {
            return (
              <Link
                key={tile.title}
                href="/products"
                className={`p-3 rounded-xl border bg-white/95 hover:bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between group cursor-pointer ${tile.color}`}
                style={{
                  animationDelay: `${idx * 80}ms`,
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-lg overflow-hidden relative border border-slate-200/80 shadow-xs group-hover:scale-105 transition-transform bg-slate-100">
                    <Image src={tile.image} alt={tile.title} fill className="object-cover" sizes="36px" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-slate-400">
                    BAY 0{idx + 1}
                  </span>
                </div>

                <div className="mt-2.5">
                  <div className="text-xs font-bold font-montserrat text-slate-900 line-clamp-1">
                    {tile.title}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">{tile.spec}</div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Container Base: Chassis & Capacity Details */}
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <div>MAX PAYLOAD: 26,500 KG</div>
          <div className="text-right">CONSOLIDATION: CHANGODAR, GUJARAT</div>
        </div>

        {/* Subtle Decorative Container Corrugation Lines */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-megh-primary via-megh-accent to-megh-primary opacity-60" />
      </div>

      {/* Floating Badge */}
      <div className="absolute -bottom-4 -left-4 sm:left-4 bg-white px-4 py-2 rounded-xl shadow-lg border border-slate-200/80 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
          ✓
        </div>
        <div>
          <div className="text-xs font-bold font-montserrat text-slate-900">
            Carton-Based Ordering
          </div>
          <div className="text-[10px] text-slate-500">Combine 50+ brands in 1 shipment</div>
        </div>
      </div>
    </div>
  )
}
