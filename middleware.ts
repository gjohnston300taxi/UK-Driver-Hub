import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

// Define protected routes that require authentication
const protectedRoutes = ['/feed', '/news', '/resources', '/finance', '/marketplace', '/profile', '/admin']
const authRoutes = ['/login', '/signup']
const publicRoutes = ['/', '/onboarding']

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session and get user
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isAuthRoute = authRoutes.some(route => path.startsWith(route))

  // If user is not logged in and trying to access a protected route
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is logged in and trying to access auth routes, redirect to feed
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/feed', request.url))
  }

  // If user is logged in, check onboarding status and admin access
  if (user && isProtectedRoute) {
    // Fetch user metadata from auth
    const { data: { user: userData } } = await supabase.auth.getUser()
    const onboardingComplete = userData?.user_metadata?.onboarding_complete ?? false
    const userRole = userData?.user_metadata?.role ?? 'user'

    // Redirect to onboarding if not complete (except if already on onboarding page)
    if (!onboardingComplete && path !== '/onboarding') {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    // Check admin access for /admin routes
    if (path.startsWith('/admin') && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/feed', request.url))
    }

    // If on onboarding page but already completed, redirect to feed
    if (onboardingComplete && path === '/onboarding') {
      return NextResponse.redirect(new URL('/feed', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
