'use client'

import * as React from 'react'
import Papa from 'papaparse'
import { useRouter } from 'next/navigation'
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Play,
  Clock,
  Loader2,
  Database,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import {
  importCatalogue,
  importFromLocalFile,
  ImportSummary,
} from '@/app/admin/actions/import'
import { toast } from 'sonner'

export interface ImportJobHistory {
  id: string
  filename: string
  total_rows: number
  created_products: number
  updated_products: number
  created_packs: number
  updated_packs: number
  errors: unknown[]
  created_at: string
}

interface ImportClientProps {
  history: ImportJobHistory[]
}

export function ImportClient({ history }: ImportClientProps) {
  const router = useRouter()
  const [file, setFile] = React.useState<File | null>(null)
  const [parsedRows, setParsedRows] = React.useState<Record<string, string>[]>([])
  const [headers, setHeaders] = React.useState<string[]>([])
  const [overwrite, setOverwrite] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [progressMsg, setProgressMsg] = React.useState<string | null>(null)
  const [summary, setSummary] = React.useState<ImportSummary | null>(null)
  const [errors, setErrors] = React.useState<{ line: number; message: string }[]>([])
  const [isDryRunSuccess, setIsDryRunSuccess] = React.useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    setFile(selected)
    setSummary(null)
    setErrors([])
    setIsDryRunSuccess(false)
    setProgressMsg('Parsing CSV file in browser...')

    Papa.parse(selected, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.replace(/^\uFEFF/, '').trim(), // strip UTF-8 BOM
      complete: (results) => {
        setParsedRows(results.data as Record<string, string>[])
        if (results.meta.fields) {
          setHeaders(results.meta.fields)
        }
        setProgressMsg(null)
        toast.success(`Parsed ${results.data.length} rows from ${selected.name}`)
      },
      error: (err) => {
        setProgressMsg(null)
        toast.error(`CSV Parsing error: ${err.message}`)
      },
    })
  }

  const handleDryRun = async () => {
    if (!parsedRows.length) return
    setLoading(true)
    setProgressMsg('Performing dry run analysis & validation...')
    setErrors([])
    setSummary(null)

    try {
      const res = await importCatalogue({
        rows: parsedRows,
        dryRun: true,
        overwrite,
        filename: file?.name || 'uploaded.csv',
      })

      if (res.ok) {
        setSummary(res.summary)
        setIsDryRunSuccess(true)
        toast.success('Dry run completed! No validation errors found.')
      } else {
        setErrors(res.errors)
        setIsDryRunSuccess(false)
        toast.error(`Dry run found ${res.errors.length} validation issues.`)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Dry run error'
      toast.error(msg)
    } finally {
      setLoading(false)
      setProgressMsg(null)
    }
  }

  const handleExecuteImport = async () => {
    if (!parsedRows.length) return
    if (!confirm(`Are you ready to import ${parsedRows.length} rows into Megh Foods database?`)) {
      return
    }

    setLoading(true)
    setProgressMsg('Importing taxonomy, products, and packs into database...')
    setErrors([])

    try {
      const res = await importCatalogue({
        rows: parsedRows,
        dryRun: false,
        overwrite,
        filename: file?.name || 'uploaded.csv',
      })

      if (res.ok) {
        setSummary(res.summary)
        toast.success(`Import complete! ${res.summary.newProducts} new products created.`)
        router.refresh()
      } else {
        setErrors(res.errors)
        toast.error(`Import failed with ${res.errors.length} errors.`)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Import execution error'
      toast.error(msg)
    } finally {
      setLoading(false)
      setProgressMsg(null)
    }
  }

  const handleQuickServerImport = async (dryRun: boolean) => {
    setLoading(true)
    setProgressMsg(
      dryRun
        ? 'Analyzing data/megh_products_clean.csv on server...'
        : 'Importing data/megh_products_clean.csv into database...'
    )
    setErrors([])
    setSummary(null)

    try {
      const res = await importFromLocalFile(dryRun, overwrite)
      if (res.ok) {
        setSummary(res.summary)
        if (dryRun) {
          setIsDryRunSuccess(true)
          toast.success('Server CSV dry run completed successfully!')
        } else {
          toast.success('Server CSV successfully imported!')
          router.refresh()
        }
      } else {
        setErrors(res.errors)
        setIsDryRunSuccess(false)
        toast.error('Encountered errors in server CSV')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Server file error'
      toast.error(msg)
    } finally {
      setLoading(false)
      setProgressMsg(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-montserrat text-megh-navy">
          Catalogue CSV Import Center
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Import and synchronize the master product list (approx 2,140 rows), automatically
          upserting categories, brands, products, and multi-pack carton SKUs.
        </p>
      </div>

      {/* Upload & Quick Action Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Zone (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Upload className="w-4 h-4 text-megh-primary" /> Upload Clean Catalogue CSV
          </h2>

          <div className="border-2 border-dashed border-slate-200 hover:border-megh-primary/50 rounded-xl p-6 text-center transition-colors">
            <input
              type="file"
              accept=".csv"
              id="csv-file-input"
              className="hidden"
              onChange={handleFileChange}
            />
            <label
              htmlFor="csv-file-input"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-megh-primary/10 text-megh-primary flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold text-slate-800">
                {file ? file.name : 'Select or drop megh_products_clean.csv'}
              </span>
              <span className="text-xs text-slate-400">
                Expected columns: sku, product_slug, product_name, brand, product_group, category,
                pack_size, units_per_carton...
              </span>
            </label>
          </div>

          {/* Settings & Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Switch checked={overwrite} onCheckedChange={setOverwrite} id="overwrite-switch" />
              <label htmlFor="overwrite-switch" className="text-xs text-slate-700 cursor-pointer">
                <span className="font-semibold">Overwrite existing products and packs</span>
                <span className="block text-[11px] text-slate-400">
                  Default is OFF (ignore duplicate SKUs and protect manual edits)
                </span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!parsedRows.length || loading}
                onClick={handleDryRun}
                className="text-xs"
              >
                Dry Run Validate
              </Button>

              <Button
                type="button"
                size="sm"
                disabled={!parsedRows.length || loading}
                onClick={handleExecuteImport}
                className="bg-megh-primary hover:bg-megh-primary/90 text-white text-xs flex items-center gap-1.5"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                Run Import ({parsedRows.length.toLocaleString()} rows)
              </Button>
            </div>
          </div>

          {progressMsg && (
            <div className="p-3 rounded-lg bg-blue-50 text-blue-900 text-xs flex items-center gap-2 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-megh-primary flex-shrink-0" />
              <span>{progressMsg}</span>
            </div>
          )}
        </div>

        {/* Quick Local Import Card (1 col) */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-megh-navy font-bold text-sm">
              <Database className="w-4 h-4 text-megh-accent" /> Server Master File
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              `data/megh_products_clean.csv` is packaged on the server (2,140 clean rows). You can run
              dry run or seed directly from the server file without uploading.
            </p>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() => handleQuickServerImport(true)}
              className="w-full text-xs justify-center bg-white"
            >
              Dry Run Server File
            </Button>
            <Button
              size="sm"
              disabled={loading}
              onClick={() => handleQuickServerImport(false)}
              className="w-full text-xs justify-center bg-megh-primary hover:bg-megh-primary/90 text-white"
            >
              Seed All From Server File
            </Button>
          </div>
        </div>
      </div>

      {/* Validation Errors Display */}
      {errors.length > 0 && (
        <div className="p-5 rounded-xl bg-red-50 border border-red-200 space-y-3">
          <div className="flex items-center gap-2 text-red-800 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            Found {errors.length} Validation Error(s)
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1 text-xs text-red-700 font-mono">
            {errors.map((e, idx) => (
              <div key={idx}>
                Line {e.line}: {e.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dry Run / Import Summary Card */}
      {summary && (
        <div className="p-6 rounded-2xl bg-white border border-emerald-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              {isDryRunSuccess ? 'Dry Run Summary (Ready to Import)' : 'Import Execution Summary'}
            </div>
            <Badge variant="success">Validation Passed</Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 pt-2 text-center">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">Total Rows</div>
              <div className="text-lg font-bold text-slate-900 mt-1">
                {summary.rows.toLocaleString()}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
              <div className="text-xs text-emerald-700 font-medium">New Products</div>
              <div className="text-lg font-bold text-emerald-800 mt-1">
                +{summary.newProducts.toLocaleString()}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">Existing Prod.</div>
              <div className="text-lg font-bold text-slate-700 mt-1">
                {summary.existingProducts.toLocaleString()}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
              <div className="text-xs text-megh-primary font-medium">New Packs</div>
              <div className="text-lg font-bold text-megh-primary mt-1">
                +{summary.newPacks.toLocaleString()}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">Existing Packs</div>
              <div className="text-lg font-bold text-slate-700 mt-1">
                {summary.existingPacks.toLocaleString()}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">Brands</div>
              <div className="text-lg font-bold text-slate-900 mt-1">{summary.brands}</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">Categories</div>
              <div className="text-lg font-bold text-slate-900 mt-1">{summary.categories}</div>
            </div>
          </div>
        </div>
      )}

      {/* CSV Preview Table (First 20 rows) */}
      {parsedRows.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              File Preview (First 20 of {parsedRows.length.toLocaleString()} rows)
            </h3>
            <span className="text-xs text-slate-500">{headers.length} columns detected</span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Pack Size</TableHead>
                  <TableHead>Units/Ctn</TableHead>
                  <TableHead>Megh Brand</TableHead>
                  <TableHead>Review Flags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedRows.slice(0, 20).map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-mono text-xs text-slate-400">{idx + 1}</TableCell>
                    <TableCell className="font-mono text-xs font-bold text-megh-navy">
                      {row.sku}
                    </TableCell>
                    <TableCell className="font-medium text-xs text-slate-900">
                      {row.product_name}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {row.brand || 'Unbranded'}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">{row.category}</TableCell>
                    <TableCell className="text-xs font-mono">{row.pack_size || '—'}</TableCell>
                    <TableCell className="text-xs font-mono">{row.units_per_carton || '—'}</TableCell>
                    <TableCell>
                      {row.is_megh_brand?.toUpperCase() === 'TRUE' ? (
                        <Badge variant="primary" className="text-[10px]">
                          Megh
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-slate-400">Partner</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.review_flags ? (
                        <Badge variant="warning" className="text-[10px]">
                          {row.review_flags}
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-slate-400">None</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Import History Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" /> Import Execution History
        </h3>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Filename</TableHead>
                <TableHead className="text-center">Total Rows</TableHead>
                <TableHead className="text-center">New Products</TableHead>
                <TableHead className="text-center">New Packs</TableHead>
                <TableHead className="text-center">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history && history.length > 0 ? (
                history.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="text-xs text-slate-600">
                      {new Date(job.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-medium text-slate-900">
                      {job.filename}
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs font-bold text-slate-800">
                      {job.total_rows.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs text-emerald-600">
                      +{job.created_products}
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs text-megh-primary">
                      +{job.created_packs}
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs text-slate-500">
                      {job.updated_products + job.updated_packs}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-500">
                    No import jobs recorded yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
