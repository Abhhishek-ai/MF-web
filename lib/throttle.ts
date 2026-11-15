import 'server-only'
import crypto from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'

export const hashIp = (ip: string) =>
  crypto
    .createHash('sha256')
    .update(ip + (process.env.IP_HASH_SALT ?? ''))
    .digest('hex')

export async function tooManyRequests(
  db: SupabaseClient,
  ipHash: string,
  max = 5,
  minutes = 60
) {
  const since = new Date(Date.now() - minutes * 60_000).toISOString()
  const { count } = await db
    .from('enquiry_throttle')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', since)
  return (count ?? 0) >= max
}
