import * as React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Factory,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Private Label & Contract Packaging | Megh Foods India',
  description:
    'Custom OEM contract packaging for Indian pulses, flours, rice, and spices under your retail store brand from our Changodar manufacturing facility in Ahmedabad, Gujarat.',
  alternates: {
    canonical: '/private-label',
  },
  openGraph: {
    title: 'Private Label & Contract Packaging | Megh Foods India',
    description:
      'Custom OEM contract packaging for Indian pulses, flours, rice, and spices under your retail store brand from our Changodar manufacturing facility in Ahmedabad.',
    url: '/private-label',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Private Label & Contract Packaging | Megh Foods India',
    description:
      'Custom OEM contract packaging for Indian pulses, flours, rice, and spices under your store brand.',
  },
}

export default function PrivateLabelPage() {
  const capabilities = [
    {
      title: 'Pouch Packaging & Bagging',
      desc: 'Stand-up zipper pouches, pillow pouches, Nitrogen flush packaging, and gusseted bags from 200g to 5kg.',
    },
    {
      title: 'Bulk Sacks & Food Service',
      desc: '10kg, 20lb, and 50lb woven polypropylene (PP) sacks with multi-wall moisture-proof liners for commercial kitchens and ethnic cash & carry.',
    },
    {
      title: 'Custom Branding & Barcodes',
      desc: 'Full-color rotogravure printing, custom UPC-A / EAN-13 barcodes, bilingual labeling (English, French, Arabic, Spanish), and nutrition facts tables.',
    },
    {
      title: 'Quality & Regulatory Compliance',
      desc: 'Customized pesticide residue reports, allergen declarations, Non-GMO verification, and compliance with US FDA, CFIA, and EU food safety standards.',
    },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 space-y-12">
      {/* Title */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          <Factory className="w-3.5 h-3.5" /> OEM & Contract Manufacturing
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-montserrat text-megh-navy tracking-tight">
          Private Label Food Manufacturing for Global Retailers
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Launch or expand your own supermarket brand with Megh Foods. We process, sort, and package
          export-grade Indian pulses, stone-ground flours, rice, and specialty fasting foods under your
          custom label.
        </p>
      </div>

      {/* Capabilities 4-Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {capabilities.map((c) => (
          <div
            key={c.title}
            className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-megh-primary flex items-center justify-center font-bold">
              ✓
            </div>
            <h2 className="text-lg font-bold font-montserrat text-slate-900">{c.title}</h2>
            <p className="text-xs text-slate-600 leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </div>

      {/* Changodar Plant Advantage */}
      <div className="bg-slate-50 p-8 sm:p-10 rounded-3xl border border-slate-200/80 space-y-6">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-megh-primary">
            Facility Advantage
          </span>
          <h2 className="text-2xl font-bold font-montserrat text-megh-navy">
            Our Changodar Manufacturing Unit
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Located in the Changodar Industrial Area of Ahmedabad, our facility features high-speed
            automated form-fill-seal (FFS) lines, optical color sorting, and stainless steel contact
            surfaces adhering to FSSAI Central Export Licensing, APEDA, and ISO 22000 standards.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium text-slate-700">
          <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Dedicated pulses & flour packaging lines</span>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Strict batch tracking & retention samples</span>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Direct highway connectivity to Mundra port</span>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-megh-navy text-white p-8 sm:p-10 rounded-3xl text-center space-y-5 shadow-lg">
        <h2 className="text-2xl sm:text-3xl font-bold font-montserrat text-white">
          Discuss Your Private Label Requirements
        </h2>
        <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
          Send us your target product list, packaging specs, and estimated annual volume. Our
          technical sales team will prepare a feasibility study and packaging estimate.
        </p>
        <div className="pt-2">
          <Link href="/contact">
            <Button className="bg-megh-primary hover:bg-megh-primary/90 text-white font-bold h-11 px-8 rounded-xl text-xs shadow-md">
              Contact OEM Sourcing Desk <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
