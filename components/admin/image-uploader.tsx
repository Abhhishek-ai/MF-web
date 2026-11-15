'use client'

import * as React from 'react'
import Image from 'next/image'
import { UploadCloud, X, ArrowLeft, ArrowRight, Loader2, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { uploadProductImage, removeProductImage } from '@/lib/image-upload'
import { Badge } from '@/components/ui/badge'

interface ImageUploaderProps {
  value: string[]
  onChange: (urls: string[]) => void
  maxImages?: number
}

export function ImageUploader({
  value = [],
  onChange,
  maxImages = 10,
}: ImageUploaderProps) {
  const [uploading, setUploading] = React.useState(false)
  const [dragOver, setDragOver] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (!fileArray.length) {
      toast.error('Please select image files only (.jpg, .png, .webp)')
      return
    }

    if (value.length + fileArray.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed. Currently have ${value.length}.`)
      return
    }

    setUploading(true)
    const toastId = toast.loading(`Uploading ${fileArray.length} image(s)...`)

    try {
      const newUrls: string[] = []
      for (const file of fileArray) {
        const url = await uploadProductImage(file)
        newUrls.push(url)
      }
      onChange([...value, ...newUrls])
      toast.success(`Successfully uploaded ${newUrls.length} image(s)`, { id: toastId })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to upload images'
      toast.error(message, { id: toastId })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files) {
      void handleFiles(e.dataTransfer.files)
    }
  }

  const handleRemove = async (index: number) => {
    const targetUrl = value[index]
    const updated = value.filter((_, i) => i !== index)
    onChange(updated)
    try {
      await removeProductImage(targetUrl)
      toast.success('Image removed')
    } catch {
      // Still updated in form state even if storage deletion fails
    }
  }

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return
    const updated = [...value]
    const item = updated.splice(from, 1)[0]
    updated.splice(to, 0, item)
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
          dragOver
            ? 'border-megh-primary bg-megh-primary/5'
            : 'border-slate-200 hover:border-megh-primary/50 hover:bg-slate-50'
        } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && void handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-megh-primary py-4">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm font-medium">Compressing and uploading images...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center py-2">
            <div className="w-12 h-12 rounded-full bg-megh-primary/10 text-megh-primary flex items-center justify-center">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Click to upload or drag & drop images
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                PNG, JPG, WebP up to 10MB (auto-compressed to WebP, max {maxImages} images)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Thumbnails Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {value.map((url, idx) => (
            <div
              key={url}
              className="group relative rounded-lg border border-slate-200 overflow-hidden bg-slate-100 aspect-square shadow-sm flex flex-col"
            >
              <div className="relative w-full h-full">
                <Image
                  src={url}
                  alt={`Product image ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
                />
              </div>

              {/* Cover badge on first image */}
              {idx === 0 && (
                <div className="absolute top-2 left-2 z-10">
                  <Badge variant="primary" className="text-[10px] px-1.5 py-0.5 shadow-sm">
                    Cover
                  </Badge>
                </div>
              )}

              {/* Action buttons overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      void handleRemove(idx)
                    }}
                    className="p-1 rounded-full bg-red-600 text-white hover:bg-red-700 shadow transition-colors"
                    title="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-1 bg-black/50 p-1 rounded-md backdrop-blur-sm">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={(e) => {
                      e.stopPropagation()
                      moveItem(idx, idx - 1)
                    }}
                    className="p-1 text-white hover:text-megh-accent disabled:opacity-30 disabled:hover:text-white"
                    title="Move left"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono text-white/90">
                    {idx + 1}/{value.length}
                  </span>
                  <button
                    type="button"
                    disabled={idx === value.length - 1}
                    onClick={(e) => {
                      e.stopPropagation()
                      moveItem(idx, idx + 1)
                    }}
                    className="p-1 text-white hover:text-megh-accent disabled:opacity-30 disabled:hover:text-white"
                    title="Move right"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {value.length === 0 && (
        <div className="flex items-center gap-2 text-xs text-slate-500 py-1">
          <ImageIcon className="w-4 h-4 text-slate-400" />
          <span>No images uploaded yet. The designed placeholder will be shown on catalogue.</span>
        </div>
      )}
    </div>
  )
}
