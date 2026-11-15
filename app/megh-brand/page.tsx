import * as React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Award,
  Factory,
  CheckCircle2,
  ArrowRight,
  Wheat,
  UtensilsCrossed,
  Boxes,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getMeghBrandProducts } from '@/lib/data'
import { ProductCard } from '@/components/public/product-card'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Megh Own Brand | Flours, Pulses, Papad & Fasting Foods',
  description:
    'Discover the Megh flagship brand: export-grade sortex pulses, stone-ground flours, premium rice, handmade papad, farali fasting items, and mukhvas manufactured in Changodar, Ahmedabad.',
  alternates: {
    canonical: '/megh-brand',
  },
  openGraph: {
    title: 'Megh Own Brand | Flours, Pulses, Papad & Fasting Foods | Megh Foods',
    description:
      'Export-grade sortex pulses, stone-ground flours, premium rice, handmade papad, farali fasting items, and mukhvas manufactured in Changodar, Ahmedabad.',
    url: '/megh-brand',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Megh Own Brand | Flours, Pulses, Papad & Fasting Foods',
    description:
      'Export-grade sortex pulses, stone-ground flours, premium rice, handmade papad, farali fasting items, and mukhvas manufactured in Changodar, Ahmedabad.',
  },
}

export default async function MeghBrandPage() {
  const products = await getMeghBrandProducts(32)

  const pillars = [
    {
      title: 'Sortex Cleaned Pulses',
      desc: 'Toor dal, moong dal, chana dal, urad dal cleaned using modern optical sortex technology with zero chemical polishing.',
      icon: UtensilsCrossed,
    },
    {
      title: 'Stone-Ground Flours',
      desc: 'Traditional chakki wheat aata, besan, rice flour, and regional specialty flours milled fresh and packed in moisture-proof barrier pouches.',
      icon: Wheat,
    },
    {
      title: 'Handmade Papad & Khakhra',
      desc: 'Authentic Gujarati handmade papad and vacuum-packed roasted khakhras made with traditional spice blends.',
      icon: Boxes,
    },
    {
      title: 'Farali / Fasting Foods',
      desc: 'Moraiyo, rajgira, singhada flour, sabudana, and fasting snacks prepared in dedicated hygienic fasting lines.',
      icon: Award,
    },
  ]

  return (
    <div className="space-y-16 sm:space-y-20 pb-16">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-megh-navy to-slate-900 text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-megh-accent text-xs font-bold uppercase tracking-wider mx-auto">
            <span className="w-2 h-2 rounded-full bg-megh-accent animate-pulse" />
            Flagship Export Brand
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-montserrat tracking-tight leading-tight max-w-3xl mx-auto">
            Megh Own Brand: Indian Staples for Global Tables
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Manufactured, sorted, and packed at our state-of-the-art facility in Changodar,
            Ahmedabad. Designed specifically for ethnic grocers and international supermarkets seeking
            consistent quality, clear carton specifications, and superior export margins.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/products?megh=true">
              <Button
                size="lg"
                className="h-12 px-8 bg-megh-primary hover:bg-megh-primary/90 text-white font-bold rounded-xl text-sm shadow-lg"
              >
                Browse All Megh Brand SKUs <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/private-label">
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-sm"
              >
                Private Label Enquiry
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pillars Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-megh-primary flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-montserrat font-bold text-sm text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Changodar Facility Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-200/80 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-megh-primary uppercase tracking-wider">
              <Factory className="w-4 h-4" /> Changodar Industrial Zone, Gujarat
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-montserrat text-megh-navy">
              Integrated Processing & Export Consolidation
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Our factory in Changodar handles the complete journey from raw agro-commodity intake
              from Gujarat and Saurashtra farming belts to multi-stage optical cleaning,
              stone-milling, Nitrogen flush sealing, and container palletizing.
            </p>

            <ul className="text-xs text-slate-700 space-y-2 font-medium pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Buhler Sortex optical color
                sorters for pulse uniformity
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Temperature-controlled milling
                to preserve nutrient density and flavor
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Dedicated export staging dock
                capable of stuffing multiple 40ft HC containers simultaneously
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-montserrat font-bold text-sm text-slate-900">
              Export Packaging Specifications
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Megh products are packed in heavy-duty laminate retail pouches inside 5-ply or 7-ply
              corrugated shipping cartons. Standard sizing includes:
            </p>

            <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-bold block text-slate-900">2LB x 20</span>
                <span className="text-slate-500 text-[11px]">40LB outer carton</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-bold block text-slate-900">4LB x 10</span>
                <span className="text-slate-500 text-[11px]">40LB outer carton</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-bold block text-slate-900">1KG x 20</span>
                <span className="text-slate-500 text-[11px]">20KG metric carton</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-bold block text-slate-900">20LB / 50LB</span>
                <span className="text-slate-500 text-[11px]">Bulk restaurant master bag</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-montserrat text-megh-navy">
              Megh Brand Catalogue Range
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select items below to add directly into your enquiry basket.
            </p>
          </div>
          <Link
            href="/products?megh=true"
            className="text-xs font-bold text-megh-primary hover:underline"
          >
            Open in Catalogue Explorer →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 16).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  )
}
