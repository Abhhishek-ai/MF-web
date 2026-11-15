'use server'

import { requireAdmin, revalidateCatalog } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseConfigured } from '@/lib/supabase/public'

export async function saveSiteSetting(key: string, value: unknown) {
  await requireAdmin()

  if (!isSupabaseConfigured()) {
    revalidateCatalog()
    return { ok: true }
  }

  try {
    const db = createAdminClient()

    const { error } = await db.from('site_settings').upsert({
      key,
      value: value as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    })

    if (error) return { ok: false, error: error.message }

    revalidateCatalog()
    return { ok: true }
  } catch {
    revalidateCatalog()
    return { ok: true }
  }
}

export async function uploadCataloguePdf(formData: FormData) {
  await requireAdmin()
  const file = formData.get('file') as File | null
  if (!file || file.type !== 'application/pdf') {
    return { ok: false, error: 'Please upload a valid PDF document' }
  }

  const db = createAdminClient()
  const buffer = Buffer.from(await file.arrayBuffer())
  const filename = `catalogue_${Date.now()}.pdf`
  const path = `catalogues/${filename}`

  const { error: uploadError } = await db.storage
    .from('documents')
    .upload(path, buffer, {
      contentType: 'application/pdf',
      upsert: true,
    })

  if (uploadError) {
    return { ok: false, error: `Upload failed: ${uploadError.message}` }
  }

  const { data: publicUrlData } = db.storage.from('documents').getPublicUrl(path)
  const pdfUrl = publicUrlData.publicUrl

  // Update site_settings for key 'catalogue'
  const { data: existing } = await db
    .from('site_settings')
    .select('value')
    .eq('key', 'catalogue')
    .single()

  const updatedVal = {
    ...(existing?.value || {}),
    pdf_url: pdfUrl,
    pdf_filename: file.name,
    uploaded_at: new Date().toISOString(),
  }

  const { error: settingError } = await db.from('site_settings').upsert({
    key: 'catalogue',
    value: updatedVal,
    updated_at: new Date().toISOString(),
  })

  if (settingError) {
    return { ok: false, error: settingError.message }
  }

  revalidateCatalog()
  return { ok: true, pdfUrl }
}
