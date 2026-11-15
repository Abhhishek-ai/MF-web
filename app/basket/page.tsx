import * as React from 'react'
import type { Metadata } from 'next'
import { getSettings } from '@/lib/settings'
import { BasketClient } from '@/components/public/basket-client'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Enquiry Basket & Container Shortlist',
  description:
    'Review your shortlisted Indian food and grocery cartons, export to Excel, and request a consolidated container shipping quote from Megh Foods.',
  alternates: {
    canonical: '/basket',
  },
  openGraph: {
    title: 'Enquiry Basket & Container Shortlist | Megh Foods',
    description:
      'Review your shortlisted Indian food and grocery cartons, export to Excel, and request a consolidated container shipping quote from Megh Foods.',
    url: '/basket',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Enquiry Basket & Container Shortlist | Megh Foods',
    description:
      'Review your shortlisted Indian food and grocery cartons, export to Excel, and request a consolidated container shipping quote.',
  },
}

export default async function BasketPage() {
  const settings = await getSettings()

  return <BasketClient whatsappNumber={settings.whatsapp?.number} />
}
