import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'fr', 'es', 'de'];
const defaultLocale = 'en';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always' // Always show locale in URL for SEO consistency
});

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip static assets and APIs
  const isStaticAsset = pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|js|css|woff|woff2|ttf|eot)$/) || pathname.startsWith('/_next');
  const isApiRoute = pathname.startsWith('/api');

  if (isStaticAsset || isApiRoute) {
    return NextResponse.next();
  }

  // 2. Run next-intl middleware
  const response = intlMiddleware(request);

  // 3. Handle Auth & Routing Logic (aware of locale prefix)
  const token = request.cookies.get('auth_token')?.value;

  // Helper to check path regardless of locale
  const isPath = (target: string) => {
    return locales.some(locale => pathname === `/${locale}${target}` || pathname === `/${locale}${target}/`);
  };
  const startsWithPath = (target: string) => {
    return locales.some(locale => pathname.startsWith(`/${locale}${target}`));
  };

  if (token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      
      const isAdmin = payload.role === 'admin' || payload.role === 'super_admin';
      const isEmployer = payload.role === 'employer';
      const isCandidate = payload.role === 'candidate';

      if (isAdmin) {
        if (isPath('/admin/login')) {
          return NextResponse.redirect(new URL(`/${defaultLocale}/admin`, request.url));
        }
        if (!startsWithPath('/admin')) {
          return NextResponse.redirect(new URL(`/${defaultLocale}/admin`, request.url));
        }
      }

      if (isEmployer) {
        if (!startsWithPath('/dashboard/employer') && !isPath('')) {
          return NextResponse.redirect(new URL(`/${defaultLocale}/dashboard/employer`, request.url));
        }
      }

      if (isCandidate) {
        if (!startsWithPath('/dashboard/candidate') && !isPath('')) {
          return NextResponse.redirect(new URL(`/${defaultLocale}/dashboard/candidate`, request.url));
        }
      }
    } catch {
      response.cookies.delete('auth_token');
      return response;
    }
  } else {
    if (startsWithPath('/admin') && !isPath('/admin/login')) {
      return NextResponse.redirect(new URL(`/${defaultLocale}/admin/login`, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    // Set a cookie to remember the last locale for users who visit directly
    '/(fr|en|es|de)/:path*',

    // Match all pathnames except for
    // - /api
    // - /_next
    // - /_vercel
    // - /admin (if not prefixed)
    // - static files
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
