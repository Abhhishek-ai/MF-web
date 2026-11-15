import React from 'react'
import { Boxes, FileCheck2, Truck, Anchor, CheckCircle } from 'lucide-react'

export function ConsolidationSection() {
  const steps = [
    {
      num: '01',
      title: 'Pick Staples & FMCG Brands',
      desc: 'Select Megh-brand pulses, spices, flours, alongside market-leading brands (Frooti, Parle-G, Everest, Wagh Bakri, Haldirams).',
      icon: Boxes,
    },
    {
      num: '02',
      title: 'Custom Relabeling & Master Cartons',
      desc: 'We format nutrition facts, ingredients, and barcodes to comply with US FDA, UK Food Standards, or EU packaging regulations.',
      icon: FileCheck2,
    },
    {
      num: '03',
      title: 'Palletized Container Stuffing',
      desc: 'Expert container loading at our Changodar warehouse to maximize cube utilization, protect fragile packs, and prevent transit shifting.',
      icon: Truck,
    },
    {
      num: '04',
      title: 'Customs & Port Clearance Docs',
      desc: 'We issue Phytosanitary, Certificate of Origin, Bill of Lading, Health & Quality inspection certificates directly to your port broker.',
      icon: Anchor,
    },
  ]

  return (
    <section id="consolidation" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-blue bg-blue-50 rounded-full border border-blue-200">
            Export Logistics Simplified
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-brand-navy tracking-tight font-heading">
            How Container Consolidation Works
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Why deal with 20 different suppliers in India when you can consolidate everything under a single exporter invoice and single bill of lading?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, idx) => {
            const Icon = s.icon
            return (
              <div
                key={idx}
                className="relative rounded-2xl bg-brand-surface border border-slate-200/80 p-6 flex flex-col justify-between hover:shadow-lg hover:border-brand-blue/30 transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-black text-slate-300 group-hover:text-brand-blue transition-colors font-heading">
                      {s.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-brand-blue flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-brand-navy mb-2 group-hover:text-brand-blue transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Guaranteed Fresh Batches</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

