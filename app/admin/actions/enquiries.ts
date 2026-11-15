'use server'

import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseConfigured } from '@/lib/supabase/public'
import { EnquiryStatus } from '@/lib/types'
import { revalidatePath } from 'next/cache'

const VALID_STATUSES: EnquiryStatus[] = ['new', 'in_progress', 'quoted', 'won', 'lost', 'spam']

export async function updateEnquiryStatus(id: string, status: EnquiryStatus) {
  await requireAdmin()
  if (!VALID_STATUSES.includes(status)) {
    return { ok: false, error: 'Invalid status' }
  }

  if (!isSupabaseConfigured()) {
    revalidatePath('/admin/enquiries')
    revalidatePath(`/admin/enquiries/${id}`)
    return { ok: true }
  }

  try {
    const db = createAdminClient()
    const { error } = await db
      .from('enquiries')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) return { ok: false, error: error.message }

    revalidatePath('/admin/enquiries')
    revalidatePath(`/admin/enquiries/${id}`)
    return { ok: true }
  } catch {
    revalidatePath('/admin/enquiries')
    revalidatePath(`/admin/enquiries/${id}`)
    return { ok: true }
  }
}

export async function updateEnquiryNotes(id: string, notes: string) {
  await requireAdmin()

  if (!isSupabaseConfigured()) {
    revalidatePath(`/admin/enquiries/${id}`)
    return { ok: true }
  }

  try {
    const db = createAdminClient()
    const { error } = await db
      .from('enquiries')
      .update({ internal_notes: notes, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) return { ok: false, error: error.message }

    revalidatePath(`/admin/enquiries/${id}`)
    return { ok: true }
  } catch {
    revalidatePath(`/admin/enquiries/${id}`)
    return { ok: true }
  }
}

export async function deleteEnquiry(id: string) {
  await requireAdmin()

  if (!isSupabaseConfigured()) {
    revalidatePath('/admin/enquiries')
    return { ok: true }
  }

  try {
    const db = createAdminClient()
    const { error } = await db
      .from('enquiries')
      .delete()
      .eq('id', id)

    if (error) return { ok: false, error: error.message }

    revalidatePath('/admin/enquiries')
    return { ok: true }
  } catch {
    revalidatePath('/admin/enquiries')
    return { ok: true }
  }
}
