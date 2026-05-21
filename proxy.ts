import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
const PROTECTED_ROUTES = ['/', '/personal-info', '/security', '/products', '/delete-account'];

const ACCESS_COOKIE = 'sk_access_token';
const REFRESH_COOKIE = 'sk_refresh_token';

export const proxy = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  // A live session means a usable access token OR a refresh token we can mint a
  // new one from. The access cookie ages out after 15 min while the refresh
  // cookie lives for days, so gating protected routes on the access cookie alone
  // bounced still-valid users to /login the moment it expired — where the client
  // SDK silently refreshes and bounces them straight back. That round-trip is the
  // "logging in and out" flicker (and a hard loop whenever the browser drops the
  // cross-origin refresh Set-Cookie). Treat the refresh cookie as a valid session
  // and let the client SDK / AccountGuard handle the actual refresh; AccountGuard
  // redirects to /login if the refresh genuinely fails.
  const hasSession = Boolean(accessToken) || Boolean(refreshToken);

  const isPublic = PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`));

  // Redirect already-authenticated users away from auth pages. Keyed on the
  // access token only (a definitively usable credential): keying it on the
  // refresh cookie too would bounce a user with a *stale* refresh cookie off
  // /login and into the account shell, where the failed refresh would send them
  // back to /login — an infinite loop.
  if (isPublic && accessToken) {
    // Honor both `redirect` (legacy) and `callbackUrl` (used by the protection
    // branch below).
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
        // Invalid URL, fall back to '/'.
      }
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Protect the account area. Root is matched exactly; everything else by prefix.
  const isProtected = PROTECTED_ROUTES.some(route =>
    route === '/' ? pathname === '/' : pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isProtected && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
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
