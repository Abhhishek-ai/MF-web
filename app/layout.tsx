import type { Metadata } from 'next'
import './globals.css'
import { getSettings } from '@/lib/settings'
import { getGroups, getCategories } from '@/lib/data'
import { Header } from '@/components/public/header'
import { Footer } from '@/components/public/footer'
import { WhatsAppFloat } from '@/components/public/whatsapp-float'
import { Toaster } from 'sonner'
import { generateOrganizationSchema } from '@/lib/seo'

import { JsonLd } from '@/components/public/json-ld'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.meghfoods.com'),
  title: {
    default: 'Megh Foods | Indian Grocery Exporter & Consolidator',
    template: '%s | Megh Foods',
  },
  description:
    'One container. 2,000+ Indian products. Indian grocery exporter and wholesale food supplier based in Ahmedabad, Gujarat. Mix Megh-brand staples, partner brands, pooja and handicraft items in a single consolidated shipment.',
  keywords: [
    'Indian grocery exporter',
    'Indian food wholesale supplier Ahmedabad',
    'mixed container Indian groceries',
    'Indian flours and pulses exporter',
    'Indian snacks and namkeen wholesale',
    'Megh Foods Ahmedabad',
    'FMCG consolidation India',
    'Changodar food manufacturing',
    'B2B food catalogue',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Megh Foods | Indian Grocery Exporter & Consolidator',
    description:
      'One container. 2,000+ Indian products. Mix Megh-brand staples, partner brands, pooja and handicraft items in a single shipment.',
    url: '/',
    siteName: 'Megh Foods',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Megh Foods - Indian Grocery Exporter',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Megh Foods | Indian Grocery Exporter & Consolidator',
    description:
      'One container. 2,000+ Indian products. Mix Megh-brand staples, partner brands, pooja and handicraft items in a single shipment.',
    images: ['/opengraph-image'],
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [settings, groups, categories] = await Promise.all([
    getSettings(),
    getGroups(),
    getCategories(),
  ])

  const orgSchema = generateOrganizationSchema(settings)

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <JsonLd data={orgSchema} />
      </head>
      <body className="antialiased min-h-screen bg-megh-surface text-megh-navy font-sans flex flex-col">
        {/* Accessibility Skip Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-[#1B4FD8] focus:text-white focus:font-semibold focus:text-xs focus:rounded-lg focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9CCB3B]"
        >
          Skip to main content
        </a>
        <Header
          groups={groups}
          categories={categories}
          pdfUrl={settings.catalogue?.pdf_url}
          phone={settings.whatsapp?.number || settings.company?.phones?.[0]}
          email={settings.company?.email}
        />
        <main id="main-content" className="flex-1 flex flex-col focus:outline-none" tabIndex={-1}>
          {children}
        </main>
        <Footer settings={settings} />
        <WhatsAppFloat number={settings.whatsapp?.number} />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
