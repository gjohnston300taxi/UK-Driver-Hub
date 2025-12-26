import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  // Define public routes that don't require authentication
  const publicRoutes = ['/', '/signin', '/signup', '/reset-password']
  const isPublicRoute = publicRoutes.some(route =>
    request.nextUrl.pathname === route
  )

  // If it's a public route, allow access
  if (isPublicRoute) {
    return response
  }

  // For protected routes, check if user is authenticated
  // The session is already refreshed by updateSession
  const supabaseResponse = response as NextResponse
  const sessionCookie = request.cookies.get('sb-access-token')

  // If no session and trying to access protected route, redirect to signin
  if (!sessionCookie && !isPublicRoute) {
    const redirectUrl = new URL('/signin', request.url)
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
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
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
