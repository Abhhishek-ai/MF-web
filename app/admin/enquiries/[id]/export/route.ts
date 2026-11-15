import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const db = createAdminClient()

    // Fetch enquiry and items
    const { data: enquiry, error: enquiryError } = await db
      .from('enquiries')
      .select('*, enquiry_items(*)')
      .eq('id', id)
      .single()

    if (enquiryError || !enquiry) {
      return new NextResponse('Enquiry not found', { status: 404 })
    }

    const isExcel = request.nextUrl.searchParams.get('format') === 'excel'

    const escapeCsv = (val: unknown) => {
      if (val === null || val === undefined) return '""'
      const str = String(val).replace(/"/g, '""')
      return `"${str}"`
    }

    // Header info rows
    const lines: string[] = []
    lines.push(`Megh Foods - B2B Enquiry Shortlist`)
    lines.push(`Reference Code,${escapeCsv(enquiry.reference_code)}`)
    lines.push(`Created Date,${escapeCsv(new Date(enquiry.created_at).toLocaleString())}`)
    lines.push(`Status,${escapeCsv(enquiry.status)}`)
    lines.push(``)
    lines.push(`Buyer Information`)
    lines.push(`Name,${escapeCsv(enquiry.buyer_name)}`)
    lines.push(`Company,${escapeCsv(enquiry.buyer_company)}`)
    lines.push(`Email,${escapeCsv(enquiry.buyer_email)}`)
    lines.push(`Phone / WhatsApp,${escapeCsv(enquiry.buyer_phone || 'N/A')}`)
    lines.push(`Country,${escapeCsv(enquiry.buyer_country)}`)
    lines.push(`Destination Port,${escapeCsv(enquiry.destination_port || 'N/A')}`)
    lines.push(`Target Timeline,${escapeCsv(enquiry.target_timeline || 'N/A')}`)
    lines.push(`Estimated Container,${escapeCsv(enquiry.estimated_container || 'N/A')}`)
    lines.push(`Buyer Message,${escapeCsv(enquiry.notes || 'N/A')}`)
    lines.push(``)
    lines.push(`Requested Items`)
    lines.push(
      `SKU,Product Name,Brand,Pack Size,Units Per Carton,Cartons Requested,Notes`
    )

    interface ExportItem {
      sku: string
      product_name: string
      brand_name?: string | null
      pack_size?: string | null
      units_per_carton?: number | null
      cartons_requested?: number | null
      notes?: string | null
    }

    const items = (enquiry.enquiry_items as ExportItem[]) || []
    let totalCartons = 0

    items.forEach((item) => {
      const cartons = item.cartons_requested || 0
      totalCartons += cartons
      lines.push(
        [
          escapeCsv(item.sku),
          escapeCsv(item.product_name),
          escapeCsv(item.brand_name || 'Megh'),
          escapeCsv(item.pack_size || ''),
          escapeCsv(item.units_per_carton ?? ''),
          escapeCsv(cartons),
          escapeCsv(item.notes || ''),
        ].join(',')
      )
    })

    lines.push(`,,,,Total Cartons,${totalCartons},`)

    // Prepend UTF-8 BOM so Excel opens it with proper encoding
    const csvContent = '\uFEFF' + lines.join('\r\n')
    const filename = `${enquiry.reference_code || 'enquiry'}${isExcel ? '_excel' : ''}.csv`

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error'
    return new NextResponse(message, { status: 500 })
  }
}
