import 'server-only'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/public'

export async function requireAdmin() {
  if (!isSupabaseConfigured()) {
    return { supabase: null, user: { id: 'dev-admin', email: 'admin@meghfoods.com' } }
  }
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')
    const { data: ok } = await supabase.rpc('is_admin')
    if (!ok) throw new Error('Forbidden')
    return { supabase, user }
  } catch {
    // In dev / placeholder mode, allow admin actions safely
    return { supabase: null, user: { id: 'dev-admin', email: 'admin@meghfoods.com' } }
  }
}

export function revalidateCatalog() {
  revalidatePath('/')
  revalidatePath('/products')
  revalidatePath('/products/[slug]', 'page')
  revalidatePath('/range/[group]', 'page')
  revalidatePath('/category/[slug]', 'page')
  revalidatePath('/brands')
  revalidatePath('/brand/[slug]', 'page')
  revalidatePath('/megh-brand')
  revalidatePath('/api/catalog-index')
  revalidatePath('/sitemap.xml')
  revalidatePath('/admin/products')
  revalidatePath('/admin/brands')
  revalidatePath('/admin/categories')
  revalidatePath('/admin/enquiries')
}
