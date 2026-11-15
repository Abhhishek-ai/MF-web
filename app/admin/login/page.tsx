'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { loginAdmin } from '@/app/admin/actions/auth'

export default function AdminLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    try {
      const res = await loginAdmin(formData)
      if (res?.error) {
        setError(res.error)
        setLoading(false)
      } else {
        router.push('/admin')
        router.refresh()
      }
    } catch {
      // In Next.js, redirect throws NEXT_REDIRECT which router catches
    }
  }

  return (
    <div className="min-h-screen bg-megh-surface flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-megh-primary text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-megh-primary/20">
            M
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-megh-navy font-montserrat">
          Megh Foods Admin Portal
        </h2>
        <p className="mt-1 text-center text-sm text-slate-600">
          Export Catalogue & Enquiry Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 text-sm rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-start gap-2">
                <span className="font-semibold">Error:</span> {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Administrator Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="admin@meghfoods.com"
                  className="pl-10 h-11"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••••••"
                  className="pl-10 h-11"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-megh-primary hover:bg-megh-primary/90 text-white font-semibold rounded-lg shadow-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign in to Portal <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-megh-accent" />
            <span>Secured with Supabase RLS & Role-Based Access</span>
          </div>
        </div>
      </div>
    </div>
  )
}
