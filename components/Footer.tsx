import React from 'react'
import { MessageCircle, PhoneCall, Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-brand-navy text-white pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1 & 2: Company Overview */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-blue text-white flex items-center justify-center font-extrabold text-lg shadow-md">
                MF
              </div>
              <span className="text-2xl font-black tracking-tight text-white font-heading">
                MEGH FOODS
              </span>
            </div>
            <p className="text-sm text-slate-300 max-w-sm leading-relaxed">
              Megh Overseas Private Limited is an international B2B exporter & consolidator of Indian groceries, spices, snacks, pooja essentials, and partner FMCG brands from Ahmedabad, Gujarat, India.
            </p>
            <div className="pt-2 text-xs text-slate-400 space-y-1">
              <p>CIN: <strong className="text-slate-200">U51900GJ2014PTC079988</strong></p>
              <p>APEDA Reg • FSSAI Certified • US FDA Compliant</p>
            </div>
          </div>

          {/* Col 3: Export Categories */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-brand-green font-heading">
              Export Catalogue
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li><a href="#catalogue" className="hover:text-white transition">Pulses, Dals & Grains</a></li>
              <li><a href="#catalogue" className="hover:text-white transition">Whole & Ground Spices</a></li>
              <li><a href="#catalogue" className="hover:text-white transition">Namkeen, Farsan & Snacks</a></li>
              <li><a href="#catalogue" className="hover:text-white transition">Pooja Thalis & Brassware</a></li>
              <li><a href="#catalogue" className="hover:text-white transition">Sheesham Home Temples</a></li>
              <li><a href="#catalogue" className="hover:text-white transition">Partner FMCG Brands</a></li>
            </ul>
          </div>

          {/* Col 4: Consolidation & Ports */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-brand-green font-heading">
              Shipment Corridors
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>USA (New York, LA, Houston)</li>
              <li>Canada (Vancouver, Montreal)</li>
              <li>United Kingdom (Felixstowe)</li>
              <li>Europe (Rotterdam, Antwerp)</li>
              <li>UAE & GCC (Jebel Ali, Dammam)</li>
              <li>East & South Africa</li>
            </ul>
          </div>

          {/* Col 5: Contact Desk */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-brand-green font-heading">
              Export Desk
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-brand-green shrink-0" />
                <span>+91 989 825 5500</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-brand-green shrink-0" />
                <span>+1 469 608 9613 (USA)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-brand-green shrink-0" />
                <span>info@meghfoods.com</span>
              </div>
              <div className="pt-2">
                <a
                  href="https://wa.me/919898255500"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition text-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Quote</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} Megh Overseas Private Limited. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Mundra Port / Nhava Sheva FCL Loading</span>
            <span>Terms: FOB / CIF / CFR</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
