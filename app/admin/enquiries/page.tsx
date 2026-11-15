import * as React from 'react'
import Link from 'next/link'
import {
  Search,
  Globe,
  ArrowRight,
} from 'lucide-react'
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/admin'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { EnquiryStatus } from '@/lib/types'

export const dynamic = 'force-dynamic'

interface EnquiriesPageProps {
  searchParams: Promise<{
    q?: string
    status?: string
  }>
}

interface AdminEnquiryRow {
  id: string
  reference: string
  full_name: string
  company: string | null
  email: string
  country: string
  city: string | null
  shipping_terms: string | null
  container_pref: string | null
  status: EnquiryStatus
  created_at: string
}

export default async function AdminEnquiriesPage({ searchParams }: EnquiriesPageProps) {
  const params = await searchParams
  let enquiries: AdminEnquiryRow[] = []

  if (isSupabaseConfigured()) {
    try {
      const db = createAdminClient()

      let query = db
        .from('enquiries')
        .select('*, enquiry_items(id)', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (params.status && params.status !== 'all') {
        query = query.eq('status', params.status)
      }

      if (params.q?.trim()) {
        query = query.or(
          `full_name.ilike.%${params.q.trim()}%,company.ilike.%${params.q.trim()}%,reference.ilike.%${params.q.trim()}%,country.ilike.%${params.q.trim()}%`
        )
      }

      const { data } = await query
      if (data) enquiries = data as AdminEnquiryRow[]
    } catch {}
  }

  const getStatusBadge = (status: EnquiryStatus) => {
    switch (status) {
      case 'new':
        return <Badge variant="primary">New</Badge>
      case 'in_progress':
        return <Badge variant="warning">In Progress</Badge>
      case 'quoted':
        return <Badge variant="accent">Quoted</Badge>
      case 'won':
        return <Badge variant="success">Won</Badge>
      case 'lost':
        return <Badge variant="danger">Lost</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-megh-navy font-montserrat">
            Container Quotation Enquiries
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage RFQs and proforma requests received from international buyers.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            name="q"
            defaultValue={params.q || ''}
            placeholder="Search buyer name, company, reference code, country..."
            className="pl-9 h-10 bg-white"
          />
        </form>
      </div>

      {/* Enquiries Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Buyer / Company</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Terms / Container</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                  No enquiries found. Submissions from the public catalogue will appear here.
                </TableCell>
              </TableRow>
            ) : (
              enquiries.map((enq) => (
                <TableRow key={enq.id}>
                  <TableCell className="font-mono text-xs font-semibold text-slate-800">
                    {enq.reference}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-megh-navy">{enq.full_name}</div>
                    <div className="text-xs text-slate-500">{enq.company || enq.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-slate-700">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <span>{enq.country}</span>
                    </div>
                    {enq.city && <div className="text-[11px] text-slate-400">{enq.city}</div>}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    <div>{enq.shipping_terms || 'FOB'}</div>
                    <div className="text-[11px] text-slate-400">{enq.container_pref || 'FCL'}</div>
                  </TableCell>
                  <TableCell>{getStatusBadge(enq.status)}</TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {new Date(enq.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm" className="h-8 text-xs text-megh-primary">
                      <Link href={`/admin/enquiries/${enq.id}`}>
                        <span>View</span>
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
