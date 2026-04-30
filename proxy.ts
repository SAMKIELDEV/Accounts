
import { samkielMiddleware } from '@samkiel/authsdk/next';

export const proxy = samkielMiddleware({
  protectedRoutes: ['/', '/personal-info', '/security', '/products', '/delete-account'],
  publicRoutes: ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'],
  loginPage: '/login',
  defaultAuthenticatedPath: '/',
  baseUrl: process.env.NEXT_PUBLIC_AUTH_URL || 'https://id.samkiel.tech',
});

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
