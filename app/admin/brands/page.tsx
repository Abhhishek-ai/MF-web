import * as React from 'react'
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/admin'
import { BrandsClient } from '@/components/admin/brands-client'
import { getLocalCatalog } from '@/lib/local-data'
import type { Brand } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function AdminBrandsPage() {
  const local = getLocalCatalog()
  let brands: Brand[] = local.brands

  if (isSupabaseConfigured()) {
    try {
      const db = createAdminClient()
      const { data: brandsData, error } = await db
        .from('brands')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })

      if (!error && brandsData && brandsData.length > 0) {
        brands = brandsData as Brand[]
      }
    } catch {}
  }

  return <BrandsClient brands={brands} />
}
