import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeJwt } from 'jose';

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];

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
// signature check): this is a UX hint, not a security boundary — the API
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

  // Best-effort server-side view of the session. The access cookie lasts ~15 min;
  // the refresh cookie lasts days. When the access cookie has aged out but the
  // refresh cookie is here, mint a fresh one so server-visible sessions stay warm.
  let authed = accessTokenValid(accessToken);
  let refreshed: RefreshResult | null = null;
  if (!authed && refreshToken) {
    refreshed = await refreshTokens(refreshToken);
    authed = Boolean(refreshed);
  }

  const isPublic = PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`));

  // Auth pages: bounce already-authenticated users to their destination — but
  // ONLY when the proxy can actually see the session. For a Google OAuth login
  // the browser may scope the cookies so only the API host receives them, leaving
  // this proxy blind; in that case we let the page through and the client decides.
  if (isPublic) {
    if (!authed) return NextResponse.next();

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

  // Everything else (the account area): do NOT hard-block here. The proxy can't
  // reliably see cross-subdomain auth cookies for every login path — most notably
  // a Google OAuth session, whose cookies the browser may deliver only to the API
  // host. Hard-redirecting to /login when the proxy is blind but the user is
  // actually signed in produced an infinite /login <-> / loop (the client's
  // cross-origin /user/me succeeds, so the login page bounces them back). Let the
  // client-side AccountGuard make the final call: it shows a loader and redirects
  // to /login only when there is genuinely no session. We still set freshly
  // refreshed cookies when we could read them, to keep server-visible sessions warm.
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
