'use client'

import React from 'react'
import Link from 'next/link'
import { MessageCircle, ShoppingBag, Globe, PhoneCall } from 'lucide-react'
import { useBasket } from '@/lib/basket/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface NavbarProps {
  onOpenBasket: () => void
}

export function Navbar({ onOpenBasket }: NavbarProps) {
  const lines = useBasket((s) => s.lines)
  const totalCartons = lines.reduce((acc, curr) => acc + curr.quantity, 0)
  const uniqueItems = lines.length

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      {/* Top micro-bar */}
      <div className="bg-brand-navy text-white text-xs py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-brand-green animate-pulse" />
            <span className="font-medium">Direct Indian Exporter & Consolidator • Changodar, Ahmedabad</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <a href="tel:+919898255500" className="hover:text-white flex items-center gap-1 transition">
              <PhoneCall className="w-3 h-3 text-brand-green" />
              <span>+91 989 825 5500</span>
            </a>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline flex items-center gap-1">
              <Globe className="w-3 h-3 text-brand-blue" />
              FCL & LCL Worldwide Shipments
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-blue to-blue-700 text-white flex items-center justify-center font-extrabold text-xl shadow-md group-hover:scale-105 transition-transform">
            MF
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-brand-navy font-heading">
                MEGH FOODS
              </span>
              <Badge variant="megh" className="text-[10px] uppercase font-bold py-0.5 px-1.5">
                B2B EXPORT
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Megh Overseas Pvt. Ltd. • India
            </p>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-700">
          <a href="#catalogue" className="hover:text-brand-blue transition">
            Export Catalogue
          </a>
          <a href="#consolidation" className="hover:text-brand-blue transition">
            Container Consolidation
          </a>
          <a href="#markets" className="hover:text-brand-blue transition">
            Global Markets
          </a>
          <a href="#credentials" className="hover:text-brand-blue transition">
            Certifications & Factory
          </a>
          <a href="#contact" className="hover:text-brand-blue transition">
            Contact
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <a
            href="https://wa.me/919898255500?text=Hello%20Megh%20Foods%20Export%20Team%2C%20I%20am%20interested%20in%20a%20container%20quotation."
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex"
          >
            <Button variant="outline" size="sm" className="gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50">
              <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-100" />
              <span>WhatsApp Export Desk</span>
            </Button>
          </a>

          <Button
            onClick={onOpenBasket}
            variant="default"
            className="relative gap-2 font-semibold shadow-sm hover:shadow-md transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Enquiry Basket</span>
            <span className="sm:hidden">Basket</span>
            {uniqueItems > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-brand-green text-brand-navy rounded-full">
                {totalCartons} ctn
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}

