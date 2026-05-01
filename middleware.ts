import { samkielMiddleware } from '@samkiel/authsdk/next';

export default samkielMiddleware({
  protectedRoutes: ['/', '/personal-info', '/security', '/products', '/delete-account'],
  loginPage: '/login',
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
