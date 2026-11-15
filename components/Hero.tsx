import React from 'react'
import { Package, ShieldCheck, Ship, ArrowRight, CheckCircle2, MessageCircle, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeroProps {
  onOpenBasket: () => void
}

export function Hero({ onOpenBasket }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-brand-surface py-16 sm:py-24 border-b border-slate-200">
      {/* Decorative gradient blur background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-blue-200/30 to-emerald-200/20 blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Main Hero Copy */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/70 border border-blue-200 text-brand-blue text-xs font-bold uppercase tracking-wider">
              <Ship className="w-3.5 h-3.5" />
              <span>B2B Indian Grocery Exporter & Consolidator</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-brand-navy tracking-tight font-heading leading-[1.15]">
              One Container. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-blue-600">
                2,000+ Indian Products.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl font-normal">
              Consolidate Megh-brand staples, leading partner FMCG brands, pooja essentials, and authentic handicrafts into a single 20ft/40ft container loaded directly at our Ahmedabad facility.
            </p>

            {/* Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm text-slate-700 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Mix 100+ SKUs in 1 FCL Container</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>US FDA & EU Compliant Labeling</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Factory Loading & Phytosanitary Docs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Ex-Ahmedabad / Mundra Port Dispatch</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <a href="#catalogue">
                <Button size="lg" className="gap-2 font-bold shadow-md hover:shadow-lg transition">
                  <span>Browse Export Catalogue</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </a>

              <a
                href="https://wa.me/919898255500?text=Hello%20Megh%20Foods%2C%20I%20need%20a%20container%20consolidation%20quote."
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" variant="outline" className="gap-2 border-slate-300 text-brand-navy hover:bg-slate-50 font-semibold">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp Export Quote</span>
                </Button>
              </a>
            </div>
          </div>

          {/* Right Visual Stats Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xl relative space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-brand-navy">Container Consolidation Hub</h3>
                  <p className="text-xs text-slate-500">Ahmedabad, Gujarat (India)</p>
                </div>
                <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-full">
                  Active Dispatch
                </div>
              </div>

              {/* 4 Metrics Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-brand-blue mb-1">
                    <Package className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Catalogue</span>
                  </div>
                  <div className="text-2xl font-black text-brand-navy">2,000+</div>
                  <div className="text-xs text-slate-500">Active Grocery & FMCG SKUs</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-brand-blue mb-1">
                    <Ship className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Consolidation</span>
                  </div>
                  <div className="text-2xl font-black text-brand-navy">FCL / LCL</div>
                  <div className="text-xs text-slate-500">20ft, 40ft & Palletized Mix</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-emerald-600 mb-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Compliance</span>
                  </div>
                  <div className="text-2xl font-black text-brand-navy">100%</div>
                  <div className="text-xs text-slate-500">APEDA, FSSAI, US FDA Docs</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-amber-600 mb-1">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Export Packing</span>
                  </div>
                  <div className="text-2xl font-black text-brand-navy">Multi-Pack</div>
                  <div className="text-xs text-slate-500">Custom Barcodes & Labels</div>
                </div>
              </div>

              {/* Bottom Callout banner */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-brand-blue uppercase tracking-wider">Fast Turnaround</p>
                  <p className="text-sm font-semibold text-brand-navy">Build your custom order and request RFQ</p>
                </div>
                <Button size="sm" onClick={onOpenBasket} variant="accent" className="font-bold">
                  Open Basket
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

