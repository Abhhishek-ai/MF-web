import * as React from 'react'
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/admin'
import { SettingsClient } from '@/components/admin/settings-client'
import { defaultSettings } from '@/lib/settings'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const settingsMap: Record<string, unknown> = { ...defaultSettings }

  if (isSupabaseConfigured()) {
    try {
      const db = createAdminClient()
      const { data: rows, error } = await db.from('site_settings').select('key, value')

      if (!error && rows) {
        rows.forEach((r) => {
          settingsMap[r.key] = r.value
        })
      }
    } catch {}
  }

  return <SettingsClient settings={settingsMap} />
}
