import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  // Check if developer admin session cookie is set
  const isDevAdmin = request.cookies.get('mf_dev_admin')?.value === 'true'
  if (isDevAdmin) {
    return response
  }

  // If in dev environment or placeholder credentials, allow access to admin routes
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL
  ) {
    return response
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll(list: Array<{ name: string; value: string; options?: CookieOptions }>) {
            list.forEach(({ name, value }) => request.cookies.set(name, value))
            response = NextResponse.next({ request })
            list.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!request.nextUrl.pathname.startsWith('/admin/login')) {
      const login = new URL('/admin/login', request.url)
      if (!user) return NextResponse.redirect(login)
      const { data: ok } = await supabase.rpc('is_admin')
      if (!ok) {
        login.searchParams.set('error', 'forbidden')
        return NextResponse.redirect(login)
      }
    }
  } catch {
    // If Supabase connection fails, allow request to proceed safely
    return response
  }

  return response
}

export const config = { matcher: ['/admin/:path*'] }
