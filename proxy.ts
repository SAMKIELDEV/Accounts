import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeJwt } from 'jose';

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
const PROTECTED_ROUTES = ['/', '/personal-info', '/security', '/products', '/delete-account'];

const ACCESS_COOKIE = 'sk_access_token';
const REFRESH_COOKIE = 'sk_refresh_token';
const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'https://id.samkiel.tech';

// Mirror the auth server's cookie attributes (Secure + Domain=.samkiel.tech in
// prod; host-only, non-Secure in dev) so the cookies we refresh here are
// interchangeable with the ones SAMKIEL ID sets on login.
const DEV_COOKIES = (() => {
  const flag = process.env.SK_DEV_COOKIES;
  if (flag === '1' || flag === 'true') return true;
  if (flag === '0' || flag === 'false') return false;
  return process.env.NODE_ENV !== 'production';
})();
const COOKIE_DOMAIN = process.env.SK_COOKIE_DOMAIN ?? (DEV_COOKIES ? '' : '.samkiel.tech');

type RefreshResult = { accessToken: string; refreshToken: string; expiresIn: number };

// True when the access token exists and hasn't expired. We only *decode* it (no
// signature check): this is a UX gate, not a security boundary — the API
// re-verifies every token — and decoding avoids needing JWT_SECRET in this app.
function accessTokenValid(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const { exp } = decodeJwt(token);
    return typeof exp === 'number' && exp * 1000 > Date.now() + 5_000;
  } catch {
    return false;
  }
}

// Exchange a refresh token for a fresh pair. Server-to-server, so the token goes
// in the body (the auth server also accepts it from the cookie).
async function refreshTokens(refreshToken: string): Promise<RefreshResult | null> {
  try {
    const res = await fetch(`${AUTH_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<RefreshResult>;
    if (!data.accessToken || !data.refreshToken || !data.expiresIn) return null;
    return data as RefreshResult;
  } catch {
    return null;
  }
}

function applyRefreshedCookies(response: NextResponse, tokens: RefreshResult) {
  const base: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'lax' | 'none';
    path: string;
    domain?: string;
  } = {
    httpOnly: true,
    secure: !DEV_COOKIES,
    sameSite: DEV_COOKIES ? 'lax' : 'none',
    path: '/',
  };
  if (COOKIE_DOMAIN) base.domain = COOKIE_DOMAIN;

  response.cookies.set({ ...base, name: ACCESS_COOKIE, value: tokens.accessToken, maxAge: tokens.expiresIn });
  // The refresh cookie's lifetime is owned by the auth server; mirror its 30-day window.
  response.cookies.set({ ...base, name: REFRESH_COOKIE, value: tokens.refreshToken, maxAge: 30 * 24 * 60 * 60 });
}

export const proxy = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  // Establish whether there's a live session. The access cookie lasts ~15 min;
  // the refresh cookie lasts days. When the access cookie has aged out — or never
  // reached the browser's JS at all, as with a Google OAuth redirect that sets
  // only httpOnly cookies — mint a fresh access cookie server-side from the
  // refresh cookie. This is what stops the Google-login bounce loop: OAuth users
  // have no localStorage token, so the client SDK can't refresh; the server does.
  let authed = accessTokenValid(accessToken);
  let refreshed: RefreshResult | null = null;
  if (!authed && refreshToken) {
    refreshed = await refreshTokens(refreshToken);
    authed = Boolean(refreshed);
  }

  const isPublic = PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`));

  // Authenticated users shouldn't linger on auth pages. Keyed on the definitive
  // `authed` (not mere cookie presence): keying it on a stale refresh cookie
  // would bounce a logged-out user /login -> / -> /login forever.
  if (isPublic) {
    if (!authed) return NextResponse.next();

    // Honor both `redirect` (legacy) and `callbackUrl`.
    const redirectParam =
      request.nextUrl.searchParams.get('redirect') ??
      request.nextUrl.searchParams.get('callbackUrl');

    let target = new URL('/', request.url);
    if (redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//')) {
      // Internal same-site path — handle before URL parsing so "/" isn't mangled.
      target = new URL(redirectParam, request.url);
    } else if (redirectParam) {
      try {
        const normalized = redirectParam.startsWith('http') ? redirectParam : `https://${redirectParam}`;
        const parsed = new URL(normalized);
        if (parsed.hostname.endsWith('.samkiel.tech') || parsed.hostname === 'samkiel.tech') {
          target = parsed;
        }
      } catch {
        // Invalid URL — fall back to '/'.
      }
    }

    const res = NextResponse.redirect(target);
    if (refreshed) applyRefreshedCookies(res, refreshed);
    return res;
  }

  // Protect the account area. Root is matched exactly; everything else by prefix.
  const isProtected = PROTECTED_ROUTES.some(route =>
    route === '/' ? pathname === '/' : pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isProtected && !authed) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const res = NextResponse.next();
  if (refreshed) applyRefreshedCookies(res, refreshed);
  return res;
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
