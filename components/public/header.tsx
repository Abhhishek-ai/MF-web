'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ShoppingBag,
  FileDown,
  Menu,
  X,
  ChevronDown,
  Phone,
  Mail,
  Globe,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBasket } from '@/lib/basket/store'
import type { ProductGroup, Category } from '@/lib/types'

interface HeaderProps {
  groups: ProductGroup[]
  categories: Category[]
  pdfUrl?: string | null
  phone?: string
  email?: string
}

export function Header({
  groups,
  categories,
  pdfUrl,
  phone = '+91 98250 00000',
  email = 'export@meghfoods.com',
}: HeaderProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [megaMenuOpen, setMegaMenuOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  const basketLines = useBasket((s) => s.lines)
  const basketCount = basketLines.reduce((sum, line) => sum + line.quantity, 0)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Close menus on path change
  React.useEffect(() => {
    setMobileMenuOpen(false)
    setMegaMenuOpen(false)
  }, [pathname])

  // Don't render public header on admin paths
  if (pathname.startsWith('/admin')) {
    return null
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
      {/* Top Utility Bar for International Importers */}
      <div className="bg-megh-navy text-white text-xs py-1.5 px-4 sm:px-8 border-b border-white/10 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-megh-accent" /> Export Consolidator & Manufacturer
            </span>
            <span>•</span>
            <span>Changodar Facility, Ahmedabad, India</span>
          </div>

          <div className="flex items-center gap-5 text-slate-300">
            <a
              href={`mailto:${email}`}
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Mail className="w-3 h-3 text-megh-accent" /> {email}
            </a>
            <span>•</span>
            <a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Phone className="w-3 h-3 text-megh-accent" /> {phone}
            </a>
            <span>•</span>
            <Link
              href="/admin/login"
              className="text-[11px] text-slate-400 hover:text-white transition-colors"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-megh-primary text-white flex items-center justify-center font-bold text-xl shadow-md shadow-megh-primary/20 group-hover:scale-105 transition-transform">
            M
          </div>
          <div>
            <div className="font-montserrat font-extrabold text-xl tracking-tight text-megh-navy">
              MEGH <span className="text-megh-primary">FOODS</span>
            </div>
            <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-500">
              Megh Overseas Pvt. Ltd.
            </div>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {/* Catalogue Mega-Menu Trigger */}
          <div
            className="relative"
            onMouseEnter={() => setMegaMenuOpen(true)}
            onMouseLeave={() => setMegaMenuOpen(false)}
          >
            <Link
              href="/products"
              className={`flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                pathname.startsWith('/products')
                  ? 'text-megh-primary bg-megh-primary/5'
                  : 'text-slate-700 hover:text-megh-primary hover:bg-slate-50'
              }`}
            >
              Catalogue <ChevronDown className="w-4 h-4 text-slate-400" />
            </Link>

            {/* Mega Menu Dropdown */}
            {megaMenuOpen && (
              <div className="absolute top-full left-0 w-[580px] bg-white rounded-2xl shadow-xl border border-slate-200/90 p-6 grid grid-cols-2 gap-6 z-50 animate-in fade-in-50 slide-in-from-top-2 duration-150">
                {groups.map((group) => {
                  const groupCats = categories.filter((c) => c.group_id === group.id)
                  return (
                    <div key={group.id} className="space-y-2">
                      <Link
                        href={`/range/${group.slug}`}
                        className="font-montserrat font-bold text-xs uppercase tracking-wider text-megh-navy hover:text-megh-primary transition-colors block border-b border-slate-100 pb-1"
                      >
                        {group.name}
                      </Link>
                      <ul className="space-y-1">
                        {groupCats.slice(0, 5).map((cat) => (
                          <li key={cat.id}>
                            <Link
                              href={`/category/${cat.slug}`}
                              className="text-xs text-slate-600 hover:text-megh-primary transition-colors block py-0.5"
                            >
                              {cat.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}

                <div className="col-span-2 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    2,140+ SKUs available for mixed shipment
                  </span>
                  <Link
                    href="/products"
                    className="font-bold text-megh-primary hover:underline"
                  >
                    View All Products →
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/megh-brand"
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
              pathname === '/megh-brand'
                ? 'text-megh-primary bg-megh-primary/5'
                : 'text-slate-700 hover:text-megh-primary hover:bg-slate-50'
            }`}
          >
            Megh Brand
          </Link>

          <Link
            href="/mixed-container"
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
              pathname === '/mixed-container'
                ? 'text-megh-primary bg-megh-primary/5'
                : 'text-slate-700 hover:text-megh-primary hover:bg-slate-50'
            }`}
          >
            Mixed Containers
          </Link>

          <Link
            href="/private-label"
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
              pathname === '/private-label'
                ? 'text-megh-primary bg-megh-primary/5'
                : 'text-slate-700 hover:text-megh-primary hover:bg-slate-50'
            }`}
          >
            Private Label
          </Link>

          <Link
            href="/about"
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
              pathname === '/about'
                ? 'text-megh-primary bg-megh-primary/5'
                : 'text-slate-700 hover:text-megh-primary hover:bg-slate-50'
            }`}
          >
            About Us
          </Link>

          <Link
            href="/contact"
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
              pathname === '/contact'
                ? 'text-megh-primary bg-megh-primary/5'
                : 'text-slate-700 hover:text-megh-primary hover:bg-slate-50'
            }`}
          >
            Contact
          </Link>
        </nav>

        {/* Action Buttons: PDF Catalogue & Basket */}
        <div className="flex items-center gap-3">
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex"
            >
              <Button
                variant="outline"
                size="sm"
                className="h-10 text-xs font-semibold text-slate-700 border-slate-300 hover:border-megh-primary hover:text-megh-primary"
              >
                <FileDown className="w-4 h-4 mr-1.5 text-megh-primary" /> Download Catalogue
              </Button>
            </a>
          )}

          {/* Enquiry Basket CTA */}
          <Link href="/basket">
            <Button
              className="h-10 bg-megh-primary hover:bg-megh-primary/90 text-white font-semibold text-xs rounded-xl shadow-sm px-4 flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Enquiry Basket</span>
              {mounted && basketCount > 0 && (
                <span className="bg-megh-accent text-megh-navy font-bold text-[11px] px-2 py-0.5 rounded-full">
                  {basketCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-6 py-6 space-y-4 shadow-xl">
          <nav className="space-y-2">
            <Link
              href="/products"
              className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-50"
            >
              Full Catalogue (2,000+ SKUs)
            </Link>
            <Link
              href="/megh-brand"
              className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-50"
            >
              Megh Own Brand
            </Link>
            <Link
              href="/mixed-container"
              className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-50"
            >
              Mixed Containers Guide
            </Link>
            <Link
              href="/private-label"
              className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-50"
            >
              Private Label Packaging
            </Link>
            <Link
              href="/about"
              className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-50"
            >
              About Megh Foods
            </Link>
            <Link
              href="/contact"
              className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-50"
            >
              Contact Sales Team
            </Link>
          </nav>

          {pdfUrl && (
            <div className="pt-2 border-t border-slate-100">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800"
              >
                <FileDown className="w-4 h-4 text-megh-primary" /> Download 65-Page Catalogue PDF
              </a>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-1">
            <div>Email: {email}</div>
            <div>WhatsApp / Phone: {phone}</div>
          </div>
        </div>
      )}
    </header>
  )
}
