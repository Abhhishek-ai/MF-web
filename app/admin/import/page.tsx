import * as React from 'react'
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/admin'
import { ImportClient } from '@/components/admin/import-client'

export const dynamic = 'force-dynamic'

export default async function AdminImportPage() {
  let history = []

  if (isSupabaseConfigured()) {
    try {
      const db = createAdminClient()
      const { data, error } = await db
        .from('import_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (!error && data) {
        history = data
      }
    } catch {}
  }

  return <ImportClient history={history} />
}
