import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const pathname = request.nextUrl.pathname

  // Public vendor routes that must stay reachable without an authenticated session
  const isPublicVendorRoute = pathname.startsWith('/vendor/activate')

  const isDashboardRoute =
    !isPublicVendorRoute &&
    (pathname.startsWith('/buyer') || pathname.startsWith('/vendor'))

  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (isDashboardRoute && !user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
  } catch (error) {
    // Supabase timed out or network error
    // If it's a dashboard route, let it through — the page itself will handle auth
    // Better to show the page than loop-redirect on a network hiccup
    console.warn('Middleware auth check failed (network issue):', (error as any)?.message)

    if (isDashboardRoute) {
      // Check if session cookie exists as a fallback
      const hasSessionCookie = request.cookies.getAll().some(
        c => c.name.includes('sb-') && c.name.includes('-auth-token')
      )
      if (!hasSessionCookie) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('redirectTo', request.nextUrl.pathname)
        return NextResponse.redirect(url)
      }
      // Has session cookie — let them through, page will re-verify
    }
  }

  return supabaseResponse
}