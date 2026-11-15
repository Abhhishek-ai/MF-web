'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Mail,
  MessageCircle,
  Building,
  Globe,
  Anchor,
  Clock,
  Download,
  Trash2,
  FileSpreadsheet,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import {
  updateEnquiryStatus,
  updateEnquiryNotes,
  deleteEnquiry,
} from '@/app/admin/actions/enquiries'
import { EnquiryStatus } from '@/lib/types'
import { toast } from 'sonner'

export interface EnquiryDetailItem {
  id: string
  sku: string
  product_name: string
  brand_name?: string | null
  pack_size?: string | null
  units_per_carton?: number | null
  cartons_requested?: number | null
  notes?: string | null
}

export interface EnquiryDetailData {
  id: string
  reference_code: string
  buyer_name: string
  buyer_email: string
  buyer_company?: string | null
  buyer_phone?: string | null
  buyer_country: string
  destination_port?: string | null
  estimated_container?: string | null
  target_timeline?: string | null
  notes?: string | null
  internal_notes?: string | null
  status: EnquiryStatus
  created_at: string
  enquiry_items?: EnquiryDetailItem[]
}

interface EnquiryDetailClientProps {
  enquiry: EnquiryDetailData
}

export function EnquiryDetailClient({ enquiry }: EnquiryDetailClientProps) {
  const router = useRouter()
  const [status, setStatus] = React.useState<EnquiryStatus>(enquiry.status)
  const [notes, setNotes] = React.useState(enquiry.internal_notes || '')
  const [savingNotes, setSavingNotes] = React.useState(false)
  const [updatingStatus, setUpdatingStatus] = React.useState(false)

  // Status Change Handler
  const handleStatusChange = async (newStatus: EnquiryStatus) => {
    setStatus(newStatus)
    setUpdatingStatus(true)
    const toastId = toast.loading('Updating enquiry status...')
    try {
      const res = await updateEnquiryStatus(enquiry.id, newStatus)
      if (res.ok) {
        toast.success(`Status updated to ${newStatus}`, { id: toastId })
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to update status', { id: toastId })
      }
    } catch {
      toast.error('Network error updating status', { id: toastId })
    } finally {
      setUpdatingStatus(false)
    }
  }

  // Internal Notes Autosave Handler with Debounce
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null)
  const handleNotesChange = (val: string) => {
    setNotes(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSavingNotes(true)
      try {
        await updateEnquiryNotes(enquiry.id, val)
        toast.success('Internal notes saved automatically', { duration: 1500 })
      } catch {
        // silent fail
      } finally {
        setSavingNotes(false)
      }
    }, 1200)
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete enquiry ${enquiry.reference_code}?`)) return
    const toastId = toast.loading('Deleting enquiry...')
    try {
      const res = await deleteEnquiry(enquiry.id)
      if (res.ok) {
        toast.success('Enquiry deleted', { id: toastId })
        router.push('/admin/enquiries')
      } else {
        toast.error(res.error || 'Failed to delete', { id: toastId })
      }
    } catch {
      toast.error('Network error', { id: toastId })
    }
  }

  const cleanPhone = (enquiry.buyer_phone || '').replace(/[^0-9]/g, '')
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(
        enquiry.buyer_name
      )},%20this%20is%20Megh%20Foods%20regarding%20your%20enquiry%20${enquiry.reference_code}.`
    : null

  const items = enquiry.enquiry_items || []
  const totalCartons = items.reduce(
    (sum: number, it: EnquiryDetailItem) => sum + (it.cartons_requested || 0),
    0
  )

  return (
    <div className="space-y-6">
      {/* Top Back Navigation & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/enquiries">
            <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-lg">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-montserrat text-megh-navy font-mono">
                {enquiry.reference_code}
              </h1>
              <Badge variant="primary" className="text-xs">
                {items.length} Items Shortlisted
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Submitted on {new Date(enquiry.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Dropdown */}
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value as EnquiryStatus)}
            disabled={updatingStatus}
            className="h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 shadow-xs focus:ring-megh-primary"
          >
            <option value="new">Status: New</option>
            <option value="in_progress">Status: In Progress</option>
            <option value="quoted">Status: Quoted</option>
            <option value="won">Status: Won (Order Confirmed)</option>
            <option value="lost">Status: Lost</option>
            <option value="spam">Status: Mark as Spam</option>
          </select>

          {/* Export Buttons */}
          <a
            href={`/admin/enquiries/${enquiry.id}/export`}
            download
            className="inline-flex"
          >
            <Button variant="outline" size="sm" className="h-9 text-xs flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-megh-primary" /> Export CSV
            </Button>
          </a>

          <a
            href={`/admin/enquiries/${enquiry.id}/export?format=excel`}
            download
            className="inline-flex"
          >
            <Button variant="outline" size="sm" className="h-9 text-xs flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Excel CSV
            </Button>
          </a>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="h-9 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Buyer Information & Internal Notes (1 Col) */}
        <div className="space-y-6">
          {/* Buyer Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              Buyer Details
            </h2>

            <div className="space-y-3 text-sm">
              <div>
                <div className="text-xs text-slate-400">Buyer Name</div>
                <div className="font-semibold text-slate-900 text-base">{enquiry.buyer_name}</div>
              </div>

              <div>
                <div className="text-xs text-slate-400">Company Name</div>
                <div className="font-medium text-slate-800 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {enquiry.buyer_company || 'Independent Importer'}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-400">Country & Destination</div>
                <div className="font-medium text-slate-800 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  {enquiry.buyer_country}
                  {enquiry.destination_port && (
                    <span className="text-slate-500 font-normal">
                      (Port: {enquiry.destination_port})
                    </span>
                  )}
                </div>
              </div>

              {enquiry.estimated_container && (
                <div>
                  <div className="text-xs text-slate-400">Container Estimate</div>
                  <div className="font-medium text-slate-800 flex items-center gap-1.5">
                    <Anchor className="w-3.5 h-3.5 text-slate-400" />
                    {enquiry.estimated_container}
                  </div>
                </div>
              )}

              {enquiry.target_timeline && (
                <div>
                  <div className="text-xs text-slate-400">Target Shipment Timeline</div>
                  <div className="font-medium text-slate-800 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {enquiry.target_timeline}
                  </div>
                </div>
              )}
            </div>

            {/* Direct Contact CTAs */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <a
                href={`mailto:${enquiry.buyer_email}?subject=Megh%20Foods%20Quote%20-%20Ref%20${enquiry.reference_code}`}
                className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
              >
                <Mail className="w-4 h-4 text-megh-primary" /> {enquiry.buyer_email}
              </a>

              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold text-emerald-800 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" /> Chat on WhatsApp (
                  {enquiry.buyer_phone})
                </a>
              )}
            </div>

            {enquiry.notes && (
              <div className="pt-3 border-t border-slate-100">
                <div className="text-xs text-slate-400 mb-1">Buyer Message:</div>
                <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-700 italic border border-slate-100">
                  &ldquo;{enquiry.notes}&rdquo;
                </div>
              </div>
            )}
          </div>

          {/* Internal Notes Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Internal Sales Notes
              </h2>
              {savingNotes && (
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Private notes visible only to the Megh export sales team. Saves automatically.
            </p>
            <Textarea
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              rows={4}
              placeholder="e.g. Quoted CIF New York $18.50/ctn on 14th Nov. Awaiting confirmation from buyer."
              className="text-xs"
            />
          </div>
        </div>

        {/* Shortlisted Items Table (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                Requested Products & Carton Quantities
              </h2>
              <span className="text-xs font-semibold text-slate-600">
                Total Cartons: <strong className="text-megh-primary font-mono text-sm">{totalCartons}</strong>
              </span>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Pack Size</TableHead>
                  <TableHead className="text-center">Units/Ctn</TableHead>
                  <TableHead className="text-right">Cartons Requested</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs font-bold text-megh-navy">
                      {item.sku}
                    </TableCell>

                    <TableCell>
                      <div className="font-medium text-xs text-slate-900">{item.product_name}</div>
                      {item.notes && (
                        <div className="text-[11px] text-slate-400 italic">Note: {item.notes}</div>
                      )}
                    </TableCell>

                    <TableCell className="text-xs text-slate-600">
                      {item.brand_name || 'Megh'}
                    </TableCell>

                    <TableCell className="text-xs font-mono">{item.pack_size || '—'}</TableCell>

                    <TableCell className="text-center text-xs font-mono">
                      {item.units_per_carton ?? '—'}
                    </TableCell>

                    <TableCell className="text-right">
                      <span className="font-mono text-xs font-bold text-megh-primary bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {item.cartons_requested} ctns
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}
