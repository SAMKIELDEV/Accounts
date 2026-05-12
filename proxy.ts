import { samkielMiddleware } from '@samkiel/authsdk/next';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
const PROTECTED_ROUTES = ['/', '/personal-info', '/security', '/products', '/delete-account'];

export const proxy = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('sk_access_token')?.value;

  const isPublic = PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`));

  // Redirect authenticated users away from auth pages
  if (isPublic && token) {
    // Honor both `redirect` (legacy) and `callbackUrl` (used by samkielMiddleware
    // and the root-protection branch below).
    const redirectParam =
      request.nextUrl.searchParams.get('redirect') ??
      request.nextUrl.searchParams.get('callbackUrl');

    if (redirectParam) {
      // Internal same-site path — keep them on this origin to avoid bouncing
      // through an external URL parse step that would mangle "/" etc.
      if (redirectParam.startsWith('/') && !redirectParam.startsWith('//')) {
        return NextResponse.redirect(new URL(redirectParam, request.url));
      }
      try {
        const normalizedUrl = redirectParam.startsWith('http') ? redirectParam : `https://${redirectParam}`;
        const parsedUrl = new URL(normalizedUrl);
        if (parsedUrl.hostname.endsWith('.samkiel.tech') || parsedUrl.hostname === 'samkiel.tech') {
          return NextResponse.redirect(parsedUrl.toString());
        }
      } catch {
        // Invalid URL, fallback to '/'
      }
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Use SDK for protection
  return samkielMiddleware({
    protectedRoutes: PROTECTED_ROUTES.filter(r => r !== '/'), // Remove root to prevent SDK startsWith('/') bug
    loginPage: '/login',
    baseUrl: process.env.NEXT_PUBLIC_AUTH_URL || 'https://id.samkiel.tech',
  })(request).then(res => {
    // Manually handle root protection since we removed it from SDK config
    if (pathname === '/' && !token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', '/');
      return NextResponse.redirect(loginUrl);
    }
    return res;
  });
};

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export default proxy;
