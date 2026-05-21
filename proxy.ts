import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeJwt } from 'jose';

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

function accessTokenValid(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const { exp } = decodeJwt(token);
    return typeof exp === 'number' && exp * 1000 > Date.now() + 5_000;
  } catch {
    return false;
  }
}

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

/**
 * The proxy does NOT make auth-based redirect decisions. All auth routing is
 * client-side: <AccountGuard> redirects to /login when there's no session, and
 * the /login page redirects authenticated users away. Both read the same
 * getSession() result, so they can never disagree — which is what previously
 * produced the /login <-> / redirect loop (the proxy's server-side view of the
 * session, especially for Google OAuth, didn't match the client's, so each side
 * bounced the user to the other forever).
 *
 * All we do here is opportunistically refresh the access cookie from the refresh
 * cookie when it has aged out, so a server-visible session stays warm. Anything
 * that needs real protection is enforced by the API (it verifies every token).
 */
export const proxy = async (request: NextRequest) => {
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  let refreshed: RefreshResult | null = null;
  if (!accessTokenValid(accessToken) && refreshToken) {
    refreshed = await refreshTokens(refreshToken);
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
