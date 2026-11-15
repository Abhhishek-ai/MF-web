import * as React from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  Package,
  Layers,
  FolderTree,
  Upload,
  Image as ImageIcon,
  MailCheck,
  Settings,
  ExternalLink,
  LogOut,
  Shield,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/public'
import { logoutAdmin } from '@/app/admin/actions/auth'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  let user: { email?: string } | null = null
  let newEnquiriesCount: number | null = null

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data } = await supabase.auth.getUser()
      user = data?.user ?? null

      if (user) {
        const { count } = await supabase
          .from('enquiries')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'new')
        newEnquiriesCount = count
      }
    } catch {
      user = null
    }
  } else {
    // Local / Dev mode with placeholder credentials: provide developer admin session
    user = { email: 'admin@meghfoods.com' }
  }

  // If unauthenticated (e.g. on /admin/login), render children without sidebar shell
  if (!user) {
    return <div className="min-h-screen bg-megh-surface">{children}</div>
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Brands', href: '/admin/brands', icon: Layers },
    { label: 'Categories & Groups', href: '/admin/categories', icon: FolderTree },
    { label: 'Import CSV', href: '/admin/import', icon: Upload },
    { label: 'Bulk Images', href: '/admin/images', icon: ImageIcon },
    {
      label: 'Enquiries',
      href: '/admin/enquiries',
      icon: MailCheck,
      badge: newEnquiriesCount && newEnquiriesCount > 0 ? newEnquiriesCount : undefined,
    },
    { label: 'Site Settings', href: '/admin/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-megh-navy text-white flex-shrink-0 flex flex-col border-r border-slate-800">
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-megh-primary text-white flex items-center justify-center font-bold text-lg shadow-sm">
              M
            </div>
            <div>
              <div className="font-montserrat font-bold text-sm tracking-wide text-white">
                MEGH FOODS
              </div>
              <div className="text-[11px] text-slate-400 font-medium">B2B Admin Console</div>
            </div>
          </div>
          <span className="flex h-2 w-2 rounded-full bg-megh-accent" title="System Online" />
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-megh-accent transition-colors" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="bg-megh-primary text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Public Store Link & Admin Info */}
        <div className="p-3 border-t border-white/10 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" /> View Public Site
            </span>
            <span className="text-[10px] text-slate-500">Live</span>
          </Link>

          <div className="px-3 py-2 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-2 text-xs text-slate-300 truncate">
              <Shield className="w-3.5 h-3.5 text-megh-accent flex-shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
          </div>

          <form action={logoutAdmin}>
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
              Megh Overseas Private Limited
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500">Ahmedabad & Changodar, India</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Connected
            </span>
          </div>
        </header>

        {/* Page Content Body */}
        <div className="p-8 max-w-7xl w-full mx-auto">{children}</div>
      </main>
    </div>
  )
}
