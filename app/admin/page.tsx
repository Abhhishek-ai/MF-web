import * as React from 'react'
import Link from 'next/link'
import {
  Package,
  MailCheck,
  AlertTriangle,
  ImageOff,
  Upload,
  ArrowRight,
  Clock,
  FileSpreadsheet,
} from 'lucide-react'
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getLocalCatalog } from '@/lib/local-data'

export const dynamic = 'force-dynamic'

interface ImportJob {
  id: string
  file_name: string | null
  rows_total: number | null
  rows_imported: number | null
  created_at: string
}

interface LatestEnquiry {
  id: string
  reference: string
  full_name: string
  company: string | null
  email: string
  country: string
  city: string | null
  container_pref: string | null
  status: string
  created_at: string
}

export default async function AdminDashboardPage() {
  const localCatalog = getLocalCatalog()
  let newEnquiriesCount = 0
  let activeProductsCount = localCatalog.products.length
  let reviewProductsCount = 0
  let noImageCount = 0
  let lastImportJob: ImportJob | null = null
  let latestEnquiries: LatestEnquiry[] = []

  if (isSupabaseConfigured()) {
    try {
      const db = createAdminClient()
      const [
        enquiriesRes,
        productsRes,
        reviewRes,
        noImageRes,
        importRes,
        latestEnqRes,
      ] = await Promise.all([
        db.from('enquiries').select('id', { count: 'exact', head: true }).eq('status', 'new'),
        db.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
        db.from('products').select('id', { count: 'exact', head: true }).eq('needs_review', true),
        db.from('products').select('id').eq('is_active', true).is('images', null),
        db.from('import_jobs').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle(),
        db.from('enquiries').select('*').order('created_at', { ascending: false }).limit(5),
      ])

      if (!enquiriesRes.error && enquiriesRes.count !== null) newEnquiriesCount = enquiriesRes.count
      if (!productsRes.error && productsRes.count !== null) activeProductsCount = productsRes.count
      if (!reviewRes.error && reviewRes.count !== null) reviewProductsCount = reviewRes.count
      if (!noImageRes.error && noImageRes.data) noImageCount = noImageRes.data.length
      if (!importRes.error && importRes.data) lastImportJob = importRes.data as ImportJob
      if (!latestEnqRes.error && latestEnqRes.data) latestEnquiries = latestEnqRes.data as LatestEnquiry[]
    } catch {
      // Graceful fallback when DB not configured
    }
  }

  const kpis = [
    {
      title: 'New Enquiries',
      value: newEnquiriesCount || 0,
      description: 'Require review & quote',
      icon: MailCheck,
      color: 'text-megh-primary',
      bg: 'bg-megh-primary/10',
      href: '/admin/enquiries?status=new',
    },
    {
      title: 'Active Products',
      value: activeProductsCount || 0,
      description: 'Live in B2B catalogue',
      icon: Package,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      href: '/admin/products',
    },
    {
      title: 'Needs Review',
      value: reviewProductsCount || 0,
      description: 'Flags or uncategorised',
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      href: '/admin/products?filter=needs_review',
    },
    {
      title: 'Missing Photos',
      value: noImageCount,
      description: 'Showing placeholder artwork',
      icon: ImageOff,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      href: '/admin/products?filter=no_image',
    },
  ]

  const getStatusBadge = (status: string) => {
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
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-megh-navy font-montserrat">
            Export Operations Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Overview of live product catalogue, export leads, and container enquiries.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="gap-2 bg-white">
            <Link href="/admin/import">
              <Upload className="w-4 h-4 text-slate-500" />
              <span>Import CSV Catalogue</span>
            </Link>
          </Button>
          <Button asChild size="sm" className="gap-2 bg-megh-primary text-white hover:bg-blue-700">
            <Link href="/admin/products">
              <Package className="w-4 h-4" />
              <span>Manage Products</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Link key={kpi.title} href={kpi.href} className="block group">
              <Card className="hover:border-megh-primary/40 hover:shadow-md transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {kpi.title}
                  </CardTitle>
                  <div className={`p-2 rounded-xl ${kpi.bg}`}>
                    <Icon className={`w-4 h-4 ${kpi.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-extrabold text-megh-navy font-montserrat">
                    {kpi.value}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                    <span>{kpi.description}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-megh-primary group-hover:translate-x-0.5 transition-all" />
                  </p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Two Column Layout: Recent Enquiries + Quick Actions / Import Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Latest Inward Enquiries */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-megh-navy font-montserrat">
                Recent Container Enquiries
              </h2>
              <p className="text-xs text-slate-500">Latest quotation requests from global buyers</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs gap-1 text-megh-primary">
              <Link href="/admin/enquiries">
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </Button>
          </div>

          <Card>
            {latestEnquiries && latestEnquiries.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {latestEnquiries.map((enq) => (
                  <Link
                    key={enq.id}
                    href={`/admin/enquiries/${enq.id}`}
                    className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors block"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-slate-800">
                          {enq.reference}
                        </span>
                        {getStatusBadge(enq.status)}
                        {enq.container_pref && (
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                            {enq.container_pref}
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-semibold text-megh-navy">
                        {enq.full_name} {enq.company ? `• ${enq.company}` : ''}
                      </div>
                      <div className="text-xs text-slate-500">
                        {enq.country} {enq.city ? `(${enq.city})` : ''} • {enq.email}
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="text-xs text-slate-400 flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(enq.created_at).toLocaleDateString()}</span>
                      </div>
                      <span className="text-xs text-megh-primary font-medium hover:underline inline-flex items-center gap-0.5">
                        Details <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <MailCheck className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-medium">No enquiries recorded yet</p>
                <p className="text-xs text-slate-400">
                  Enquiries submitted from the public catalogue will appear here.
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column (1 Col): Catalogue Health & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-megh-navy font-montserrat">
                Catalogue Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start text-xs h-9 bg-white" size="sm">
                <Link href="/admin/import">
                  <FileSpreadsheet className="w-4 h-4 mr-2 text-megh-primary" />
                  <span>Bulk Upload CSV Master</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start text-xs h-9 bg-white" size="sm">
                <Link href="/admin/images">
                  <Package className="w-4 h-4 mr-2 text-emerald-600" />
                  <span>Bulk Image Management</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start text-xs h-9 bg-white" size="sm">
                <Link href="/admin/brands">
                  <Package className="w-4 h-4 mr-2 text-amber-600" />
                  <span>Brand Visibility Controls</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start text-xs h-9 bg-white" size="sm">
                <Link href="/admin/settings">
                  <Package className="w-4 h-4 mr-2 text-slate-600" />
                  <span>Company & Export Settings</span>
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Last Import Info Card */}
          <Card className="bg-gradient-to-br from-slate-50 to-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Last Catalogue Sync
                </CardTitle>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {lastImportJob ? (
                <>
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500">File Name</div>
                    <div className="text-sm font-semibold text-megh-navy truncate">
                      {lastImportJob.file_name || 'Master CSV Catalogue'}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 block">Total Rows:</span>
                      <span className="font-semibold text-slate-700">
                        {lastImportJob.rows_total || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Synced SKUs:</span>
                      <span className="font-semibold text-emerald-600">
                        {lastImportJob.rows_imported || 0}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-xs text-slate-500 space-y-1">
                  <p className="font-semibold text-slate-700">Local Dataset Active</p>
                  <p>
                    Currently serving {localCatalog.products.length} verified products from <code>megh_products_clean.csv</code>.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
