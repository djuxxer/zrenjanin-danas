import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Rute koje NE zahtevaju login (ostatak /admin je zaštićen)
const PUBLIC_ADMIN_PATHS = ['/admin/login']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Ova zaštita se odnosi samo na /admin rute
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isPublicAdminPath = PUBLIC_ADMIN_PATHS.some((path) => pathname.startsWith(path))

  // Nije ulogovan i pokušava da pristupi zaštićenoj /admin ruti -> login
  if (!user && !isPublicAdminPath) {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Već je ulogovan i pokušava da ode na /admin/login -> pravo na dashboard
  if (user && isPublicAdminPath) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
