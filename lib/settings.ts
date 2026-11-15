import { publicClient, isSupabaseConfigured } from '@/lib/supabase/public'
import type { SiteSettingsMap } from './types'

export const defaultSettings: SiteSettingsMap = {
  company: {
    name: 'Megh Overseas Private Limited',
    brand: 'Megh Foods',
    cin: 'U51900GJ2014PTC079988',
    registered_office:
      'A-43 Aditya Residency, Nr. Thaltej Fire Station, Zydus Hospital Road, Thaltej, Ahmedabad - 380059, Gujarat, India',
    factory:
      'Shed No. 6, Marutinandan Estate, Tajpur Road, Changodar, Ahmedabad - 382213, Gujarat, India',
    phones: ['+91 989 825 5500', '+1 469 608 9613'],
    email: 'info@meghfoods.com',
    website: 'www.meghfoods.com',
  },
  whatsapp: {
    number: '919898255500',
  },
  markets: ['United States', 'European Union', 'Middle East', 'Africa'],
  certifications: [],
  catalogue: {
    pdf_url: null,
    label: 'Export Product Catalogue',
    updated: 'November 2026',
  },
  features: {
    show_partner_brands: true,
    enable_checkout: false,
  },
}

export async function getSettings(): Promise<SiteSettingsMap> {
  if (!isSupabaseConfigured()) {
    return defaultSettings
  }
  try {
    const supabase = publicClient()
    const { data, error } = await supabase.from('site_settings').select('key, value')
    if (error || !data) return defaultSettings

    const map = { ...defaultSettings }
    for (const row of data) {
      if (row.key in map) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(map as any)[row.key] = row.value
      }
    }
    return map
  } catch {
    return defaultSettings
  }
}

export const getSiteSettings = getSettings
