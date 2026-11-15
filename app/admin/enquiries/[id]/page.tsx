import * as React from 'react'
import { notFound } from 'next/navigation'
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/admin'
import { EnquiryDetailClient } from '@/components/admin/enquiry-detail-client'

export const dynamic = 'force-dynamic'

interface EnquiryPageProps {
  params: Promise<{ id: string }>
}

export default async function AdminEnquiryDetailPage({ params }: EnquiryPageProps) {
  const { id } = await params

  if (!isSupabaseConfigured()) {
    notFound()
  }

  try {
    const db = createAdminClient()

    const { data: enquiry, error } = await db
      .from('enquiries')
      .select('*, enquiry_items(*)')
      .eq('id', id)
      .single()

    if (error || !enquiry) {
      notFound()
    }

    return <EnquiryDetailClient enquiry={enquiry} />
  } catch {
    notFound()
  }
}
