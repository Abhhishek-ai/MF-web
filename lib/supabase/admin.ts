import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { isSupabaseConfigured } from './public'

export { isSupabaseConfigured }

export const createAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
