import React from 'react'
import { Building2, Factory, Phone, Mail, CheckCircle2 } from 'lucide-react'

export function CompanyCredentials() {
  return (
    <section id="credentials" className="py-20 bg-brand-surface border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-blue bg-blue-50 rounded-full border border-blue-200">
            Exporter Credentials
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-brand-navy tracking-tight font-heading">
            Direct Infrastructure & Factory Operations
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Megh Overseas Private Limited operates a dedicated modern packaging, sorting, and container consolidation facility in Changodar, Ahmedabad.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Facility 1: Factory / Warehouse */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-brand-blue flex items-center justify-center">
              <Factory className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-brand-navy">Changodar Packaging & Consolidation Hub</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Shed No. 6, Marutinandan Estate, Tajpur Road, Changodar, Ahmedabad - 382213, Gujarat, India.
            </p>
            <div className="pt-2 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Heavy vehicle & 40ft container loading bays</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Modern sorting, grading, and inert gas packaging</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>In-house quality check & pre-dispatch lab inspection</span>
              </div>
            </div>
          </div>

          {/* Facility 2: Registered Corporate Office */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-brand-navy">Registered Corporate Office</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              A-43 Aditya Residency, Nr. Thaltej Fire Station, Zydus Hospital Road, Thaltej, Ahmedabad - 380059, Gujarat, India.
            </p>
            <div className="pt-2 space-y-2 text-xs text-slate-600">
              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wider block">Company CIN:</span>
                <span className="font-mono text-slate-800">U51900GJ2014PTC079988</span>
              </div>
              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wider block">Incorporated:</span>
                <span className="text-slate-800">Since 2014 • Over a decade of B2B export leadership</span>
              </div>
              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wider block">Govt Registrations:</span>
                <span className="text-slate-800">APEDA, FSSAI, DGFT / IEC Registered Exporter</span>
              </div>
            </div>
          </div>

          {/* Facility 3: Global Export Support Desk */}
          <div id="contact" className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-brand-navy">Direct Export Inquiries</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Connect with our dedicated export desk for container bookings, proforma invoices, and customized mix requests.
            </p>

            <div className="pt-2 space-y-3 text-xs">
              <a
                href="https://wa.me/919898255500"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition"
              >
                <Phone className="w-4 h-4 shrink-0 text-emerald-600" />
                <div>
                  <span className="font-bold block">India & Worldwide WhatsApp:</span>
                  <span className="font-medium">+91 989 825 5500</span>
                </div>
              </a>

              <a
                href="tel:+14696089613"
                className="flex items-center gap-3 p-2.5 rounded-lg bg-blue-50 text-brand-blue border border-blue-200 hover:bg-blue-100 transition"
              >
                <Phone className="w-4 h-4 shrink-0" />
                <div>
                  <span className="font-bold block">USA Desk Line:</span>
                  <span className="font-medium">+1 469 608 9613</span>
                </div>
              </a>

              <a
                href="mailto:info@meghfoods.com"
                className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 text-slate-800 border border-slate-200 hover:bg-slate-100 transition"
              >
                <Mail className="w-4 h-4 shrink-0 text-slate-500" />
                <div>
                  <span className="font-bold block">Email Quotation Requests:</span>
                  <span className="font-medium">info@meghfoods.com / export@meghfoods.com</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
