import * as React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Boxes,
  Anchor,
  FileCheck,
  ArrowRight,
  Truck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Mixed Container Consolidation Guide | Indian Grocery Export',
  description:
    'Learn how to mix Megh brand staples, partner FMCG brands, and pooja goods in a single 20ft or 40ft container. Carton notation, CBM planning, and shipping terms explained.',
  alternates: {
    canonical: '/mixed-container',
  },
  openGraph: {
    title: 'Mixed Container Consolidation Guide | Megh Foods',
    description:
      'Learn how to mix Megh brand staples, partner FMCG brands, and pooja goods in a single container. Practical export guide for international buyers.',
    url: '/mixed-container',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mixed Container Consolidation Guide | Megh Foods',
    description:
      'Consolidate 50+ Indian grocery SKUs in a single container. Carton notation, CBM calculation, and FOB/CIF guide.',
  },
}

export default function MixedContainerGuidePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 space-y-12">
      {/* Title Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-megh-primary/10 text-megh-primary text-xs font-bold uppercase tracking-wider">
          <Anchor className="w-3.5 h-3.5" /> B2B International Buyer Guide
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-montserrat text-megh-navy tracking-tight">
          How Mixed Container Consolidation Works
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Traditional agro-exporters require full container loads (FCL) of a single commodity. Megh
          Foods allows international supermarket chains, distributors, and ethnic grocers to combine
          over 50 different Indian product lines in a single consolidated ocean container.
        </p>
      </div>

      {/* 4 Core Concepts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-megh-primary flex items-center justify-center">
            <Boxes className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-montserrat text-slate-900">
            1. Understanding Carton Notation
          </h2>
          <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <p>
              In our catalogue, products are ordered by the master outer carton rather than loose
              units. Here is how to decode standard specifications:
            </p>
            <div className="space-y-2 pt-2 font-mono">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-megh-primary block">2LB x 20 (40LB CTN)</strong>
                <span className="text-slate-500">
                  Twenty 2-pound retail stand-up pouches per master carton (gross ~18.1 kg).
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-megh-primary block">400G x 24 (9.6KG CTN)</strong>
                <span className="text-slate-500">
                  Twenty-four 400g retail consumer boxes per outer carton.
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-megh-primary block">750ML x 12 (9L CTN)</strong>
                <span className="text-slate-500">
                  Twelve 750ml bottles packed with protective corrugated dividers.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-montserrat text-slate-900">
            2. Container Capacities (FCL vs LCL)
          </h2>
          <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
            <p>
              Depending on your sales volume and import budget, we configure shipments into standard
              ocean containers:
            </p>
            <ul className="space-y-2 font-medium">
              <li className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-2">
                <span className="font-bold text-slate-900 min-w-[70px]">20ft FCL:</span>
                <span>
                  Accommodates approx 28–30 CBM or up to 21,000–24,000 kg payload (ideal for heavy
                  flours & pulses).
                </span>
              </li>
              <li className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-2">
                <span className="font-bold text-slate-900 min-w-[70px]">40ft HC:</span>
                <span>
                  Accommodates approx 65–68 CBM or up to 26,000 kg payload (ideal for volumetric snacks,
                  biscuits, and mixed goods).
                </span>
              </li>
              <li className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-2">
                <span className="font-bold text-slate-900 min-w-[70px]">LCL:</span>
                <span>
                  Less-than-container palletized shipments for initial trial orders or regional replenishment.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <FileCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-montserrat text-slate-900">
            3. Standard Export Documentation
          </h2>
          <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <p>
              To ensure smooth customs clearance in the United States, United Kingdom, European
              Union, Middle East, and Australia, Megh Foods prepares full export dossiers:
            </p>
            <ul className="space-y-1.5 list-disc pl-4 text-slate-700">
              <li>Commercial Invoice with HS Codes & FOB/CIF breakdown</li>
              <li>Detailed Itemized Packing List with Net & Gross Carton Weights</li>
              <li>Clean on Board Ocean Bill of Lading (B/L) or Sea Waybill</li>
              <li>Official Phytosanitary Certificate issued by Indian Quarantine Authorities</li>
              <li>Certificate of Origin (COO / Indo-Arab / GSP where applicable)</li>
              <li>Fumigation Certificate for wooden export pallets / container</li>
            </ul>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Anchor className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-montserrat text-slate-900">
            4. Shipping Terms & Incoterms
          </h2>
          <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <p>We work flexibly across all major international trade terms:</p>
            <div className="space-y-2 pt-1">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <strong className="text-slate-900 block font-montserrat">FOB Mundra / Nhava Sheva (JNPT)</strong>
                <span>We handle transport, customs clearance, and loading onto your designated shipping line in India.</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <strong className="text-slate-900 block font-montserrat">CIF Destination Port</strong>
                <span>We cover freight and marine insurance directly to your port of discharge (e.g. CIF New York, CIF Jebel Ali, CIF Felixstowe).</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How to Build an Enquiry Step-by-Step */}
      <div className="bg-slate-50 rounded-3xl p-8 sm:p-10 border border-slate-200 space-y-6">
        <h2 className="text-2xl font-bold font-montserrat text-megh-navy text-center">
          How to Assemble Your First Shortlist
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-600">
          <div className="space-y-2">
            <span className="font-bold text-base text-megh-primary block font-montserrat">Step 1</span>
            <h3 className="font-bold text-slate-900 text-sm">Add Items to Basket</h3>
            <p>
              Navigate the catalogue, choose desired carton quantities for each product SKU, and
              click <strong>Add to Enquiry</strong>.
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-base text-megh-primary block font-montserrat">Step 2</span>
            <h3 className="font-bold text-slate-900 text-sm">Review Shortlist</h3>
            <p>
              Open your <strong>Enquiry Basket</strong> to verify total carton counts or download a
              pre-formatted Excel CSV for your internal review.
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-base text-megh-primary block font-montserrat">Step 3</span>
            <h3 className="font-bold text-slate-900 text-sm">Receive Indicative Quote</h3>
            <p>
              Submit the form with your destination port. Our export desk calculates optimal container
              stuffing and sends a formal quote within 24–48 hours.
            </p>
          </div>
        </div>

        <div className="pt-4 text-center">
          <Link href="/products">
            <Button className="bg-megh-primary hover:bg-megh-primary/90 text-white font-bold h-11 px-8 rounded-xl text-xs shadow-md">
              Start Shortlisting in Catalogue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
