import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Search,
  ArrowRight,
  Layers,
  Sparkles,
  CheckCircle2,
  FileSpreadsheet,
  Globe,
  Award,
  Boxes,
  ShieldCheck,
  Factory,
  FileCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ShippingContainerArt } from '@/components/public/shipping-container-art'
import { ProductCard } from '@/components/public/product-card'
import {
  getProductCount,
  getFeaturedProducts,
  getCategories,
  getBrands,
} from '@/lib/data'
import { getSettings } from '@/lib/settings'

export const dynamic = 'force-dynamic'

function getCategoryImageUrl(slug: string, rawUrl?: string | null): string {
  if (rawUrl && !rawUrl.includes('placeholder') && !rawUrl.includes('unsplash')) return rawUrl
  const s = slug.toLowerCase()
  if (s.includes('pulse') || s.includes('dal') || s.includes('bean')) return '/images/categories/pulses-dals.svg'
  if (s.includes('spice') || s.includes('masala') || s.includes('chilli')) return '/images/categories/spices-seasonings.svg'
  if (s.includes('flour') || s.includes('grain') || s.includes('aata') || s.includes('rice') || s.includes('vermicelli')) return '/images/categories/flours-grains.svg'
  if (s.includes('roasted') || s.includes('farsan') || s.includes('papad') || s.includes('khakhra')) return '/images/categories/roasted-snacks-farsan.svg'
  if (s.includes('namkeen') || s.includes('sev') || s.includes('snack') || s.includes('bhujia')) return '/images/categories/namkeen-sev.svg'
  if (s.includes('bev') || s.includes('tea') || s.includes('coffee') || s.includes('juice') || s.includes('drink') || s.includes('syrup')) return '/images/categories/beverages.svg'
  if (s.includes('biscuit') || s.includes('cookie') || s.includes('sweet') || s.includes('confectionery') || s.includes('chikki')) return '/images/categories/biscuits-cookies.svg'
  if (s.includes('brass') || s.includes('diya') || s.includes('puja') || s.includes('pooja') || s.includes('havan')) return '/images/categories/brassware-diyas.svg'
  if (s.includes('incense') || s.includes('dhoop') || s.includes('agarbatti') || s.includes('camphor')) return '/images/categories/incense-dhoop.svg'
  if (s.includes('temple') || s.includes('wood') || s.includes('mandir')) return '/images/categories/wooden-temples-decor.svg'
  if (s.includes('metal') || s.includes('handicraft') || s.includes('decor') || s.includes('cradle')) return '/images/categories/metal-handicrafts.svg'
  return '/images/categories/flours-grains.svg'
}

export default async function HomePage() {
  const [totalProducts, featured, categories, brands, settings] =
    await Promise.all([
      getProductCount(),
      getFeaturedProducts(8),
      getCategories(),
      getBrands(),
      getSettings(),
    ])

  // Computed count: round down to nearest 100 with a plus
  const roundedCount = Math.floor(totalProducts / 100) * 100
  const countDisplay = roundedCount >= 1000 ? `${roundedCount.toLocaleString()}+` : `${totalProducts}+`

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION (Split-screen as per Section 2 design brief) */}
      <section className="relative overflow-hidden pt-8 pb-14 sm:pt-12 sm:pb-20 border-b border-slate-300 bg-slate-900">
        {/* Background Hero Image & Atmospheric Overlay */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <Image
            src="/images/hero/hero-bg.jpg"
            alt="Megh Foods Global Export Port"
            fill
            priority
            className="object-cover object-center"
          />
          {/* Subtle cinematic overlay to provide depth while keeping the port, cranes and containers vibrantly visible */}
          <div className="absolute inset-0 bg-slate-950/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-slate-950/20" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Headlines, CTAs, Search inside elevated frosted-glass card */}
            <div className="lg:col-span-7 bg-white/95 backdrop-blur-md p-6 sm:p-10 rounded-3xl border border-white/80 shadow-2xl space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-megh-primary/10 text-megh-primary text-xs font-bold uppercase tracking-wider">
                <span className="h-2 w-2 rounded-full bg-megh-primary animate-pulse" />
                Indian Grocery Exporter • Ahmedabad & Changodar
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-montserrat text-megh-navy tracking-tight leading-[1.1]">
                One container. <br />
                <span className="text-megh-primary">{countDisplay}</span> Indian products.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                As a leading Indian food wholesale supplier in Ahmedabad, we consolidate Megh-brand
                staples, partner brands, pooja and handicraft goods into mixed container Indian groceries
                with flexible CIF or FOB indicative quotes.
              </p>

              {/* CTAs & Mini Search Box */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                  <Link href="/products" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto h-12 px-7 bg-megh-primary hover:bg-megh-primary/90 text-white font-bold rounded-xl shadow-md shadow-megh-primary/20 text-sm flex items-center justify-center gap-2"
                    >
                      Browse the Catalogue <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/basket" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto h-12 px-7 border-slate-300 hover:border-megh-navy text-megh-navy font-bold rounded-xl text-sm"
                    >
                      Start an Enquiry
                    </Button>
                  </Link>
                </div>

                {/* Search Box */}
                <form
                  action="/products"
                  method="GET"
                  className="max-w-md mx-auto lg:mx-0 relative pt-2"
                >
                  <Search className="w-4 h-4 absolute left-3.5 top-[calc(50%+4px)] -translate-y-1/2 text-slate-400" />
                  <Input
                    name="q"
                    placeholder="Search pulses, flours, biscuits, spices, pooja items..."
                    className="pl-10 pr-24 h-11 bg-white border-slate-300 rounded-xl text-xs shadow-xs focus-visible:ring-megh-primary"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="absolute right-1.5 top-[calc(50%+4px)] -translate-y-1/2 h-8 px-3 bg-megh-navy text-white text-xs rounded-lg font-semibold"
                  >
                    Search
                  </Button>
                </form>
              </div>

              {/* Key Trust Signals */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-slate-500 font-medium border-t border-slate-200/60">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-megh-accent" /> No Minimum Container per SKU
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-megh-accent" /> Own Changodar Facility
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-megh-accent" /> Full Export Clearance
                </span>
              </div>
            </div>

            {/* Right Column: Illustrated Shipping Container Art */}
            <div className="lg:col-span-5 flex justify-center">
              <ShippingContainerArt />
            </div>
          </div>
        </div>
      </section>

      {/* 1.5 EXPORT CERTIFICATIONS TRUST BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 -mt-6 sm:-mt-10 relative z-20">
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-lg shadow-slate-900/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left shrink-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-megh-primary block">
                Export Accreditation
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Certified for global port clearance
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full md:w-auto">
              <div className="h-14 px-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-center relative overflow-hidden">
                <Image src="/images/certifications/fssai.svg" alt="FSSAI" width={110} height={40} className="object-contain max-h-10" />
              </div>
              <div className="h-14 px-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-center relative overflow-hidden">
                <Image src="/images/certifications/apeda.svg" alt="APEDA" width={110} height={40} className="object-contain max-h-10" />
              </div>
              <div className="h-14 px-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-center relative overflow-hidden">
                <Image src="/images/certifications/usfda.svg" alt="US FDA" width={110} height={40} className="object-contain max-h-10" />
              </div>
              <div className="h-14 px-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-center relative overflow-hidden">
                <Image src="/images/certifications/spices-board.svg" alt="Spices Board" width={110} height={40} className="object-contain max-h-10" />
              </div>
              <div className="h-14 px-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-center relative overflow-hidden col-span-2 sm:col-span-1">
                <Image src="/images/certifications/iso-haccp.svg" alt="ISO 22000 & HACCP" width={110} height={40} className="object-contain max-h-10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE RANGE PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-montserrat text-megh-navy">
            Three Core Sourcing Pillars
          </h2>
          <p className="text-sm text-slate-600">
            Combine high-margin in-house Megh staples with leading Indian branded grocery items and
            cultural essentials in one unified consignment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1: Megh Brand */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between group overflow-hidden">
            <div className="space-y-4">
              <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden relative bg-slate-100 border border-slate-100 shadow-xs">
                <Image
                  src="/images/categories/flours-grains.svg"
                  alt="Megh Brand Staples"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-megh-primary/10 text-megh-primary flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                  M
                </div>
                <h3 className="text-xl font-bold font-montserrat text-slate-900">
                  Megh Brand Staples
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct manufacturer and Indian flours and pulses exporter. Our own manufactured &
                packaged range: sortex pulses, stone-ground flours, premium rice, papad, farali
                fasting items, and mukhvas.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 font-medium pt-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-megh-primary" /> Processed at our
                  Changodar factory
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-megh-primary" /> Export retail
                  carton packaging
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-megh-primary" /> Private label / OEM
                  available
                </li>
              </ul>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100">
              <Link
                href="/megh-brand"
                className="text-xs font-bold text-megh-primary hover:underline flex items-center gap-1"
              >
                Explore Megh Brand Range →
              </Link>
            </div>
          </div>

          {/* Pillar 2: Partner FMCG Brands */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between group overflow-hidden">
            <div className="space-y-4">
              <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden relative bg-slate-100 border border-slate-100 shadow-xs">
                <Image
                  src="/images/categories/namkeen-sev.svg"
                  alt="Partner FMCG Brands"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold font-montserrat text-slate-900">
                  Partner FMCG Brands
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Consolidation for Indian snacks and namkeen wholesale, biscuits, confectioneries,
                beverages, packaged sweets, noodles, and condiments from top Indian brands.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 font-medium pt-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Over 1,500+ branded
                  SKUs
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Authentic master
                  cartons with batch codes
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Coordinated multi-vendor
                  intake
                </li>
              </ul>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100">
              <Link
                href="/products"
                className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
              >
                Browse FMCG Catalogue →
              </Link>
            </div>
          </div>

          {/* Pillar 3: Handicraft & Pooja */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between group overflow-hidden">
            <div className="space-y-4">
              <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden relative bg-slate-100 border border-slate-100 shadow-xs">
                <Image
                  src="/images/categories/brassware-diyas.svg"
                  alt="Handicraft & Pooja Goods"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold font-montserrat text-slate-900">
                  Handicraft & Pooja Goods
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Traditional Indian cultural goods required by diaspora retailers: brass diyas, pooja
                samagri kits, dhoop & agarbatti, festive items, and Indian sports goods.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 font-medium pt-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> High-margin items for
                  ethnic supermarkets
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Secure export-grade
                  protective packing
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Fits naturally inside
                  grocery container space
                </li>
              </ul>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100">
              <Link
                href="/range/handicraft-home-decor"
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
              >
                View Cultural Collection →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW SOURCING WORKS (4-Step Timeline) */}
      <section className="bg-megh-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-megh-accent">
              Streamlined B2B Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-montserrat text-white">
              How Sourcing Works
            </h2>
            <p className="text-sm text-slate-300">
              Replacing the cumbersome 65-page PDF and email spreadsheet cycle with an Enquiry
              Basket designed for international container buyers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3 relative group hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-megh-primary text-white flex items-center justify-center font-bold text-sm font-montserrat">
                01
              </div>
              <h3 className="font-montserrat font-bold text-base text-white">
                Browse & Shortlist
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Explore ~2,140 SKU lines. Filter by product group or brand, select your required pack
                sizes and enter desired carton quantities.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3 relative group hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-megh-accent text-megh-navy flex items-center justify-center font-bold text-sm font-montserrat">
                02
              </div>
              <h3 className="font-montserrat font-bold text-base text-white">
                Send Enquiry Basket
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Submit your shortlist with target destination port, preferred shipping terms (FOB/CIF),
                and container estimate. Zero credit card or upfront checkout needed.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3 relative group hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-sm font-montserrat">
                03
              </div>
              <h3 className="font-montserrat font-bold text-base text-white">
                Receive Indicative Quote
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Our export desk in Ahmedabad calculates exact volume, container cubic meterage (CBM),
                weight, and issues a formal proforma quote within 24-48 hours.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3 relative group hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-bold text-sm font-montserrat">
                04
              </div>
              <h3 className="font-montserrat font-bold text-base text-white">
                Plan Your Container
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Products are gathered and consolidated at our Changodar warehouse, palletized or
                floor-loaded, phytosanitary inspected, and shipped to your destination.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CATEGORY TILES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-montserrat text-megh-navy">
              Explore by Category
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select a category to view carton configurations and product packaging.
            </p>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-megh-primary hover:underline flex items-center gap-1"
          >
            All {categories.length} Categories →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.slice(0, 12).map((cat) => {
            const catImg = getCategoryImageUrl(cat.slug, cat.image_url)
            return (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="p-3.5 rounded-2xl border border-slate-200/80 bg-white hover:border-megh-primary hover:shadow-lg transition-all text-center group flex flex-col items-center justify-between overflow-hidden"
              >
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-3 relative bg-slate-100 border border-slate-200/60 shadow-xs">
                  <Image
                    src={catImg}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  />
                </div>
                <div className="font-montserrat font-bold text-xs text-slate-900 group-hover:text-megh-primary transition-colors line-clamp-1">
                  {cat.name}
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block truncate max-w-full">
                  {cat.group?.name || 'Staples'}
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* 5. FEATURED MEGH-BRAND PRODUCTS */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-megh-primary uppercase tracking-wider mb-1">
                <Award className="w-4 h-4 text-megh-accent" /> Flagship Export Selection
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-montserrat text-megh-navy">
                Featured Megh Brand Products
              </h2>
            </div>
            <Link
              href="/megh-brand"
              className="text-xs font-bold text-megh-primary hover:underline flex items-center gap-1"
            >
              View Full Megh Range →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.slice(0, 8).map((product, idx) => (
              <ProductCard key={product.id} product={product} priority={idx < 4} />
            ))}
          </div>
        </section>
      )}

      {/* 6. WHY IMPORTERS CHOOSE MEGH (Real Factual Points Only) */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-megh-primary">
              Operational Competencies
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-montserrat text-megh-navy">
              Why Importers Choose Megh
            </h2>
            <p className="text-sm text-slate-600">
              Clear trade terms, verified food processing facilities in Gujarat, and complete
              carton-level visibility for international retail distributors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-megh-primary flex items-center justify-center">
                <Boxes className="w-5 h-5" />
              </div>
              <h3 className="font-montserrat font-bold text-sm text-slate-900">
                Mixed-Container Flexibility
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Consolidate 30 to 80 different food products in a single 20ft or 40ft high cube
                container without being locked into full-container single SKU minimums.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Factory className="w-5 h-5" />
              </div>
              <h3 className="font-montserrat font-bold text-sm text-slate-900">
                Own Factory in Changodar
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct manufacturing, sortex cleaning, stone-grinding, and hygienic packaging at our
                industrial facility in Changodar, Ahmedabad (Gujarat, India).
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="font-montserrat font-bold text-sm text-slate-900">
                Carton-Based Catalogue
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every catalogue SKU specifies its pack size and units per carton (e.g. 2LB x 20 /
                40LB CTN) so you can plan precise warehouse pallet layouts.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="font-montserrat font-bold text-sm text-slate-900">
                Export Documentation
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Full documentation provided: Phytosanitary Certificates, Certificates of Origin, Bill
                of Lading, packing lists, and export invoices ready for customs clearance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. MARKETS STRIP */}
      {settings.markets && settings.markets.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-megh-primary flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-montserrat font-bold text-sm text-slate-900">
                  Global Export Destinations
                </h3>
                <p className="text-xs text-slate-500">
                  Containerized shipments dispatched to distributors worldwide
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 justify-center md:justify-end">
              {settings.markets.map((m) => (
                <span
                  key={m}
                  className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. CERTIFICATIONS STRIP */}
      {settings.certifications && settings.certifications.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-montserrat font-bold text-sm text-slate-900">
                  Quality & Export Accreditations
                </h3>
                <p className="text-xs text-slate-500">
                  Compliant with food safety authorities and international import standards
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 justify-center md:justify-end">
              {settings.certifications.map((c, i) => (
                <div
                  key={i}
                  className="px-3.5 py-1.5 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs flex items-center gap-2"
                >
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-emerald-950">{c.label}</span>
                  <span className="text-[10px] text-emerald-700 font-mono">({c.number})</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 9. PARTNER BRAND CHIPS (Only if show_partner_brands is true) */}
      {settings.features.show_partner_brands && brands.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 text-center space-y-6">
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Popular Partner Brands Consolidated
            </h3>
            <p className="text-xs text-slate-500">
              Mix authentic branded Indian products alongside your staples order
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
            {brands.slice(0, 30).map((b) => (
              <Link
                key={b.id}
                href={`/brand/${b.slug}`}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-megh-primary hover:text-megh-primary text-xs font-medium text-slate-700 transition-colors shadow-2xs"
              >
                {b.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 10. FINAL CTA BAND */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-gradient-to-r from-megh-navy via-slate-900 to-megh-navy rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3 z-10 relative">
            <h2 className="text-2xl sm:text-4xl font-extrabold font-montserrat text-white">
              Ready to Plan Your Next Mixed Container?
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Explore our full 2,140+ SKU catalogue, select carton quantities for your target
              market, and request an indicative quote directly from the Megh Foods export team.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 z-10 relative pt-2">
            <Link href="/products">
              <Button
                size="lg"
                className="h-12 px-8 bg-megh-primary hover:bg-megh-primary/90 text-white font-bold rounded-xl text-sm shadow-md"
              >
                Explore Full Catalogue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-sm"
              >
                Contact Export Desk
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
