import 'server-only'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'

function renderEnquiryCsv(
  enquiry: {
    reference: string
    full_name: string
    company: string | null
    email: string
    phone: string | null
    country: string
    city: string | null
    buyer_type: string | null
    shipping_terms: string | null
    container_pref: string | null
    created_at: string
  },
  items: Array<{
    sku: string
    product_name: string
    brand_name: string | null
    pack_size: string | null
    units_per_carton: number | null
    quantity_cartons: number
  }>
) {
  const meta = [
    `Reference,${enquiry.reference}`,
    `Date,${new Date(enquiry.created_at).toISOString()}`,
    `Buyer Name,"${enquiry.full_name.replace(/"/g, '""')}"`,
    `Company,"${(enquiry.company || '').replace(/"/g, '""')}"`,
    `Email,${enquiry.email}`,
    `Phone,"${(enquiry.phone || '').replace(/"/g, '""')}"`,
    `Country,"${enquiry.country.replace(/"/g, '""')}"`,
    `City,"${(enquiry.city || '').replace(/"/g, '""')}"`,
    `Buyer Type,"${(enquiry.buyer_type || '').replace(/"/g, '""')}"`,
    `Shipping Terms,"${(enquiry.shipping_terms || '').replace(/"/g, '""')}"`,
    `Container Preference,"${(enquiry.container_pref || '').replace(/"/g, '""')}"`,
    '',
    'SKU,Product,Brand,Pack Size,Units Per Carton,Cartons Required',
  ]

  const rows = items.map((item) =>
    [
      item.sku,
      item.product_name,
      item.brand_name || '',
      item.pack_size || '',
      item.units_per_carton || '',
      item.quantity_cartons,
    ]
      .map((val) => `"${String(val).replace(/"/g, '""')}"`)
      .join(',')
  )

  return '\uFEFF' + [...meta, ...rows].join('\r\n')
}

export async function sendEnquiryEmails(enquiryId: string) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || apiKey.startsWith('re_placeholder') || apiKey === 'placeholder-resend-key') {
    return
  }

  const db = createAdminClient()
  const { data: enquiry, error: enqErr } = await db
    .from('enquiries')
    .select('*')
    .eq('id', enquiryId)
    .single()

  if (enqErr || !enquiry) return

  const { data: items, error: itemErr } = await db
    .from('enquiry_items')
    .select('*')
    .eq('enquiry_id', enquiryId)

  if (itemErr || !items) return

  const resend = new Resend(apiKey)
  const fromEmail = process.env.EMAIL_FROM || 'Megh Foods <export@meghfoods.com>'
  const ownerEmail = process.env.OWNER_NOTIFY_EMAIL || 'info@meghfoods.com'

  const csvContent = renderEnquiryCsv(enquiry, items)
  const csvBuffer = Buffer.from(csvContent, 'utf-8').toString('base64')

  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-family: sans-serif; font-size: 13px; color: #0B1B3F;"><strong>${item.sku}</strong></td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-family: sans-serif; font-size: 13px; color: #0B1B3F;">${item.product_name}${item.brand_name ? ` <span style="color: #64748b;">(${item.brand_name})</span>` : ''}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-family: sans-serif; font-size: 13px; color: #0B1B3F;">${item.pack_size || '-'}${item.units_per_carton ? ` x ${item.units_per_carton}` : ''}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-family: sans-serif; font-size: 13px; color: #0B1B3F; text-align: right; font-weight: bold;">${item.quantity_cartons}</td>
    </tr>
  `
    )
    .join('')

  // 1. Send Owner Notification
  try {
    await resend.emails.send({
      from: fromEmail,
      to: [ownerEmail],
      subject: `[New RFQ ${enquiry.reference}] ${enquiry.company || enquiry.full_name} (${enquiry.country})`,
      attachments: [
        {
          filename: `${enquiry.reference}.csv`,
          content: csvBuffer,
        },
      ],
      html: `
        <div style="background-color: #F6F8FC; padding: 24px; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
            <div style="background-color: #1B4FD8; padding: 20px 24px; color: #ffffff;">
              <h1 style="margin: 0; font-size: 20px; font-weight: bold;">New Export Enquiry / RFQ</h1>
              <p style="margin: 4px 0 0; font-size: 14px; opacity: 0.9;">Reference: ${enquiry.reference}</p>
            </div>
            <div style="padding: 24px;">
              <h2 style="font-size: 16px; color: #0B1B3F; margin-top: 0; border-bottom: 2px solid #9CCB3B; padding-bottom: 6px;">Buyer Information</h2>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr><td style="padding: 4px 0; color: #64748b; font-size: 13px; width: 140px;">Name:</td><td style="padding: 4px 0; font-size: 13px; color: #0B1B3F; font-weight: bold;">${enquiry.full_name}</td></tr>
                <tr><td style="padding: 4px 0; color: #64748b; font-size: 13px;">Company:</td><td style="padding: 4px 0; font-size: 13px; color: #0B1B3F;">${enquiry.company || '-'}</td></tr>
                <tr><td style="padding: 4px 0; color: #64748b; font-size: 13px;">Email:</td><td style="padding: 4px 0; font-size: 13px; color: #0B1B3F;"><a href="mailto:${enquiry.email}" style="color: #1B4FD8;">${enquiry.email}</a></td></tr>
                <tr><td style="padding: 4px 0; color: #64748b; font-size: 13px;">Phone:</td><td style="padding: 4px 0; font-size: 13px; color: #0B1B3F;">${enquiry.phone || '-'}</td></tr>
                <tr><td style="padding: 4px 0; color: #64748b; font-size: 13px;">Country / City:</td><td style="padding: 4px 0; font-size: 13px; color: #0B1B3F;">${enquiry.country}${enquiry.city ? `, ${enquiry.city}` : ''}</td></tr>
                <tr><td style="padding: 4px 0; color: #64748b; font-size: 13px;">Buyer Type:</td><td style="padding: 4px 0; font-size: 13px; color: #0B1B3F;">${enquiry.buyer_type || '-'}</td></tr>
                <tr><td style="padding: 4px 0; color: #64748b; font-size: 13px;">Terms / Container:</td><td style="padding: 4px 0; font-size: 13px; color: #0B1B3F;">${enquiry.shipping_terms || '-'} / ${enquiry.container_pref || '-'}</td></tr>
                ${enquiry.message ? `<tr><td style="padding: 4px 0; color: #64748b; font-size: 13px;">Message:</td><td style="padding: 4px 0; font-size: 13px; color: #0B1B3F;">${enquiry.message}</td></tr>` : ''}
              </table>

              <h2 style="font-size: 16px; color: #0B1B3F; margin-top: 24px; border-bottom: 2px solid #9CCB3B; padding-bottom: 6px;">Requested Items (${items.length})</h2>
              <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
                <thead>
                  <tr style="background-color: #f1f5f9;">
                    <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: #475569;">SKU</th>
                    <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: #475569;">Product</th>
                    <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: #475569;">Pack Spec</th>
                    <th style="padding: 8px 12px; text-align: right; font-size: 12px; color: #475569;">Cartons</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div style="margin-top: 24px; padding: 12px; background-color: #eff6ff; border-radius: 6px; font-size: 12px; color: #1e3a8a;">
                Attached: Excel-compatible CSV file for direct pricing calculations and order processing.
              </div>
            </div>
          </div>
        </div>
      `,
    })
  } catch (err) {
    console.error('Failed to send owner notification email:', err)
  }

  // 2. Send Buyer Confirmation
  try {
    await resend.emails.send({
      from: fromEmail,
      to: [enquiry.email],
      subject: `Enquiry Received: ${enquiry.reference} | Megh Foods Export Team`,
      html: `
        <div style="background-color: #F6F8FC; padding: 24px; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
            <div style="background-color: #1B4FD8; padding: 24px; color: #ffffff;">
              <h1 style="margin: 0; font-size: 22px; font-weight: bold;">Megh Foods</h1>
              <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Export Catalogue & Mixed Container Sourcing</p>
            </div>
            <div style="padding: 24px;">
              <p style="font-size: 15px; color: #0B1B3F; margin-top: 0;">Dear ${enquiry.full_name},</p>
              <p style="font-size: 14px; color: #334155; line-height: 1.6;">
                Thank you for submitting your enquiry. We have received your request for quote under reference <strong>${enquiry.reference}</strong>.
              </p>
              <p style="font-size: 14px; color: #334155; line-height: 1.6;">
                Our export sales team in Ahmedabad is reviewing your product requirements and carton quantities. We will respond with an indicative quote and container consolidation plan shortly.
              </p>

              <h2 style="font-size: 15px; color: #0B1B3F; margin-top: 24px; border-bottom: 2px solid #9CCB3B; padding-bottom: 6px;">Your Shortlisted Items (${items.length})</h2>
              <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
                <thead>
                  <tr style="background-color: #f1f5f9;">
                    <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: #475569;">SKU</th>
                    <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: #475569;">Product</th>
                    <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: #475569;">Pack Spec</th>
                    <th style="padding: 8px 12px; text-align: right; font-size: 12px; color: #475569;">Cartons</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 13px; color: #64748b;">
                <p style="margin: 0;"><strong>Megh Overseas Private Limited</strong></p>
                <p style="margin: 4px 0 0;">Factory: Shed No. 6, Marutinandan Estate, Tajpur Road, Changodar, Ahmedabad - 382213, Gujarat, India</p>
                <p style="margin: 4px 0 0;">WhatsApp: +91 989 825 5500 | Email: export@meghfoods.com</p>
              </div>
            </div>
          </div>
        </div>
      `,
    })
  } catch (err) {
    console.error('Failed to send buyer confirmation email:', err)
  }
}
