import * as React from 'react'
import {
  Wheat,
  UtensilsCrossed,
  Coffee,
  Sparkles,
  Flame,
  Candy,
  Package,
  ShoppingBag,
} from 'lucide-react'

interface ProductPlaceholderProps {
  name: string
  categoryName?: string | null
  brandName?: string | null
  isMeghBrand?: boolean
  className?: string
  aspectRatio?: string
}

export function ProductPlaceholder({
  name,
  categoryName,
  brandName,
  isMeghBrand,
  className = '',
}: ProductPlaceholderProps) {
  const cat = (categoryName || '').toLowerCase()

  // Deterministic theme gradient based on category
  let gradient = 'from-slate-100 to-slate-200 text-slate-700'
  let Icon = Package
  let accentColor = 'bg-slate-200/80 text-slate-800'

  if (cat.includes('flour') || cat.includes('grain') || cat.includes('aata') || cat.includes('millet')) {
    gradient = 'from-amber-50 to-amber-100/90 text-amber-900'
    Icon = Wheat
    accentColor = 'bg-amber-200/70 text-amber-900'
  } else if (cat.includes('pulse') || cat.includes('dal') || cat.includes('bean') || cat.includes('rice')) {
    gradient = 'from-emerald-50 to-emerald-100/90 text-emerald-900'
    Icon = UtensilsCrossed
    accentColor = 'bg-emerald-200/70 text-emerald-900'
  } else if (cat.includes('spice') || cat.includes('masala') || cat.includes('chilli')) {
    gradient = 'from-orange-50 to-orange-100/90 text-orange-900'
    Icon = Flame
    accentColor = 'bg-orange-200/70 text-orange-900'
  } else if (cat.includes('snack') || cat.includes('namkeen') || cat.includes('wafer') || cat.includes('papad')) {
    gradient = 'from-yellow-50 to-yellow-100/90 text-yellow-900'
    Icon = ShoppingBag
    accentColor = 'bg-yellow-200/70 text-yellow-900'
  } else if (cat.includes('sweet') || cat.includes('chikki') || cat.includes('chocolate') || cat.includes('biscuit')) {
    gradient = 'from-rose-50 to-rose-100/90 text-rose-900'
    Icon = Candy
    accentColor = 'bg-rose-200/70 text-rose-900'
  } else if (cat.includes('beverage') || cat.includes('tea') || cat.includes('drink') || cat.includes('syrup')) {
    gradient = 'from-sky-50 to-sky-100/90 text-sky-900'
    Icon = Coffee
    accentColor = 'bg-sky-200/70 text-sky-900'
  } else if (cat.includes('pooja') || cat.includes('handicraft') || cat.includes('brass') || cat.includes('havan')) {
    gradient = 'from-indigo-50 to-indigo-100/90 text-indigo-900'
    Icon = Sparkles
    accentColor = 'bg-indigo-200/70 text-indigo-900'
  }

  const brandInitial = (brandName || (isMeghBrand ? 'Megh' : 'M')).charAt(0).toUpperCase()

  return (
    <div
      className={`relative w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-between p-4 overflow-hidden border border-slate-200/60 rounded-xl select-none ${className}`}
    >
      {/* Background Subtle Watermark */}
      <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
        <Icon className="w-36 h-36" />
      </div>

      {/* Top Bar: Brand Initial Badge & Megh Tag */}
      <div className="w-full flex items-center justify-between z-10">
        <div
          className={`w-7 h-7 rounded-lg ${accentColor} flex items-center justify-center font-bold text-xs shadow-xs font-montserrat`}
          title={brandName || 'Megh'}
        >
          {brandInitial}
        </div>

        {isMeghBrand ? (
          <span className="text-[10px] font-bold uppercase tracking-wider bg-megh-primary text-white px-2 py-0.5 rounded-full shadow-xs">
            Megh Brand
          </span>
        ) : categoryName ? (
          <span className="text-[10px] font-medium text-slate-500 bg-white/70 backdrop-blur-xs px-2 py-0.5 rounded-full border border-slate-200/50 truncate max-w-[120px]">
            {categoryName}
          </span>
        ) : null}
      </div>

      {/* Center Category Emblem */}
      <div className="my-auto flex flex-col items-center justify-center text-center p-2 z-10">
        <div className="w-14 h-14 rounded-2xl bg-white/80 shadow-xs border border-white/60 flex items-center justify-center mb-2 backdrop-blur-xs transition-transform group-hover:scale-105 duration-200">
          <Icon className="w-7 h-7 opacity-80" />
        </div>
        <p className="text-xs font-semibold font-montserrat line-clamp-2 px-1 text-slate-800 leading-snug">
          {name}
        </p>
      </div>

      {/* Bottom Subtle Sourcing Notice */}
      <div className="w-full text-center z-10 border-t border-slate-200/40 pt-1.5">
        <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
          Export Packaging • India
        </span>
      </div>
    </div>
  )
}
