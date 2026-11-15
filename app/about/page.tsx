import * as React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Building2,
  MapPin,
  Factory,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getSettings } from '@/lib/settings'

export const metadata: Metadata = {
  title: 'About Us | Megh Foods & Megh Overseas Pvt Ltd',
  description:
    'Learn about Megh Overseas Private Limited, our Changodar manufacturing hub, and our export operations supplying global importers from Ahmedabad, India.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Us | Megh Foods & Megh Overseas Pvt Ltd',
    description:
      'Learn about Megh Overseas Private Limited, our Changodar manufacturing hub, and our export operations supplying global importers from Ahmedabad, India.',
    url: '/about',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us | Megh Foods & Megh Overseas Pvt Ltd',
    description:
      'Corporate profile, Changodar manufacturing facilities, and container export consolidation in Ahmedabad, India.',
  },
}

export default async function AboutPage() {
  const settings = await getSettings()
  const company = settings.company

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 space-y-12">
      {/* Title */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-megh-primary/10 text-megh-primary text-xs font-bold uppercase tracking-wider">
          <Building2 className="w-3.5 h-3.5" /> Corporate Profile & Infrastructure
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-montserrat text-megh-navy tracking-tight">
          About Megh Foods
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Operating as the flagship food export brand of <strong>{company.name}</strong>, we are a
          licensed Indian manufacturer and export consolidator bridging traditional Indian culinary
          heritage with modern global logistics.
        </p>
      </div>

      {/* Corporate Facts Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div className="p-3 border-r border-slate-100 last:border-0">
          <span className="text-[11px] text-slate-400 font-medium block">Corporate Entity</span>
          <span className="font-bold text-xs text-slate-900 mt-1 block">Private Limited</span>
        </div>
        <div className="p-3 border-r border-slate-100 last:border-0">
          <span className="text-[11px] text-slate-400 font-medium block">Corporate ID (CIN)</span>
          <span className="font-mono font-bold text-xs text-slate-900 mt-1 block">
            {company.cin}
          </span>
        </div>
        <div className="p-3 border-r border-slate-100 last:border-0">
          <span className="text-[11px] text-slate-400 font-medium block">Primary Loading Port</span>
          <span className="font-bold text-xs text-slate-900 mt-1 block">Mundra & Nhava Sheva</span>
        </div>
        <div className="p-3">
          <span className="text-[11px] text-slate-400 font-medium block">Catalogue Range</span>
          <span className="font-bold text-xs text-megh-primary mt-1 block">2,140+ SKUs</span>
        </div>
      </div>

      {/* Facilities Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Head Office */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-megh-primary flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-montserrat text-slate-900">
            Registered Head Office
          </h2>
          <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <p>
              Located in the commercial heart of Ahmedabad, Gujarat, our corporate headquarters houses
              our international sales team, documentation desk, compliance officers, and trade financing
              coordinators.
            </p>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-megh-primary flex-shrink-0 mt-0.5" />
              <span>{company.registered_office}</span>
            </div>
          </div>
        </div>

        {/* Manufacturing & Consolidation Facility */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Factory className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-montserrat text-slate-900">
            Changodar Manufacturing & Consolidation Hub
          </h2>
          <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <p>
              Situated along the strategic Sarkhej-Bavla industrial corridor with rapid expressway
              access to the ports of Mundra and Kandla, our Changodar facility conducts optical pulse
              cleaning, grain milling, packaging, and high-cube container consolidation.
            </p>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{company.factory}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Core Principles */}
      <div className="bg-slate-50 rounded-3xl p-8 sm:p-10 border border-slate-200 space-y-6">
        <h2 className="text-2xl font-bold font-montserrat text-megh-navy text-center">
          Our Operational Pillars
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-600">
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Carton Precision</h3>
            <p className="leading-relaxed">
              Every SKU is clearly mapped by units per carton and physical dimensions, allowing
              importers to calculate exact palletization and container space utilization.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Rigorous Documentation</h3>
            <p className="leading-relaxed">
              We provide Phytosanitary, Certificate of Origin, and complete customs dossiers to ensure
              zero demurrage or quarantine delays at foreign arrival ports.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Authenticity Assured</h3>
            <p className="leading-relaxed">
              We source only authentic Indian agro-commodities and direct manufacturer cartons with
              clear batch tracking and maximum remaining shelf life.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-megh-navy text-white p-8 sm:p-10 rounded-3xl text-center space-y-5 shadow-lg">
        <h2 className="text-2xl sm:text-3xl font-bold font-montserrat text-white">
          Partner with Megh Foods for Your Indian Sourcing
        </h2>
        <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
          Whether you are an ethnic supermarket distributor in the UK, USA, EU, or Gulf, let us
          prepare an indicative quote for your mixed container requirements.
        </p>
        <div className="pt-2">
          <Link href="/products">
            <Button className="bg-megh-primary hover:bg-megh-primary/90 text-white font-bold h-11 px-8 rounded-xl text-xs shadow-md">
              Browse Export Catalogue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
