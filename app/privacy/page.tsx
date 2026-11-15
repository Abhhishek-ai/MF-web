import { Metadata } from 'next';
import Link from 'next/link';
import { getSiteSettings } from '@/lib/settings';

export const metadata: Metadata = {
  title: 'Privacy Policy | Megh Foods — Megh Overseas Pvt Ltd',
  description:
    'Privacy Policy for Megh Foods B2B export catalogue website, detailing how we collect, use, and protect trade enquiry data.',
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: 'Privacy Policy | Megh Foods',
    description: 'Privacy policy and data protection for international commercial buyers and importers.',
    url: '/privacy',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | Megh Foods',
    description: 'Privacy policy and data protection for international commercial buyers and importers.',
  },
}

export default async function PrivacyPage() {
  const settings = await getSiteSettings();

  return (
    <div className="bg-[#F6F8FC] min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 sm:p-12">
          {/* Header */}
          <div className="border-b border-slate-100 pb-8 mb-8">
            <span className="text-xs font-semibold tracking-wider text-[#1B4FD8] uppercase">Legal & Compliance</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B1B3F] mt-2">Privacy Policy</h1>
            <p className="text-sm text-slate-500 mt-2">
              Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="prose prose-slate max-w-none text-[#0B1B3F]/80 leading-relaxed space-y-6">
            <section>
              <h2 className="text-xl font-bold text-[#0B1B3F]">1. Corporate Identity</h2>
              <p>
                This website is operated by <strong>{settings.company.name}</strong> (brand name <strong>Megh Foods</strong>), a company incorporated under the laws of India with registered office at {settings.company.registered_office}, and manufacturing / consolidation facilities at {settings.company.factory}.
              </p>
              <p>
                Corporate Identification Number (CIN): <span className="font-mono text-slate-700">{settings.company.cin || 'U15400GJ2015PTC084550'}</span>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0B1B3F]">2. Scope & Purpose</h2>
              <p>
                Megh Foods is a Business-to-Business (B2B) export enterprise. This website functions as an export product catalogue and an Enquiry Basket system for commercial buyers, importers, wholesalers, distributors, and supermarket operators worldwide. We do not engage in retail consumer sales through this website.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0B1B3F]">3. Information We Collect</h2>
              <p>We collect trade and commercial contact information submitted voluntary by prospective and current international trade partners, including:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Contact person name, professional email address, telephone / WhatsApp number.</li>
                <li>Company or trading name, business registration or VAT / tax details where provided.</li>
                <li>Destination country, target port of discharge (e.g., Felixstowe, Jebel Ali, New York, Durban).</li>
                <li>Catalogue SKU shortlists, carton quantities, packaging preferences, and private label specifications.</li>
                <li>Communication logs regarding quotations, container consolidation, and commercial invoice drafting.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0B1B3F]">4. How We Use Collected Data</h2>
              <p>Your commercial enquiry information is used strictly for legitimate B2B business operations:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Preparing and delivering formal indicative export price quotations (FOB / CIF / CFR).</li>
                <li>Optimising mixed container loading calculations and calculating ocean freight estimates.</li>
                <li>Verifying international compliance requirements for food labeling in destination jurisdictions (FDA, EFSA, FSSAI, SFDA).</li>
                <li>Direct export trade communications via WhatsApp or commercial email correspondence.</li>
              </ul>
              <p>
                We do not sell, rent, monetize, or trade buyer contact lists or company details to third-party marketing brokers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0B1B3F]">5. Data Storage & Security</h2>
              <p>
                Our enquiry database is hosted on secure cloud infrastructure with encrypted transport (TLS 1.3) and strict Row-Level Security (RLS) controls. Administrative access to enquiry records is restricted to authorized export sales and operations personnel.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0B1B3F]">6. Cookies & Client-Side Storage</h2>
              <p>
                This website uses browser <code>localStorage</code> solely to retain your Enquiry Basket selections across sessions so you do not lose your shortlisted cartons while browsing the catalogue. We do not employ intrusive tracking pixels or invasive advertising cookies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0B1B3F]">7. Contact & Data Inquiries</h2>
              <p>
                If you have questions regarding trade data handling or wish to update your commercial contact profile, please contact our export compliance desk at:
              </p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm mt-3 space-y-1">
                <p><strong>{settings.company.name}</strong></p>
                <p>Email: <a href={`mailto:${settings.company.email}`} className="text-[#1B4FD8] underline">{settings.company.email}</a></p>
                <p>Phone: {settings.company.phones[0]}</p>
                <p>Address: {settings.company.registered_office}</p>
              </div>
            </section>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between items-center text-sm">
            <Link href="/" className="text-[#1B4FD8] font-medium hover:underline">
              &larr; Back to Catalogue Home
            </Link>
            <Link href="/terms" className="text-slate-500 hover:text-slate-800">
              Terms of Trade &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
