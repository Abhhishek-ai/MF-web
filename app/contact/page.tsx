import * as React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Mail,
  MessageCircle,
  Building2,
  Factory,
  Send,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { getSettings } from '@/lib/settings'

export const metadata: Metadata = {
  title: 'Contact Export Desk | Megh Foods Ahmedabad',
  description:
    'Contact Megh Overseas Private Limited export desk for container quotes, product specifications, and private label inquiries in Ahmedabad and Changodar, Gujarat.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Export Desk | Megh Foods Ahmedabad',
    description:
      'Contact Megh Overseas Private Limited export desk for container quotes, product specifications, and private label inquiries in Ahmedabad and Changodar, Gujarat.',
    url: '/contact',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Export Desk | Megh Foods Ahmedabad',
    description:
      'Contact Megh Foods export desk for container quotes, product specifications, and private label inquiries.',
  },
}

export default async function ContactPage() {
  const settings = await getSettings()
  const company = settings.company
  const waNumber = settings.whatsapp?.number || '+91 98982 55500'
  const cleanPhone = waNumber.replace(/[^0-9]/g, '')
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    'Hello Megh Foods export team, I would like to inquire about container export pricing and product availability.'
  )}`

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 space-y-12">
      {/* Title */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-megh-primary/10 text-megh-primary text-xs font-bold uppercase tracking-wider">
          <Mail className="w-3.5 h-3.5" /> International Trade Desk
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-montserrat text-megh-navy tracking-tight">
          Contact Megh Foods
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Get in touch with our international sourcing coordinators for container pricing, custom
          carton packaging, or private-label food manufacturing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Direct Contacts & Addresses (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Contact Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="font-montserrat font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              Direct Contact Desk
            </h2>

            <div className="space-y-3 text-xs text-slate-700">
              <div>
                <span className="text-slate-400 block mb-0.5">Export Sales Email</span>
                <a
                  href={`mailto:${company.email}`}
                  className="font-semibold text-megh-primary hover:underline text-sm"
                >
                  {company.email}
                </a>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">WhatsApp Instant Quotes</span>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-emerald-700 hover:underline flex items-center gap-1.5 text-sm"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  {waNumber}
                </a>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Office Phone Lines</span>
                <div className="space-y-1">
                  {(company.phones || ['+91 79 4000 0000']).map((p) => (
                    <div key={p} className="font-mono text-slate-800">
                      {p}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <span className="font-bold text-slate-700 block">Working Hours:</span>
                Monday to Saturday: 09:30 AM to 06:30 PM (IST / UTC+5:30)
              </div>
            </div>
          </div>

          {/* Operational Facilities */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="font-montserrat font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              Operational Facilities
            </h2>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-megh-primary" /> Registered Head Office
                </div>
                <p className="pl-5 leading-relaxed">{company.registered_office}</p>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Factory className="w-4 h-4 text-emerald-600" /> Manufacturing & Export Dock
                </div>
                <p className="pl-5 leading-relaxed">{company.factory}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Direct General Enquiry Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-montserrat text-megh-navy flex items-center gap-2">
              <Send className="w-5 h-5 text-megh-primary" /> Send a General Inquiry
            </h2>
            <p className="text-xs text-slate-500">
              For specific container orders with product lines, please use the{' '}
              <Link href="/products" className="text-megh-primary font-bold hover:underline">
                Catalogue Enquiry Basket
              </Link>
              . For partnerships, distributions, or factory visits, reach out below.
            </p>
          </div>

          <form action="/basket" method="GET" className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Your Full Name *</label>
                <Input required placeholder="e.g. David Brown" className="h-10 text-xs" />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Company / Organization</label>
                <Input placeholder="e.g. Brown Global Imports" className="h-10 text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email Address *</label>
                <Input type="email" required placeholder="david@company.com" className="h-10 text-xs" />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Destination Country *</label>
                <Input required placeholder="e.g. United Kingdom" className="h-10 text-xs" />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Subject / Area of Interest</label>
              <Input placeholder="e.g. FCL Container quote for ethnic grocery store chain" className="h-10 text-xs" />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Message</label>
              <Textarea
                rows={4}
                placeholder="Share your requirements, expected volumes, or questions for our team..."
                className="text-xs"
              />
            </div>

            <div className="pt-2">
              <Link href="/basket">
                <Button
                  type="button"
                  className="w-full h-11 bg-megh-primary hover:bg-megh-primary/90 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  Send Message to Export Team
                </Button>
              </Link>
            </div>

            <div className="text-center text-[10px] text-slate-400">
              For instant response, message directly on WhatsApp: {waNumber}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
