'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Globe,
  Award,
  ArrowUpRight,
} from 'lucide-react'
import type { SiteSettings, CertificationItem } from '@/lib/types'

interface FooterProps {
  settings: SiteSettings
}

export function Footer({ settings }: FooterProps) {
  const pathname = usePathname()

  // Hide on admin portal paths
  if (pathname.startsWith('/admin')) {
    return null
  }

  const company = settings.company
  const certifications = settings.certifications || []
  const markets = settings.markets || []

  return (
    <footer className="bg-megh-navy text-white pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        {/* Top 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Brand & Registration */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-megh-primary text-white flex items-center justify-center font-bold text-lg shadow-sm">
                M
              </div>
              <div>
                <div className="font-montserrat font-bold text-base tracking-wide text-white">
                  MEGH FOODS
                </div>
                <div className="text-[11px] text-slate-400 font-semibold">
                  Megh Overseas Pvt. Ltd.
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Export consolidator and food manufacturer based in Ahmedabad and Changodar, Gujarat,
              India. Supplying international importers with Megh brand staples and leading Indian FMCG
              brands in flexible mixed containers.
            </p>

            <div className="text-[11px] text-slate-400 space-y-1 pt-1 font-mono">
              <div>CIN: {company.cin}</div>
              <div>Incorporated in India</div>
            </div>
          </div>

          {/* Col 2: Physical Facilities & Offices */}
          <div className="space-y-3">
            <h3 className="font-montserrat font-bold text-xs uppercase tracking-wider text-megh-accent">
              Operational Facilities
            </h3>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">Registered Head Office</span>
                  {company.registered_office}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">
                    Manufacturing & Consolidation Plant
                  </span>
                  {company.factory}
                </div>
              </div>
            </div>
          </div>

          {/* Col 3: Direct Trade Contacts */}
          <div className="space-y-3">
            <h3 className="font-montserrat font-bold text-xs uppercase tracking-wider text-megh-accent">
              Export Desk & Sourcing
            </h3>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <a href={`mailto:${company.email}`} className="hover:text-white transition-colors">
                  {company.email}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{settings.whatsapp?.number || company.phones?.[0] || '+91 989 825 5500'} (WhatsApp Shortlists)</span>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 leading-snug">
                Export quotes provided on FOB Mundra, FOB Nhava Sheva, or CIF worldwide ports.
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/basket"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-megh-accent hover:underline"
              >
                Go to Enquiry Basket <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Col 4: Quick Links */}
          <div className="space-y-3">
            <h3 className="font-montserrat font-bold text-xs uppercase tracking-wider text-megh-accent">
              Trade Information
            </h3>

            <ul className="space-y-1.5 text-xs text-slate-300">
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Full Catalogue Explorer
                </Link>
              </li>
              <li>
                <Link href="/megh-brand" className="hover:text-white transition-colors">
                  Megh Own Brand Staples
                </Link>
              </li>
              <li>
                <Link href="/mixed-container" className="hover:text-white transition-colors">
                  Mixed Container Consolidation Guide
                </Link>
              </li>
              <li>
                <Link href="/private-label" className="hover:text-white transition-colors">
                  Private Label & Contract Packaging
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Company History & Infrastructure
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact & Inquiries
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Trade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Certifications Strip */}
        {certifications.length > 0 && (
          <div className="pt-8 border-t border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-megh-accent" /> Quality Certifications & Export
                Registrations:
              </span>

              <div className="flex flex-wrap items-center gap-3">
                {certifications.map((c: CertificationItem, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-lg text-xs border border-slate-700/80"
                  >
                    <Award className="w-3.5 h-3.5 text-megh-accent" />
                    <span className="font-semibold text-white">{c.label}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({c.number})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Export Markets Strip */}
        {markets.length > 0 && (
          <div className="pt-4 border-t border-slate-800/60 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-slate-500" /> Export Markets Served:
            </span>
            {markets.map((m: string) => (
              <span
                key={m}
                className="text-slate-300 bg-white/5 px-2 py-0.5 rounded text-[11px]"
              >
                {m}
              </span>
            ))}
          </div>
        )}

        {/* Bottom Trademarks Disclaimer & Copyright */}
        <div className="pt-8 border-t border-slate-800 text-[11px] text-slate-500 space-y-3 leading-relaxed">
          <p>
            <strong>Partner Brand Disclaimer:</strong> All third-party brand names, registered
            trademarks, product designations, and logos referenced on this site belong to their
            respective manufacturers and rights holders. They are displayed solely to facilitate
            B2B export sourcing, carton identification, and container consolidation for overseas
            importers and retailers.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/50">
            <div>
              © {new Date().getFullYear()} Megh Overseas Private Limited. All rights reserved.
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Trade
              </Link>
              <span>•</span>
              <Link href="/admin/login" className="hover:text-white transition-colors">
                Staff Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
