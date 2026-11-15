import React from 'react'
import { Globe2, Ship } from 'lucide-react'

export function ExportMarketsSection() {
  const markets = [
    {
      region: 'North America (USA & Canada)',
      ports: 'New York, Los Angeles, Houston, Savannah, Vancouver, Montreal',
      compliance: 'US FDA Registered Facility, Prior Notice, Nutrition Facts labeling compliant',
      flag: '🇺🇸 🇨🇦',
    },
    {
      region: 'United Kingdom & European Union',
      ports: 'Felixstowe, London Gateway, Rotterdam, Antwerp, Hamburg',
      compliance: 'EU/UK allergen labeling, multilingual ingredient declarations, health certification',
      flag: '🇬🇧 🇪🇺',
    },
    {
      region: 'Middle East & GCC',
      ports: 'Jebel Ali (Dubai), Dammam, Jeddah, Sohar, Hamad Port',
      compliance: 'Arabic/English dual labeling, Halal verified, SASO / ESMA conformity documentation',
      flag: '🇦🇪 🇸🇦 🇴🇲',
    },
    {
      region: 'Africa & Indian Ocean',
      ports: 'Mombasa, Dar es Salaam, Durban, Port Louis, Tamatave',
      compliance: 'Pre-export verification of conformity (PVoC), competitive bulk container freight',
      flag: '🇰🇪 🇿🇦 🇲🇺',
    },
    {
      region: 'Australia & New Zealand',
      ports: 'Melbourne, Sydney, Brisbane, Auckland',
      compliance: 'DAFF strict biosecurity fumigation & phytosanitary protocols',
      flag: '🇦🇺 🇳🇿',
    },
  ]

  return (
    <section id="markets" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-blue bg-blue-50 rounded-full border border-blue-200">
            Global Trade Reach
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-brand-navy tracking-tight font-heading">
            Supplying Global Indian Diaspora & Mainstream Grocers
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Our export team understands destination-specific labeling laws, pallet height restrictions, and import customs requirements across every major corridor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {markets.map((m, idx) => (
            <div
              key={idx}
              className="bg-brand-surface rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md hover:border-brand-blue/30 transition group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl">{m.flag}</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-100/70 text-brand-blue flex items-center justify-center">
                    <Globe2 className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-bold text-lg text-brand-navy group-hover:text-brand-blue transition-colors">
                  {m.region}
                </h3>
                <div className="mt-3 space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-500 uppercase tracking-wider block">Regular Ports:</span>
                    <span className="text-slate-700 font-medium">{m.ports}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 uppercase tracking-wider block">Compliance Standards:</span>
                    <span className="text-slate-600">{m.compliance}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center gap-1.5 text-xs font-semibold text-brand-blue">
                <Ship className="w-3.5 h-3.5" />
                <span>Regular Sailing Schedule</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
