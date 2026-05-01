import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const { pathname } = request.nextUrl

  // Define static asset and API exclusions
  const isStaticAsset = pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|js|css|woff|woff2|ttf|eot)$/) || pathname.startsWith('/_next')
  const isApiRoute = pathname.startsWith('/api')

  if (isStaticAsset || isApiRoute) {
    return NextResponse.next()
  }

  // Handle Admin Auth Logic
  if (token) {
    try {
      // Decode JWT payload (Base64URL)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      
      const isAdmin = payload.role === 'admin' || payload.role === 'super_admin';
      const isEmployer = payload.role === 'employer';
      const isCandidate = payload.role === 'candidate';

      if (isAdmin) {
        // 1. If trying to access login page while logged in, go to dashboard
        if (pathname === '/admin/login') {
          return NextResponse.redirect(new URL('/admin', request.url));
        }

        // 2. "Lock" admin in the admin region: if outside /admin, bounce back
        if (!pathname.startsWith('/admin')) {
          return NextResponse.redirect(new URL('/admin', request.url));
        }
      }

      if (isEmployer) {
        // "Lock" employer in the dashboard region: if outside /dashboard/employer, bounce back
        // ONLY allow the homepage (/) as requested.
        if (!pathname.startsWith('/dashboard/employer') && pathname !== '/') {
          return NextResponse.redirect(new URL('/dashboard/employer', request.url));
        }
      }

      if (isCandidate) {
        // "Lock" candidate in the dashboard region: if outside /dashboard/candidate, bounce back
        // ONLY allow the homepage (/) as requested.
        if (!pathname.startsWith('/dashboard/candidate') && pathname !== '/') {
          return NextResponse.redirect(new URL('/dashboard/candidate', request.url));
        }
      }
    } catch {
      // If token is malformed, clear it and allow next
      const response = NextResponse.next();
      response.cookies.delete('auth_token');
      return response;
    }
  } else {
    // No token: Protect /admin routes (except login)
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (handled internally)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
