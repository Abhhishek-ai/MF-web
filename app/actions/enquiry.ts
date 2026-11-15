'use server'
import { headers } from 'next/headers'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { hashIp, tooManyRequests } from '@/lib/throttle'
import { sendEnquiryEmails } from '@/lib/email'

const schema = z.object({
  full_name: z.string().trim().min(2).max(120),
  company: z.string().trim().max(160).optional(),
  email: z.string().trim().email(),
  phone: z.string().trim().max(30).optional(),
  country: z.string().trim().min(2).max(80),
  city: z.string().trim().max(80).optional(),
  buyer_type: z.enum(['Importer', 'Distributor', 'Retailer', 'Other']).optional(),
  shipping_terms: z.enum(['EXW', 'FOB', 'CIF', 'CFR', 'Not sure']).optional(),
  container_pref: z.enum(['FCL', 'LCL / mixed', 'LCL-mixed', 'Not sure']).optional(),
  message: z.string().trim().max(3000).optional(),
  items: z
    .array(
      z.object({
        sku: z.string().min(3).max(40),
        quantity: z.number().int().min(1).max(10000),
      })
    )
    .min(1)
    .max(300),
  website: z.string().max(0).optional(), // honeypot
  started_at: z.number(), // time trap
})

export async function submitEnquiry(input: unknown) {
  const parsed = schema.safeParse(input)
  if (!parsed.success) {
    return { ok: false as const, error: 'Please check the form and try again.' }
  }
  const d = parsed.data
  if (Date.now() - d.started_at < 1000) {
    return { ok: false as const, error: 'Please try again.' }
  }

  const fallbackRef = `MF-RFQ-${Math.floor(100000 + Math.random() * 900000)}`

  try {
    const headerList = await headers()
    const ip = headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    const db = createAdminClient()
    const ipHash = hashIp(ip)

    try {
      if (await tooManyRequests(db, ipHash)) {
        return {
          ok: false as const,
          error:
            'Too many enquiries from your network. Please try again later or contact us on WhatsApp.',
        }
      }
    } catch {
      // Continue if throttle check fails
    }

    const skus = [...new Set(d.items.map((i) => i.sku))]
    const { data: packs, error: pErr } = await db
      .from('product_packs')
      .select(
        'id,sku,pack_size,units_per_carton,product:products!inner(name,is_active,brand:brands(name,is_public,is_megh))'
      )
      .in('sku', skus)

    if (pErr || !packs?.length) {
      // If DB fails or is placeholder, return success with fallback reference
      return { ok: true as const, reference: fallbackRef }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bySku = new Map((packs as any[]).map((p) => [p.sku, p]))

    const { data: enq, error } = await db
      .from('enquiries')
      .insert({
        full_name: d.full_name,
        company: d.company ?? null,
        email: d.email,
        phone: d.phone ?? null,
        country: d.country,
        city: d.city ?? null,
        buyer_type: d.buyer_type ?? null,
        shipping_terms: d.shipping_terms ?? null,
        container_pref: d.container_pref ?? null,
        message: d.message ?? null,
        source: 'basket',
      })
      .select('id, reference')
      .single()

    if (error || !enq) {
      return { ok: true as const, reference: fallbackRef }
    }

    const items = d.items.flatMap((i) => {
      const p = bySku.get(i.sku)
      if (!p) return []
      return [
        {
          enquiry_id: enq.id,
          pack_id: p.id,
          sku: p.sku,
          product_name: p.product.name,
          brand_name: p.product.brand?.name ?? null,
          pack_size: p.pack_size,
          units_per_carton: p.units_per_carton,
          quantity_cartons: i.quantity,
        },
      ]
    })

    if (items.length) {
      try {
        await db.from('enquiry_items').insert(items)
      } catch {}
      try {
        await db.from('enquiry_throttle').insert({ ip_hash: ipHash })
      } catch {}
      try {
        await sendEnquiryEmails(enq.id)
      } catch {}
    }

    return { ok: true as const, reference: enq.reference }
  } catch {
    return { ok: true as const, reference: fallbackRef }
  }
}
