import { Metadata } from 'next';
import Link from 'next/link';
import { getSiteSettings } from '@/lib/settings';

export const metadata: Metadata = {
  title: 'Terms of Trade | Megh Foods — Megh Overseas Pvt Ltd',
  description:
    'Terms and conditions of international export trade, indicative quotations, carton-based ordering, and mixed container consolidation.',
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: 'Terms of Trade | Megh Foods',
    description: 'Terms and conditions of international export trade and container consolidation.',
    url: '/terms',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Trade | Megh Foods',
    description: 'Terms and conditions of international export trade and container consolidation.',
  },
}

export default async function TermsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="bg-[#F6F8FC] min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 sm:p-12">
          {/* Header */}
          <div className="border-b border-slate-100 pb-8 mb-8">
            <span className="text-xs font-semibold tracking-wider text-[#1B4FD8] uppercase">Commercial Conditions</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B1B3F] mt-2">Terms of Export Trade</h1>
            <p className="text-sm text-slate-500 mt-2">
              Applicable to all commercial quotations, proforma invoices, and international container shipments.
            </p>
          </div>

          <div className="prose prose-slate max-w-none text-[#0B1B3F]/80 leading-relaxed space-y-6">
            <section>
              <h2 className="text-xl font-bold text-[#0B1B3F]">1. Business Model & Indicative Quotations</h2>
              <p>
                <strong>{settings.company.name}</strong> (brand: <strong>Megh Foods</strong>) operates exclusively on a B2B wholesale export basis. Submitting an enquiry via this website&apos;s Enquiry Basket does not constitute a legally binding sales contract or checkout transaction. All prices supplied in response to website enquiries are <strong>indicative quotations</strong> valid for 14 calendar days, subject to commodity price fluctuations, foreign currency exchange rates, ocean freight tariffs, and raw material availability.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0B1B3F]">2. Carton-Based Ordering & Minimum Order Quantities (MOQ)</h2>
              <p>
                All goods are packaged and supplied in master export shippers (cartons). Line items in enquiries represent full master cartons (e.g., 20 x 2 lb packets per carton). While there is no rigid single-SKU container requirement for catalogue items, consolidated shipments require a minimum total volume equivalent to a 20ft FCL (approx. 20–24 metric tonnes / ~1,200 standard cartons) or 40ft High Cube container unless LCL terms are mutually agreed upon in writing.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0B1B3F]">3. Incoterms & Delivery</h2>
              <p>
                Standard export quotations are provided on an <strong>FOB Mundra Port / Pipavav Port, Gujarat, India</strong> basis or <strong>CIF / CFR</strong> to the buyer&apos;s nominated destination discharge port in accordance with Incoterms® 2020 rules. Risk of loss passes according to the agreed Incoterm. Bill of Lading (B/L) and shipping documents are dispatched promptly following vessel departure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0B1B3F]">4. Export Documentation & Compliance</h2>
              <p>Every commercial container shipment is accompanied by standard Indian export documentation:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Commercial Invoice & Packing List (itemized carton counts, net/gross weights).</li>
                <li>FSSAI Export Health / Phytosanitary Certificate (where required by commodity).</li>
                <li>Certificate of Origin (issued by Chamber of Commerce / authorized agencies).</li>
                <li>Certificate of Analysis (COA) / Batch laboratory test reports upon request.</li>
                <li>Ocean Bill of Lading (Originals or Surrender / Express Release).</li>
              </ul>
              <p>
                The buyer remains responsible for verifying local customs import clearances, tariff schedules, and destination country ingredient restrictions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0B1B3F]">5. Payment & Settlement Terms</h2>
              <p>
                Standard commercial settlement for first-time international buyers is via <strong>Irrevocable Letter of Credit (L/C at sight)</strong> issued by a prime international bank, or <strong>Telegraphic Transfer (T/T)</strong> with 30% advance on proforma invoice confirmation and 70% balance payable upon submission of copy shipping documents. Credit terms may be extended to longstanding repeat clients subject to credit assessment and credit insurance approval.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0B1B3F]">6. Inspection & Quality Assurance</h2>
              <p>
                Consolidated containers are loaded and sealed at our certified warehouse facility in Changodar, Ahmedabad under strict quality inspection protocols. Buyers are welcome to appoint independent third-party inspection agencies (e.g., SGS, Bureau Veritas) at Mundra/Pipavav port at their own cost prior to vessel departure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0B1B3F]">7. Governing Law & Dispute Resolution</h2>
              <p>
                All commercial agreements, proforma invoices, and contracts arising from trade through this catalogue shall be governed by and construed in accordance with the laws of the Republic of India. Courts in Ahmedabad, Gujarat, India shall have exclusive jurisdiction over any legal disputes.
              </p>
            </section>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between items-center text-sm">
            <Link href="/" className="text-[#1B4FD8] font-medium hover:underline">
              &larr; Back to Catalogue Home
            </Link>
            <Link href="/privacy" className="text-slate-500 hover:text-slate-800">
              Privacy Policy &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
