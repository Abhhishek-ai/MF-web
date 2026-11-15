import { NextResponse } from 'next/server'
import { publicClient, isSupabaseConfigured } from '@/lib/supabase/public'
import { getLocalCatalog } from '@/lib/local-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!isSupabaseConfigured()) {
    const local = getLocalCatalog().indexProducts
    return NextResponse.json(local, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    })
  }

  try {
    const db = publicClient()
    const out: unknown[] = []

    for (let from = 0; ; from += 1000) {
      const { data, error } = await db
        .from('products')
        .select(
          'slug,name,is_megh_brand,is_featured,images,created_at,brand:brands(name,slug,is_public,is_megh),category:categories(name,slug),group:product_groups(name,slug),packs:product_packs(sku,pack_size,units_per_carton,is_active)'
        )
        .eq('is_active', true)
        .order('name')
        .range(from, from + 999)

      if (error || !data || data.length === 0) {
        if (out.length === 0) {
          // fallback to local catalog
          const local = getLocalCatalog().indexProducts
          return NextResponse.json(local, {
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            },
          })
        }
        break
      }

      const rows = data ?? []
      for (const item of rows) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const p = item as any
        if (p.brand && !p.brand.is_public && !p.brand.is_megh) {
          p.brand = null
        }
        out.push(p)
      }

      if (rows.length < 1000) break
    }

    return NextResponse.json(out, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    })
  } catch {
    const local = getLocalCatalog().indexProducts
    return NextResponse.json(local, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    })
  }
}
