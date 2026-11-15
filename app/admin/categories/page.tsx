import * as React from 'react'
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/admin'
import { CategoriesClient } from '@/components/admin/categories-client'
import { getLocalCatalog } from '@/lib/local-data'
import type { Category, ProductGroup } from '@/lib/types'

export const dynamic = 'force-dynamic'

type CategoryWithGroup = Category & {
  product_group?: { id: string; name: string } | null
}

export default async function AdminCategoriesPage() {
  const local = getLocalCatalog()
  let categories: CategoryWithGroup[] = local.categories.map((c) => ({
    ...c,
    product_group: c.group ? { id: c.group.id, name: c.group.name } : null,
  }))
  let groups: ProductGroup[] = local.groups

  if (isSupabaseConfigured()) {
    try {
      const db = createAdminClient()
      const [{ data: categoriesData }, { data: groupsData }] = await Promise.all([
        db
          .from('categories')
          .select('*, product_group:product_groups(id, name)')
          .order('sort_order', { ascending: true })
          .order('name', { ascending: true }),
        db
          .from('product_groups')
          .select('*')
          .order('sort_order', { ascending: true })
          .order('name', { ascending: true }),
      ])

      if (categoriesData && categoriesData.length > 0) categories = categoriesData as CategoryWithGroup[]
      if (groupsData && groupsData.length > 0) groups = groupsData as ProductGroup[]
    } catch {}
  }

  return <CategoriesClient categories={categories} groups={groups} />
}
