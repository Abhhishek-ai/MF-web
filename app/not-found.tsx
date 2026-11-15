import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, PackageSearch } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-surface flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center mx-auto">
          <PackageSearch className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">
            404 — Page Not Found
          </span>
          <h1 className="text-2xl font-black text-brand-navy font-heading">
            Catalogue Item Not Found
          </h1>
          <p className="text-sm text-slate-600">
            The page or product you requested may have been moved, renamed, or is temporarily unavailable in the export catalogue.
          </p>
        </div>
        <div className="pt-2">
          <Button asChild className="w-full font-bold gap-2">
            <Link href="/">
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Export Catalogue</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

