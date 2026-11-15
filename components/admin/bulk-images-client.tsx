'use client'

import * as React from 'react'
import Image from 'next/image'
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { uploadProductImage } from '@/lib/image-upload'
import { attachProductImageByIdentifier } from '@/app/admin/actions/products'
import { toast } from 'sonner'

interface UploadItem {
  id: string
  file: File
  filename: string
  identifier: string
  previewUrl: string
  status: 'pending' | 'uploading' | 'matched' | 'unmatched' | 'error'
  productName?: string
  errorMessage?: string
}

export function BulkImagesClient() {
  const [items, setItems] = React.useState<UploadItem[]>([])
  const [processing, setProcessing] = React.useState(false)
  const [filter, setFilter] = React.useState<'all' | 'matched' | 'unmatched'>('all')
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | File[]) => {
    const valid = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (!valid.length) {
      toast.error('Please select image files')
      return
    }

    const newItems: UploadItem[] = valid.map((file) => {
      // Remove file extension to derive identifier
      const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
      return {
        id: crypto.randomUUID(),
        file,
        filename: file.name,
        identifier: cleanName.trim(),
        previewUrl: URL.createObjectURL(file),
        status: 'pending',
      }
    })

    setItems((prev) => [...newItems, ...prev])
    toast.success(`Queued ${newItems.length} images for bulk matching`)
  }

  const handleStartProcessing = async () => {
    const pendingItems = items.filter((i) => i.status === 'pending' || i.status === 'error')
    if (!pendingItems.length) return

    setProcessing(true)
    let matchedCount = 0
    let unmatchedCount = 0

    for (const item of pendingItems) {
      // Set status to uploading
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'uploading' } : i))
      )

      try {
        // 1. Upload to Supabase Storage with WebP compression
        const cdnUrl = await uploadProductImage(item.file)

        // 2. Attach to product by SKU or Slug
        const matchRes = await attachProductImageByIdentifier(item.identifier, cdnUrl)

        if (matchRes.ok) {
          matchedCount++
          setItems((prev) =>
            prev.map((i) =>
              i.id === item.id
                ? {
                    ...i,
                    status: 'matched',
                    productName: matchRes.productName,
                  }
                : i
            )
          )
        } else {
          unmatchedCount++
          setItems((prev) =>
            prev.map((i) =>
              i.id === item.id
                ? {
                    ...i,
                    status: 'unmatched',
                    errorMessage: matchRes.error,
                  }
                : i
            )
          )
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Upload failed'
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  status: 'error',
                  errorMessage: message,
                }
              : i
          )
        )
      }
    }

    setProcessing(false)
    toast.success(`Bulk processing finished: ${matchedCount} matched, ${unmatchedCount} unmatched.`)
  }

  const filteredItems = items.filter((item) => {
    if (filter === 'matched') return item.status === 'matched'
    if (filter === 'unmatched') return item.status === 'unmatched' || item.status === 'error'
    return true
  })

  const matchedTotal = items.filter((i) => i.status === 'matched').length
  const unmatchedTotal = items.filter((i) => i.status === 'unmatched').length
  const pendingTotal = items.filter((i) => i.status === 'pending').length

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold font-montserrat text-megh-navy">
          Bulk Image Uploader & Matcher
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Drag dozens or hundreds of product photos named by SKU (e.g.{' '}
          <code className="text-megh-navy font-mono">MF-0001.jpg</code>) or slug (e.g.{' '}
          <code className="text-megh-navy font-mono">megh-toor-dal.webp</code>).
        </p>
      </div>

      {/* Guidance Info Card */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200/80 flex items-start gap-3 text-xs text-blue-900 leading-relaxed shadow-xs">
        <Info className="w-5 h-5 text-megh-primary flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Automated SKU & Slug Linking:</span> Files are automatically
          compressed to WebP in browser before uploading to the{' '}
          <code className="font-mono bg-blue-100 px-1 py-0.5 rounded">product-images</code> storage
          bucket. The system attaches the image to the matched product and sets it as the primary cover
          photo if no image currently exists.
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onClick={() => !processing && fileInputRef.current?.click()}
        className="p-8 border-2 border-dashed border-slate-200 hover:border-megh-primary/50 hover:bg-slate-50/50 rounded-2xl cursor-pointer text-center transition-colors bg-white shadow-xs"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-megh-primary/10 text-megh-primary flex items-center justify-center">
            <UploadCloud className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">
              Click to select multiple photos or drag them here
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supported: JPG, PNG, WebP. Auto-converts to optimized WebP.
            </p>
          </div>
        </div>
      </div>

      {/* Control Toolbar */}
      {items.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              disabled={processing || pendingTotal === 0}
              onClick={handleStartProcessing}
              className="bg-megh-primary hover:bg-megh-primary/90 text-white text-xs flex items-center gap-1.5"
            >
              {processing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing Queue...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" /> Start Matching & Upload ({pendingTotal})
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={processing}
              onClick={() => setItems([])}
              className="text-xs"
            >
              Clear All
            </Button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setFilter('matched')}
              className={`px-3 py-1 rounded-full font-medium transition-colors ${
                filter === 'matched'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Matched ({matchedTotal})
            </button>
            <button
              onClick={() => setFilter('unmatched')}
              className={`px-3 py-1 rounded-full font-medium transition-colors ${
                filter === 'unmatched'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Unmatched ({unmatchedTotal})
            </button>
          </div>
        </div>
      )}

      {/* Upload Items Table */}
      {items.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Preview</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Extracted SKU / Slug</TableHead>
                <TableHead>Matched Product</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden relative">
                      <Image
                        src={item.previewUrl}
                        alt={item.filename}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  </TableCell>

                  <TableCell className="font-mono text-xs text-slate-700">
                    {item.filename}
                  </TableCell>

                  <TableCell>
                    <span className="font-mono text-xs font-bold text-megh-navy bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {item.identifier}
                    </span>
                  </TableCell>

                  <TableCell className="text-xs">
                    {item.productName ? (
                      <span className="font-semibold text-slate-900">{item.productName}</span>
                    ) : item.errorMessage ? (
                      <span className="text-red-600 font-mono text-[11px]">{item.errorMessage}</span>
                    ) : (
                      <span className="text-slate-400">Matching...</span>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    {item.status === 'pending' && <Badge variant="outline">Pending</Badge>}
                    {item.status === 'uploading' && (
                      <Badge variant="warning" className="flex items-center gap-1 justify-end">
                        <Loader2 className="w-3 h-3 animate-spin" /> Uploading
                      </Badge>
                    )}
                    {item.status === 'matched' && (
                      <Badge variant="success" className="flex items-center gap-1 justify-end">
                        <CheckCircle2 className="w-3 h-3" /> Matched
                      </Badge>
                    )}
                    {item.status === 'unmatched' && (
                      <Badge variant="warning" className="flex items-center gap-1 justify-end">
                        <AlertCircle className="w-3 h-3" /> Unmatched
                      </Badge>
                    )}
                    {item.status === 'error' && <Badge variant="danger">Error</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
