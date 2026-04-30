import { samkielMiddleware } from '@samkiel/authsdk/next';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
const PROTECTED_ROUTES = ['/', '/personal-info', '/security', '/products', '/delete-account'];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // We check for the cookie manually for quick public-route redirection
  const token = request.cookies.get('sk_access_token')?.value;

  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`));
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname === route || (route !== '/' && pathname.startsWith(`${route}/`)));

  // 1. If user is authenticated and tries to access public auth pages, redirect to dashboard
  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 2. Use SDK to handle protection for protected routes
  // The SDK middleware handles token validation and redirecting to login
  return samkielMiddleware({
    protectedRoutes: PROTECTED_ROUTES.filter(r => r !== '/'), // SDK bug with root path, handling manually
    loginPage: '/login',
    baseUrl: process.env.NEXT_PUBLIC_AUTH_URL || 'https://id.samkiel.tech',
  })(request).then(res => {
    // 3. Manually handle root path protection
    if (pathname === '/' && !token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', '/');
      return NextResponse.redirect(loginUrl);
    }
    return res;
  });
}

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
